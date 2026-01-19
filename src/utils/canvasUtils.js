/**
 * Converts a frame image buffer into a Uint8Array of color indices.
 * @param {ArrayBuffer} frame - The original frame data.
 * @returns {Promise<{width: number, height: number, data: Uint8Array}>}
 */
export async function convertFrameToData(frame) {
    const bitmap = await createImageBitmap(new Blob([frame]));
    const { width, height } = bitmap;

    const offscreenCanvas = new OffscreenCanvas(width, height);
    const offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCtx.drawImage(bitmap, 0, 0);
    const frameImageData = offscreenCtx.getImageData(0, 0, width, height);
    const data = frameImageData.data;

    const frameData = new Uint8Array(width * height);

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const a = data[i + 3];

        if (a < 128) {
            frameData[i / 4] = 4; // Transparent
        } else if (r >= 200) {
            frameData[i / 4] = 0; // White
        } else if (r >= 120) {
            frameData[i / 4] = 1; // Light Gray
        } else if (r >= 40) {
            frameData[i / 4] = 2; // Dark Gray
        } else {
            frameData[i / 4] = 3; // Black
        }
    }

    return { width, height, data: frameData };
}

/**
 * Composes the image and frame onto a single canvas.
 * @param {ImageBitmap} imageBitmap - The main image.
 * @param {ImageBitmap | null} frameBitmap - The frame image (optional).
 * @param {number} width - The width of the main image.
 * @param {number} height - The height of the main image.
 * @param {Object} offsets - The offsets for the frame.
 * @returns {OffscreenCanvas} The canvas with the composed image.
 */
export function composeImage(imageBitmap, frameBitmap, width, height, offsets) {
    const {
        top = frameBitmap ? 16 : 0,
        bottom = frameBitmap ? 16 : 0,
        left = frameBitmap ? 16 : 0,
        right = frameBitmap ? 16 : 0
    } = offsets || {};
    const compositeWidth = width + left + right;
    const compositeHeight = height + top + bottom;

    const compositionCanvas = new OffscreenCanvas(compositeWidth, compositeHeight);
    const ctx = compositionCanvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    ctx.drawImage(imageBitmap, left, top, width, height);
    if (frameBitmap) {
        ctx.drawImage(frameBitmap, 0, 0, compositeWidth, compositeHeight);
    }

    return compositionCanvas;
}
