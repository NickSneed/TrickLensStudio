import { useState, useCallback, useEffect, useRef } from 'react';
import { getFrameOffsets } from '../utils/frameUtils.js';

/**
 * Hook to handle drawing operations on the photo canvas.
 * Allows modifying pixel data directly based on touch/mouse input.
 *
 * @param {Object} initialPhoto - The starting photo data.
 * @param {Object} frame - The current frame (used for offset calculations).
 * @param {number} brushColor - The color index to draw with (0-3).
 * @param {number} brushSize - The size of the drawing brush in pixels.
 */
export const useCanvasDrawer = (initialPhoto, frame, brushColor, brushSize) => {
    const [drawPhoto, setDrawPhoto] = useState(initialPhoto); // The "saved" photo state
    const [previewPhoto, setPreviewPhoto] = useState(initialPhoto); // The photo state for rendering, including hover previews
    const [isDrawing, setIsDrawing] = useState(false);
    const requestRef = useRef(null);

    useEffect(() => {
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    useEffect(() => {
        setDrawPhoto(initialPhoto);
        setPreviewPhoto(initialPhoto);
    }, [initialPhoto]);

    useEffect(() => {
        setPreviewPhoto(drawPhoto);
    }, [drawPhoto]);

    const getCoords = (e) => {
        // Normalizes touch and mouse coordinates
        if (e.touches && e.touches.length > 0) {
            return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
        return { x: e.clientX, y: e.clientY };
    };

    const getCanvasRelativeCoords = useCallback(
        (e) => {
            const canvas = e.currentTarget;
            if (!canvas) return null;

            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const { x: clientX, y: clientY } = getCoords(e);

            const x = (clientX - rect.left) * scaleX;
            const y = (clientY - rect.top) * scaleY;
            const scale = 8; // Internal scaling factor for the Game Boy resolution

            const offsets = getFrameOffsets(frame);
            const unscaledX = Math.floor(x / scale - offsets.left);
            const unscaledY = Math.floor(y / scale - offsets.top);
            return { unscaledX, unscaledY };
        },
        [frame]
    );

    const applyBrush = useCallback(
        (pixels, x, y) => {
            const photoWidth = 128;
            const photoHeight = 112;

            const newPixels = new Uint8Array(pixels);
            const size = Number(brushSize);

            // Apply the brush to the pixel data
            for (let i = 0; i < size; i++) {
                for (let j = 0; j < size; j++) {
                    const drawX = x + i;
                    const drawY = y + j;
                    // Ensure drawing stays within photo bounds
                    if (drawX >= 0 && drawX < photoWidth && drawY >= 0 && drawY < photoHeight) {
                        const index = drawY * photoWidth + drawX;
                        newPixels[index] = Number(brushColor);
                    }
                }
            }
            return newPixels;
        },
        [brushColor, brushSize]
    );

    const drawOnCanvas = useCallback(
        (e) => {
            if (!drawPhoto) return;
            const coords = getCanvasRelativeCoords(e);
            if (!coords) return;
            const { unscaledX, unscaledY } = coords;

            const newPixels = applyBrush(drawPhoto.pixels, unscaledX, unscaledY);
            setDrawPhoto({ ...drawPhoto, pixels: newPixels });
        },
        [drawPhoto, getCanvasRelativeCoords, applyBrush]
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

            if (requestRef.current) return;

            const coords = getCanvasRelativeCoords(e);
            if (!coords || !drawPhoto) return;

            requestRef.current = requestAnimationFrame(() => {
                requestRef.current = null;
                const { unscaledX, unscaledY } = coords;
                const newPixels = applyBrush(drawPhoto.pixels, unscaledX, unscaledY);
                if (isDrawing) {
                    setDrawPhoto({ ...drawPhoto, pixels: newPixels });
                } else {
                    setPreviewPhoto({ ...drawPhoto, pixels: newPixels });
                }
            });
        },
        [isDrawing, drawPhoto, getCanvasRelativeCoords, applyBrush]
    );

    const handleDrawEnd = useCallback((e) => {
        if (e.cancelable) {
            e.preventDefault();
        }
        setIsDrawing(false);
    }, []);

    const handleMouseLeave = useCallback(() => {
        if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
            requestRef.current = null;
        }
        setIsDrawing(false);
        if (drawPhoto) {
            setPreviewPhoto(drawPhoto);
        }
    }, [drawPhoto]);

    const drawHandlers = {
        onDrawStart: handleDrawStart,
        onDrawMove: handleDrawMove,
        onDrawEnd: handleDrawEnd,
        onMouseLeave: handleMouseLeave
    };

    return { drawPhoto, photoToRender: previewPhoto, setDrawPhoto, drawHandlers };
};
