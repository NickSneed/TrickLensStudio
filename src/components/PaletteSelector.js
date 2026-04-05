import { useState } from 'react';
import PropTypes from 'prop-types';
import { palettes } from 'tricklens-js';
import * as styles from './PaletteSelector.module.css';
import Modal from './Modal.js';
import { useSettings } from '../context/SettingsContext.js';

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

    // Use the global settings context
    const { settings } = useSettings();

    const handleSelect = (paletteId) => {
        onPaletteChange(paletteId);
        setIsOpen(false); // Close the selector after choosing a palette
    };

    const handleRandom = () => {
        const paletteKeys = Object.keys(palettes);
        const randomIndex = Math.floor(Math.random() * paletteKeys.length);
        const randomPalette = paletteKeys[randomIndex];
        onPaletteChange(randomPalette);
        setIsOpen(false);
    };

    const currentColors = palettes[currentPalette]?.colors || [];

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
                    <div className={styles.dropdownContainer}>
                        {Object.keys(palettes).map((paletteId) => {
                            const palette = palettes[paletteId].colors;
                            const isSelected = currentPalette === paletteId;

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
                </Modal>
            </div>
        </>
    );
};

PaletteSelector.propTypes = {
    currentPalette: PropTypes.string.isRequired,
    onPaletteChange: PropTypes.func.isRequired
};

export default PaletteSelector;
