import PropTypes from 'prop-types';
import { useRef, useEffect } from 'react';
import { palettes, applyPalette } from 'gbcam-js';
import * as styles from './Photo.module.css';

function Photo({ image, paletteId, frame, scaleFactor }) {
    const canvasRefOriginal = useRef(null);
    const canvasRefSave = useRef(null);
    const canvasRefDisplay = useRef(null);
    const saveScale = 4;
    const palette = palettes[paletteId];

    const displayScale = scaleFactor; // The factor to scale the display canvas
    const imageBaseWidth = frame ? 160 : 128;
    const imageBaseHeight = frame ? 144 : 112;
    const canvasPadding = frame ? '0' : 16 * displayScale + 'px';
    const canvasWidth = imageBaseWidth * displayScale;
    const canvasHeight = imageBaseHeight * displayScale;

    useEffect(() => {
        const renderImage = async () => {
            try {
                // We need to check for both `data` and the canvas `ref` to be ready.
                if (image && canvasRefOriginal.current) {
                    const canvas = canvasRefOriginal.current;
                    const ctx = canvas.getContext('2d');

                    // Now we can get the imageData because we have the context
                    // Decode the photo to get palette indices
                    const { width, height, photoData } = image;

                    // Apply the color palette to the photo
                    const pixels = applyPalette(photoData, palette);

                    // Create a bitmap from the raw image data for efficient drawing
                    const imageData = ctx.createImageData(width, height);
                    imageData.data.set(pixels);
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

                    // Set canvas dimensions to 2x the original image size
                    canvas.width = imageData.width + frameOffset;
                    canvas.height = imageData.height + frameOffset;

                    // Disable anti-aliasing to get crisp, hard-edge pixels
                    ctx.imageSmoothingEnabled = false;

                    // Draw the bitmap onto the canvas, scaling it up
                    ctx.drawImage(imageBitmap, frameOffset / 2, frameOffset / 2, imageData.width, imageData.height);

                    // Draw frame
                    if (frameBitmap) {
                        ctx.drawImage(frameBitmap, 0, 0, canvas.width, canvas.height);
                    }

                    // Helper to scale and copy a canvas
                    const scaleAndCopyCanvas = (targetRef, sourceCanvas, scale) => {
                        const targetCanvas = targetRef.current;
                        if (targetCanvas) {
                            const targetCtx = targetCanvas.getContext('2d');
                            targetCanvas.width = sourceCanvas.width * scale;
                            targetCanvas.height = sourceCanvas.height * scale;
                            targetCtx.imageSmoothingEnabled = false;
                            targetCtx.drawImage(sourceCanvas, 0, 0, targetCanvas.width, targetCanvas.height);
                        }
                    };

                    scaleAndCopyCanvas(canvasRefDisplay, canvas, displayScale * 2);
                    scaleAndCopyCanvas(canvasRefSave, canvas, saveScale);
                }
            } catch (error) {
                console.log(error);
            }
        };

        renderImage();
    }, [image, palette, frame, saveScale, displayScale]); // The effect depends on the `data` prop.

    const handleExport = () => {
        const canvas = canvasRefSave.current;
        if (!canvas) {
            console.error('Canvas element not found for export.');
            return;
        }

        canvas.toBlob((blob) => {
            const link = document.createElement('a');
            // Using a timestamp for a unique filename. You could use an image ID if available.
            link.download = `gb-photo-${Date.now()}.png`;
            link.href = URL.createObjectURL(blob);
            link.click();
            // Clean up by revoking the object URL.
            URL.revokeObjectURL(link.href);
        }, 'image/png');
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
                <canvas
                    className={styles.canvas}
                    width={canvasWidth}
                    height={canvasHeight}
                    style={{
                        display: 'none',
                        padding: canvasPadding,
                        width: canvasWidth + 'px',
                        height: canvasHeight + 'px'
                    }}
                    ref={canvasRefSave}
                ></canvas>
                <canvas
                    className={styles.canvas}
                    width={canvasWidth}
                    height={canvasHeight}
                    style={{
                        display: 'none',
                        padding: canvasPadding,
                        width: canvasWidth + 'px',
                        height: canvasHeight + 'px'
                    }}
                    ref={canvasRefOriginal}
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
