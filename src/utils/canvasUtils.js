/**
 * Recolors a frame image using a new palette.
 * Assumes the original frame uses a specific 4-shade grayscale palette.
 * @param {ArrayBuffer} frame - The original frame data.
 * @param {Array<Object>} newPaletteColors - The new palette to apply.
 * @returns {Promise<ImageBitmap>} A promise that resolves with the recolored frame as an ImageBitmap.
 */
export async function recolorFrame(frame, newPaletteColors) {
    const originalFrameBitmap = await createImageBitmap(new Blob([frame]));

    // Use an OffscreenCanvas for recoloring the frame
    const offscreenCanvas = new OffscreenCanvas(
        originalFrameBitmap.width,
        originalFrameBitmap.height
    );
    const offscreenCtx = offscreenCanvas.getContext('2d');

    // Draw the original frame to get its pixel data
    offscreenCtx.drawImage(originalFrameBitmap, 0, 0);
    const frameImageData = offscreenCtx.getImageData(
        0,
        0,
        originalFrameBitmap.width,
        originalFrameBitmap.height
    );
    const frameData = frameImageData.data;

    // The original grayscale palette of the frame file.
    const originalFramePalette = [
        [255, 255, 255, 255], // White
        [160, 160, 160, 255], // Light Gray
        [80, 80, 80, 255], // Dark Gray
        [0, 0, 0, 255] // Black
    ];

    const newPalette = newPaletteColors.map((c) => [c.r, c.g, c.b, 255]);

    // Helper to compare colors
    const colorsMatch = (a, b) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];

    // Replace colors pixel by pixel
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

    return await createImageBitmap(frameImageData);
}

/**
 * Composes the image and frame onto a single canvas.
 * @param {ImageBitmap} imageBitmap - The main image.
 * @param {ImageBitmap | null} frameBitmap - The frame image (optional).
 * @param {number} width - The width of the main image.
 * @param {number} height - The height of the main image.
 * @returns {OffscreenCanvas} The canvas with the composed image.
 */
export function composeImage(imageBitmap, frameBitmap, width, height) {
    const frameOffset = frameBitmap ? 32 : 0;
    const compositeWidth = width + frameOffset;
    const compositeHeight = height + frameOffset;

    const compositionCanvas = new OffscreenCanvas(compositeWidth, compositeHeight);
    const ctx = compositionCanvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    ctx.drawImage(imageBitmap, frameOffset / 2, frameOffset / 2, width, height);
    if (frameBitmap) {
        ctx.drawImage(frameBitmap, 0, 0, compositeWidth, compositeHeight);
    }

    return compositionCanvas;
}
