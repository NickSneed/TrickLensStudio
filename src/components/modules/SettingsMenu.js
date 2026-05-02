import { useSettings } from '../../context/SettingsContext.js';
import * as styles from './SettingsMenu.module.css';
import MainButton from '../elements/MainButton.js';

/**
 * SettingsMenu component displays a list of configurable application settings.
 * It allows users to modify preferences such as photo scale, UI color, theme,
 * export format, and display options.
 *
 * @returns {JSX.Element} The rendered settings menu.
 */
const SettingsMenu = () => {
    const { settings, handleSettingChange } = useSettings();

    const handleClearStorage = () => {
        if (
            window.confirm(
                'Are you sure you want to clear all data? This will reset all settings and remove loaded save data.'
            )
        ) {
            localStorage.clear();
            window.location.reload();
        }
    };

    return (
        <div className={styles.settings}>
            <label>
                Photo scale:{' '}
                <select
                    className="select"
                    name="scaleFactor"
                    value={settings.scaleFactor}
                    onChange={handleSettingChange}
                >
                    <option value={1}>1</option>
                    <option value={2}>2 (default)</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                </select>
            </label>
            <label>
                UI color:{' '}
                <select
                    className="select"
                    name="color"
                    value={settings.color}
                    onChange={handleSettingChange}
                >
                    <option>red</option>
                    <option>green (default)</option>
                    <option>yellow</option>
                    <option>blue</option>
                </select>
            </label>
            <label>
                Theme:{' '}
                <select
                    className="select"
                    name="theme"
                    value={settings.theme}
                    onChange={handleSettingChange}
                >
                    <option value="system">System (default)</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                </select>
            </label>
            <label>
                Export scale:{' '}
                <select
                    className="select"
                    name="saveScale"
                    value={settings.saveScale}
                    onChange={handleSettingChange}
                >
                    <option value={1}>1x</option>
                    <option value={2}>2x</option>
                    <option value={4}>4x</option>
                    <option value={8}>8x</option>
                    <option value={10}>10x (default)</option>
                    <option value={16}>16x</option>
                </select>
            </label>
            <label>
                Export format:{' '}
                <select
                    className="select"
                    name="exportFormat"
                    value={settings.exportFormat}
                    onChange={handleSettingChange}
                >
                    <option value="png">PNG (default)</option>
                    <option value="jpg">JPG</option>
                </select>
            </label>
            {settings.exportFormat === 'jpg' ? (
                <label>
                    Quality:{' '}
                    <span className={styles.qualityValue}>
                        {Math.round(settings.exportQuality * 100)}%
                    </span>
                    <input
                        className={styles.qualitySlider}
                        type="range"
                        name="exportQuality"
                        min="0.1"
                        max="1"
                        step="0.1"
                        value={settings.exportQuality}
                        onChange={handleSettingChange}
                    />
                </label>
            ) : null}
            <label className="pixelCheckbox">
                <input
                    type="checkbox"
                    name="isReversed"
                    checked={settings.isReversed}
                    onChange={handleSettingChange}
                />
                <span></span>
                Reverse order
            </label>
            <label className="pixelCheckbox">
                <input
                    type="checkbox"
                    name="isShowDeleted"
                    checked={settings.isShowDeleted}
                    onChange={handleSettingChange}
                />
                <span></span>
                Show deleted
            </label>
            <label className="pixelCheckbox">
                <input
                    type="checkbox"
                    name="isAnimate"
                    checked={settings.isAnimate}
                    onChange={handleSettingChange}
                />
                <span></span>
                Enable Animations
            </label>
            <MainButton onClick={handleClearStorage}>Clear All Data</MainButton>
        </div>
    );
};

export default SettingsMenu;
