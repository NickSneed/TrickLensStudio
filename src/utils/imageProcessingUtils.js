import { palettes } from 'tricklens-js';

/**
 * Analyzes the image to find unique colors and sorts them by luminance.
 * @param {HTMLImageElement} image - The source image.
 * @param {number} width - The width to analyze.
 * @param {number} height - The height to analyze.
 * @returns {Map<string, number>} A map of color strings to indices.
 */
export const analyzeImageColors = (image, width, height) => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.imageSmoothingEnabled = false;
    tempCtx.drawImage(image, 0, 0, width, height);
    const imageData = tempCtx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const uniqueColors = new Map();

    // Extract unique colors from the image data
    for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] === 0) continue; // Skip transparent pixels
        const r = data[i],
            g = data[i + 1],
            b = data[i + 2];
        const colorStr = `${r},${g},${b}`;
        if (!uniqueColors.has(colorStr)) {
            uniqueColors.set(colorStr, { r, g, b });
            // Most images will have 4 colors or less, so we can exit early.
            if (uniqueColors.size === 4) {
                break;
            }
        }
    }

    // Calculate luminance for each unique color to map them to palette indices (brightness)
    const colorsWithLuminance = Array.from(uniqueColors.values()).map((color) => ({
        ...color,
        luminance: 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b
    }));

    // Sort lightest to darkest
    colorsWithLuminance.sort((a, b) => b.luminance - a.luminance);

    // Create the new colors map
    const newColorMap = new Map();
    colorsWithLuminance.forEach((color, index) => {
        const colorStr = `${color.r},${color.g},${color.b}`;
        newColorMap.set(colorStr, index);
    });

    return newColorMap;
};

/**
 * Calculates the layout dimensions and offsets for an image with an optional frame.
 *
 * @param {{width: number, height: number}} baseDimensions - The base dimensions of the source image.
 * @param {HTMLImageElement} [frame] - The frame image to be applied.
 * @returns {{finalWidth: number, finalHeight: number, offsetX: number, offsetY: number}} The calculated layout properties.
 */
export const getFramedLayout = (baseDimensions, frame) => {
    let finalWidth = baseDimensions.width;
    let finalHeight = baseDimensions.height;
    let offsetX = 0;
    let offsetY = 0;

    // Only adjust dimensions for frames if the base image is the standard 128x112 size
    if (frame && baseDimensions.width === 128 && baseDimensions.height === 112) {
        const frameAspect = frame.width / frame.height;
        // Check for Wild frame (160x224) vs Standard (160x144)
        if (Math.abs(frameAspect - 160 / 224) < 0.1) {
            finalWidth = 160;
            finalHeight = 224;
            offsetX = 16;
            offsetY = 40;
        } else {
            finalWidth = 160;
            finalHeight = 144;
            offsetX = 16;
            offsetY = 16;
        }
    }

    return { finalWidth, finalHeight, offsetX, offsetY };
};

/**
 * Applies a palette to an image, returning a new canvas with the transformed content.
 *
 * @param {HTMLImageElement} source - The image to process.
 * @param {number} width - The width of the image.
 * @param {number} height - The height of the image.
 * @param {Map<string, number>} colorIndexMap - The map of original colors to palette indices.
 * @param {string} palette - The palette ID to apply.
 * @returns {HTMLCanvasElement} A new canvas with the palette applied.
 */
const applyPalette = (source, width, height, colorIndexMap, palette) => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.imageSmoothingEnabled = false;
    tempCtx.drawImage(source, 0, 0, width, height);

    const imageData = tempCtx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const paletteObj = palettes[palette] || Object.values(palettes)[0];
    const currentColors = paletteObj ? paletteObj.colors : null;

    if (currentColors && currentColors.length >= 4) {
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i],
                g = data[i + 1],
                b = data[i + 2],
                a = data[i + 3];
            if (a === 0) continue;
            const colorStr = `${r},${g},${b}`;
            const index = colorIndexMap.get(colorStr);
            if (index !== undefined && index < currentColors.length) {
                const color = currentColors[index];
                data[i] = color.r;
                data[i + 1] = color.g;
                data[i + 2] = color.b;
                data[i + 3] = 255;
            }
        }
        tempCtx.putImageData(imageData, 0, 0);
    }

    return tempCanvas;
};

/**
 * Draws the scaled and palette-applied image to the canvas.
 *
 * @param {HTMLCanvasElement} canvas - The canvas element to draw onto.
 * @param {HTMLImageElement} image - The source image.
 * @param {{width: number, height: number}} baseDimensions - The base dimensions of the image.
 * @param {number} displayScale - The scale factor for drawing.
 * @param {string} palette - The palette ID to apply.
 * @param {Map<string, number>} colorIndexMap - The map of original colors to palette indices.
 * @param {HTMLImageElement} [frame] - The optional frame image.
 */
export const drawScaledImage = (
    canvas,
    image,
    baseDimensions,
    displayScale,
    palette,
    colorIndexMap,
    frame
) => {
    if (!canvas || !image || !baseDimensions.width) return;

    const ctx = canvas.getContext('2d');

    // Calculate the final canvas size and where the image should be placed
    const { finalWidth, finalHeight, offsetX, offsetY } = getFramedLayout(baseDimensions, frame);
    const targetWidth = finalWidth * displayScale;
    const targetHeight = finalHeight * displayScale;

    canvas.width = targetWidth;
    canvas.height = targetHeight;
    ctx.imageSmoothingEnabled = false;

    let imageToDraw = image;

    // Apply the selected palette to the main image
    if (palette && colorIndexMap) {
        imageToDraw = applyPalette(
            image,
            baseDimensions.width,
            baseDimensions.height,
            colorIndexMap,
            palette
        );
    }

    // Draw the main image onto the canvas at the calculated offset
    ctx.drawImage(
        imageToDraw,
        offsetX * displayScale,
        offsetY * displayScale,
        baseDimensions.width * displayScale,
        baseDimensions.height * displayScale
    );

    // Draw the frame over the image if it exists
    if (frame) {
        let frameToDraw = frame;

        // If a palette is selected, apply it to the frame as well
        if (palette) {
            const frameColorIndexMap = analyzeImageColors(frame, frame.width, frame.height);
            frameToDraw = applyPalette(
                frame,
                frame.width,
                frame.height,
                frameColorIndexMap,
                palette
            );
        }

        ctx.drawImage(frameToDraw, 0, 0, targetWidth, targetHeight);
    }
};

/**
 * Calculates the standard base dimensions for a Game Boy Camera image based on its aspect ratio.
 *
 * @param {number} width - The width of the raw image.
 * @param {number} height - The height of the raw image.
 * @returns {{width: number, height: number}} The standardized width and height.
 */
export const calculateBaseDimensions = (width, height) => {
    const aspectRatio = width / height;
    // Check if the image matches the "Wild" frame aspect ratio (160x224)
    if (Math.abs(aspectRatio - 160 / 224) < 0.05) return { width: 160, height: 224 };
    // Check if the image matches the standard Game Boy Camera frame aspect ratio (160x144)
    if (Math.abs(aspectRatio - 160 / 144) < 0.01) return { width: 160, height: 144 };
    // Default to the standard raw image size (128x112)
    return { width: 128, height: 112 };
};
