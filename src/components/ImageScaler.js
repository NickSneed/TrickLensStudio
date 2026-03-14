import { useState, useRef, useEffect } from 'react';
import { palettes } from 'tricklens-js';
import Modal from './Modal.js';
import FileLoader from './FileLoader.js';
import PaletteSelector from './PaletteSelector.js';
import * as styles from './ImageScaler.module.css';

/**
 * ImageScaler component provides a UI for uploading, previewing, and scaling PNG images.
 * It uses a canvas to perform nearest-neighbor upscaling and allows users to download
 * the resulting high-resolution image.
 *
 * @returns {JSX.Element} The rendered ImageScaler component.
 */
const ImageScaler = () => {
    const [isOpen, setIsOpen] = useState(false);
    const canvasRef = useRef(null);
    const [displayScale, setDisplayScale] = useState(2);
    const [image, setImage] = useState(null);
    const [fileName, setFileName] = useState('');
    const [baseDimensions, setBaseDimensions] = useState({ width: 0, height: 0 });
    const [palette, setPalette] = useState(null);
    const [colorIndexMap, setColorIndexMap] = useState(null);

    // Analyze the image's colors to create a brightness-based mapping.
    useEffect(() => {
        if (!image || !baseDimensions.width) {
            setColorIndexMap(null);
            return;
        }

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = baseDimensions.width;
        tempCanvas.height = baseDimensions.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.imageSmoothingEnabled = false;
        tempCtx.drawImage(image, 0, 0, baseDimensions.width, baseDimensions.height);

        const imageData = tempCtx.getImageData(0, 0, baseDimensions.width, baseDimensions.height);
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

        setColorIndexMap(newColorMap);
    }, [image, baseDimensions]);

    // Resizes the canvas drawing buffer and redraws the image whenever
    // the source image, scale factor, or palette changes.
    useEffect(() => {
        if (!image || !canvasRef.current || !baseDimensions.width) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Calculate target internal resolution
        const targetWidth = baseDimensions.width * displayScale;
        const targetHeight = baseDimensions.height * displayScale;

        // This changes the actual size of the image data (the drawing buffer)
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // Resizing a canvas resets the context state, so we must disable smoothing now
        ctx.imageSmoothingEnabled = false;

        let imageToDraw = image;

        // Only apply palette if one is selected and the color map is ready
        if (palette && colorIndexMap) {
            // Create a temporary canvas to handle pixel manipulation at base resolution
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = baseDimensions.width;
            tempCanvas.height = baseDimensions.height;
            const tempCtx = tempCanvas.getContext('2d');
            // Disable smoothing to preserve original pixel colors when downscaling
            tempCtx.imageSmoothingEnabled = false;
            tempCtx.drawImage(image, 0, 0, baseDimensions.width, baseDimensions.height);

            // Apply palette coloring
            const imageData = tempCtx.getImageData(
                0,
                0,
                baseDimensions.width,
                baseDimensions.height
            );
            const data = imageData.data;
            // Safely get the palette, falling back to the first available one if the selected one is invalid.
            const paletteObj = palettes[palette] || Object.values(palettes)[0];
            const currentColors = paletteObj ? paletteObj.colors : null;

            if (currentColors && currentColors.length >= 4) {
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i],
                        g = data[i + 1],
                        b = data[i + 2],
                        a = data[i + 3];

                    // If pixel is transparent, keep it that way
                    if (a === 0) continue;

                    const colorStr = `${r},${g},${b}`;
                    const index = colorIndexMap.get(colorStr);

                    if (index !== undefined && index < currentColors.length) {
                        const color = currentColors[index];
                        data[i] = color.r;
                        data[i + 1] = color.g;
                        data[i + 2] = color.b;
                        data[i + 3] = 255; // Ensure full alpha
                    }
                }
                tempCtx.putImageData(imageData, 0, 0);
            }
            imageToDraw = tempCanvas;
        }

        // Draw the original or processed image, stretched to the new internal resolution
        ctx.drawImage(imageToDraw, 0, 0, targetWidth, targetHeight);
    }, [image, displayScale, baseDimensions, palette, colorIndexMap]);

    /**
     * Processes the selected file, creates an Image object, and stores it in state.
     *
     * @param {Object} fileInfo - Object containing raw file data as an ArrayBuffer and the name.
     */
    const handleFileChange = ({ data, name }) => {
        setPalette(null);
        setFileName(name);
        const blob = new Blob([data], { type: 'image/png' });
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
            // Determine base dimensions based on aspect ratio
            const aspectRatio = img.width / img.height;
            const standardFrameAspectRatio = 160 / 144;
            const noFrameAspectRatio = 128 / 112;
            const wildFrameAspectRatio = 160 / 244;

            const diffStandard = Math.abs(aspectRatio - standardFrameAspectRatio);
            const diffNoFrame = Math.abs(aspectRatio - noFrameAspectRatio);
            const diffWild = Math.abs(aspectRatio - wildFrameAspectRatio);

            let newBaseDimensions;
            if (diffWild < diffStandard && diffWild < diffNoFrame) {
                newBaseDimensions = { width: 160, height: 244 };
            } else if (diffStandard < diffNoFrame) {
                newBaseDimensions = { width: 160, height: 144 };
            } else {
                newBaseDimensions = { width: 128, height: 112 };
            }

            // Set the default scale to make the image 1280px wide
            if (newBaseDimensions.width > 0) {
                const targetWidth = 1280;
                setDisplayScale(targetWidth / newBaseDimensions.width);
            }

            setBaseDimensions(newBaseDimensions);
            setImage(img);
            URL.revokeObjectURL(url);
        };
        img.src = url;
    };

    /**
     * Triggers a browser download of the current canvas content as a PNG file.
     */
    const handleDownload = () => {
        if (!canvasRef.current) return;
        const link = document.createElement('a');
        // Remove the existing extension and append the scale
        const baseName = fileName.replace(/\.[^/.]+$/, '');
        link.download = `${baseName}-${displayScale}x.png`;
        link.href = canvasRef.current.toDataURL('image/png');
        link.click();
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`button`}
            >
                Img Editor
            </button>
            <Modal
                type="full"
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                title="Image Editor"
            >
                <div className={styles.scalerwrapper}>
                    <FileLoader
                        text="Select PNG &hellip;"
                        onChange={handleFileChange}
                        // Reset the component state when the selected file is removed
                        onRemove={() => {
                            const canvas = canvasRef.current;
                            if (canvas) {
                                const ctx = canvas.getContext('2d');
                                setImage(null);
                                setFileName('');
                                setBaseDimensions({ width: 0, height: 0 });
                                setColorIndexMap(null);
                                setPalette(null);
                                setDisplayScale(2);
                                ctx.clearRect(0, 0, canvas.width, canvas.height);
                            }
                        }}
                        showRemove={image ? true : false}
                        accept=".png"
                    />

                    {image && (
                        <>
                            <div style={{ marginTop: '10px' }}>
                                <PaletteSelector
                                    currentPalette={palette}
                                    onPaletteChange={setPalette}
                                />
                            </div>
                            <label style={{ display: 'block', marginTop: '10px' }}>
                                Scale:{' '}
                                <select
                                    className="select"
                                    value={displayScale}
                                    onChange={(e) => setDisplayScale(Number(e.target.value))}
                                >
                                    {[1, 2, 3, 4, 5, 6, 8, 10, 12, 16].map((s) => (
                                        <option
                                            key={s}
                                            value={s}
                                        >
                                            {s}x
                                            {baseDimensions.width > 0 &&
                                                ` (${baseDimensions.width * s}x${
                                                    baseDimensions.height * s
                                                })`}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <div className={styles.canvaswrapper}>
                                <canvas
                                    ref={canvasRef}
                                    className={styles.canvas}
                                />
                            </div>
                            <div style={{ marginTop: '10px' }}>
                                <button
                                    className="button"
                                    onClick={handleDownload}
                                >
                                    Save
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </Modal>
        </>
    );
};

export default ImageScaler;
