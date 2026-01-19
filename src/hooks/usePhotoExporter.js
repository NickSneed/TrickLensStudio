import { useCallback } from 'react';

const getFormattedUsername = (username) => {
    if (!username) {
        return '';
    }
    return '-' + username.toLowerCase().replace(/\s/g, '-');
};

export const usePhotoExporter = (
    saveCanvasRef,
    username,
    paletteId,
    format = 'png',
    quality = 0.9
) => {
    const handleExport = useCallback(async () => {
        const canvas = saveCanvasRef.current;
        if (!canvas) {
            console.error('Save canvas not ready for export.');
            return;
        }

        const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
        const extension = format === 'jpg' ? 'jpg' : 'png';
        const blob = await canvas.convertToBlob({ type: mimeType, quality });
        const link = document.createElement('a');
        link.download = `gbcam${getFormattedUsername(
            username
        )}-${paletteId}-${Date.now()}.${extension}`;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
    }, [saveCanvasRef, username, paletteId, format, quality]);

    const handleShare = useCallback(async () => {
        const canvas = saveCanvasRef.current;
        if (!canvas) {
            return;
        }

        try {
            const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
            const extension = format === 'jpg' ? 'jpg' : 'png';
            const blob = await canvas.convertToBlob({ type: mimeType, quality });
            const filename = `gbcam${getFormattedUsername(
                username
            )}-${paletteId}-${Date.now()}.${extension}`;
            const file = new File([blob], filename, { type: mimeType });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file]
                });
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    }, [saveCanvasRef, username, paletteId, format, quality]);

    return { handleExport, handleShare };
};
