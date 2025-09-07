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
