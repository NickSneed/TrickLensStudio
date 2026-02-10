import { memo } from 'react';
import PropTypes from 'prop-types';
import * as styles from './Photo.module.css';
import { usePhotoRenderer } from '../hooks/usePhotoRenderer.js';

const Photo = ({
    image,
    imageG,
    imageB,
    paletteId,
    frame,
    isFramePadding,
    paletteOrder,
    scaleFactor = 0.3,
    rgbConfig,
    saveRef,
    drawHandlers
}) => {
    const { brightness: rgbBrightness = 0, contrast: rgbContrast = 0 } = rgbConfig || {};
    const { onDrawStart, onDrawMove, onDrawEnd } = drawHandlers || {};

    const { displayCanvasRef } = usePhotoRenderer(
        image,
        imageG,
        imageB,
        paletteId,
        frame,
        scaleFactor,
        paletteOrder,
        rgbBrightness,
        rgbContrast,
        saveRef
    );

    const displayScale = scaleFactor;
    const imageBaseWidth = frame ? 160 : 128;
    const isWild = frame && frame.name.includes('wild');
    const frameHeight = isWild ? 224 : 144;
    const imageBaseHeight = frame ? frameHeight : 112;
    const canvasPadding = frame || !isFramePadding ? '0' : 16 * displayScale + 'px';
    const canvasWidth = imageBaseWidth * displayScale;
    const canvasHeight = imageBaseHeight * displayScale;

    // Return if there is no image
    if (!image) {
        return null;
    }

    // Return canvas
    return (
        <canvas
            className={styles.canvas}
            width={canvasWidth}
            height={canvasHeight}
            style={{
                padding: canvasPadding,
                width: canvasWidth + 'px',
                height: canvasHeight + 'px'
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
    image: PropTypes.object.isRequired,
    imageG: PropTypes.object,
    imageB: PropTypes.object,
    paletteId: PropTypes.string,
    frame: PropTypes.object,
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
    })
};

export default memo(Photo);
