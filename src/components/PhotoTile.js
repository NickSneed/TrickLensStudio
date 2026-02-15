import PropTypes from 'prop-types';
import * as styles from './PhotoTile.module.css';
import Photo from './Photo.js';

/**
 * PhotoTile component renders a single photo within a tile layout.
 * It supports selection, clicking, and displaying a deleted flag.
 *
 * @param {Object} props - The component props.
 * @param {Object} props.photo - The photo data object.
 * @param {string} props.paletteId - The ID of the palette to apply.
 * @param {Object} props.frame - The frame object to apply.
 * @param {boolean} props.isFramePadding - Whether to apply padding for the frame.
 * @param {number} props.scaleFactor - The scaling factor for the photo.
 * @param {boolean} props.showDeletedFlag - Whether to show a flag if the photo is marked as deleted.
 * @param {Function} props.onClick - Handler for click events on the photo.
 * @param {Function} props.onSelect - Handler for selection events (checkbox).
 * @param {boolean} props.isSelected - Whether the tile is currently selected.
 * @param {boolean} props.isDisabled - Whether the selection checkbox is disabled.
 * @param {Object} props.rgbConfig - Configuration for RGB brightness and contrast.
 */
function PhotoTile({
    photo,
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
    // Return if there is no photo
    if (!photo) {
        return null;
    }

    const canvasMarkup = (
        <>
            {photo.isDeleted && showDeletedFlag ? <div className={styles.deleted}>d</div> : null}
            <Photo
                photo={photo}
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
                        onChange={(e) => onSelect(photo?.index, e.target.checked)}
                        disabled={isDisabled}
                    />
                    <span></span>
                </label>
            </div>
        </>
    );
}

PhotoTile.propTypes = {
    photo: PropTypes.object,
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
