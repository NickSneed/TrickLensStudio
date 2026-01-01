import PropTypes from 'prop-types';
import * as styles from './SettingsMenu.module.css';

const SettingsMenu = ({ settings, onSettingChange }) => {
    return (
        <div className={styles.settings}>
            <label>
                Photo scale:{' '}
                <select
                    className="select"
                    name="scaleFactor"
                    value={settings.scaleFactor}
                    onChange={onSettingChange}
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
                    onChange={onSettingChange}
                >
                    <option>red</option>
                    <option>green</option>
                    <option>yellow</option>
                    <option>blue</option>
                </select>
            </label>
            <label>
                Export format:{' '}
                <select
                    className="select"
                    name="exportFormat"
                    value={settings.exportFormat}
                    onChange={onSettingChange}
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
                        onChange={onSettingChange}
                    />
                </label>
            ) : null}
            <label className="pixel-checkbox">
                <input
                    type="checkbox"
                    name="isReversed"
                    checked={settings.isReversed}
                    onChange={onSettingChange}
                />
                <span></span>
                Reverse order
            </label>
            <label className="pixel-checkbox">
                <input
                    type="checkbox"
                    name="isShowDeleted"
                    checked={settings.isShowDeleted}
                    onChange={onSettingChange}
                />
                <span></span>
                Show deleted
            </label>
        </div>
    );
};

export default SettingsMenu;

SettingsMenu.propTypes = {
    settings: PropTypes.shape({
        isShowDeleted: PropTypes.bool.isRequired,
        scaleFactor: PropTypes.number.isRequired,
        color: PropTypes.string.isRequired,
        isReversed: PropTypes.bool.isRequired,
        exportFormat: PropTypes.string,
        exportQuality: PropTypes.number
    }).isRequired,
    onSettingChange: PropTypes.func.isRequired
};
