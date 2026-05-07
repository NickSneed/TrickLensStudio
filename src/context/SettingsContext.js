import React, { createContext, useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { getItem, setItem, KEYS } from '../utils/storageUtils.js';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

// Map internal setting keys to their centralized storage keys
const SETTINGS_STORAGE_MAP = {
    scaleFactor: KEYS.SETTING_SCALE_FACTOR,
    isShowDeleted: KEYS.SETTING_IS_SHOW_DELETED,
    color: KEYS.SETTING_COLOR,
    isReversed: KEYS.SETTING_IS_REVERSED,
    exportFormat: KEYS.SETTING_EXPORT_FORMAT,
    exportQuality: KEYS.SETTING_EXPORT_QUALITY,
    theme: KEYS.SETTING_THEME,
    isAnimate: KEYS.SETTING_IS_ANIMATE,
    saveScale: KEYS.SETTING_SAVE_SCALE
};

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(() => {
        // Retrieve settings from localStorage using centralized KEYS
        const initialIsReversed = getItem(KEYS.SETTING_IS_REVERSED);
        return {
            scaleFactor: getItem(KEYS.SETTING_SCALE_FACTOR) || 2,
            isShowDeleted: getItem(KEYS.SETTING_IS_SHOW_DELETED) || false,
            color: getItem(KEYS.SETTING_COLOR) || 'green',
            isReversed: initialIsReversed === null ? false : initialIsReversed,
            exportFormat: getItem(KEYS.SETTING_EXPORT_FORMAT) || 'png',
            exportQuality: Number(getItem(KEYS.SETTING_EXPORT_QUALITY)) || 0.9,
            theme: getItem(KEYS.SETTING_THEME) || 'system',
            isAnimate: getItem(KEYS.SETTING_IS_ANIMATE) || false,
            saveScale: Number(getItem(KEYS.SETTING_SAVE_SCALE)) || 10
        };
    });

    // Persist settings to storage
    useEffect(() => {
        Object.keys(settings).forEach((key) => {
            setItem(SETTINGS_STORAGE_MAP[key], settings[key]);
        });
    }, [settings]);

    // Handle Theme changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const applyTheme = () => {
            let themeToApply = settings.theme;
            if (themeToApply === 'system') {
                themeToApply = mediaQuery.matches ? 'dark' : 'light';
            }
            document.body.setAttribute('data-theme', themeToApply);
        };

        applyTheme();
        mediaQuery.addEventListener('change', applyTheme);
        return () => mediaQuery.removeEventListener('change', applyTheme);
    }, [settings.theme]);

    // Handle Keyboard Shortcuts for Scale
    useEffect(() => {
        const handleKeyDown = (event) => {
            const isModKey = event.ctrlKey || event.metaKey;
            if ((event.key === '+' || event.key === '=') && isModKey) {
                event.preventDefault();
                updateSetting('scaleFactor', Math.min(settings.scaleFactor + 1, 4));
            } else if (event.key === '-' && isModKey) {
                event.preventDefault();
                updateSetting('scaleFactor', Math.max(settings.scaleFactor - 1, 1));
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [settings.scaleFactor]);

    // Helper to update a specific setting directly
    const updateSetting = (name, value) => {
        setSettings((prev) => ({ ...prev, [name]: value }));
    };

    // Handler for form inputs (keeps compatibility with your existing components)
    const handleSettingChange = (event) => {
        const { name, value, type, checked } = event.target;
        const newValue =
            type === 'checkbox'
                ? checked
                : name === 'scaleFactor' || name === 'exportQuality' || name === 'saveScale'
                  ? Number(value)
                  : value;

        updateSetting(name, newValue);
    };

    return (
        <SettingsContext.Provider value={{ settings, handleSettingChange, updateSetting }}>
            {children}
        </SettingsContext.Provider>
    );
};

SettingsProvider.propTypes = {
    children: PropTypes.node.isRequired
};
