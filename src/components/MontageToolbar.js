import PropTypes from 'prop-types';
import * as styles from './MontageToolbar.module.css';
import Photo from './Photo.js';

const MontageToolbar = ({ montagePhotos, palette, onClick }) => {
    if (montagePhotos.length === 0) {
        return null;
    }

    return (
        <div className={styles.montagetoolbar}>
            <button onClick={onClick}>
                {montagePhotos.map((photo, index) => (
                    <Photo
                        key={index}
                        paletteId={palette}
                        image={photo}
                        frame={null}
                        scaleFactor={0.4}
                    />
                ))}
            </button>
        </div>
    );
};

MontageToolbar.propTypes = {
    montagePhotos: PropTypes.array.isRequired,
    palette: PropTypes.string,
    onClick: PropTypes.func
};

export default MontageToolbar;
