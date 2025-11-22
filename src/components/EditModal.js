import { useState } from 'react';
import PropTypes from 'prop-types';
import Photo from '../components/Photo.js';
import * as styles from './EditModal.module.css';

const EditModal = ({ editImage, palette, frame }) => {
    const [effect, setEffect] = useState('none');

    return (
        <div className={styles.editWrapper}>
            Effect:
            <select
                className={styles.select}
                value={effect}
                onChange={(e) => setEffect(e.target.value)}
            >
                <option value="none">none</option>
                <option value="invert">invert</option>
                <option value="mirror-rtl">mirror-rtl</option>
                <option value="mirror-ltr">mirror-ltr</option>
                <option value="mirror-btt">mirror-btt</option>
                <option value="mirror-ttb">mirror-ttb</option>
                <option value="zoom">zoom</option>
                <option value="zoom-h">zoom-h</option>
                <option value="zoom-v">zoom-v</option>
                <option value="tile">tile</option>
            </select>
            <div className={styles.photo}>
                <Photo
                    image={editImage}
                    paletteId={palette}
                    frame={frame}
                    scaleFactor={4}
                    isScale={true}
                    effect={effect === 'none' ? null : effect}
                />
            </div>
        </div>
    );
};

export default EditModal;

EditModal.propTypes = {
    editImage: PropTypes.object,
    palette: PropTypes.string,
    frame: PropTypes.object
};
