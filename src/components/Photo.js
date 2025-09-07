import PropTypes from 'prop-types';
import { useRef, useEffect } from 'react';
import { palettes, applyPalette } from 'gbcam-js';

function Photo({ data, photoIndex, paletteId, frame, scaleFactor }) {
    const canvasRef = useRef(null);
    const scale = scaleFactor;
    const palette = palettes[paletteId];

    // Check if within range
    if (photoIndex > 29 || photoIndex < 0) {
        return;
    }

    useEffect(() => {
        const renderImage = async () => {
            // We need to check for both `data` and the canvas `ref` to be ready.
            if (data && canvasRef.current) {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');

                // Now we can get the imageData because we have the context
                // Decode the photo to get palette indices
                const { width, height, photoData } = data.images[photoIndex];

                // Apply the color palette to the photo
                const pixels = applyPalette(photoData, palette);

                // Create a bitmap from the raw image data for efficient drawing
                const imageData = ctx.createImageData(width, height);
                imageData.data.set(pixels);
                const imageBitmap = await createImageBitmap(imageData);

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
                const frameOffset = frame ? 32 * scale : 0;

                // Set canvas dimensions to 2x the original image size
                canvas.width = imageData.width * scale + frameOffset;
                canvas.height = imageData.height * scale + frameOffset;

                // Disable anti-aliasing to get crisp, hard-edge pixels
                ctx.imageSmoothingEnabled = false;

                // Draw the bitmap onto the canvas, scaling it up
                ctx.drawImage(imageBitmap, frameOffset / 2, frameOffset / 2, imageData.width * scale, imageData.height * scale);

                // Draw frame
                if (frameBitmap) {
                    ctx.drawImage(frameBitmap, 0, 0, canvas.width, canvas.height);
                }
            }
        };

        renderImage();
    }, [data, photoIndex, palette, frame, scaleFactor]); // The effect depends on the `data` prop.

    if (!data) {
        return null;
    }

    return (
        <>
            {data?.images ? data.images[photoIndex].comment : null}
            <canvas style={{ display: 'block', float: 'left', margin: '10px', padding: 0 }} ref={canvasRef}></canvas>
        </>
    );
}

Photo.propTypes = {
    data: PropTypes.object,
    photoIndex: PropTypes.number,
    paletteId: PropTypes.string,
    frame: PropTypes.object,
    scaleFactor: PropTypes.number
};

export default Photo;
