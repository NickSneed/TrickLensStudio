import { useState, useCallback } from 'react';
import { getFrameOffsets } from '../utils/frameUtils.js';

/**
 * Hook to handle drawing operations on the image canvas.
 * Allows modifying pixel data directly based on touch/mouse input.
 *
 * @param {Object} initialImage - The starting image data.
 * @param {Object} frame - The current frame (used for offset calculations).
 * @param {number} color - The color index to draw with (0-3).
 * @param {number} brushSize - The size of the drawing brush in pixels.
 */
export const useCanvasDrawer = (initialImage, frame, color, brushSize) => {
    const [editedImage, setEditedImage] = useState(initialImage);
    const [isDrawing, setIsDrawing] = useState(false);

    const getCoords = (e) => {
        // Normalizes touch and mouse coordinates
        if (e.touches && e.touches.length > 0) {
            return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
        return { x: e.clientX, y: e.clientY };
    };

    const drawOnCanvas = useCallback(
        (e) => {
            const canvas = e.currentTarget;
            if (!canvas || !editedImage) return;

            // Calculate coordinates relative to the canvas element
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const { x: clientX, y: clientY } = getCoords(e);

            const x = (clientX - rect.left) * scaleX;
            const y = (clientY - rect.top) * scaleY;
            const scale = 8; // Internal scaling factor for the Game Boy resolution

            // Adjust for frame borders to find the actual image coordinates
            const offsets = getFrameOffsets(frame);
            const unscaledX = Math.floor(x / scale - offsets.left);
            const unscaledY = Math.floor(y / scale - offsets.top);
            const imageWidth = 128;
            const imageHeight = 112;

            const newPhotoData = [...editedImage.photoData];
            const size = Number(brushSize);

            // Apply the brush to the pixel data
            for (let i = 0; i < size; i++) {
                for (let j = 0; j < size; j++) {
                    const drawX = unscaledX + i;
                    const drawY = unscaledY + j;
                    // Ensure drawing stays within image bounds
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
            if (e.cancelable) {
                e.preventDefault();
            }
            setIsDrawing(true);
            drawOnCanvas(e);
        },
        [drawOnCanvas]
    );

    const handleDrawMove = useCallback(
        (e) => {
            if (e.cancelable) {
                e.preventDefault();
            }
            if (isDrawing) {
                drawOnCanvas(e);
            }
        },
        [isDrawing, drawOnCanvas]
    );

    const handleDrawEnd = useCallback((e) => {
        if (e.cancelable) {
            e.preventDefault();
        }
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
