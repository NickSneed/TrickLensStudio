import PropTypes from 'prop-types';
import { isIOS } from '../../utils/deviceUtils.js';
import { usePhotoExporter } from '../../hooks/usePhotoExporter.js';
import { useSettings } from '../../context/SettingsContext.js';
import MainButton from './MainButton.js';

/**
 * A button that shows "Share" on iOS/supporting platforms and a fallback "Save" or "Export" button otherwise.
 *
 * @param {object} props
 * @param {React.RefObject<HTMLCanvasElement|OffscreenCanvas>} props.saveCanvasRef - Ref to the canvas to export.
 * @param {string} [props.username] - Username for filename.
 * @param {string} [props.paletteId] - Palette ID for filename.
 * @param {string} [props.fileNameOverride] - A specific filename to use.
 */
const ExportButton = ({ saveCanvasRef, username, paletteId, fileNameOverride }) => {
    const { settings } = useSettings();
    const { handleExport, handleShare } = usePhotoExporter(
        saveCanvasRef,
        username,
        paletteId,
        settings.exportFormat,
        settings.exportQuality,
        fileNameOverride
    );

    const canShare = isIOS() && typeof navigator !== 'undefined' && navigator.share;

    if (canShare && handleShare) {
        return <MainButton onClick={handleShare}>Share</MainButton>;
    }

    return (
        <MainButton onClick={handleExport}>
            Export<span> as {settings.exportFormat.toUpperCase()}</span>
        </MainButton>
    );
};

ExportButton.propTypes = {
    saveCanvasRef: PropTypes.object.isRequired,
    username: PropTypes.string,
    paletteId: PropTypes.string,
    fileNameOverride: PropTypes.string
};

export default ExportButton;
