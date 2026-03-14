import { useState, useRef, useEffect } from 'react';
import Modal from './Modal.js';
import FileLoader from './FileLoader.js';
import PaletteSelector from './PaletteSelector.js';
import * as styles from './ImageEditor.module.css';
import {
    analyzeImageColors,
    drawScaledImage,
    calculateBaseDimensions
} from '../utils/imageProcessingUtils.js';
import { isIOS } from '../utils/deviceUtils.js';

/**
 * ImageEditor component provides a UI for uploading, previewing, and scaling PNG images.
 * It uses a canvas to perform nearest-neighbor upscaling and allows users to download
 * the resulting high-resolution image.
 *
 * @returns {JSX.Element} The rendered ImageEditor component.
 */
const ImageEditor = () => {
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
        const newColorMap = analyzeImageColors(image, baseDimensions.width, baseDimensions.height);
        setColorIndexMap(newColorMap);
    }, [image, baseDimensions]);

    // Resizes the canvas drawing buffer and redraws the image whenever
    // the source image, scale factor, or palette changes.
    useEffect(() => {
        drawScaledImage(
            canvasRef.current,
            image,
            baseDimensions,
            displayScale,
            palette,
            colorIndexMap
        );
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
            const newBaseDimensions = calculateBaseDimensions(img.width, img.height);

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

    /**
     * Triggers the Web Share API for the current canvas content.
     */
    const handleShare = () => {
        if (!canvasRef.current || typeof navigator === 'undefined' || !navigator.share) return;

        const baseName = fileName.replace(/\.[^/.]+$/, '');
        const shareFileName = `${baseName}-${displayScale}x.png`;

        canvasRef.current.toBlob(async (blob) => {
            if (blob) {
                const file = new File([blob], shareFileName, { type: 'image/png' });
                try {
                    await navigator.share({
                        files: [file],
                        title: shareFileName
                    });
                } catch (error) {
                    // Ignore errors thrown when the user cancels the share dialog
                    if (error.name !== 'AbortError') {
                        console.error('Error sharing:', error);
                    }
                }
            }
        }, 'image/png');
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
                                {isIOS() && typeof navigator !== 'undefined' && navigator.share ? (
                                    <button
                                        className="button"
                                        onClick={handleShare}
                                    >
                                        Share
                                    </button>
                                ) : (
                                    <button
                                        className="button"
                                        onClick={handleDownload}
                                    >
                                        Save
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </Modal>
        </>
    );
};

export default ImageEditor;
