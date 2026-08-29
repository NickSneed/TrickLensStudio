import { renderPhotoToCanvas } from './renderUtils.js';

/**
 * Bulk exports all provided photos as individual image files.
 * Downloads are staggered by ~50 ms to avoid browser popup blocking.
 *
 * @param {Array<Object>} photos - Array of photo data objects to export.
 * @param {Object} palette - The active palette.
 * @param {Object|null} frame - The active frame (or null).
 * @param {string} username - Username for the filename.
 * @param {Object} settings - App settings (saveScale, exportFormat, exportQuality, isScanline, scanlineBrightness, isScanlineDisplayOnly).
 */
export async function bulkExport(photos, palette, frame, username, settings) {
    const { exportFormat, exportQuality } = settings;
    const isJpg = exportFormat === 'jpg';
    const mimeType = isJpg ? 'image/jpeg' : 'image/png';
    const extension = isJpg ? 'jpg' : 'png';

    const formattedUsername = username ? '-' + username.toLowerCase().replace(/\s/g, '-') : '';

    const paletteId = palette?.id || 'unknown';

    for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];

        try {
            const canvas = await renderPhotoToCanvas(photo, palette, frame, settings);

            let blob;
            if (canvas.convertToBlob) {
                blob = await canvas.convertToBlob({ type: mimeType, quality: exportQuality });
            } else if (canvas.toBlob) {
                blob = await new Promise((resolve) =>
                    canvas.toBlob(resolve, mimeType, exportQuality)
                );
            }

            if (!blob) continue;

            const slot = String((photo.slot ?? i) + 1).padStart(2, '0');
            const filename = `gbcam${formattedUsername}-${paletteId}-slot${slot}.${extension}`;

            const link = document.createElement('a');
            link.download = filename;
            link.href = URL.createObjectURL(blob);
            link.click();
            URL.revokeObjectURL(link.href);
        } catch (err) {
            console.error(`Failed to export photo at index ${i}:`, err);
        }

        // Stagger downloads to prevent browser popup blocking
        if (i < photos.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 50));
        }
    }
}
