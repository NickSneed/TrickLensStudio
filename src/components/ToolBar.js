import PropTypes from 'prop-types';
import PaletteSelector from '../components/PaletteSelector.js';
import FileLoader from '../components/FileLoader.js';
import { parseSave } from 'gbcam-js';
import * as styles from './ToolBar.module.css';

const ToolBar = ({
    palette,
    setPalette,
    setSaveData,
    setFrame,
    setIsSettingsOpen,
    isSettingsOpen,
    frame
}) => {
    // Parses the save data
    const loadSave = (event) => {
        const saveData = parseSave(event.target.result);
        setSaveData(saveData);
        window.scrollTo(0, 0);
    };

    // Set the frame
    const loadFrame = (event) => {
        setFrame(event.target.result);
    };

    return (
        <>
            <div className={styles.toolbar}>
                <div className={styles.toolbaritem}>
                    <FileLoader
                        onChange={loadSave}
                        accept=".sav"
                    />
                </div>
                <div className={styles.toolbaritem}>
                    <FileLoader
                        onChange={loadFrame}
                        onRemove={() => setFrame(null)}
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
                        className="img-button"
                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    >
                        &#9965;
                    </button>
                </div>
                <span className={`${styles.logo} font-bold`}>GBCam Studio</span>
            </div>
        </>
    );
};

export default ToolBar;

ToolBar.propTypes = {
    palette: PropTypes.string.isRequired,
    setPalette: PropTypes.func.isRequired,
    setSaveData: PropTypes.func.isRequired,
    setFrame: PropTypes.func.isRequired,
    setScaleFactor: PropTypes.func.isRequired,
    setIsSettingsOpen: PropTypes.func.isRequired,
    isSettingsOpen: PropTypes.bool.isRequired,
    frame: PropTypes.object,
    scaleFactor: PropTypes.number.isRequired
};
