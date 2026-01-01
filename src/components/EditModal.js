import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Photo from '../components/Photo.js';
import * as styles from './EditModal.module.css';
import { applyEffect, createMontage } from 'gbcam-js';
import { useCanvasDrawer } from '../hooks/useCanvasDrawer.js';

const EditModal = ({ montagePhotos, editImage, palette, frame, exportFormat, exportQuality }) => {
    const [effect, setEffect] = useState('none');
    const [color, setColor] = useState(0);
    const [brushSize, setBrushSize] = useState(1);
    const [montageType, setMontageType] = useState('none');
    const [paletteOrder, setPaletteOrder] = useState('normal');

    const { editedImage, setEditedImage, drawHandlers } = useCanvasDrawer(
        editImage,
        frame,
        color,
        brushSize
    );

    useEffect(() => {
        if (!editImage) {
            return;
        }

        const isMontage = montagePhotos?.length > 0 && montageType !== 'none';

        if ((editedImage && effect && effect !== 'none') || isMontage) {
            let newPhotoData = isMontage
                ? createMontage([editImage.photoData, ...montagePhotos], montageType)
                : editImage.photoData;
            newPhotoData = applyEffect(newPhotoData, effect);
            setEditedImage({
                ...editImage,
                photoData: newPhotoData
            });
        }

        if (effect === 'none' && !isMontage) {
            setEditedImage(editImage);
        }
    }, [effect, editImage, montagePhotos, montageType]);

    const getMontageOptions = () => {
        const numPhotos = montagePhotos?.length || 0;
        if (numPhotos === 0) return null;

        const baseOptions = [
            'none',
            'vertical',
            'horizontal',
            'quadrant',
            'horizontal-2/3',
            'border'
        ];
        if (numPhotos > 1) {
            baseOptions.push('horizontal-bars');
        }
        if (numPhotos > 2) {
            baseOptions.push('four-quadrant');
        }

        return baseOptions.map((opt) => (
            <option
                key={opt}
                value={opt}
            >
                {opt}
            </option>
        ));
    };

    const montageOptions = getMontageOptions();

    return (
        <div className={styles.editWrapper}>
            <div className={styles.photo}>
                <Photo
                    image={editedImage}
                    paletteId={palette}
                    frame={frame}
                    scaleFactor={4}
                    isScale={true}
                    drawHandlers={drawHandlers}
                    paletteOrder={paletteOrder}
                    exportFormat={exportFormat}
                    exportQuality={exportQuality}
                    showShareButton={true}
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
                        </select>
                    </label>
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
    exportQuality: PropTypes.number
};
