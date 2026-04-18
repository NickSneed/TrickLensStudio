import PropTypes from 'prop-types';
import * as styles from './SwatchSet.module.css';
import { useSettings } from '../../context/SettingsContext.js';

/**
 * SwatchSet component displays a visual preview of a color palette.
 * It renders a grid or row of color blocks representing the colors in the palette.
 *
 * @param {Object} props - The component props.
 * @param {boolean} [props.isSelected=false] - Whether this swatch set is currently selected/active.
 * @param {'1x4'|'2x2'} [props.layout='1x4'] - The layout orientation of the swatches.
 * @param {Array<{r: number, g: number, b: number}>} props.colors - Array of RGB color objects to display.
 * @param {string} [props.className] - Additional CSS class names to apply to the wrapper.
 */
const SwatchSet = ({ isSelected, layout = '1x4', colors, className }) => {
    const { settings } = useSettings();
    return (
        <span
            className={`swatchSet ${styles.swatchSet} ${layout === '1x4' ? styles.layout1x4 : styles.layout2x2} ${isSelected ? styles.selected : ''} ${settings.isAnimate ? 'shake' : ''} ${className ? className : ''}`}
        >
            {colors.map((c, index) => (
                <span
                    key={index}
                    className={styles.swatchColorBlock}
                    style={{
                        backgroundColor: `rgb(${c.r},${c.g},${c.b})`
                    }}
                ></span>
            ))}
        </span>
    );
};

SwatchSet.propTypes = {
    isSelected: PropTypes.bool,
    layout: PropTypes.oneOf(['1x4', '2x2']),
    className: PropTypes.string,
    colors: PropTypes.arrayOf(
        PropTypes.shape({
            r: PropTypes.number,
            g: PropTypes.number,
            b: PropTypes.number
        })
    ).isRequired
};

export default SwatchSet;
