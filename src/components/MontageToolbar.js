import PropTypes from 'prop-types';
import * as styles from './MontageToolbar.module.css';
import Photo from './Photo.js';

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
                        image={photo}
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
