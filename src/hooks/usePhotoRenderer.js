import { useRef, useEffect } from 'react';
import { applyPalette, applyRGB } from 'tricklens-js';
import { composeImage } from '../utils/canvasUtils.js';
import { getFrameOffsets } from '../utils/frameUtils.js';
import { useSettings } from '../context/SettingsContext.js';

/**
 * Draws a gray scanline grid aligned to actual rendered pixels.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} pixelScale
 * @param {number} brightness
 */
const drawScanlineGrid = (ctx, pixelScale, brightness) => {
    const totalWidth = ctx.canvas.width;
    const totalHeight = ctx.canvas.height;

    ctx.save();
    ctx.strokeStyle = `rgba(120, 120, 120, ${brightness})`;
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.beginPath();

    for (let x = pixelScale; x < totalWidth; x += pixelScale) {
        const currentX = Math.round(x) + 0.5;
        ctx.moveTo(currentX, 0);
        ctx.lineTo(currentX, totalHeight);
    }

    for (let y = pixelScale; y < totalHeight; y += pixelScale) {
        const currentY = Math.round(y) + 0.5;
        ctx.moveTo(0, currentY);
        ctx.lineTo(totalWidth, currentY);
    }

    ctx.stroke();
    ctx.restore();
};

/**
 * Hook to render the photo with applied effects, palettes, and frames.
 * Handles both display rendering and creating a high-resolution version for saving.
 *
 * @param {Object} photo - The primary photo data (Red channel or grayscale).
 * @param {Object} photoG - The Green channel photo data (optional, for RGB mode).
 * @param {Object} photoB - The Blue channel photo data (optional, for RGB mode).
 * @param {Object} palette - The color palette object to apply.
 * @param {Object} frame - The frame data to overlay.
 * @param {number} displayScale - The scale factor for the display canvas.
 * @param {Array} paletteOrder - The order of colors in the palette.
 * @param {number} rgbBrightness - Brightness adjustment for RGB mode.
 * @param {number} rgbContrast - Contrast adjustment for RGB mode.
 * @param {Object} externalSaveRef - Optional external ref for the save canvas.
 * @param {boolean} imageSmoothing - Whether to enable image smoothing.
 */
export const usePhotoRenderer = (
    photo,
    photoG,
    photoB,
    palette,
    frame,
    displayScale,
    paletteOrder,
    rgbBrightness,
    rgbContrast,
    externalSaveRef,
    imageSmoothing = false
) => {
    const { settings } = useSettings();
    const displayCanvasRef = useRef(null);
    const internalSaveRef = useRef(null);
    const saveCanvasRef = externalSaveRef || internalSaveRef;
    const { saveScale, isScanline, scanlineBrightness } = settings; // Scale factor for the high-resolution export, optional scanline overlay, and brightness

    useEffect(() => {
        if (!photo) return;

        (async () => {
            try {
                const { width, height, pixels } = photo;

                let palettePixels;

                // If red and green photos are passed apply rgb colors otherwise apply a palette
                if (photoG && photoB) {
                    // Combine R, G, B channels into a single color photo
                    palettePixels = applyRGB(
                        pixels,
                        photoG.pixels,
                        photoB.pixels,
                        width,
                        height,
                        rgbBrightness,
                        rgbContrast
                    );
                } else {
                    // Apply the selected color palette to the grayscale photo
                    palettePixels = applyPalette(pixels, palette, paletteOrder);
                }

                // Create a bitmap from the raw photo data for efficient drawing
                const imageBitmap = await createImageBitmap(
                    new ImageData(palettePixels, width, height)
                );

                // Recolor the frame if it exists
                let frameBitmap = null;
                if (frame) {
                    // Create a clean copy of frame data to apply palette
                    const cleanData = new Uint8Array(frame.data.length);
                    for (let i = 0; i < frame.data.length; i++) {
                        // Replace transparent index (4) with 0 for palette application
                        cleanData[i] = frame.data[i] === 4 ? 0 : frame.data[i];
                    }

                    // Apply palette to frame data
                    const framePixels = applyPalette(cleanData, palette, paletteOrder);

                    // Restore transparency for index 4
                    for (let i = 0; i < frame.data.length; i++) {
                        if (frame.data[i] === 4) {
                            framePixels[i * 4 + 3] = 0; // Set Alpha to 0
                        }
                    }
                    frameBitmap = await createImageBitmap(
                        new ImageData(framePixels, frame.width, frame.height)
                    );
                }

                const offsets = getFrameOffsets(frame);
                // Use an OffscreenCanvas for composition
                const compositionCanvas = composeImage(
                    imageBitmap,
                    frameBitmap,
                    width,
                    height,
                    offsets
                );

                // Create and prepare the save canvas in memory
                const saveCanvas = new OffscreenCanvas(
                    compositionCanvas.width * saveScale,
                    compositionCanvas.height * saveScale
                );
                const saveCtx = saveCanvas.getContext('2d');
                saveCtx.imageSmoothingEnabled = imageSmoothing;
                saveCtx.drawImage(compositionCanvas, 0, 0, saveCanvas.width, saveCanvas.height);
                if (isScanline) {
                    drawScanlineGrid(saveCtx, saveScale, scanlineBrightness);
                }

                // Store the save-ready canvas
                saveCanvasRef.current = saveCanvas;

                // Scale and draw to the display canvas
                const displayCanvas = displayCanvasRef.current;
                if (displayCanvas) {
                    const displayCtx = displayCanvas.getContext('2d');
                    const scale = displayScale * 2;
                    displayCanvas.width = compositionCanvas.width * scale;
                    displayCanvas.height = compositionCanvas.height * scale;
                    displayCtx.imageSmoothingEnabled = imageSmoothing;
                    displayCtx.drawImage(
                        compositionCanvas,
                        0,
                        0,
                        displayCanvas.width,
                        displayCanvas.height
                    );
                    if (isScanline) {
                        drawScanlineGrid(displayCtx, scale, scanlineBrightness);
                    }
                }
            } catch (error) {
                console.log(error);
            }
        })();
    }, [
        photo,
        palette,
        frame,
        displayScale,
        saveScale,
        paletteOrder,
        photoG,
        photoB,
        rgbBrightness,
        rgbContrast,
        imageSmoothing,
        isScanline,
        scanlineBrightness
    ]);

    return { displayCanvasRef, saveCanvasRef };
};
