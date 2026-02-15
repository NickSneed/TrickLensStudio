import PropTypes from 'prop-types';
import * as styles from './MontageToolbar.module.css';
import Photo from './Photo.js';

/**
 * MontageToolbar component displays a floating toolbar with selected photos for creating a montage.
 * It allows users to see which photos are selected and provides options to proceed or clear selection.
 *
 * @param {Object} props - The component props.
 * @param {Array} props.montagePhotos - Array of selected photo objects to be included in the montage.
 * @param {string} props.palette - The ID of the palette to apply to the thumbnail previews.
 * @param {Function} props.onClick - Handler for clicking the main toolbar area (e.g., to open edit modal).
 * @param {Function} props.onClose - Handler for clicking the close button (e.g., to clear selection).
 */
const MontageToolbar = ({ montagePhotos, palette, onClick, onClose }) => {
    if (montagePhotos.length === 0) {
        return null;
    }

    return (
        <div className={styles.montagetoolbar}>
            <button
                className={styles.mainbutton}
                onClick={onClick}
            >
                {montagePhotos.map((photo, index) => (
                    <Photo
                        key={index}
                        paletteId={palette}
                        photo={photo}
                        frame={null}
                        scaleFactor={0.4}
                        imageSmoothing={true}
                    />
                ))}
            </button>
            <button
                className={`closeButton ${styles.close}`}
                onClick={onClose}
            >
                x
            </button>
        </div>
    );
};

MontageToolbar.propTypes = {
    montagePhotos: PropTypes.array.isRequired,
    palette: PropTypes.string,
    onClick: PropTypes.func,
    onClose: PropTypes.func
};

export default MontageToolbar;
