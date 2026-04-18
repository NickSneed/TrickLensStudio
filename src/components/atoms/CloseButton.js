import PropTypes from 'prop-types';
import * as styles from './CloseButton.module.css';

/**
 * A reusable close button component.
 *
 * @param {Object} props - The component props.
 * @param {Function} [props.onClick] - The function to call when the button is clicked.
 * @param {string} [props.className] - Optional additional CSS class for styling.
 * @param {boolean} [props.isHide=false] - If true, the component will not be rendered.
 * @returns {JSX.Element|null} The rendered button or null if hidden.
 */
const CloseButton = ({ onClick, className, isHide }) => {
    if (isHide) return null;
    return (
        <button
            className={`${styles.closeButton} ${className}`}
            onClick={onClick}
        >
            x
        </button>
    );
};

CloseButton.propTypes = {
    onClick: PropTypes.func,
    className: PropTypes.string,
    isHide: PropTypes.bool
};

export default CloseButton;
