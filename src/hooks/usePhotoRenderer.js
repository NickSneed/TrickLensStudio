import { useRef, useEffect } from 'react';
import { palettes, applyPalette, applyRGB } from 'tricklens-js';
import { composeImage } from '../utils/canvasUtils.js';
import { getFrameOffsets } from '../utils/frameUtils.js';

/**
 * Hook to render the photo with applied effects, palettes, and frames.
 * Handles both display rendering and creating a high-resolution version for saving.
 *
 * @param {Object} image - The primary image data (Red channel or grayscale).
 * @param {Object} imageG - The Green channel image data (optional, for RGB mode).
 * @param {Object} imageB - The Blue channel image data (optional, for RGB mode).
 * @param {string} paletteId - The ID of the color palette to apply.
 * @param {Object} frame - The frame data to overlay.
 * @param {number} displayScale - The scale factor for the display canvas.
 * @param {Array} paletteOrder - The order of colors in the palette.
 * @param {number} rgbBrightness - Brightness adjustment for RGB mode.
 * @param {number} rgbContrast - Contrast adjustment for RGB mode.
 * @param {Object} externalSaveRef - Optional external ref for the save canvas.
 * @param {boolean} imageSmoothing - Whether to enable image smoothing.
 */
export const usePhotoRenderer = (
    image,
    imageG,
    imageB,
    paletteId,
    frame,
    displayScale,
    paletteOrder,
    rgbBrightness,
    rgbContrast,
    externalSaveRef,
    imageSmoothing = false
) => {
    const displayCanvasRef = useRef(null);
    const internalSaveRef = useRef(null);
    const saveCanvasRef = externalSaveRef || internalSaveRef;
    const saveScale = 10; // Scale factor for the high-resolution export
    const palette = palettes[paletteId];

    useEffect(() => {
        if (!image) return;

        (async () => {
            try {
                const { width, height, photoData } = image;

                let pixels;

                // If red and green images are passed apply rgb colors otherwise apply a palette
                if (imageG && imageB) {
                    // Combine R, G, B channels into a single color image
                    pixels = applyRGB(
                        photoData,
                        imageG.photoData,
                        imageB.photoData,
                        width,
                        height,
                        rgbBrightness,
                        rgbContrast
                    );
                } else {
                    // Apply the selected color palette to the grayscale image
                    pixels = applyPalette(photoData, palette, paletteOrder);
                }

                // Create a bitmap from the raw image data for efficient drawing
                const imageBitmap = await createImageBitmap(new ImageData(pixels, width, height));

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
                }
            } catch (error) {
                console.log(error);
            }
        })();
    }, [
        image,
        palette,
        frame,
        displayScale,
        saveScale,
        paletteOrder,
        imageG,
        imageB,
        rgbBrightness,
        rgbContrast,
        imageSmoothing
    ]);

    return { displayCanvasRef, saveCanvasRef };
};
