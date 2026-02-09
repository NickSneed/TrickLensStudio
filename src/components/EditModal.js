import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Photo from '../components/Photo.js';
import * as styles from './EditModal.module.css';
import { useCanvasDrawer } from '../hooks/useCanvasDrawer.js';
import { useEffectApplier } from '../hooks/useEffectApplier.js';
import { getAvailableMontageTypes } from '../utils/montageUtils.js';

const EditModal = ({ editImage, palette, frame, exportFormat, exportQuality, username }) => {
    const [effect, setEffect] = useState('none');
    const [color, setColor] = useState(0);
    const [brushSize, setBrushSize] = useState(1);
    const [montageType, setMontageType] = useState('none');
    const [paletteOrder, setPaletteOrder] = useState('normal');
    const [rgbBrightness, setRgbBrightness] = useState(0);
    const [rgbContrast, setRgbContrast] = useState(0);

    useEffect(() => {
        setRgbBrightness(0);
        setRgbContrast(0);
    }, [editImage]);

    const { editedImage, setEditedImage, drawHandlers } = useCanvasDrawer(
        editImage ? editImage[0] : null,
        frame,
        color,
        brushSize
    );

    const isRgb = montageType === 'rgb';

    useEffectApplier(
        editImage ? editImage : null,
        editedImage,
        effect,
        isRgb ? 'none' : montageType,
        setEditedImage
    );

    const montageOptions = getAvailableMontageTypes(editImage?.length).map((opt) => (
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
                    imageG={isRgb && editImage?.length >= 1 ? editImage[1] : undefined}
                    imageB={isRgb && editImage?.length >= 2 ? editImage[2] : undefined}
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
                {editImage?.length > 1 ? (
                    <label>
                        Montage:
                        <select
                            className={styles.select}
                            value={montageType}
                            onChange={(e) => setMontageType(e.target.value)}
                        >
                            {montageOptions}
                            {editImage.length > 2 ? <option value="rgb">rgb</option> : null}
                        </select>
                    </label>
                ) : null}

                {editImage?.length > 2 && isRgb ? (
                    <>
                        <label>
                            Brightness: {Math.round(rgbBrightness * 20)}
                            <input
                                className={styles.slider}
                                type="range"
                                min="-0.5"
                                max="0.5"
                                step="0.05"
                                value={rgbBrightness}
                                onChange={(e) => setRgbBrightness(e.target.value)}
                            />
                        </label>
                        <label>
                            Contrast: {Math.round(rgbContrast * 10)}
                            <input
                                className={styles.slider}
                                type="range"
                                min="-1"
                                max="1"
                                step="0.1"
                                value={rgbContrast}
                                onChange={(e) => setRgbContrast(e.target.value)}
                            />
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
    palette: PropTypes.string,
    frame: PropTypes.object,
    exportFormat: PropTypes.string,
    exportQuality: PropTypes.number,
    username: PropTypes.string
};
