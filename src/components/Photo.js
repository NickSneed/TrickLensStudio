import { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import * as styles from './Photo.module.css';
import { usePhotoRenderer } from '../hooks/usePhotoRenderer.js';

// Constants for photo dimensions based on Game Boy Camera specs
const PHOTO_WIDTH_NO_FRAME = 128;
const PHOTO_WIDTH_WITH_FRAME = 160;
const PHOTO_HEIGHT_NO_FRAME = 112;
const PHOTO_HEIGHT_WITH_FRAME = 144;
const PHOTO_HEIGHT_WILD_FRAME = 224;
const CANVAS_PADDING_PX = 16;

/**
 * Photo component responsible for rendering the Game Boy Camera photo.
 * It handles applying palettes, frames, and scaling, as well as drawing interactions.
 *
 * @param {Object} props - The component props.
 * @param {Object} props.photo - The primary photo data object (Red channel or grayscale).
 * @param {Object} [props.photoG] - The Green channel photo data object (for RGB mode).
 * @param {Object} [props.photoB] - The Blue channel photo data object (for RGB mode).
 * @param {string} [props.paletteId] - The ID of the color palette to apply.
 * @param {Object} [props.frame] - The frame object to overlay on the photo.
 * @param {boolean} [props.isFramePadding=false] - Whether to add padding when no frame is present.
 * @param {string} [props.paletteOrder] - The order of colors in the palette (e.g., for inversion).
 * @param {number} [props.scaleFactor=0.3] - The scaling factor for the display canvas.
 * @param {Object} [props.rgbConfig={}] - Configuration for RGB brightness and contrast.
 * @param {Object} [props.saveRef] - Ref to store the high-resolution canvas for saving.
 * @param {Object} [props.drawHandlers={}] - Event handlers for drawing on the canvas.
 * @param {boolean} [props.imageSmoothing=false] - Whether to enable image smoothing on the canvas.
 * @returns {JSX.Element|null} The rendered canvas element or null if no photo is provided.
 */
const Photo = ({
    photo,
    photoG,
    photoB,
    paletteId,
    frame,
    isFramePadding = false,
    paletteOrder,
    scaleFactor = 0.3,
    rgbConfig = {},
    saveRef,
    drawHandlers = {},
    imageSmoothing = false
}) => {
    const { brightness: rgbBrightness = 0, contrast: rgbContrast = 0 } = rgbConfig;
    const { onDrawStart, onDrawMove, onDrawEnd } = drawHandlers;

    const { displayCanvasRef } = usePhotoRenderer(
        photo,
        photoG,
        photoB,
        paletteId,
        frame,
        scaleFactor,
        paletteOrder,
        rgbBrightness,
        rgbContrast,
        saveRef,
        imageSmoothing
    );

    const { canvasWidth, canvasHeight, canvasPadding } = useMemo(() => {
        const hasFrame = !!frame;
        const isWild = hasFrame && frame.name.includes('wild');

        const photoBaseWidth = hasFrame ? PHOTO_WIDTH_WITH_FRAME : PHOTO_WIDTH_NO_FRAME;
        const photoBaseHeight = hasFrame
            ? isWild
                ? PHOTO_HEIGHT_WILD_FRAME
                : PHOTO_HEIGHT_WITH_FRAME
            : PHOTO_HEIGHT_NO_FRAME;

        const padding = hasFrame || !isFramePadding ? '0' : `${CANVAS_PADDING_PX * scaleFactor}px`;

        return {
            canvasWidth: photoBaseWidth * scaleFactor,
            canvasHeight: photoBaseHeight * scaleFactor,
            canvasPadding: padding
        };
    }, [frame, isFramePadding, scaleFactor]);

    // Return if there is no photo
    if (!photo) {
        return null;
    }

    // Return canvas
    return (
        <canvas
            className={`${styles.canvas} ${drawHandlers?.onDrawStart ? styles.drawcanvas : ''}`}
            width={canvasWidth}
            height={canvasHeight}
            style={{
                padding: canvasPadding,
                width: `${canvasWidth}px`,
                height: `${canvasHeight}px`
            }}
            ref={displayCanvasRef}
            onMouseDown={onDrawStart}
            onMouseMove={onDrawMove}
            onMouseUp={onDrawEnd}
            onMouseLeave={onDrawEnd}
            onTouchStart={onDrawStart}
            onTouchMove={onDrawMove}
            onTouchEnd={onDrawEnd}
        ></canvas>
    );
};

Photo.propTypes = {
    photo: PropTypes.object.isRequired,
    photoG: PropTypes.object,
    photoB: PropTypes.object,
    paletteId: PropTypes.string,
    frame: PropTypes.shape({
        name: PropTypes.string
    }),
    isFramePadding: PropTypes.bool,
    paletteOrder: PropTypes.string,
    scaleFactor: PropTypes.number,
    rgbConfig: PropTypes.shape({
        brightness: PropTypes.number,
        contrast: PropTypes.number
    }),
    saveRef: PropTypes.object,
    drawHandlers: PropTypes.shape({
        onDrawStart: PropTypes.func,
        onDrawMove: PropTypes.func,
        onDrawEnd: PropTypes.func
    }),
    imageSmoothing: PropTypes.bool
};

export default memo(Photo);
