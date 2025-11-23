import { useState } from 'react';
import PropTypes from 'prop-types';
import { palettes } from 'gbcam-js';
import * as styles from './PaletteSelector.module.css';
import Modal from './Modal.js';

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
                    onClick={() => setIsOpen(!isOpen)}
                    className="button"
                >{`Palette: ${selectedPalette}`}</button>

                <Modal
                    isOpen={isOpen}
                    setIsOpen={setIsOpen}
                    title="Palettes"
                    allowScroll={true}
                    zindex={8}
                >
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
                                        style={
                                            isSelected
                                                ? {
                                                      borderColor:
                                                          'color-mix(in srgb, var(--c-modalcopy) 20%, #fff)'
                                                  }
                                                : null
                                        }
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
    selectedPalette: PropTypes.string.isRequired,
    onPaletteChange: PropTypes.func.isRequired
};

export default PaletteSelector;
