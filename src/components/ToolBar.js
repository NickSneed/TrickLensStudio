import PropTypes from 'prop-types';
import PaletteSelector from '../components/PaletteSelector.js';
import FileLoader from '../components/FileLoader.js';
import FrameLoader from '../components/FrameLoader.js';

const toolbarStyles = {
    background: '#272727ff',
    position: 'fixed',
    bottom: '0',
    left: '0',
    right: '0',
    width: '100%'
};

const ToolBar = ({ palette, setPalette, setSaveData, setFrame }) => {
    return (
        <>
            <div style={toolbarStyles}>
                <FileLoader setSaveData={setSaveData} />
                <FrameLoader setFrame={setFrame} />
                <PaletteSelector selectedPalette={palette} onPaletteChange={setPalette} />
                <span style={{ float: 'right', margin: '20px' }}>GBCam Studio</span>
            </div>
        </>
    );
};

export default ToolBar;

ToolBar.propTypes = {
    palette: PropTypes.string.isRequired,
    setPalette: PropTypes.func.isRequired,
    setSaveData: PropTypes.func.isRequired,
    setFrame: PropTypes.func.isRequired
};
