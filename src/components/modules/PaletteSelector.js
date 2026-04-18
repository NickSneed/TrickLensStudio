import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { palettes } from 'tricklens-js';
import * as styles from './PaletteSelector.module.css';
import Modal from '../elements/Modal.js';
import FileLoader from '../elements/FileLoader.js';
import SwatchBar from '../elements/SwatchBar.js';
import MainButton from '../elements/MainButton.js';
import Swatch from '../elements/Swatch.js';

/**
 * Adjusts the brightness of an RGB color using specific shade levels.
 * @param {number} r, g, b - The base color values (0-255)
 * @param {number} level - The shade level (-3 to 3)
 * @returns {Array} - The new [r, g, b] values
 */
const getSGBShade = (r, g, b, level) => {
    const darkMultipliers = [1.0, 0.686, 0.439, 0.247]; // Neutral, -1, -2, -3
    const lightSteps = [0, 0.314, 0.533, 0.753]; // Neutral, +1, +2, +3

    if (level === 0) return [r, g, b];

    if (level < 0) {
        const mult = darkMultipliers[Math.abs(level)];
        return [Math.round(r * mult), Math.round(g * mult), Math.round(b * mult)];
    } else {
        const step = lightSteps[level];
        return [
            Math.round(r + (255 - r) * step),
            Math.round(g + (255 - g) * step),
            Math.round(b + (255 - b) * step)
        ];
    }
};

/**
 * PaletteSelector component allows users to choose a color palette from a list.
 * It displays the current palette and opens a modal with available options.
 *
 * @param {Object} props - The component props.
 * @param {Object} props.currentPalette - The currently selected palette object.
 * @param {Function} props.onPaletteChange - Handler called when a new palette is selected.
 */
