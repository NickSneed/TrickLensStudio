import PropTypes from 'prop-types';
import { useRef, useEffect } from 'react';
import { palettes, applyPalette } from 'gbcam-js';
import * as styles from './Photo.module.css';
import { recolorFrame, composeImage } from '../utils/canvasUtils.js';

function Photo({ image, paletteId, frame, scaleFactor, showDeletedFlag, isScale, onClick }) {
    const canvasRefSave = useRef(null);
    const canvasRefDisplay = useRef(null);
    const saveScale = 10;
    const palette = palettes[paletteId];
    const displayScale = scaleFactor;
    const imageBaseWidth = frame ? 160 : 128;
    const isWild = frame && frame.name.includes('wild');
    const frameHeight = isWild ? 224 : 144;
    const imageBaseHeight = frame ? frameHeight : 112;

    // CSS settings
    const canvasPadding = frame ? '0' : 16 * displayScale + 'px';
    const canvasWidth = imageBaseWidth * displayScale;
    const canvasHeight = imageBaseHeight * displayScale;

    useEffect(() => {
        if (!image) return;

        (async () => {
            try {
                const { width, height, photoData } = image;

                // Apply the color palette to the photo
                const pixels = applyPalette(photoData, palette);

                // Create a bitmap from the raw image data for efficient drawing
                const imageBitmap = await createImageBitmap(new ImageData(pixels, width, height));

                // Recolor the frame if it exists
                const frameBitmap = frame ? await recolorFrame(frame.data, palette) : null;

                // Define offsets based on frame type
                let offsets = {};
                if (frame) {
                    // Example of how to handle a special frame by its name
                    if (isWild) {
                        offsets = { top: 40, bottom: 72, left: 16, right: 16 };
                    } else {
                        offsets = { top: 16, bottom: 16, left: 16, right: 16 };
                    }
                }

                // Use an OffscreenCanvas for composition
                const compositionCanvas = composeImage(
                    imageBitmap,
                    frameBitmap,
                    width,
                    height,
                    offsets
                );

                // Create and prepare the save canvas in memory
                const saveCanvas = new OffscreenCanvas(
                    compositionCanvas.width * saveScale,
                    compositionCanvas.height * saveScale
                );
                const saveCtx = saveCanvas.getContext('2d');
                saveCtx.imageSmoothingEnabled = false;
                saveCtx.drawImage(compositionCanvas, 0, 0, saveCanvas.width, saveCanvas.height);

                // Scale and draw to the display canvas
                const displayCanvas = canvasRefDisplay.current;
                if (displayCanvas) {
                    const displayCtx = displayCanvas.getContext('2d');
                    const scale = displayScale * 2;
                    displayCanvas.width = compositionCanvas.width * scale;
                    displayCanvas.height = compositionCanvas.height * scale;
                    displayCtx.imageSmoothingEnabled = false;
                    displayCtx.drawImage(
                        compositionCanvas,
                        0,
                        0,
                        displayCanvas.width,
                        displayCanvas.height
                    );
                }

                // Store the save-ready canvas
                canvasRefSave.current = saveCanvas;
            } catch (error) {
                console.log(error);
            }
        })();
    }, [image, palette, frame, saveScale, displayScale, canvasHeight, canvasWidth]);

    const handleExport = async () => {
        const canvas = canvasRefSave.current;
        if (!canvas) {
            console.error('Save canvas not ready for export.');
            return;
        }

        const blob = await canvas.convertToBlob({ type: 'image/png' });
        const link = document.createElement('a');
        // Using a timestamp for a unique filename. You could use an image ID if available.
        link.download = `gb-photo-${Date.now()}.png`;
        link.href = URL.createObjectURL(blob);
        link.click();
        // Clean up by revoking the object URL.
        URL.revokeObjectURL(link.href);
    };

    // Return if there is no image
    if (!image) {
        return null;
    }

    const canvasMarkup = (
        <>
            {image.isDeleted && showDeletedFlag ? <div className={styles.deleted}>d</div> : null}
            <canvas
                className={styles.canvas}
                width={canvasWidth}
                height={canvasHeight}
                style={{
                    padding: canvasPadding,
                    width: canvasWidth + 'px',
                    height: canvasHeight + 'px'
                }}
                ref={canvasRefDisplay}
            ></canvas>
        </>
    );
    return (
        <>
            <div className={`${styles.photo} ${isScale ? styles.scale : ''}`}>
                {onClick ? (
                    <button
                        className={styles.canvasContainer}
                        onClick={onClick}
                    >
                        {canvasMarkup}
                    </button>
                ) : (
                    <div className={styles.canvasContainer}>{canvasMarkup}</div>
                )}

                <button
                    className="button"
                    onClick={handleExport}
                >
                    Export<span> as PNG</span>
                </button>
            </div>
        </>
    );
}

Photo.propTypes = {
    image: PropTypes.object,
    paletteId: PropTypes.string,
    frame: PropTypes.object,
    scaleFactor: PropTypes.number,
    showDeletedFlag: PropTypes.bool,
    isScale: PropTypes.bool,
    onClick: PropTypes.func
};

export default Photo;
