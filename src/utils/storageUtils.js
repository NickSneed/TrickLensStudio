/**
 * Constants for localStorage keys used by the application.
 */
export const KEYS = {
    SAVE_DATA: 'tricklens-save-data',
    FRAME_DATA: 'tricklens-frame-data',
    // User-saved palettes
    PALETTES: 'tricklens-saved-palettes',
    // Currently selected palette
    ACTIVE_PALETTE: 'tricklens-active-palette',
    // Settings keys
    SETTING_SCALE_FACTOR: 'tricklens-setting-scale-factor',
    SETTING_IS_SHOW_DELETED: 'tricklens-setting-is-show-deleted',
    SETTING_COLOR: 'tricklens-setting-color',
    SETTING_IS_REVERSED: 'tricklens-setting-is-reversed',
    SETTING_EXPORT_FORMAT: 'tricklens-setting-export-format',
    SETTING_EXPORT_QUALITY: 'tricklens-setting-export-quality',
    SETTING_THEME: 'tricklens-setting-theme',
    SETTING_IS_ANIMATE: 'tricklens-setting-is-animate',
    SETTING_SAVE_SCALE: 'tricklens-setting-save-scale'
};

/**
 * Converts a Uint8Array to a Base64 string safely.
 * @param {Uint8Array} arr
 * @returns {string}
 */
const toBase64 = (arr) => {
    let binary = '';
    const len = arr.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(arr[i]);
    }
    return btoa(binary);
};

/**
 * Converts a Base64 string back to a Uint8Array.
 * @param {string} str
 * @returns {Uint8Array}
 */
const fromBase64 = (str) => {
    const binaryString = atob(str);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
};

// Custom replacer for JSON.stringify to handle Uint8Array
const uint8ArrayReplacer = (key, value) => {
    if (value instanceof Uint8Array) {
        return { __type: 'Uint8Array', data: toBase64(value) };
    }
    return value;
};

// Custom reviver for JSON.parse to handle Uint8Array
const uint8ArrayReviver = (key, value) => {
    if (
        value &&
        typeof value === 'object' &&
        value.__type === 'Uint8Array' &&
        typeof value.data === 'string'
    ) {
        return fromBase64(value.data);
    }
    return value;
};

// Generic localStorage operations with optional custom replacer/reviver
const storage = {
    getItem: (key, reviver = null) => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item, reviver) : null;
        } catch (error) {
            console.error(`Error getting item "${key}" from localStorage:`, error);
            return null;
        }
    },
    setItem: (key, value, replacer = null) => {
        try {
            const stringifiedValue = JSON.stringify(value, replacer);
            window.localStorage.setItem(key, stringifiedValue);
        } catch (error) {
            console.error(`Error setting item "${key}" in localStorage:`, error);
        }
    },
    removeItem: (key) => {
        try {
            window.localStorage.removeItem(key);
        } catch (error) {
            console.error(`Error removing item "${key}" from localStorage:`, error);
        }
    },
    clear: () => {
        try {
            window.localStorage.clear();
        } catch (error) {
            console.error('Error clearing localStorage:', error);
        }
    }
};

/**
 * Gets a generic item from localStorage.
 * @param {string} key - The key of the item to retrieve.
 * @param {Function} [reviver] - Optional JSON reviver function.
 * @returns {any | null} The retrieved item, parsed from JSON, or null if not found.
 */
export function getItem(key, reviver = null) {
    return storage.getItem(key, reviver);
}

/**
 * Sets a generic item in localStorage.
 * @param {string} key - The key of the item to set.
 * @param {any} value - The value to store. It will be stringified.
 * @param {Function} [replacer] - Optional JSON replacer function.
 */
export function setItem(key, value, replacer = null) {
    storage.setItem(key, value, replacer);
}

export function getStoredSave() {
    return storage.getItem(KEYS.SAVE_DATA, uint8ArrayReviver);
}

export function setStoredSave(saveData) {
    storage.setItem(KEYS.SAVE_DATA, saveData, uint8ArrayReplacer);
}

export function removeStoredSave() {
    storage.removeItem(KEYS.SAVE_DATA);
}

export function getStoredFrame() {
    return storage.getItem(KEYS.FRAME_DATA, uint8ArrayReviver);
}

export function setStoredFrame(frameData) {
    storage.setItem(KEYS.FRAME_DATA, frameData, uint8ArrayReplacer);
}

export function removeStoredFrame() {
    storage.removeItem(KEYS.FRAME_DATA);
}

export function getStoredActivePalette() {
    return storage.getItem(KEYS.ACTIVE_PALETTE);
}

export function setStoredActivePalette(palette) {
    storage.setItem(KEYS.ACTIVE_PALETTE, palette);
}

export function getStoredPalettes() {
    return storage.getItem(KEYS.PALETTES);
}

export function setStoredPalettes(palettesData) {
    storage.setItem(KEYS.PALETTES, palettesData);
}

export function removeStoredPalettes() {
    storage.removeItem(KEYS.PALETTES);
}

/**
 * Clears all data from localStorage for this origin.
 */
export function clearAppStorage() {
    storage.clear();
}
