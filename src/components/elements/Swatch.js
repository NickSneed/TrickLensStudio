import PropTypes from 'prop-types';
import * as styles from './Swatch.module.css';

/**
 * A reusable color swatch component.
 *
 * @param {Object} props - The component props.
 * @param {Function} [props.onClick] - The function to call when the button is clicked.
 * @param {boolean} [props.isSelected=false] - If true, the swatch will have a selected style applied.
 * @param {Object} props.color - The RGB color object {r, g, b} to display.
 * @returns {JSX.Element|null} The rendered color swatch or null if no color is provided.
 */
const Swatch = ({ onClick, color, isSelected }) => {
    if (!color) return null;
    return (
        <div
            className={`${styles.quickSwatch} ${isSelected ? styles.selected : ''}`}
            style={{
                backgroundColor: `rgb(${color.r},${color.g},${color.b})`
            }}
            onClick={onClick}
        />
    );
};

Swatch.propTypes = {
    onClick: PropTypes.func,
    isSelected: PropTypes.bool,
    color: PropTypes.shape({
        r: PropTypes.number,
        g: PropTypes.number,
        b: PropTypes.number
    })
};

export default Swatch;
