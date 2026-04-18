import PropTypes from 'prop-types';
import * as styles from './Swatch.module.css';

/**
 * A reusable color swatch component.
 *
 * @param {Object} props - The component props.
 * @param {Function} [props.onClick] - The function to call when the button is clicked.
 * @param {boolean} [props.isHide=false] - If true, the component will not be rendered.
 * @param {Object} props.color - The RGB color object {r, g, b} to display.
 * @returns {JSX.Element|null} The rendered button or null if hidden.
 */
const Swatch = ({ onClick, isHide, color }) => {
    if (!color) return null;
    return (
        <div
            className={styles.quickSwatch}
            style={{
                backgroundColor: `rgb(${color.r},${color.g},${color.b})`
            }}
            onClick={onClick}
        />
    );
};

Swatch.propTypes = {
    onClick: PropTypes.func,
    isHide: PropTypes.bool
};

export default Swatch;
