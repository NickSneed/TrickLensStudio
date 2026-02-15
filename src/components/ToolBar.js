import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import PaletteSelector from '../components/PaletteSelector.js';
import FileLoader from '../components/FileLoader.js';
import { parseSave } from 'tricklens-js';
import { convertFrameToData } from '../utils/canvasUtils.js';
import { setStoredFrame, removeStoredFrame } from '../utils/storageUtils.js';
import * as styles from './ToolBar.module.css';

/**
 * ToolBar component containing controls for file loading, palette selection, and settings.
 *
 * @param {Object} props - The component props.
 * @param {string} props.palette - The ID of the currently selected palette.
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
        // Parses the save data
        const loadSave = ({ data }) => {
            const saveData = parseSave(data);
            setSaveData(saveData);
            try {
                localStorage.setItem(
                    'tricklens-save-data',
                    JSON.stringify(saveData, (k, v) =>
                        v instanceof Uint8Array ? Array.from(v) : v
                    )
                );
            } catch (e) {
                console.warn('Failed to save to localStorage', e);
            }
            window.scrollTo(0, 0);
        };

        // Set the frame
        const loadFrame = async ({ data, name }) => {
            const frameData = await convertFrameToData(data);
            const newFrame = { ...frameData, name };
            setFrame(newFrame);
            setStoredFrame(newFrame);
        };

        return (
            <>
                <div className={`${styles.toolbar} color${color}`}>
                    {count > 0 ? <div className={styles.photoCount}>{count}</div> : null}
                    <div className={styles.toolbaritem}>
                        <FileLoader
                            text="Select .sav &hellip;"
                            onChange={loadSave}
                            onRemove={() => {
                                setSaveData(null);
                                localStorage.removeItem('tricklens-save-data');
                            }}
                            showRemove={saveData ? true : false}
                            accept=".sav"
                            ref={ref}
                        />
                    </div>
                    <div className={styles.toolbaritem}>
                        <FileLoader
                            text="Select frame &hellip;"
                            onChange={loadFrame}
                            onRemove={() => {
                                setFrame(null);
                                removeStoredFrame();
                            }}
                            showRemove={frame ? true : false}
                            accept=".png"
                        />
                    </div>
                    <div className={styles.toolbaritem}>
                        <PaletteSelector
                            selectedPalette={palette}
                            onPaletteChange={setPalette}
                        />
                    </div>
                    <div className={styles.settingsbutton}>
                        <button
                            className="imgButton"
                            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        >
                            &#9965;
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
    palette: PropTypes.string.isRequired,
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
