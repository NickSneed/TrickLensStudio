import PropTypes from 'prop-types';
import * as styles from './PhotoTile.module.css';
import Photo from './Photo.js';

function PhotoTile({
    image,
    paletteId,
    frame,
    isFramePadding,
    scaleFactor,
    showDeletedFlag,
    onClick,
    onSelect,
    isSelected,
    isDisabled,
    rgbConfig
}) {
    // Return if there is no image
    if (!image) {
        return null;
    }

    const canvasMarkup = (
        <>
            {image.isDeleted && showDeletedFlag ? <div className={styles.deleted}>d</div> : null}
            <Photo
                image={image}
                paletteId={paletteId}
                scaleFactor={scaleFactor}
                frame={frame}
                isFramePadding={isFramePadding}
                rgbConfig={rgbConfig}
            />
        </>
    );
    return (
        <>
            <div className={styles.phototile}>
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

                <label className="pixel-checkbox">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => onSelect(image?.index, e.target.checked)}
                        disabled={isDisabled}
                    />
                    <span></span>
                </label>
            </div>
        </>
    );
}

PhotoTile.propTypes = {
    image: PropTypes.object,
    paletteId: PropTypes.string,
    frame: PropTypes.object,
    isFramePadding: PropTypes.bool,
    scaleFactor: PropTypes.number,
    showDeletedFlag: PropTypes.bool,
    onClick: PropTypes.func,
    onSelect: PropTypes.func,
    isSelected: PropTypes.bool,
    isDisabled: PropTypes.bool,
    rgbConfig: PropTypes.shape({
        brightness: PropTypes.number,
        contrast: PropTypes.number
    })
};

export default PhotoTile;
