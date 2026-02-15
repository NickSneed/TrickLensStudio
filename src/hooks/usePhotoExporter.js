import { useCallback } from 'react';

// Helper function to format the username for the filename
const getFormattedUsername = (username) => {
    if (!username) {
        return '';
    }
    // Converts to lowercase and replaces spaces with hyphens, adding a leading hyphen
    return '-' + username.toLowerCase().replace(/\s/g, '-');
};

/**
 * Hook to handle photo exporting and sharing functionality.
 *
 * @param {Object} saveCanvasRef - Ref to the OffscreenCanvas used for saving.
 * @param {string} username - The username to include in the filename.
 * @param {string} paletteId - The ID of the palette used.
 * @param {string} format - The image format ('png' or 'jpg').
 * @param {number} quality - The image quality (0 to 1).
 */
export const usePhotoExporter = (
    saveCanvasRef,
    username,
    paletteId,
    format = 'png',
    quality = 0.9
) => {
    // Determines the MIME type and file extension based on the selected format
    const getFormatDetails = () => {
        const isJpg = format === 'jpg';
        return {
            mimeType: isJpg ? 'image/jpeg' : 'image/png',
            extension: isJpg ? 'jpg' : 'png'
        };
    };

    // Handles downloading the image to the user's device
    const handleExport = useCallback(async () => {
        const canvas = saveCanvasRef.current;
        if (!canvas) {
            console.error('Save canvas not ready for export.');
            return;
        }

        const { mimeType, extension } = getFormatDetails();

        // Convert the canvas content to a Blob
        const blob = await canvas.convertToBlob({ type: mimeType, quality });

        // Create a temporary link element to trigger the download
        const link = document.createElement('a');
        link.download = `gbcam${getFormattedUsername(
            username
        )}-${paletteId}-${Date.now()}.${extension}`;
        link.href = URL.createObjectURL(blob);
        link.click();

        // Clean up the object URL
        URL.revokeObjectURL(link.href);
    }, [saveCanvasRef, username, paletteId, format, quality]);

    // Handles sharing the image using the Web Share API
    const handleShare = useCallback(async () => {
        const canvas = saveCanvasRef.current;
        if (!canvas) {
            return;
        }

        try {
            const { mimeType, extension } = getFormatDetails();

            // Convert canvas to Blob
            const blob = await canvas.convertToBlob({ type: mimeType, quality });

            const filename = `gbcam${getFormattedUsername(
                username
            )}-${paletteId}-${Date.now()}.${extension}`;

            // Create a File object from the Blob
            const file = new File([blob], filename, { type: mimeType });

            // Check if the browser supports sharing files
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