const PaletteSelector = ({ currentPalette, onPaletteChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedColorIndex, setSelectedColorIndex] = useState(0);
    const [shadeLevels, setShadeLevels] = useState([0, 0, 0, 0]);
    const [baseColors, setBaseColors] = useState([null, null, null, null]);
    const [userPalettes, setUserPalettes] = useState({});
    const [quickColors, setQuickColors] = useState([]);

    const [isDesktop, setIsDesktop] = useState(
        typeof window !== 'undefined' ? window.innerWidth >= 1280 : true
    );

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 1280);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Synchronize local shade tracking when a preset palette is selected
    useEffect(() => {
        if (currentPalette && currentPalette.id !== 'custom') {
            setShadeLevels([0, 0, 0, 0]);
            setBaseColors(currentPalette.colors);
        }
    }, [currentPalette?.id]);

    // Load user palettes from local storage on component mount
    useEffect(() => {
        try {
            const storedData = localStorage.getItem('tricklens-saved-palettes');
            if (storedData) {
                const parsed = JSON.parse(storedData);
                setUserPalettes(parsed.palettes || {});
                setQuickColors(parsed.quickColors || []);
            }
        } catch (e) {
            console.error('Failed to load user palettes from localStorage', e);
        }
    }, []);

    // Combine built-in and user palettes for easier access throughout the component
    const allPalettes = useMemo(() => ({ ...palettes, ...userPalettes }), [userPalettes]);

    const handleSelect = (paletteId) => {
        const selectedPaletteData = allPalettes[paletteId];
        if (!selectedPaletteData) return;
        onPaletteChange({ id: paletteId, ...selectedPaletteData });
        setIsOpen(false); // Close the selector after choosing a palette
    };

    const handleLoadUserPalettesFile = ({ data }) => {
        try {
            const decoder = new TextDecoder('utf-8');
            const jsonString = decoder.decode(data);
            const loadedData = JSON.parse(jsonString);

            const loadedPalettes = loadedData.palettes || {};
            const loadedQuickColors = loadedData.quickColors || [];

            // Basic validation for the loaded structure
            const isValid = Object.values(loadedPalettes).every(
                (p) =>
                    p &&
                    p.name &&
                    Array.isArray(p.colors) &&
                    p.colors.every(
                        (c) =>
                            typeof c.r === 'number' &&
                            typeof c.g === 'number' &&
                            typeof c.b === 'number'
                    )
            );

            if (!isValid) {
                alert(
                    'Invalid palette file format. Please ensure it matches the expected structure.'
                );
                return;
            }

            setUserPalettes(loadedPalettes);
            setQuickColors(loadedQuickColors);
            localStorage.setItem(
                'tricklens-saved-palettes',
                JSON.stringify({
                    palettes: loadedPalettes,
                    quickColors: loadedQuickColors
                })
            );
            window.scrollTo(0, 0);
        } catch (error) {
            console.error('Error loading palette file:', error);
            alert('Failed to load palette file. Please ensure it is a valid JSON file.');
        }
    };

    const handleClearUserPalettes = () => {
        setUserPalettes({});
        setQuickColors([]);
        localStorage.removeItem('tricklens-saved-palettes');
    };

    const handleRandom = () => {
        const allPaletteIds = Object.keys(allPalettes);
        if (allPaletteIds.length === 0) {
            alert('No palettes available for random selection.');
            return;
        }

        const randomId = allPaletteIds[Math.floor(Math.random() * allPaletteIds.length)];

        onPaletteChange({ id: randomId, ...allPalettes[randomId] });
        setIsOpen(false);
    };

    const handleColorChange = (colorIndex, channel, value) => {
        const updatedColor = { ...currentColors[colorIndex], [channel]: parseInt(value, 10) };

        // Reset tracking because user manually tweaked the color
        const newLevels = [...shadeLevels];
        newLevels[colorIndex] = 0;
        setShadeLevels(newLevels);
        updateBaseColor(colorIndex, updatedColor);

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

    const handleShadeChange = (colorIndex, delta) => {
        const currentLevel = shadeLevels[colorIndex];
        const newLevel = Math.max(-3, Math.min(3, currentLevel + delta));

        if (newLevel === currentLevel) return;

        const base = baseColors[colorIndex] || currentColors[colorIndex];
        const [r, g, b] = getSGBShade(base.r, base.g, base.b, newLevel);

        const newLevels = [...shadeLevels];
        newLevels[colorIndex] = newLevel;
        setShadeLevels(newLevels);
        updateBaseColor(colorIndex, base);

        const newColors = currentColors.map((c, i) => {
            if (i === colorIndex) return { r, g, b };
            return c;
        });

        onPaletteChange({
            ...currentPalette,
            id: 'custom',
            colors: newColors
        });
    };

    const handleQuickColorSelect = (color) => {
        // Reset level to 0 and set new base when picking from the grid
        const newLevels = [...shadeLevels];
        newLevels[selectedColorIndex] = 0;
        setShadeLevels(newLevels);

        const newBases = [...baseColors];
        newBases[selectedColorIndex] = color;
        setBaseColors(newBases);

        const newColors = currentColors.map((c, i) => (i === selectedColorIndex ? color : c));

        onPaletteChange({
            ...currentPalette,
            id: 'custom',
            colors: newColors
        });
    };

    const updateBaseColor = (index, color) => {
        const newBases = [...baseColors];
        newBases[index] = color;
        setBaseColors(newBases);
    };

    const currentColors = currentPalette?.colors || [];

    return (
        <>
            <div>
                <MainButton
                    onClick={() => setIsOpen(!isOpen)}
                    rightPadding={true}
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
                </MainButton>

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
                            {Object.keys(allPalettes).map((paletteId) => {
                                const paletteData = allPalettes[paletteId];
                                return (
                                    <SwatchBar
                                        key={paletteId}
                                        paletteId={paletteId}
                                        colors={paletteData.colors}
                                        isSelected={currentPalette?.id === paletteId}
                                        handleSelect={handleSelect}
                                    />
                                );
                            })}
                        </div>
                        <div className={styles.randombutton}>
                            <MainButton onClick={handleRandom}>Random</MainButton>
                        </div>
                    </div>
                    <h3>Custom</h3>
                    <div className={styles.section}>
                        {currentColors.length > 0 && (
                            <div className={styles.custom}>
                                {!isDesktop && (
                                    <div className={styles.mobileColorSwatches}>
                                        {currentColors.map((color, idx) => (
                                            <div
                                                key={idx}
                                                className={`${styles.swatchColorBlock} ${selectedColorIndex === idx ? styles.activeSwatch : ''}`}
                                                style={{
                                                    backgroundColor: `rgb(${color.r},${color.g},${color.b})`
                                                }}
                                                onClick={() => setSelectedColorIndex(idx)}
                                            />
                                        ))}
                                    </div>
                                )}
                                {currentColors.map((color, colorIdx) => {
                                    if (!isDesktop && selectedColorIndex !== colorIdx) return null;
                                    return (
                                        <div
                                            key={colorIdx}
                                            className={`${styles.customColorRow} ${
                                                selectedColorIndex === colorIdx
                                                    ? styles.activeRow
                                                    : ''
                                            }`}
                                            onClick={() => setSelectedColorIndex(colorIdx)}
                                        >
                                            {isDesktop && <Swatch color={color} />}
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
                                            <div className={styles.rgbValues}>
                                                <span>{color.r}</span>
                                                <span>{color.g}</span>
                                                <span>{color.b}</span>
                                            </div>
                                            <div className={styles.stepper}>
                                                <MainButton
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleShadeChange(colorIdx, -1);
                                                    }}
                                                >
                                                    -
                                                </MainButton>
                                                <MainButton
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleShadeChange(colorIdx, 1);
                                                    }}
                                                >
                                                    +
                                                </MainButton>
                                            </div>
                                        </div>
                                    );
                                })}
                                {quickColors.length > 0 && (
                                    <div className={styles.quickPicker}>
                                        {quickColors.map((color, index) => (
                                            <Swatch
                                                key={index}
                                                color={color}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleQuickColorSelect(color);
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <h3>Load/Manage</h3>
                    <FileLoader
                        text="Load config ..."
                        onChange={handleLoadUserPalettesFile}
                        onRemove={handleClearUserPalettes}
                        accept=".json"
                        showRemove={Object.keys(userPalettes).length > 0}
                    />
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
