import { useState, useCallback } from 'react';
import { getFrameOffsets } from '../utils/frameUtils.js';

export const useCanvasDrawer = (initialImage, frame, color, brushSize) => {
    const [editedImage, setEditedImage] = useState(initialImage);
    const [isDrawing, setIsDrawing] = useState(false);

    const getCoords = (e) => {
        if (e.touches && e.touches.length > 0) {
            return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
        return { x: e.clientX, y: e.clientY };
    };

    const drawOnCanvas = useCallback(
        (e) => {
            const canvas = e.currentTarget;
            if (!canvas || !editedImage) return;

            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const { x: clientX, y: clientY } = getCoords(e);

            const x = (clientX - rect.left) * scaleX;
            const y = (clientY - rect.top) * scaleY;
            const scale = 8; // This seems to be a magic number, consider making it a prop if it varies

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
        },
        [editedImage, frame, brushSize, color]
    );

    const handleDrawStart = useCallback(
        (e) => {
            e.preventDefault();
            setIsDrawing(true);
            drawOnCanvas(e);
        },
        [drawOnCanvas]
    );

    const handleDrawMove = useCallback(
        (e) => {
            e.preventDefault();
            if (isDrawing) {
                drawOnCanvas(e);
            }
        },
        [isDrawing, drawOnCanvas]
    );

    const handleDrawEnd = useCallback((e) => {
        e.preventDefault();
        setIsDrawing(false);
    }, []);

    const drawHandlers = {
        onDrawStart: handleDrawStart,
        onDrawMove: handleDrawMove,
        onDrawEnd: handleDrawEnd,
        onMouseLeave: handleDrawEnd
    };

    return { editedImage, setEditedImage, drawHandlers };
};
