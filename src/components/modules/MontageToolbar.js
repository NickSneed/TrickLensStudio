import PropTypes from 'prop-types';
import * as styles from './MontageToolbar.module.css';
import Photo from '../elements/Photo.js';
import CloseButton from '../elements/CloseButton.js';

/**
 * MontageToolbar component displays a floating toolbar with selected photos for creating a montage.
 * It allows users to see which photos are selected and provides options to proceed or clear selection.
 *
 * @param {Object} props - The component props.
 * @param {Array} props.photos - Array of selected photo objects to be included in the montage.
 * @param {Object} props.palette - The palette object to apply to the thumbnail previews.
 * @param {Function} props.onClick - Handler for clicking the main toolbar area (e.g., to open edit modal).
 * @param {Function} props.onClose - Handler for clicking the close button (e.g., to clear selection).
 */
const MontageToolbar = ({ photos, palette, onClick, onClose }) => {
    if (photos.length === 0) {
        return null;
    }

    return (
        <div className={styles.montagetoolbar}>
            <button
                className={styles.mainbutton}
                onClick={onClick}
            >
                {photos.map((photo, index) => (
                    <Photo
                        key={index}
                        palette={palette}
                        photo={photo}
                        frame={null}
                        scaleFactor={0.4}
                        imageSmoothing={true}
                    />
                ))}
            </button>
            <CloseButton
                onClick={onClose}
                className={styles.close}
                isDark={true}
            />
        </div>
    );
};

MontageToolbar.propTypes = {
    photos: PropTypes.array.isRequired,
    palette: PropTypes.object,
    onClick: PropTypes.func,
    onClose: PropTypes.func
};

export default MontageToolbar;
