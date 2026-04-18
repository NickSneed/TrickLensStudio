import PropTypes from 'prop-types';
import * as styles from './CloseButton.module.css';

/**
 * A reusable close button component.
 *
 * @param {Object} props - The component props.
 * @param {Function} [props.onClick] - The function to call when the button is clicked.
 * @param {boolean} [props.isHide=false] - If true, the component will not be rendered.
 * @param {string} [props.className] - Additional CSS class names to apply to the button.
 * @param {boolean} [props.isDark] - If true, dark styling will be applied.
 * @returns {JSX.Element|null} The rendered button or null if hidden.
 */
const CloseButton = ({ onClick, isHide, className, isDark }) => {
    if (isHide) return null;
    return (
        <button
            className={`${styles.closeButton} ${isDark ? styles.dark : ''} ${className}`}
            onClick={onClick}
        >
            x
        </button>
    );
};

CloseButton.propTypes = {
    onClick: PropTypes.func,
    isHide: PropTypes.bool,
    className: PropTypes.string,
    isDark: PropTypes.bool
};

export default CloseButton;
