import PropTypes from 'prop-types';
import * as styles from './Photo.module.css';
import { usePhotoRenderer } from '../hooks/usePhotoRenderer.js';
import PhotoControls from './PhotoControls.js';
import { usePhotoExporter } from '../hooks/usePhotoExporter.js';

function Photo({
    image,
    paletteId,
    frame,
    scaleFactor,
    showDeletedFlag,
    isScale,
    onClick,
    onSelect,
    isSelected,
    isDisabled,
    drawHandlers,
    paletteOrder,
    username,
    exportFormat,
    exportQuality,
    showShareButton = false
}) {
    const { displayCanvasRef, saveCanvasRef } = usePhotoRenderer(
        image,
        paletteId,
        frame,
        scaleFactor,
        paletteOrder
    );
    const { handleExport, handleShare } = usePhotoExporter(
        saveCanvasRef,
        username,
        paletteId,
        exportFormat,
        exportQuality
    );
    const displayScale = scaleFactor;
    const imageBaseWidth = frame ? 160 : 128;
    const isWild = frame && frame.name.includes('wild');
    const frameHeight = isWild ? 224 : 144;
    const imageBaseHeight = frame ? frameHeight : 112;
    const canvasPadding = frame ? '0' : 16 * displayScale + 'px';
    const canvasWidth = imageBaseWidth * displayScale;
    const canvasHeight = imageBaseHeight * displayScale;

    // Return if there is no image
    if (!image) {
        return null;
    }

    const { onDrawStart, onDrawMove, onDrawEnd, onMouseLeave } = drawHandlers || {};

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
                ref={displayCanvasRef}
                onMouseDown={onDrawStart}
                onMouseMove={onDrawMove}
                onMouseUp={onDrawEnd}
                onMouseLeave={onMouseLeave}
                onTouchStart={onDrawStart}
                onTouchMove={onDrawMove}
                onTouchEnd={onDrawEnd}
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
                <div className={styles.controls}>
                    <PhotoControls
                        onExport={handleExport}
                        onShare={showShareButton ? handleShare : null}
                        onSelect={onSelect}
                        isSelected={isSelected}
                        isDisabled={isDisabled}
                        imageIndex={image?.index}
                        format={exportFormat}
                    />
                </div>
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
    onClick: PropTypes.func,
    onSelect: PropTypes.func,
    isSelected: PropTypes.bool,
    isDisabled: PropTypes.bool,
    drawHandlers: PropTypes.shape({
        onDrawStart: PropTypes.func,
        onDrawMove: PropTypes.func,
        onDrawEnd: PropTypes.func,
        onMouseLeave: PropTypes.func
    }),
    paletteOrder: PropTypes.string,
    username: PropTypes.string,
    exportFormat: PropTypes.string,
    exportQuality: PropTypes.number,
    showShareButton: PropTypes.bool
};

export default Photo;
