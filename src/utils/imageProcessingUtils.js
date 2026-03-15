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

export const getFramedLayout = (baseDimensions, frame) => {
    let finalWidth = baseDimensions.width;
    let finalHeight = baseDimensions.height;
    let offsetX = 0;
    let offsetY = 0;

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
 * Draws the scaled and palette-applied image to the canvas.
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

    const { finalWidth, finalHeight, offsetX, offsetY } = getFramedLayout(baseDimensions, frame);

    const targetWidth = finalWidth * displayScale;
    const targetHeight = finalHeight * displayScale;

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
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = frame.width;
            tempCanvas.height = frame.height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.imageSmoothingEnabled = false;
            tempCtx.drawImage(frame, 0, 0, frame.width, frame.height);

            const imageData = tempCtx.getImageData(0, 0, frame.width, frame.height);
            const data = imageData.data;
            const paletteObj = palettes[palette] || Object.values(palettes)[0];
            const currentColors = paletteObj ? paletteObj.colors : null;

            if (currentColors && currentColors.length >= 4) {
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i],
                        g = data[i + 1],
                        b = data[i + 2],
                        a = data[i + 3];
                    if (a === 0) continue; // Preserve transparency
                    const colorStr = `${r},${g},${b}`;
                    const index = frameColorIndexMap.get(colorStr);
                    if (index !== undefined && index < currentColors.length) {
                        const color = currentColors[index];
                        data[i] = color.r;
                        data[i + 1] = color.g;
                        data[i + 2] = color.b;
                        data[i + 3] = 255; // Make opaque where color is applied
                    }
                }
                tempCtx.putImageData(imageData, 0, 0);
            }
            frameToDraw = tempCanvas;
        }

        ctx.drawImage(frameToDraw, 0, 0, targetWidth, targetHeight);
    }
};

export const calculateBaseDimensions = (width, height) => {
    const aspectRatio = width / height;
    if (Math.abs(aspectRatio - 160 / 224) < 0.05) return { width: 160, height: 224 };
    if (Math.abs(aspectRatio - 160 / 144) < 0.01) return { width: 160, height: 144 };
    return { width: 128, height: 112 };
};
