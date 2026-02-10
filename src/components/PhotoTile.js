import { useRef } from 'react';
import PropTypes from 'prop-types';
import * as styles from './PhotoTile.module.css';
import Photo from './Photo.js';
import PhotoControls from './PhotoControls.js';
import { usePhotoExporter } from '../hooks/usePhotoExporter.js';

function PhotoTile({
    image,
    imageG,
    imageB,
    paletteId,
    frame,
    isFramePadding,
    scaleFactor,
    showDeletedFlag,
    isScale,
    onClick,
    onSelect,
    isSelected,
    isDisabled,
    drawHandlers,
    paletteOrder,
    exportConfig,
    showShareButton = false,
    showExportButton = false,
    rgbConfig
}) {
    const { format: exportFormat, quality: exportQuality, username } = exportConfig || {};

    const saveCanvasRef = useRef(null);
    const { handleExport, handleShare } = usePhotoExporter(
        saveCanvasRef,
        username,
        paletteId,
        exportFormat,
        exportQuality
    );

    // Return if there is no image
    if (!image) {
        return null;
    }

    const canvasMarkup = (
        <>
            {image.isDeleted && showDeletedFlag ? <div className={styles.deleted}>d</div> : null}
            <Photo
                image={image}
                imageG={imageG}
                imageB={imageB}
                paletteId={paletteId}
                scaleFactor={scaleFactor}
                frame={frame}
                isFramePadding={isFramePadding}
                paletteOrder={paletteOrder}
                rgbConfig={rgbConfig}
                saveRef={saveCanvasRef}
                drawHandlers={drawHandlers}
            />
        </>
    );
    return (
        <>
            <div className={`${styles.phototile} ${isScale ? styles.scale : ''}`}>
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
                        onExport={showExportButton ? handleExport : null}
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

PhotoTile.propTypes = {
    image: PropTypes.object,
    imageG: PropTypes.object,
    imageB: PropTypes.object,
    paletteId: PropTypes.string,
    frame: PropTypes.object,
    isFramePadding: PropTypes.bool,
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
    exportConfig: PropTypes.shape({
        format: PropTypes.string,
        quality: PropTypes.number,
        username: PropTypes.string
    }),
    showShareButton: PropTypes.bool,
    showExportButton: PropTypes.bool,
    rgbConfig: PropTypes.shape({
        brightness: PropTypes.number,
        contrast: PropTypes.number
    })
};

export default PhotoTile;
