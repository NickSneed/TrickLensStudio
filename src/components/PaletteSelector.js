import { useState } from 'react';
import PropTypes from 'prop-types';
import { palettes } from 'tricklens-js';
import * as styles from './PaletteSelector.module.css';
import Modal from './Modal.js';

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

    const handleSelect = (paletteId) => {
        onPaletteChange(paletteId);
        setIsOpen(false); // Close the selector after choosing a palette
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
                                        className={`${styles.swatchContainer} ${isSelected ? styles.selected : ''}`}
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
