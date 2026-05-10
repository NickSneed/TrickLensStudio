import { useRef, forwardRef, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import * as styles from './FileLoader.module.css';
import MainButton from './MainButton.js';
import CloseButton from './CloseButton.js';

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
 * @param {boolean} [props.multiple=false] - Whether to allow multiple file selection.
 * @param {React.Ref} ref - Ref forwarded to the internal file input element.
 */
const FileLoader = forwardRef(({ text, onChange, onRemove, showRemove, accept, multiple }, ref) => {
    const inputRef = useRef(null);

    // Expose methods to parent components
    useImperativeHandle(ref, () => ({
        clear: () => {
            if (inputRef.current) {
                inputRef.current.value = '';
            }
        },
        click: () => {
            inputRef.current?.click();
        }
    }));

    const handleFileChange = async (event) => {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        const readFile = (file) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve({ data: reader.result, name: file.name });
                reader.onerror = reject;
                reader.readAsArrayBuffer(file);
            });
        };

        try {
            if (multiple) {
                const results = await Promise.all(files.map(readFile));
                onChange(results);
            } else {
                const result = await readFile(files[0]);
                onChange(result);
            }
        } catch (error) {
            console.error('Error loading file(s):', error);
        }
    };

    const handleRemove = () => {
        onRemove?.();
        if (inputRef.current) inputRef.current.value = '';
    };

    const handleButtonClick = () => {
        inputRef.current?.click();
    };

    return (
        <div className={styles.fileLoader}>
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                multiple={multiple}
                onChange={handleFileChange}
            />
            <MainButton
                onClick={handleButtonClick}
                rightPadding={true}
            >
                {text}
            </MainButton>
            <CloseButton
                onClick={handleRemove}
                isHide={!showRemove}
                className={styles.remove}
                isDark={true}
            />
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
    accept: PropTypes.string,
    multiple: PropTypes.bool
};

FileLoader.defaultProps = {
    onRemove: null,
    showRemove: false,
    accept: '',
    multiple: false
};
