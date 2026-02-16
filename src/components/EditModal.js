import { useState, useEffect, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import Photo from '../components/Photo.js';
import * as styles from './EditModal.module.css';
import { useCanvasDrawer } from '../hooks/useCanvasDrawer.js';
import { useEffectApplier } from '../hooks/useEffectApplier.js';
import { getAvailableMontageTypes } from '../utils/montageUtils.js';
import { usePhotoExporter } from '../hooks/usePhotoExporter.js';
import { useSettings } from '../context/SettingsContext.js';

/**
 * EditModal component allows users to edit, apply effects, and export photos.
 * It provides controls for trick lenses, palette order, brush settings, and montage options.
 *
 * @param {Object} props - The component props.
 * @param {Array} props.photos - Array of photo objects to be edited.
 * @param {string} props.palette - The ID of the currently selected palette.
 * @param {Object} props.frame - The frame object to apply to the photo.
 * @param {string} props.username - The username associated with the photos (used for export filename).
 */
const EditModal = ({ photos, palette, frame, username }) => {
    const { settings } = useSettings();

    // State definitions for editing controls
    const [effect, setEffect] = useState('none'); // Current trick lens effect
    const [color, setColor] = useState(0); // Brush color index
    const [brushSize, setBrushSize] = useState(1); // Brush size
    const [montageType, setMontageType] = useState('none'); // Selected montage layout
    const [paletteOrder, setPaletteOrder] = useState('normal'); // Palette color mapping order
    const [rgbBrightness, setRgbBrightness] = useState(0); // Brightness for RGB mode
    const [rgbContrast, setRgbContrast] = useState(0); // Contrast for RGB mode

    // Reset RGB settings when photos change
    useEffect(() => {
        setRgbBrightness(0);
        setRgbContrast(0);
    }, [photos]);

    // Initialize canvas drawing hook
    const { drawPhoto, setDrawPhoto, drawHandlers } = useCanvasDrawer(
        photos ? photos[0] : null,
        frame,
        color,
        brushSize
    );

    // Set idRgb flag for RGB montages
    const isRgb = montageType === 'rgb';

    // Apply selected effects and montage settings to the photo
    useEffectApplier(
        photos ? photos : null,
        effect,
        isRgb ? 'none' : montageType,
        drawPhoto,
        setDrawPhoto
    );

    // Set saveCanvasRef
    const saveCanvasRef = useRef(null);

    // Initialize photo export hook
    const { handleExport, handleShare } = usePhotoExporter(
        saveCanvasRef,
        username,
        palette,
        settings.exportFormat,
        settings.exportQuality
    );

    // Generate montage dropdown options based on photo count
    const montageOptions = getAvailableMontageTypes(photos?.length).map((opt) => (
        <option
            key={opt}
            value={opt}
        >
            {opt}
        </option>
    ));

    // Detect iOS devices to conditionally show the Share button
    const isIOS = useMemo(
        () =>
            typeof navigator !== 'undefined' &&
            (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
                (navigator.userAgent.includes('Mac') &&
                    typeof document !== 'undefined' &&
                    'ontouchend' in document)),
        []
    );

    return (
        <div className={styles.editWrapper}>
            <div className={styles.photo}>
                <div className={styles.scale}>
                    <Photo
                        photo={drawPhoto}
                        photoG={isRgb && photos?.length >= 1 ? photos[1] : undefined}
                        photoB={isRgb && photos?.length >= 2 ? photos[2] : undefined}
                        paletteId={palette}
                        frame={frame}
                        scaleFactor={4}
                        isScale={true}
                        drawHandlers={drawHandlers}
                        paletteOrder={paletteOrder}
                        exportConfig={{
                            format: settings.exportFormat,
                            quality: settings.exportQuality,
                            username
                        }}
                        showShareButton={true}
                        showExportButton={true}
                        saveRef={saveCanvasRef}
                        rgbConfig={{ brightness: rgbBrightness, contrast: rgbContrast }}
                    />
                    <div>
                        {handleExport && !isIOS ? (
                            <button
                                className="button"
                                onClick={handleExport}
                            >
                                Export<span> as {settings.exportFormat.toUpperCase()}</span>
                            </button>
                        ) : null}
                        {handleShare &&
                        isIOS &&
                        typeof navigator !== 'undefined' &&
                        navigator.share ? (
                            <button
                                className="button"
                                onClick={handleShare}
                            >
                                Share
                            </button>
                        ) : null}
                    </div>
                </div>
            </div>
            <div className={styles.controls}>
                <label>
                    Trick Lenses:
                    <select
                        className={styles.select}
                        value={effect}
                        onChange={(e) => setEffect(e.target.value)}
                    >
                        <option value="none">none</option>
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
                    Palette Order:
                    <select
                        className={styles.select}
                        value={paletteOrder}
                        onChange={(e) => setPaletteOrder(e.target.value)}
                    >
                        <option value="normal">normal</option>
                        <option value="i">invert</option>
                        <option value="pa">a</option>
                        <option value="pb">b</option>
                        <option value="pc">c</option>
                        <option value="pd">d</option>
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
                {photos?.length > 1 ? (
                    <label>
                        Montage:
                        <select
                            className={styles.select}
                            value={montageType}
                            onChange={(e) => setMontageType(e.target.value)}
                        >
                            {montageOptions}
                            {photos.length > 2 ? <option value="rgb">rgb</option> : null}
                        </select>
                    </label>
                ) : null}

                {photos?.length > 2 && isRgb ? (
                    <>
                        <label>
                            Brightness: {Math.round(rgbBrightness * 20)}
                            <input
                                className={styles.slider}
                                type="range"
                                min="-0.5"
                                max="0.5"
                                step="0.05"
                                value={rgbBrightness}
                                onChange={(e) => setRgbBrightness(e.target.value)}
                            />
                        </label>
                        <label>
                            Contrast: {Math.round(rgbContrast * 10)}
                            <input
                                className={styles.slider}
                                type="range"
                                min="-1"
                                max="1"
                                step="0.1"
                                value={rgbContrast}
                                onChange={(e) => setRgbContrast(e.target.value)}
                            />
                        </label>
                    </>
                ) : null}
            </div>
        </div>
    );
};

export default EditModal;

EditModal.propTypes = {
    photos: PropTypes.object,
    palette: PropTypes.string,
    frame: PropTypes.object,
    username: PropTypes.string
};
