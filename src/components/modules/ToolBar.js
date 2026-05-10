import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import PaletteSelector from './PaletteSelector.js';
import FileLoader from '../elements/FileLoader.js';
import { parseSave } from 'tricklens-js';
import { convertFrameToData } from '../../utils/canvasUtils.js';
import { setItem, removeItem, KEYS } from '../../utils/storageUtils.js';
import { transformPngToGbcPhoto } from '../../utils/imageProcessingUtils.js';
import * as styles from './ToolBar.module.css';

/**
 * ToolBar component containing controls for file loading, palette selection, and settings.
 *
 * @param {Object} props - The component props.
 * @param {Object} props.palette - The currently selected palette object.
 * @param {Function} props.setPalette - Function to update the selected palette.
 * @param {Function} props.setSaveData - Function to update the loaded save data.
 * @param {Function} props.setFrame - Function to update the selected frame.
 * @param {Function} props.setIsSettingsOpen - Function to toggle the settings menu.
 * @param {boolean} props.isSettingsOpen - Whether the settings menu is currently open.
 * @param {Object} props.saveData - The currently loaded save data object.
 * @param {Object} props.frame - The currently selected frame object.
 * @param {string} props.color - The UI color theme.
 * @param {number} props.count - The number of photos currently loaded.
 * @param {React.Ref} ref - Ref forwarded to the file loader input.
 */
const ToolBar = forwardRef(
    (
        {
            palette,
            setPalette,
            setSaveData,
            setFrame,
            setIsSettingsOpen,
            isSettingsOpen,
            saveData,
            frame,
            color,
            count
        },
        ref
    ) => {
        /**
         * Handles file selection for both Game Boy Camera saves (.sav) and images (.png).
         * If a PNG is loaded, it is converted into a synthetic GBC photo object.
         */
        const handleFileLoad = async ({ data, name }) => {
            const extension = name.toLowerCase().split('.').pop();

            if (extension === 'sav') {
                const saveData = parseSave(data);
                setSaveData(saveData);
                setItem(KEYS.SAVE_DATA, saveData);
                window.scrollTo(0, 0);
                return;
            }

            if (extension === 'png') {
                try {
                    const photo = await transformPngToGbcPhoto(data, name);
                    const importedSave = {
                        username: 'Imported',
                        photos: [photo]
                    };

                    setSaveData(importedSave);
                    setItem(KEYS.SAVE_DATA, importedSave);
                    window.scrollTo(0, 0);
                } catch (error) {
                    console.error('Failed to transform PNG:', error);
                }
            }
        };

        // Set the frame
        const loadFrame = async ({ data, name }) => {
            const frameData = await convertFrameToData(data);
            const newFrame = { ...frameData, name };
            setFrame(newFrame);
            setItem(KEYS.FRAME_DATA, newFrame);
        };

        return (
            <>
                <div className={`${styles.toolbar} color${color}`}>
                    {count > 0 ? <div className={styles.photoCount}>{count}</div> : null}
                    <div className={styles.toolbaritem}>
                        <FileLoader
                            text="Load .sav or .png &hellip;"
                            onChange={handleFileLoad}
                            onRemove={() => {
                                setSaveData(null);
                                removeItem(KEYS.SAVE_DATA);
                            }}
                            showRemove={saveData ? true : false}
                            accept=".sav,.png"
                            ref={ref}
                        />
                    </div>
                    <div className={styles.toolbaritem}>
                        <FileLoader
                            text="Select frame &hellip;"
                            onChange={loadFrame}
                            onRemove={() => {
                                setFrame(null);
                                removeItem(KEYS.FRAME_DATA);
                            }}
                            showRemove={frame ? true : false}
                            accept=".png"
                        />
                    </div>
                    <div className={styles.toolbaritem}>
                        <PaletteSelector
                            currentPalette={palette}
                            onPaletteChange={setPalette}
                        />
                    </div>
                    <div className={styles.settingsbutton}>
                        <button
                            className="imgButton"
                            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        >
                            (S)
                        </button>
                    </div>
                    <span className={`${styles.logo} fontBold`}>TrickLens Studio</span>
                </div>
            </>
        );
    }
);

export default ToolBar;

ToolBar.displayName = 'ToolBar';

ToolBar.propTypes = {
    palette: PropTypes.object.isRequired,
    setPalette: PropTypes.func.isRequired,
    setSaveData: PropTypes.func.isRequired,
    setFrame: PropTypes.func.isRequired,
    setIsSettingsOpen: PropTypes.func.isRequired,
    isSettingsOpen: PropTypes.bool.isRequired,
    saveData: PropTypes.object,
    frame: PropTypes.object,
    color: PropTypes.string.isRequired,
    count: PropTypes.number.isRequired
};
