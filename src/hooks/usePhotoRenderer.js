import { useRef, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext.js';
import { drawScanlineGrid, composePhotoCanvas } from '../utils/renderUtils.js';

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
    const { saveScale, isScanline, scanlineBrightness, isScanlineDisplayOnly } = settings;
    const activeScanline = isScanline && displayScale > 1;
    const shouldDrawScanlineOnSave = activeScanline && !isScanlineDisplayOnly;

    useEffect(() => {
        if (!photo) return;

        (async () => {
            try {
                const rgbOptions =
                    photoG && photoB ? { photoG, photoB, rgbBrightness, rgbContrast } : null;
                const compositionCanvas = await composePhotoCanvas(
                    photo,
                    palette,
                    frame,
                    paletteOrder,
                    rgbOptions
                );

                // Create and prepare the save canvas in memory
                const saveCanvas = new OffscreenCanvas(
                    compositionCanvas.width * saveScale,
                    compositionCanvas.height * saveScale
                );
                const saveCtx = saveCanvas.getContext('2d');
                saveCtx.imageSmoothingEnabled = imageSmoothing;
                saveCtx.drawImage(compositionCanvas, 0, 0, saveCanvas.width, saveCanvas.height);
                if (shouldDrawScanlineOnSave) {
                    drawScanlineGrid(saveCtx, saveScale, scanlineBrightness, palette);
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
                    if (activeScanline) {
                        drawScanlineGrid(displayCtx, scale, scanlineBrightness, palette);
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
        scanlineBrightness,
        isScanlineDisplayOnly
    ]);

    return { displayCanvasRef, saveCanvasRef };
};
