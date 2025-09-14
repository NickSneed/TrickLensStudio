import PropTypes from 'prop-types';
import { useRef, useEffect } from 'react';
import { palettes, applyPalette } from 'gbcam-js';
import * as styles from './Photo.module.css';

function Photo({ image, paletteId, frame, scaleFactor }) {
    const canvasRefSave = useRef(null);
    const canvasRefDisplay = useRef(null);
    const saveScale = 4;
    const palette = palettes[paletteId];
    const displayScale = scaleFactor;
    const imageBaseWidth = frame ? 160 : 128;
    const imageBaseHeight = frame ? 144 : 112;

    // CSS settings
    const canvasPadding = frame ? '0' : 16 * displayScale + 'px';
    const canvasWidth = imageBaseWidth * displayScale;
    const canvasHeight = imageBaseHeight * displayScale;

    useEffect(() => {
        if (!image) return;

        (async () => {
            try {
                const { width, height, photoData } = image;

                // Apply the color palette to the photo
                const pixels = applyPalette(photoData, palette);

                // Create a bitmap from the raw image data for efficient drawing
                const imageData = new ImageData(pixels, width, height);
                const imageBitmap = await createImageBitmap(imageData);

                // Apply a frame
                let frameBitmap = null;
                if (frame) {
                    const originalFrameBitmap = await createImageBitmap(new Blob([frame]));

                    // Use an OffscreenCanvas for recoloring the frame
                    const offscreenCanvas = new OffscreenCanvas(originalFrameBitmap.width, originalFrameBitmap.height);
                    const offscreenCtx = offscreenCanvas.getContext('2d');

                    // Draw the original frame to the offscreen canvas to get its pixel data
                    offscreenCtx.drawImage(originalFrameBitmap, 0, 0);
                    const frameImageData = offscreenCtx.getImageData(0, 0, originalFrameBitmap.width, originalFrameBitmap.height);
                    const frameData = frameImageData.data;

                    // The original grayscale palette of the frame file.
                    // This assumes frames are created with these specific shades.
                    const originalFramePalette = [
                        [255, 255, 255, 255], // White
                        [160, 160, 160, 255], // Light Gray
                        [80, 80, 80, 255], // Dark Gray
                        [0, 0, 0, 255] // Black
                    ];

                    // The new palette to apply
                    const newPalette = palette.map((c) => [c.r, c.g, c.b, 255]);

                    // Helper to compare colors
                    const colorsMatch = (a, b) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];

                    // Iterate over each pixel and replace the color
                    for (let i = 0; i < frameData.length; i += 4) {
                        const pixel = [frameData[i], frameData[i + 1], frameData[i + 2], frameData[i + 3]];
                        for (let j = 0; j < originalFramePalette.length; j++) {
                            if (colorsMatch(pixel, originalFramePalette[j])) {
                                frameData[i] = newPalette[j][0];
                                frameData[i + 1] = newPalette[j][1];
                                frameData[i + 2] = newPalette[j][2];
                                break; // Move to the next pixel
                            }
                        }
                    }

                    // Create a new bitmap from the recolored image data
                    frameBitmap = await createImageBitmap(frameImageData);
                }
                const frameOffset = frame ? 32 : 0;
                const compositeWidth = width + frameOffset;
                const compositeHeight = height + frameOffset;

                // Use an OffscreenCanvas for composition
                const compositionCanvas = new OffscreenCanvas(compositeWidth, compositeHeight);
                const ctx = compositionCanvas.getContext('2d');

                // Disable anti-aliasing to get crisp, hard-edge pixels
                ctx.imageSmoothingEnabled = false;

                // Draw the image onto the OffscreenCanvas
                ctx.drawImage(imageBitmap, frameOffset / 2, frameOffset / 2, width, height);

                // Draw the frame onto the OffscreenCanvas
                if (frameBitmap) {
                    ctx.drawImage(frameBitmap, 0, 0, compositeWidth, compositeHeight);
                }

                // Create and prepare the save canvas in memory
                const saveCanvas = new OffscreenCanvas(compositionCanvas.width * saveScale, compositionCanvas.height * saveScale);
                const saveCtx = saveCanvas.getContext('2d');
                saveCtx.imageSmoothingEnabled = false;
                saveCtx.drawImage(compositionCanvas, 0, 0, saveCanvas.width, saveCanvas.height);
                canvasRefSave.current = saveCanvas;

                // Scale and draw to the display canvas
                const displayCanvas = canvasRefDisplay.current;
                if (displayCanvas) {
                    const displayCtx = displayCanvas.getContext('2d');
                    const scale = displayScale * 2;
                    displayCanvas.width = compositionCanvas.width * scale;
                    displayCanvas.height = compositionCanvas.height * scale;
                    displayCtx.imageSmoothingEnabled = false;
                    displayCtx.drawImage(compositionCanvas, 0, 0, displayCanvas.width, displayCanvas.height);
                }
            } catch (error) {
                console.log(error);
            }
        })();
    }, [image, palette, frame, saveScale, displayScale]); // The effect depends on the `data` prop.

    const handleExport = async () => {
        const canvas = canvasRefSave.current;
        if (!canvas) {
            console.error('Save canvas not ready for export.');
            return;
        }

        const blob = await canvas.convertToBlob({ type: 'image/png' });
        const link = document.createElement('a');
        // Using a timestamp for a unique filename. You could use an image ID if available.
        link.download = `gb-photo-${Date.now()}.png`;
        link.href = URL.createObjectURL(blob);
        link.click();
        // Clean up by revoking the object URL.
        URL.revokeObjectURL(link.href);
    };

    // Return if there is no image
    if (!image || image.isDeleted) {
        return null;
    }

    return (
        <>
            <div className={styles.photo}>
                {image.comment || null}
                <canvas
                    className={styles.canvas}
                    width={canvasWidth}
                    height={canvasHeight}
                    style={{
                        padding: canvasPadding,
                        width: canvasWidth + 'px',
                        height: canvasHeight + 'px'
                    }}
                    ref={canvasRefDisplay}
                ></canvas>
                <button
                    onClick={handleExport}
                    className={styles.exportButton}
                >
                    Export as PNG
                </button>
            </div>
        </>
    );
}

Photo.propTypes = {
    image: PropTypes.object,
    paletteId: PropTypes.string,
    frame: PropTypes.object,
    scaleFactor: PropTypes.number
};

export default Photo;
