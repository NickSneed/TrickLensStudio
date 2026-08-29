import { applyPalette, applyRGB } from 'tricklens-js';
import { composeImage } from './canvasUtils.js';
import { getFrameOffsets } from './frameUtils.js';

/**
 * Draws a scanline grid aligned to actual rendered pixels.
 * @param {CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D} ctx
 * @param {number} pixelScale
 * @param {number} brightness
 * @param {Object} palette
 */
export const drawScanlineGrid = (ctx, pixelScale, brightness, palette) => {
    const colorObj = palette?.colors?.[0];
    const totalWidth = ctx.canvas.width;
    const totalHeight = ctx.canvas.height;
    const scaledBrightness = brightness + pixelScale / 50;

    ctx.save();
    ctx.strokeStyle = colorObj
        ? `rgba(${colorObj.r}, ${colorObj.g}, ${colorObj.b}, ${scaledBrightness})`
        : `rgba(255, 255, 255, ${scaledBrightness})`;
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.beginPath();

    // Draw horizontal lines
    for (let y = 0; y < totalHeight; y += pixelScale) {
        const currentY = Math.round(y) + 0.5;
        ctx.moveTo(0, currentY);
        ctx.lineTo(totalWidth, currentY);
    }

    // Draw vertical segments skipping horizontal lines
    for (let x = 0; x < totalWidth; x += pixelScale) {
        const currentX = Math.round(x) + 0.5;
        for (let y = 0; y < totalHeight; y += pixelScale) {
            const startY = y + 1;
            const endY = Math.min(y + pixelScale, totalHeight);
            if (startY < endY) {
                ctx.moveTo(currentX, startY);
                ctx.lineTo(currentX, endY);
            }
        }
    }

    ctx.stroke();
    ctx.restore();
};

/**
 * Composes a photo with an optional palette, frame, and RGB channels into an OffscreenCanvas.
 *
 * @param {Object} photo - The primary photo data (Red channel or grayscale).
 * @param {Object} palette - The color palette object to apply.
 * @param {Object} [frame] - The frame data to overlay.
 * @param {Array} [paletteOrder] - The order of colors in the palette.
 * @param {Object} [rgbOptions] - Optional RGB channel options { photoG, photoB, rgbBrightness, rgbContrast }.
 * @returns {Promise<OffscreenCanvas>} The composed image canvas.
 */
export async function composePhotoCanvas(
    photo,
    palette,
    frame = null,
    paletteOrder = null,
    rgbOptions = null
) {
    const { width, height, pixels } = photo;
    let palettePixels;

    if (rgbOptions && rgbOptions.photoG && rgbOptions.photoB) {
        palettePixels = applyRGB(
            pixels,
            rgbOptions.photoG.pixels,
            rgbOptions.photoB.pixels,
            width,
            height,
            rgbOptions.rgbBrightness,
            rgbOptions.rgbContrast
        );
    } else {
        palettePixels = applyPalette(pixels, palette, paletteOrder);
    }

    const imageBitmap = await createImageBitmap(new ImageData(palettePixels, width, height));

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
    return composeImage(imageBitmap, frameBitmap, width, height, offsets);
}

/**
 * Renders a single photo headlessly to an OffscreenCanvas at save resolution.
 *
 * @param {Object} photo - The photo data object.
 * @param {Object} palette - The active palette.
 * @param {Object|null} frame - The active frame (or null).
 * @param {Object} settings - Relevant settings: saveScale, isScanline, scanlineBrightness, isScanlineDisplayOnly.
 * @param {string|null} [paletteOrder] - Optional palette order string.
 * @param {Object} [rgbOptions] - Optional RGB channel options { photoG, photoB, rgbBrightness, rgbContrast }.
 * @returns {Promise<OffscreenCanvas>} The rendered canvas.
 */
export async function renderPhotoToCanvas(
    photo,
    palette,
    frame,
    settings,
    paletteOrder = null,
    rgbOptions = null
) {
    const { saveScale, isScanline, scanlineBrightness, isScanlineDisplayOnly } = settings;

    const compositionCanvas = await composePhotoCanvas(
        photo,
        palette,
        frame,
        paletteOrder,
        rgbOptions
    );

    // Build the save canvas at full resolution
    const saveCanvas = new OffscreenCanvas(
        compositionCanvas.width * saveScale,
        compositionCanvas.height * saveScale
    );
    const saveCtx = saveCanvas.getContext('2d');
    saveCtx.imageSmoothingEnabled = false;
    saveCtx.drawImage(compositionCanvas, 0, 0, saveCanvas.width, saveCanvas.height);

    // Optionally draw scanline grid (only if not display-only)
    const shouldDrawScanline = isScanline && !isScanlineDisplayOnly;
    if (shouldDrawScanline) {
        drawScanlineGrid(saveCtx, saveScale, scanlineBrightness, palette);
    }

    return saveCanvas;
}
