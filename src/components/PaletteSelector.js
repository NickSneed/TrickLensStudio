import { useState } from 'react';
import PropTypes from 'prop-types';
import { palettes } from 'tricklens-js';
import * as styles from './PaletteSelector.module.css';
import Modal from './Modal.js';
import { useSettings } from '../context/SettingsContext.js';
import QUICK_COLORS from '../utils/quickColors.js';

/**
 * PaletteSelector component allows users to choose a color palette from a list.
 * It displays the current palette and opens a modal with available options.
 *
 * @param {Object} props - The component props.
 * @param {string} props.currentPalette - The ID of the currently selected palette.
 * @param {Function} props.onPaletteChange - Handler called when a new palette is selected.
 */
const PaletteSelector = ({ currentPalette, onPaletteChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedColorIndex, setSelectedColorIndex] = useState(0);

    // Use the global settings context
    const { settings } = useSettings();

    const handleSelect = (paletteId) => {
        onPaletteChange({ id: paletteId, ...palettes[paletteId] });
        setIsOpen(false); // Close the selector after choosing a palette
    };

    const handleRandom = () => {
        const paletteKeys = Object.keys(palettes);
        const randomId = paletteKeys[Math.floor(Math.random() * paletteKeys.length)];
        onPaletteChange({ id: randomId, ...palettes[randomId] });
        setIsOpen(false);
    };

    const handleColorChange = (colorIndex, channel, value) => {
        const newColors = currentColors.map((color, i) => {
            if (i === colorIndex) {
                return { ...color, [channel]: parseInt(value, 10) };
            }
            return color;
        });

        onPaletteChange({
            ...currentPalette,
            id: 'custom',
            colors: newColors
        });
    };

    const handleQuickColorSelect = (color) => {
        const newColors = currentColors.map((c, i) => (i === selectedColorIndex ? color : c));

        onPaletteChange({
            ...currentPalette,
            id: 'custom',
            colors: newColors
        });
    };

    const currentColors = currentPalette?.colors || [];

    return (
        <>
            <div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`${styles.paletteselector} button`}
                >
                    Palette
                    <div className={styles.paletteicon}>
                        {currentColors.map((c, index) => (
                            <div
                                key={index}
                                style={{ backgroundColor: `rgb(${c.r},${c.g},${c.b})` }}
                            />
                        ))}
                    </div>
                </button>

                <Modal
                    isOpen={isOpen}
                    setIsOpen={setIsOpen}
                    title="Palettes"
                    allowScroll={true}
                    zindex={8}
                    saveScrollPosition={true}
                >
                    <h3>Presets</h3>
                    <div className={styles.section}>
                        <div className={styles.presetContainer}>
                            {Object.keys(palettes).map((paletteId) => {
                                const palette = palettes[paletteId].colors;
                                const isSelected = currentPalette?.id === paletteId;

                                return (
                                    <label
                                        className={styles.label}
                                        key={paletteId}
                                    >
                                        <input
                                            type="radio"
                                            name="palette"
                                            value={paletteId}
                                            checked={isSelected}
                                            onChange={(e) => handleSelect(e.target.value)}
                                            className={styles.radioInput}
                                        />
                                        <span
                                            className={`${styles.swatchContainer} ${isSelected ? styles.selected : ''} ${settings.isAnimate ? 'shake' : ''}`}
                                        >
                                            {palette.map((c, index) => (
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
                            })}
                        </div>
                        <div className={styles.randombutton}>
                            <button
                                onClick={handleRandom}
                                className="button"
                            >
                                Random
                            </button>
                        </div>
                    </div>
                    <h3>Custom</h3>
                    <div className={styles.section}>
                        {currentColors.length > 0 && (
                            <div className={styles.custom}>
                                {currentColors.map((color, colorIdx) => (
                                    <div
                                        key={colorIdx}
                                        className={`${styles.colorRow} ${
                                            selectedColorIndex === colorIdx ? styles.activeRow : ''
                                        }`}
                                        onClick={() => setSelectedColorIndex(colorIdx)}
                                    >
                                        <div
                                            className={styles.swatchColorBlock}
                                            style={{
                                                backgroundColor: `rgb(${color.r},${color.g},${color.b})`
                                            }}
                                        />
                                        {['r', 'g', 'b'].map((channel) => (
                                            <input
                                                key={channel}
                                                type="range"
                                                min="0"
                                                max="255"
                                                value={color[channel]}
                                                onChange={(e) =>
                                                    handleColorChange(
                                                        colorIdx,
                                                        channel,
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        ))}
                                    </div>
                                ))}
                                <div className={styles.quickPicker}>
                                    {QUICK_COLORS.map((color, index) => (
                                        <div
                                            key={index}
                                            className={styles.quickSwatch}
                                            style={{
                                                backgroundColor: `rgb(${color.r},${color.g},${color.b})`
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleQuickColorSelect(color);
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </Modal>
            </div>
        </>
    );
};

PaletteSelector.propTypes = {
    currentPalette: PropTypes.object,
    onPaletteChange: PropTypes.func.isRequired
};

export default PaletteSelector;
