import PropTypes from 'prop-types';
import * as styles from './SwatchBar.module.css';
import { useSettings } from '../../context/SettingsContext.js';

/**
 * SwatchBar component displays a radio input styled as a color palette preview.
 * It shows the colors associated with a palette and allows the user to select it.
 *
 * @param {Object} props - The component props.
 * @param {string} props.paletteId - The unique identifier or name of the palette.
 * @param {boolean} props.isSelected - Whether this palette is currently selected.
 * @param {Function} props.handleSelect - Callback function called when the palette is selected.
 * @param {Array<{r: number, g: number, b: number}>} props.colors - Array of RGB color objects to display.
 */
const SwatchBar = ({ paletteId, isSelected, handleSelect, colors }) => {
    const { settings } = useSettings();
    return (
        <label className={styles.label}>
            <input
                type="radio"
                name="palette"
                value={paletteId}
                checked={isSelected}
                onChange={() => handleSelect(paletteId)}
                className={styles.radioInput}
            />
            <span
                className={`${styles.presetSwatches} ${isSelected ? styles.selected : ''} ${settings.isAnimate ? 'shake' : ''}`}
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
            {paletteId}
        </label>
    );
};

SwatchBar.propTypes = {
    paletteId: PropTypes.string.isRequired,
    isSelected: PropTypes.bool,
    handleSelect: PropTypes.func.isRequired,
    colors: PropTypes.arrayOf(
        PropTypes.shape({
            r: PropTypes.number,
            g: PropTypes.number,
            b: PropTypes.number
        })
    ).isRequired
};

export default SwatchBar;
