import { useRef, forwardRef } from 'react';
import PropTypes from 'prop-types';
import * as styles from './FileLoader.module.css';

/**
 * FileLoader component handles file input operations.
 * It provides a styled button to trigger file selection and reads the file as an ArrayBuffer.
 *
 * @param {Object} props - The component props.
 * @param {string} props.text - The label text for the file loader button.
 * @param {Function} props.onChange - Handler called when a file is selected. Receives an object with `data` (ArrayBuffer) and `name`.
 * @param {Function} [props.onRemove] - Handler called when the remove button is clicked.
 * @param {boolean} [props.showRemove=false] - Whether to display the remove button.
 * @param {string} [props.accept=''] - The file types to accept (e.g., ".sav", ".png").
 * @param {React.Ref} ref - Ref forwarded to the internal file input element.
 */
const FileLoader = forwardRef(({ text, onChange, onRemove, showRemove, accept }, ref) => {
    const reader = new FileReader();
    const internalRef = useRef(null);
    const inputRef = ref || internalRef;
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            reader.onload = () => {
                onChange({ data: reader.result, name: file.name });
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

    const handleButtonClick = () => {
        if (inputRef.current) {
            inputRef.current.click();
        }
    };

    return (
        <div className={styles.fileLoader}>
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                multiple
                onChange={handleFileChange}
            />
            <button
                className="button"
                onClick={handleButtonClick}
            >
                {text}
            </button>
            <button
                className={`closeButton ${styles.remove}`}
                onClick={handleRemove}
                style={{ display: showRemove ? 'block' : 'none' }}
            >
                x
            </button>
        </div>
    );
});

export default FileLoader;

FileLoader.displayName = 'FileLoader';

FileLoader.propTypes = {
    text: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onRemove: PropTypes.func,
    showRemove: PropTypes.bool,
    accept: PropTypes.string
};

FileLoader.defaultProps = {
    onRemove: null,
    showRemove: false,
    accept: ''
};
