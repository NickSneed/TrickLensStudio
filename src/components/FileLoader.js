import { useRef } from 'react';
import PropTypes from 'prop-types';
import * as styles from './FileLoader.module.css';

const FileLoader = ({ onChange, onRemove, showRemove }) => {
    const reader = new FileReader();
    const inputRef = useRef(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            reader.onload = (loadEvent) => {
                onChange(loadEvent);
            };

            reader.readAsArrayBuffer(file);
        }
    };

    const handleRemove = () => {
        if (onRemove) {
            onRemove();
        }
        if (inputRef.current) {
            inputRef.current.value = null;
        }
    };

    return (
        <>
            <input
                ref={inputRef}
                className={styles.input}
                type="file"
                id="images"
                accept=""
                multiple
                onChange={handleFileChange}
            />
            <button
                className={styles.remove}
                onClick={handleRemove}
                style={{ display: showRemove ? 'block' : 'none' }}
            >
                x
            </button>
        </>
    );
};

export default FileLoader;

FileLoader.propTypes = {
    onChange: PropTypes.func.isRequired,
    onRemove: PropTypes.func,
    showRemove: PropTypes.bool
};
