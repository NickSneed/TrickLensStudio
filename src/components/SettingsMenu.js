import { useSettings } from '../context/SettingsContext.js';
import * as styles from './SettingsMenu.module.css';

const SettingsMenu = () => {
    const { settings, handleSettingChange } = useSettings();

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
                    <option value={2}>2</option>
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
                    <option>green</option>
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
                    <option value="system">System</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
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
                    <option value="png">PNG</option>
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
            <label className="pixel-checkbox">
                <input
                    type="checkbox"
                    name="isReversed"
                    checked={settings.isReversed}
                    onChange={handleSettingChange}
                />
                <span></span>
                Reverse order
            </label>
            <label className="pixel-checkbox">
                <input
                    type="checkbox"
                    name="isShowDeleted"
                    checked={settings.isShowDeleted}
                    onChange={handleSettingChange}
                />
                <span></span>
                Show deleted
            </label>
        </div>
    );
};

export default SettingsMenu;
