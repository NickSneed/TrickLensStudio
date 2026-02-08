import { useState } from 'react';
import PropTypes from 'prop-types';
import Photo from '../components/Photo.js';
import * as styles from './EditModal.module.css';
import { useCanvasDrawer } from '../hooks/useCanvasDrawer.js';
import { useEffectApplier } from '../hooks/useEffectApplier.js';
import { getAvailableMontageTypes } from '../utils/montageUtils.js';

const EditModal = ({
    montagePhotos,
    editImage,
    palette,
    frame,
    exportFormat,
    exportQuality,
    username
}) => {
    const [effect, setEffect] = useState('none');
    const [color, setColor] = useState(0);
    const [brushSize, setBrushSize] = useState(1);
    const [montageType, setMontageType] = useState('none');
    const [paletteOrder, setPaletteOrder] = useState('normal');
    const [rgbBrightness, setRgbBrightness] = useState(0);
    const [rgbContrast, setRgbContrast] = useState(0);

    const { editedImage, setEditedImage, drawHandlers } = useCanvasDrawer(
        editImage,
        frame,
        color,
        brushSize
    );

    const isRgb = montageType === 'rgb';

    useEffectApplier(
        editImage,
        editedImage,
        effect,
        montagePhotos,
        isRgb ? 'none' : montageType,
        setEditedImage
    );

    const montageOptions = getAvailableMontageTypes(montagePhotos?.length).map((opt) => (
        <option
            key={opt}
            value={opt}
        >
            {opt}
        </option>
    ));

    return (
        <div className={styles.editWrapper}>
            <div className={styles.photo}>
                <Photo
                    image={editedImage}
                    imageR={
                        isRgb && montagePhotos?.length >= 1
                            ? { photoData: montagePhotos[0] }
                            : undefined
                    }
                    imageG={
                        isRgb && montagePhotos?.length >= 2
                            ? { photoData: montagePhotos[1] }
                            : undefined
                    }
                    paletteId={palette}
                    frame={frame}
                    scaleFactor={4}
                    isScale={true}
                    drawHandlers={drawHandlers}
                    paletteOrder={paletteOrder}
                    exportFormat={exportFormat}
                    exportQuality={exportQuality}
                    showShareButton={true}
                    username={username}
                    rgbBrightness={rgbBrightness}
                    rgbContrast={rgbContrast}
                />
            </div>
            <div className={styles.controls}>
                <label>
                    Trick Lenses:
                    <select
                        className={styles.select}
                        value={effect}
                        onChange={(e) => setEffect(e.target.value)}
                    >
                        <option value="none">none</option>
                        <option value="mirror-rtl">mirror-rtl</option>
                        <option value="mirror-ltr">mirror-ltr</option>
                        <option value="mirror-btt">mirror-btt</option>
                        <option value="mirror-ttb">mirror-ttb</option>
                        <option value="zoom">zoom</option>
                        <option value="zoom-h">zoom-h</option>
                        <option value="zoom-v">zoom-v</option>
                        <option value="tile">tile</option>
                    </select>
                </label>
                <label>
                    Palette Order:
                    <select
                        className={styles.select}
                        value={paletteOrder}
                        onChange={(e) => setPaletteOrder(e.target.value)}
                    >
                        <option value="normal">normal</option>
                        <option value="i">invert</option>
                        <option value="pa">a</option>
                        <option value="pb">b</option>
                        <option value="pc">c</option>
                        <option value="pd">d</option>
                    </select>
                </label>
                <label>
                    Color:
                    <select
                        className={styles.select}
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                    >
                        <option value="0">Lightest</option>
                        <option value="1">Light</option>
                        <option value="2">Dark</option>
                        <option value="3">Darkest</option>
                    </select>
                </label>
                <label>
                    Brush Size:
                    <select
                        className={styles.select}
                        value={brushSize}
                        onChange={(e) => setBrushSize(e.target.value)}
                    >
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                    </select>
                </label>
                {montagePhotos?.length > 0 ? (
                    <label>
                        Montage:
                        <select
                            className={styles.select}
                            value={montageType}
                            onChange={(e) => setMontageType(e.target.value)}
                        >
                            {montageOptions}
                            {montagePhotos.length >= 2 ? <option value="rgb">rgb</option> : null}
                        </select>
                    </label>
                ) : null}

                {montagePhotos?.length > 0 && isRgb ? (
                    <>
                        <label>
                            RGB Brightness:
                            <select
                                className={styles.select}
                                value={rgbBrightness}
                                onChange={(e) => setRgbBrightness(e.target.value)}
                            >
                                <option value="-0.5">-5</option>
                                <option value="-0.4">-4</option>
                                <option value="-0.3">-3</option>
                                <option value="-0.2">-2</option>
                                <option value="-0.1">-1</option>
                                <option value="0">0</option>
                                <option value="0.1">1</option>
                                <option value="0.2">2</option>
                                <option value="0.3">3</option>
                                <option value="0.4">4</option>
                                <option value="0.5">5</option>
                            </select>
                        </label>
                        <label>
                            RGB Contrast:
                            <select
                                className={styles.select}
                                value={rgbContrast}
                                onChange={(e) => setRgbContrast(e.target.value)}
                            >
                                <option value="-0.5">-5</option>
                                <option value="-0.4">-4</option>
                                <option value="-0.3">-3</option>
                                <option value="-0.2">-2</option>
                                <option value="-0.1">-1</option>
                                <option value="0">0</option>
                                <option value="0.1">1</option>
                                <option value="0.2">2</option>
                                <option value="0.3">3</option>
                                <option value="0.4">4</option>
                                <option value="0.5">5</option>
                            </select>
                        </label>
                    </>
                ) : null}
            </div>
        </div>
    );
};

export default EditModal;

EditModal.propTypes = {
    editImage: PropTypes.object,
    montagePhotos: PropTypes.array,
    palette: PropTypes.string,
    frame: PropTypes.object,
    exportFormat: PropTypes.string,
    exportQuality: PropTypes.number,
    username: PropTypes.string
};
