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
    for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] === 0) continue; // Skip transparent pixels
        const r = data[i],
            g = data[i + 1],
            b = data[i + 2];
        const colorStr = `${r},${g},${b}`;
        if (!uniqueColors.has(colorStr)) {
            uniqueColors.set(colorStr, { r, g, b });
        }
    }

    const colorsWithLuminance = Array.from(uniqueColors.values()).map((color) => ({
        ...color,
        luminance: 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b
    }));

    colorsWithLuminance.sort((a, b) => b.luminance - a.luminance); // Sort lightest to darkest

    const newColorMap = new Map();
    colorsWithLuminance.forEach((color, index) => {
        const colorStr = `${color.r},${color.g},${color.b}`;
        newColorMap.set(colorStr, index);
    });

    return newColorMap;
};

/**
 * Draws the scaled and palette-applied image to the canvas.
 */
export const drawScaledImage = (
    canvas,
    image,
    baseDimensions,
    displayScale,
    palette,
    colorIndexMap
) => {
    if (!canvas || !image || !baseDimensions.width) return;

    const ctx = canvas.getContext('2d');
    const targetWidth = baseDimensions.width * displayScale;
    const targetHeight = baseDimensions.height * displayScale;

    canvas.width = targetWidth;
    canvas.height = targetHeight;
    ctx.imageSmoothingEnabled = false;

    let imageToDraw = image;

    if (palette && colorIndexMap) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = baseDimensions.width;
        tempCanvas.height = baseDimensions.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.imageSmoothingEnabled = false;
        tempCtx.drawImage(image, 0, 0, baseDimensions.width, baseDimensions.height);

        const imageData = tempCtx.getImageData(0, 0, baseDimensions.width, baseDimensions.height);
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
        imageToDraw = tempCanvas;
    }
    ctx.drawImage(imageToDraw, 0, 0, targetWidth, targetHeight);
};

export const calculateBaseDimensions = (width, height) => {
    const aspectRatio = width / height;
    if (Math.abs(aspectRatio - 160 / 244) < 0.1) return { width: 160, height: 244 };
    if (Math.abs(aspectRatio - 160 / 144) < 0.1) return { width: 160, height: 144 };
    return { width: 128, height: 112 };
};
