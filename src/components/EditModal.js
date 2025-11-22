import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Photo from '../components/Photo.js';
import * as styles from './EditModal.module.css';
import { getFrameOffsets } from '../utils/frameUtils.js';
import { applyEffect, createMontage } from 'gbcam-js';

const EditModal = ({ montagePhotos, editImage, palette, frame }) => {
    const [editedImage, setEditedImage] = useState(editImage);
    const [effect, setEffect] = useState('none');
    const [color, setColor] = useState(0);
    const [brushSize, setBrushSize] = useState(1);
    const [isDrawing, setIsDrawing] = useState(false);
    const [montageType, setMontageType] = useState('none');

    useEffect(() => {
        if (!editImage) {
            return;
        }

        const isMontage = montagePhotos && montageType !== 'none';

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

    const drawOnCanvas = (e) => {
        const canvas = e.currentTarget.querySelector('canvas');
        if (canvas) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;
            const scale = 8;

            const offsets = getFrameOffsets(frame);
            const unscaledX = Math.floor(x / scale - offsets.left);
            const unscaledY = Math.floor(y / scale - offsets.top);
            const imageWidth = 128;
            const imageHeight = 112;

            const newPhotoData = [...editedImage.photoData];
            const size = Number(brushSize);

            for (let i = 0; i < size; i++) {
                for (let j = 0; j < size; j++) {
                    const drawX = unscaledX + i;
                    const drawY = unscaledY + j;
                    if (drawX >= 0 && drawX < imageWidth && drawY >= 0 && drawY < imageHeight) {
                        const index = drawY * imageWidth + drawX;
                        newPhotoData[index] = Number(color);
                    }
                }
            }
            setEditedImage({ ...editedImage, photoData: newPhotoData });
        }
    };

    const handleMouseDown = (e) => {
        setIsDrawing(true);
        drawOnCanvas(e);
    };

    const handleMouseMove = (e) => {
        if (isDrawing) {
            drawOnCanvas(e);
        }
    };

    const handleMouseUp = () => {
        setIsDrawing(false);
    };

    let montageOptions;
    if (montagePhotos && montagePhotos.length) {
        montageOptions = (
            <>
                <option value="none">none</option>
                <option value="vertical">vertical</option>
                <option value="horizontal">horizontal</option>
                <option value="quadrant">quadrant</option>
                <option value="horizontal-2/3">horizontal-2/3</option>
                <option value="border">border</option>
            </>
        );
    }

    if (montagePhotos && montagePhotos.length > 1) {
        montageOptions = (
            <>
                <option value="none">none</option>
                <option value="vertical">vertical</option>
                <option value="horizontal">horizontal</option>
                <option value="quadrant">quadrant</option>
                <option value="horizontal-2/3">horizontal-2/3</option>
                <option value="horizontal-bars">horizontal-bars</option>
                <option value="border">border</option>
            </>
        );
    }

    if (montagePhotos && montagePhotos.length > 2) {
        montageOptions = (
            <>
                <option value="none">none</option>
                <option value="vertical">vertical</option>
                <option value="horizontal">horizontal</option>
                <option value="quadrant">quadrant</option>
                <option value="four-quadrant">four-quadrant</option>
                <option value="horizontal-2/3">horizontal-2/3</option>
                <option value="horizontal-bars">horizontal-bars</option>
                <option value="border">border</option>
            </>
        );
    }

    return (
        <div className={styles.editWrapper}>
            <div
                className={styles.photo}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp} // Stop drawing if mouse leaves the area
            >
                <Photo
                    image={editedImage}
                    paletteId={palette}
                    frame={frame}
                    scaleFactor={4}
                    isScale={true}
                />
            </div>
            <div className={styles.controls}>
                <label>
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
                {montagePhotos ? (
                    <label>
                        Montage type:
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
    frame: PropTypes.object
};
