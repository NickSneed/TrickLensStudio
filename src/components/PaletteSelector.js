import { useState } from 'react';
import PropTypes from 'prop-types';
import { palettes } from 'gbcam-js';
import * as styles from './PaletteSelector.module.css';

const PaletteSelector = ({ selectedPalette, onPaletteChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (paletteId) => {
        onPaletteChange(paletteId);
        setIsOpen(false); // Close the selector after choosing a palette
    };

    return (
        <>
            <div>
                <button
                    className={styles.button}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {`Palette: ${selectedPalette}`}
                </button>

                {isOpen && (
                    <div className={styles.dropdownContainer}>
                        {Object.keys(palettes).map((paletteId) => {
                            const palette = palettes[paletteId];
                            const isSelected = selectedPalette === paletteId;

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
                                        className={styles.swatchContainer}
                                        style={isSelected ? { border: '1px solid #fff' } : { border: '1px solid #000' }}
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
                )}
            </div>
        </>
    );
};

PaletteSelector.propTypes = {
    selectedPalette: PropTypes.string.isRequired,
    onPaletteChange: PropTypes.func.isRequired
};

export default PaletteSelector;
