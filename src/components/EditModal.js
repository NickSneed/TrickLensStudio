import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Photo from '../components/Photo.js';
import * as styles from './EditModal.module.css';
import { getFrameOffsets } from '../utils/frameUtils.js';
import { applyEffect } from 'gbcam-js';

const EditModal = ({ editImage, palette, frame }) => {
    const [editedImage, setEditedImage] = useState(editImage);
    const [effect, setEffect] = useState('none');
    const [color, setColor] = useState(0);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        if (!editImage) {
            return;
        }

        if (editedImage && effect && effect !== 'none') {
            let newPhotoData = editImage.photoData;
            newPhotoData = applyEffect(newPhotoData, effect);
            setEditedImage({
                ...editedImage,
                photoData: newPhotoData
            });
        }

        if (effect === 'none') {
            setEditedImage(editImage);
        }
    }, [effect, editImage]);

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
            const index = unscaledY * imageWidth + unscaledX;

            if (unscaledX >= 0 && unscaledX < imageWidth && unscaledY >= 0 && unscaledY < 112) {
                const newPhotoData = [...editedImage.photoData];
                newPhotoData[index] = Number(color);

                setEditedImage({
                    ...editedImage,
                    photoData: newPhotoData
                });
            }
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
            Color:
            <select
                className={styles.select}
                value={color}
                onChange={(e) => setColor(e.target.value)}
            >
                <option value="0">1</option>
                <option value="1">2</option>
                <option value="2">3</option>
                <option value="3">4</option>
            </select>
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
        </div>
    );
};

export default EditModal;

EditModal.propTypes = {
    editImage: PropTypes.object,
    palette: PropTypes.string,
    frame: PropTypes.object
};
