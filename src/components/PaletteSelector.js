import { useState } from 'react';
import PropTypes from 'prop-types';
import palettes from '../../../GBCamExtractionTool/src/assets/palettes.js';
import { styles } from '../assets/styles.js';

const PaletteSelector = ({ selectedPalette, onPaletteChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (paletteId) => {
        onPaletteChange(paletteId);
        setIsOpen(false); // Close the selector after choosing a palette
    };

    return (
        <>
            <div>
                <button style={styles.button} onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? 'Hide palettes' : 'Select palette'}
                </button>

                {isOpen && (
                    <div style={styles.dropdownContainer}>
                        {Object.keys(palettes).map((paletteId) => {
                            const palette = palettes[paletteId];
                            const isSelected = selectedPalette === paletteId;

                            // Combine base and dynamic styles for the swatch border
                            const swatchStyle = {
                                ...styles.swatchContainer,
                                border: isSelected ? '2px solid #5a0ae5ff' : '2px solid #ccc'
                            };

                            return (
                                <label key={paletteId} style={styles.label}>
                                    <input type="radio" name="palette" value={paletteId} checked={isSelected} onChange={(e) => handleSelect(e.target.value)} style={styles.radioInput} />
                                    <span style={swatchStyle}>
                                        {palette.map((c, index) => (
                                            <span
                                                key={index}
                                                style={{
                                                    ...styles.swatchColorBlock,
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
