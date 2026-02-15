import React, { createContext, useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { getItem, setItem } from '../utils/storageUtils.js';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(() => {
        const initialIsReversed = getItem('isReversed');
        return {
            scaleFactor: getItem('scaleFactor') || 2,
            isShowDeleted: getItem('isShowDeleted') || false,
            color: getItem('color') || 'green',
            isReversed: initialIsReversed === null ? false : initialIsReversed,
            exportFormat: getItem('exportFormat') || 'png',
            exportQuality: Number(getItem('exportQuality')) || 0.9,
            theme: getItem('theme') || 'system'
        };
    });

    // Persist settings to storage
    useEffect(() => {
        Object.keys(settings).forEach((key) => {
            setItem(key, settings[key]);
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
                : name === 'scaleFactor' || name === 'exportQuality'
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
