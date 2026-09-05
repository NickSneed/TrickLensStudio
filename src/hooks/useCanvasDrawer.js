import { useState, useCallback, useEffect, useRef } from 'react';
import { getFrameOffsets } from '../utils/frameUtils.js';
import { BRUSH_SHAPES } from '../utils/brushConstants.js'; // <-- Import here

/**
 * Hook to handle drawing operations on the photo canvas.
 * Allows modifying pixel data directly based on touch/mouse input.
 *
 * @param {Object} initialPhoto - The starting photo data.
 * @param {Object} frame - The current frame (used for offset calculations).
 * @param {number} brushColor - The color index to draw with (0-3).
 * @param {number} brushSize - The size of the drawing brush in pixels.
 * @param {string} brushStyle - The currently selected brush style.
 */
export const useCanvasDrawer = (initialPhoto, frame, brushColor, brushSize, brushStyle) => {
    const [drawPhoto, setDrawPhoto] = useState(initialPhoto); // The "saved" photo state
    const [previewPhoto, setPreviewPhoto] = useState(initialPhoto); // The photo state for rendering, including hover previews
    const [isDrawing, setIsDrawing] = useState(false);
    const requestRef = useRef(null);
    const isHoveringRef = useRef(false);
    const historyRef = useRef([]);
    const redoStackRef = useRef([]);
    const drawPhotoRef = useRef(drawPhoto);
    const MAX_HISTORY_STEPS = 20;
    const lastPointRef = useRef(null);

    useEffect(() => {
        drawPhotoRef.current = drawPhoto;
    }, [drawPhoto]);

    useEffect(() => {
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    useEffect(() => {
        setDrawPhoto(initialPhoto);
        setPreviewPhoto(initialPhoto);
        historyRef.current = [];
        redoStackRef.current = [];
        lastPointRef.current = null; // Reset last point
    }, [initialPhoto]);

    useEffect(() => {
        setPreviewPhoto(drawPhoto);
    }, [drawPhoto]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            // Check for Ctrl+Z (or Cmd+Z on Mac)
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
                e.preventDefault();

                if (historyRef.current.length === 0) return;

                const previousPixels = historyRef.current.pop(); // Get last state

                // Save current state to redo stack using the ref
                if (drawPhotoRef.current) {
                    redoStackRef.current.push(drawPhotoRef.current.pixels);
                }

                // Apply previous state
                setDrawPhoto((prev) => (prev ? { ...prev, pixels: previousPixels } : prev));
                setPreviewPhoto((prev) => (prev ? { ...prev, pixels: previousPixels } : prev));
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

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
        (pixels, points) => {
            const photoWidth = 128;
            const photoHeight = 112;

            const newPixels = new Uint8Array(pixels);
            const size = Number(brushSize);

            // Brush shapes definition (relative coordinates)
            const brushes = BRUSH_SHAPES;

            points.forEach(({ x, y }) => {
                if (brushStyle !== 'none' && brushes[brushStyle]) {
                    brushes[brushStyle].forEach((offset) => {
                        const drawX = x + offset.x * size;
                        const drawY = y + offset.y * size;
                        for (let i = 0; i < size; i++) {
                            for (let j = 0; j < size; j++) {
                                const px = drawX + i;
                                const py = drawY + j;
                                if (px >= 0 && px < photoWidth && py >= 0 && py < photoHeight) {
                                    const index = py * photoWidth + px;
                                    newPixels[index] = Number(brushColor);
                                }
                            }
                        }
                    });
                } else {
                    // Apply standard brush to the pixel data
                    for (let i = 0; i < size; i++) {
                        for (let j = 0; j < size; j++) {
                            const drawX = x + i;
                            const drawY = y + j;
                            // Ensure drawing stays within photo bounds
                            if (
                                drawX >= 0 &&
                                drawX < photoWidth &&
                                drawY >= 0 &&
                                drawY < photoHeight
                            ) {
                                const index = drawY * photoWidth + drawX;
                                newPixels[index] = Number(brushColor);
                            }
                        }
                    }
                }
            });

            return newPixels;
        },
        [brushColor, brushSize, brushStyle]
    );

    const getLinePixels = (x0, y0, x1, y1) => {
        const points = [];
        const dx = Math.abs(x1 - x0);
        const dy = Math.abs(y1 - y0);
        const sx = x0 < x1 ? 1 : -1;
        const sy = y0 < y1 ? 1 : -1;
        let err = dx - dy;

        let currX = x0;
        let currY = y0;

        while (true) {
            points.push({ x: currX, y: currY });
            if (currX === x1 && currY === y1) break;
            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                currX += sx;
            }
            if (e2 < dx) {
                err += dx;
                currY += sy;
            }
        }
        return points;
    };

    const handleDrawStart = useCallback(
        (e) => {
            if (e.button !== undefined && e.button !== 0) {
                return;
            }
            if (e.cancelable) {
                e.preventDefault();
            }

            const coords = getCanvasRelativeCoords(e);
            if (!coords || !drawPhoto) return;
            const { unscaledX, unscaledY } = coords;

            if (drawPhoto) {
                historyRef.current.push(drawPhoto.pixels);
                if (historyRef.current.length > MAX_HISTORY_STEPS) {
                    historyRef.current.shift();
                }
                redoStackRef.current = [];
            }

            let points;
            if (e.shiftKey && lastPointRef.current) {
                // Get all points along the straight line from the last point to the current point
                points = getLinePixels(
                    lastPointRef.current.x,
                    lastPointRef.current.y,
                    unscaledX,
                    unscaledY
                );
            } else {
                // Just a single point/brush placement
                points = [{ x: unscaledX, y: unscaledY }];
            }

            const newPixels = applyBrush(drawPhoto.pixels, points);

            setDrawPhoto({ ...drawPhoto, pixels: newPixels });
            lastPointRef.current = { x: unscaledX, y: unscaledY };
            setIsDrawing(true);
        },
        [drawPhoto, getCanvasRelativeCoords, applyBrush]
    );

    const handleDrawMove = useCallback(
        (e) => {
            if (e.cancelable) {
                e.preventDefault();
            }

            if (requestRef.current) return;

            const coords = getCanvasRelativeCoords(e);
            if (!coords || !drawPhoto) return;

            isHoveringRef.current = true;

            requestRef.current = requestAnimationFrame(() => {
                requestRef.current = null;

                // Guard: If the mouse has already left, don't update the preview.
                // This prevents the "last pixel" ghosting.
                if (!isHoveringRef.current && !isDrawing) return;

                const { unscaledX, unscaledY } = coords;
                const newPixels = applyBrush(drawPhoto.pixels, [{ x: unscaledX, y: unscaledY }]);
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
        isHoveringRef.current = false;
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
