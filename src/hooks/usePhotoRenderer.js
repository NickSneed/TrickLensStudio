import { useRef, useEffect } from 'react';
import { palettes, applyPalette, applyRGB } from 'tricklens-js';
import { composeImage } from '../utils/canvasUtils.js';
import { getFrameOffsets } from '../utils/frameUtils.js';

export const usePhotoRenderer = (
    image,
    imageR,
    imageG,
    paletteId,
    frame,
    displayScale,
    paletteOrder,
    rgbBrightness,
    rgbContrast
) => {
    const displayCanvasRef = useRef(null);
    const saveCanvasRef = useRef(null);
    const saveScale = 10;
    const palette = palettes[paletteId];

    useEffect(() => {
        if (!image) return;

        (async () => {
            try {
                const { width, height, photoData } = image;

                let pixels;

                // If red and green images are passed apply rgb colors otherwise apply a palette
                if (imageR && imageG) {
                    pixels = applyRGB(
                        imageR.photoData,
                        imageG.photoData,
                        photoData,
                        width,
                        height,
                        rgbBrightness,
                        rgbContrast
                    );
                } else {
                    // Apply the color palette to the photo
                    pixels = applyPalette(photoData, palette, paletteOrder);
                }

                // Create a bitmap from the raw image data for efficient drawing
                const imageBitmap = await createImageBitmap(new ImageData(pixels, width, height));

                // Recolor the frame if it exists
                let frameBitmap = null;
                if (frame) {
                    const cleanData = new Uint8Array(frame.data.length);
                    for (let i = 0; i < frame.data.length; i++) {
                        cleanData[i] = frame.data[i] === 4 ? 0 : frame.data[i];
                    }

                    const framePixels = applyPalette(cleanData, palette, paletteOrder);

                    for (let i = 0; i < frame.data.length; i++) {
                        if (frame.data[i] === 4) {
                            framePixels[i * 4 + 3] = 0;
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
                saveCtx.imageSmoothingEnabled = false;
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
                    displayCtx.imageSmoothingEnabled = false;
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
        imageR,
        imageG,
        rgbBrightness,
        rgbContrast
    ]);

    return { displayCanvasRef, saveCanvasRef };
};
