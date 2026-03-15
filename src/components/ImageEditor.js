import { useState, useRef, useEffect, useMemo } from 'react';
import Modal from './Modal.js';
import FileLoader from './FileLoader.js';
import PaletteSelector from './PaletteSelector.js';
import * as styles from './ImageEditor.module.css';
import {
    analyzeImageColors,
    drawScaledImage,
    calculateBaseDimensions,
    getFramedLayout,
    createImageFromBuffer
} from '../utils/imageProcessingUtils.js';
import ExportButton from './ExportButton.js';
import EditorLayout from './EditorLayout.js';

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
    const [frame, setFrame] = useState(null);
    const [fileName, setFileName] = useState('');
    const [baseDimensions, setBaseDimensions] = useState({ width: 0, height: 0 });
    const [palette, setPalette] = useState(null);
    const [colorIndexMap, setColorIndexMap] = useState(null);

    const displayedDimensions = useMemo(() => {
        const { finalWidth, finalHeight } = getFramedLayout(baseDimensions, frame);
        return { width: finalWidth, height: finalHeight };
    }, [baseDimensions, frame]);

    // Auto-scale to 1280px width when dimensions change (image load or frame switch)
    useEffect(() => {
        if (displayedDimensions.width > 0) {
            const targetWidth = 1280;
            setDisplayScale(targetWidth / displayedDimensions.width);
        }
    }, [displayedDimensions.width, image, frame]);

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
            colorIndexMap,
            frame
        );
    }, [image, displayScale, baseDimensions, palette, colorIndexMap, frame]);

    // Prepare filename for export (remove original extension, append scale)
    const baseName = fileName.replace(/\.[^/.]+$/, '');
    const exportFileName = `${baseName}-${displayScale}x`;

    /**
     * Processes the selected file, creates an Image object, and stores it in state.
     *
     * @param {Object} fileInfo - Object containing raw file data as an ArrayBuffer and the name.
     */
    const handleFileChange = async ({ data, name }) => {
        setPalette(null);
        setFileName(name);
        try {
            const img = await createImageFromBuffer(data);
            const newBaseDimensions = calculateBaseDimensions(img.width, img.height);
            setBaseDimensions(newBaseDimensions);
            setImage(img);
        } catch (error) {
            console.error('Failed to load image:', error);
        }
    };

    /**
     * Processes the selected frame file, creates an Image object, and stores it in state.
     *
     * @param {Object} fileInfo - Object containing raw file data as an ArrayBuffer.
     */
    const handleFrameChange = async ({ data }) => {
        try {
            const img = await createImageFromBuffer(data);
            setFrame(img);
        } catch (error) {
            console.error('Failed to load frame:', error);
        }
    };

    const mainContent = image ? (
        <>
            <canvas
                ref={canvasRef}
                className={styles.canvas}
            />
            <ExportButton
                saveCanvasRef={canvasRef}
                fileNameOverride={exportFileName}
            />
        </>
    ) : (
        <div className={`${styles.placeholder} mainMessage`}>Select a .png file</div>
    );

    const controlsContent = (
        <>
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
                        setFrame(null);
                        setDisplayScale(2);
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                    }
                }}
                showRemove={image ? true : false}
                accept=".png"
            />
            {image && (
                <>
                    <FileLoader
                        text="Select frame &hellip;"
                        onChange={handleFrameChange}
                        onRemove={() => {
                            setFrame(null);
                        }}
                        showRemove={frame ? true : false}
                        accept=".png"
                    />
                    <PaletteSelector
                        currentPalette={palette}
                        onPaletteChange={setPalette}
                    />
                    {palette && (
                        <button
                            onClick={() => setPalette(null)}
                            className={`button`}
                        >
                            Remove Palette
                        </button>
                    )}
                    <label>
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
                                    {displayedDimensions.width > 0 &&
                                        ` (${displayedDimensions.width * s}x${
                                            displayedDimensions.height * s
                                        })`}
                                </option>
                            ))}
                        </select>
                    </label>
                </>
            )}
        </>
    );

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
                <EditorLayout
                    mainContent={mainContent}
                    controlsContent={controlsContent}
                />
            </Modal>
        </>
    );
};

export default ImageEditor;
