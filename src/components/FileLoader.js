import PropTypes from 'prop-types';
import { styles } from '../assets/styles.js';
import { parseSave } from 'gbcam-js';

const FileLoader = ({ setSaveData }) => {
    const reader = new FileReader();

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            // On load
            reader.onload = (loadEvent) => {
                const saveData = parseSave(loadEvent.target.result);
                setSaveData(saveData);
            };

            // Read the file
            reader.readAsArrayBuffer(file);
        }
    };

    return (
        <>
            <input style={styles.input} type="file" className="files" id="images" accept="" multiple onChange={handleFileChange} />
        </>
    );
};

export default FileLoader;

FileLoader.propTypes = {
    setSaveData: PropTypes.func.isRequired
};
