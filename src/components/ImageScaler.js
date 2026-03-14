import { useState, useRef, useEffect } from 'react';
import Modal from './Modal.js';
import FileLoader from './FileLoader.js';
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

    // Resizes the canvas drawing buffer and redraws the image whenever
    // the source image or the scale factor changes.
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

        // Draw the image stretched to the new internal resolution
        ctx.drawImage(image, 0, 0, targetWidth, targetHeight);
    }, [image, displayScale, baseDimensions]);

    /**
     * Processes the selected file, creates an Image object, and stores it in state.
     *
     * @param {Object} fileInfo - Object containing raw file data as an ArrayBuffer and the name.
     */
    const handleFileChange = ({ data, name }) => {
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

            if (diffWild < diffStandard && diffWild < diffNoFrame) {
                setBaseDimensions({ width: 160, height: 244 });
            } else if (diffStandard < diffNoFrame) {
                setBaseDimensions({ width: 160, height: 144 });
            } else {
                setBaseDimensions({ width: 128, height: 112 });
            }
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
                Scaler
            </button>
            <Modal
                type="full"
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                title="Image Scaler"
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
                                ctx.clearRect(0, 0, canvas.width, canvas.height);
                            }
                        }}
                        showRemove={image ? true : false}
                        accept=".png"
                    />

                    {image && (
                        <>
                            <label style={{ display: 'block', marginTop: '10px' }}>
                                Preview Scale:{' '}
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
