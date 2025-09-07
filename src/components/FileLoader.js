import PropTypes from 'prop-types';
import { styles } from '../assets/styles.js';

const FileLoader = ({ setFileBuffer }) => {
    const reader = new FileReader();

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            // On load
            reader.onload = (loadEvent) => {
                setFileBuffer(new Uint8Array(loadEvent.target.result));
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
    setFileBuffer: PropTypes.func.isRequired
};
