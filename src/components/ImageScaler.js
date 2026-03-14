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

    // Resizes the canvas drawing buffer and redraws the image whenever
    // the source image or the scale factor changes.
    useEffect(() => {
        if (!image || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Calculate target internal resolution
        const targetWidth = image.width * displayScale;
        const targetHeight = image.height * displayScale;

        // This changes the actual size of the image data (the drawing buffer)
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // Resizing a canvas resets the context state, so we must disable smoothing now
        ctx.imageSmoothingEnabled = false;

        // Draw the image stretched to the new internal resolution
        ctx.drawImage(image, 0, 0, targetWidth, targetHeight);
    }, [image, displayScale]);

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
                                    {[2, 3, 4, 5, 6, 8, 10, 12, 16].map((s) => (
                                        <option
                                            key={s}
                                            value={s}
                                        >
                                            {s}x
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
                                    Save {image.width * displayScale} x{' '}
                                    {image.height * displayScale}
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
