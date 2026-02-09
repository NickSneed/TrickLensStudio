import PropTypes from 'prop-types';
import * as styles from './MontageToolbar.module.css';
import PhotoThumb from './PhotoThumb.js';

const MontageToolbar = ({ montagePhotos, palette, onClick }) => {
    return (
        <div className={styles.montagetoolbar}>
            <button onClick={onClick}>
                {montagePhotos.map((photo, index) => (
                    <PhotoThumb
                        key={index}
                        paletteId={palette}
                        image={photo}
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
