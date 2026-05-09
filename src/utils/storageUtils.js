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
    // Strictly validate the object shape to prevent processing tampered JSON
    if (
        value &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        value.__type === 'Uint8Array' &&
        typeof value.data === 'string' &&
        Object.keys(value).length === 2
    ) {
        return fromBase64(value.data);
    }
    return value;
};

/**
 * Validates the structure of palette data to prevent XSS or malformed storage.
 * @param {any} data
 * @returns {boolean}
 */
const validatePaletteData = (data) => {
    if (!data || typeof data !== 'object') return false;

    const loadedPalettes = data.palettes || {};

    // Regex to allow only alphanumeric, spaces, and hyphens/underscores in names
    const safeNameRegex = /^[a-zA-Z0-9\s\-_]+$/;

    // Strict validation for the palettes object
    return Object.values(loadedPalettes).every((p) => {
        const hasValidStructure =
            p &&
            typeof p.name === 'string' &&
            p.name.length > 0 &&
            p.name.length < 50 &&
            safeNameRegex.test(p.name) &&
            Array.isArray(p.colors) &&
            p.colors.length === 4;

        if (!hasValidStructure) return false;

        // Ensure colors are valid RGB integers
        return p.colors.every(
            (c) =>
                Number.isInteger(c.r) &&
                c.r >= 0 &&
                c.r <= 255 &&
                Number.isInteger(c.g) &&
                c.g >= 0 &&
                c.g <= 255 &&
                Number.isInteger(c.b) &&
                c.b >= 0 &&
                c.b <= 255
        );
    });
};

/**
 * Validates the structure of frame data.
 * @param {any} data
 * @returns {boolean}
 */
const validateFrameData = (data) => {
    if (!data || typeof data !== 'object') return false;

    const safeNameRegex = /^[a-zA-Z0-9\s\-_.]+$/;

    const hasValidStructure =
        typeof data.width === 'number' &&
        typeof data.height === 'number' &&
        typeof data.name === 'string' &&
        data.name.length < 100 &&
        safeNameRegex.test(data.name) &&
        (data.data instanceof Uint8Array || (data.data && data.data.__type === 'Uint8Array')); // Handle both raw and serialized forms

    if (!hasValidStructure) return false;

    // Sanity check dimensions for Game Boy Camera frames
    return data.width > 0 && data.width <= 160 && data.height > 0 && data.height <= 224;
};

/**
 * Validates the structure of save data to ensure it conforms to Game Boy Camera expectations.
 * @param {any} data
 * @returns {boolean}
 */
const validateSaveData = (data) => {
    if (!data || typeof data !== 'object') return false;

    // username is typically 8 chars in GBC, allowing 50 for safety
    if (typeof data.username !== 'string' || data.username.length > 50) return false;

    if (!Array.isArray(data.photos) || data.photos.length > 30) return false;

    return data.photos.every((p) => {
        if (p === null) return true;
        if (typeof p !== 'object') return false;

        return typeof p.isDeleted === 'boolean' && typeof p.slot === 'number';
    });
};

// Generic localStorage operations with optional custom replacer/reviver
const storage = {
    getItem: (key, reviver = uint8ArrayReviver) => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item, reviver) : null;
        } catch (error) {
            console.error(`Error getting item "${key}" from localStorage:`, error);
            return null;
        }
    },
    setItem: (key, value, replacer = uint8ArrayReplacer) => {
        try {
            // Apply specific validation for palettes
            if (key === KEYS.PALETTES && !validatePaletteData(value)) {
                console.error('Invalid palette data format rejected.');
                return false;
            }

            if (key === KEYS.FRAME_DATA && !validateFrameData(value)) {
                console.error('Invalid frame data format rejected.');
                return false;
            }

            if (key === KEYS.SAVE_DATA && !validateSaveData(value)) {
                console.error('Invalid save data format rejected.');
                return false;
            }

            // Validate boolean settings
            if (
                [
                    KEYS.SETTING_IS_ANIMATE,
                    KEYS.SETTING_IS_REVERSED,
                    KEYS.SETTING_IS_SHOW_DELETED
                ].includes(key) &&
                typeof value !== 'boolean'
            ) {
                console.error(`Invalid boolean value for ${key} rejected.`);
                return false;
            }

            // Validate numeric settings
            if (
                [
                    KEYS.SETTING_EXPORT_QUALITY,
                    KEYS.SETTING_SAVE_SCALE,
                    KEYS.SETTING_SCALE_FACTOR
                ].includes(key) &&
                typeof value !== 'number'
            ) {
                console.error(`Invalid numeric value for ${key} rejected.`);
                return false;
            }

            // Validate theme setting
            if (key === KEYS.SETTING_THEME && !['system', 'light', 'dark'].includes(value)) {
                console.error(`Invalid theme value for ${key} rejected.`);
                return false;
            }

            // Validate UI color setting
            if (key === KEYS.SETTING_COLOR && !['red', 'yellow', 'green', 'blue'].includes(value)) {
                console.error(`Invalid color value for ${key} rejected.`);
                return false;
            }

            const stringifiedValue = JSON.stringify(value, replacer);
            window.localStorage.setItem(key, stringifiedValue);
            return true;
        } catch (error) {
            console.error(`Error setting item "${key}" in localStorage:`, error);
            return false;
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
export function getItem(key, reviver = uint8ArrayReviver) {
    return storage.getItem(key, reviver);
}

/**
 * Sets a generic item in localStorage.
 * @param {string} key - The key of the item to set.
 * @param {any} value - The value to store. It will be stringified.
 * @param {Function} [replacer] - Optional JSON replacer function.
 * @returns {boolean} True if the item was successfully set.
 */
export function setItem(key, value, replacer = uint8ArrayReplacer) {
    return storage.setItem(key, value, replacer);
}

/**
 * Removes an item from localStorage.
 * @param {string} key - The key of the item to remove.
 */
export function removeItem(key) {
    storage.removeItem(key);
}

/**
 * Clears all data from localStorage for this origin.
 */
export function clearAppStorage() {
    storage.clear();
}
