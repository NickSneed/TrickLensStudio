import PropTypes from 'prop-types';
import PaletteSelector from '../components/PaletteSelector.js';
import FileLoader from '../components/FileLoader.js';
import FrameLoader from '../components/FrameLoader.js';

const toolbarStyles = {
    background: '#169e78',
    bottom: '10px',
    borderRadius: '10px',
    boxSizing: 'border-box',
    color: '#fff',
    boxShadow: '0 0 5px rgba(0,0,0,0.5)',
    left: '10px',
    position: 'fixed',
    width: 'calc(100% - 20px)',
    zIndex: 2
};

const blurStyles = {
    background: 'rgba(255,255,255,0.1)',
    position: 'fixed',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '150px',
    zIndex: 1,
    mask: 'linear-gradient(to bottom, transparent, white 90%)',
    backdropFilter: 'blur(5px)'
};

const ToolBar = ({ palette, setPalette, setSaveData, setFrame, setScaleFactor }) => {
    return (
        <>
            <div style={toolbarStyles}>
                <FileLoader setSaveData={setSaveData} />
                <FrameLoader setFrame={setFrame} />
                <PaletteSelector selectedPalette={palette} onPaletteChange={setPalette} />
                <select style={{ margin: '12px 0 0 10px', padding: '10px 20px 10px 5px' }} onChange={(e) => setScaleFactor(e.target.value)}>
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>4</option>
                </select>
                <span style={{ float: 'right', margin: '23px 40px 0', fontWeight: 'bold', color: '#fff' }}>GBCam Studio</span>
            </div>
            <div style={blurStyles}></div>
        </>
    );
};

export default ToolBar;

ToolBar.propTypes = {
    palette: PropTypes.string.isRequired,
    setPalette: PropTypes.func.isRequired,
    setSaveData: PropTypes.func.isRequired,
    setFrame: PropTypes.func.isRequired,
    setScaleFactor: PropTypes.func.isRequired
};
