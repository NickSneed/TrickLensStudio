/**
 * Constants for localStorage keys used by the application.
 */
const KEYS = {
    SAVE_DATA: 'tricklens-save-data',
    FRAME_DATA: 'tricklens-frame-data',
    PALETTES: 'tricklens-saved-palettes'
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

/**
 * Gets an item from localStorage.
 * @param {string} key - The key of the item to retrieve.
 * @returns {any | null} The retrieved item, parsed from JSON, or null if not found.
 */
export function getItem(key) {
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error(`Error getting item ${key} from localStorage`, error);
        return null;
    }
}

/**
 * Sets an item in localStorage.
 * @param {string} key - The key of the item to set.
 * @param {any} value - The value to store. It will be stringified.
 */
export function setItem(key, value) {
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error setting item ${key} in localStorage`, error);
    }
}

export function getStoredSave() {
    try {
        const saved = window.localStorage.getItem(KEYS.SAVE_DATA);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.photos) {
                parsed.photos.forEach((photo) => {
                    if (typeof photo?.pixels === 'string') {
                        photo.pixels = fromBase64(photo.pixels);
                    }
                });
            }
            return parsed;
        }
        return null;
    } catch (e) {
        console.warn('Failed to load save data from localStorage', e);
        return null;
    }
}

export function setStoredSave(saveData) {
    try {
        window.localStorage.setItem(
            KEYS.SAVE_DATA,
            JSON.stringify(saveData, (k, v) => (v instanceof Uint8Array ? toBase64(v) : v))
        );
    } catch (e) {
        console.warn('Failed to save to localStorage', e);
    }
}

export function removeStoredSave() {
    window.localStorage.removeItem(KEYS.SAVE_DATA);
}

export function getStoredFrame() {
    try {
        const saved = window.localStorage.getItem(KEYS.FRAME_DATA);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (typeof parsed.data === 'string') {
                parsed.data = fromBase64(parsed.data);
            }
            return parsed;
        }
        return null;
    } catch (e) {
        console.warn('Failed to load frame data from localStorage', e);
        return null;
    }
}

export function setStoredFrame(frameData) {
    try {
        window.localStorage.setItem(
            KEYS.FRAME_DATA,
            JSON.stringify(frameData, (k, v) => (v instanceof Uint8Array ? toBase64(v) : v))
        );
    } catch (e) {
        console.warn('Failed to save frame to localStorage', e);
    }
}

export function removeStoredFrame() {
    window.localStorage.removeItem(KEYS.FRAME_DATA);
}

export function getStoredPalettes() {
    try {
        const saved = window.localStorage.getItem(KEYS.PALETTES);
        return saved ? JSON.parse(saved) : null;
    } catch (e) {
        console.error('Failed to load user palettes from localStorage', e);
        return null;
    }
}

export function setStoredPalettes(palettesData) {
    try {
        window.localStorage.setItem(KEYS.PALETTES, JSON.stringify(palettesData));
    } catch (e) {
        console.error('Failed to save user palettes to localStorage', e);
    }
}

export function removeStoredPalettes() {
    window.localStorage.removeItem(KEYS.PALETTES);
}

/**
 * Clears only the app-specific data from localStorage.
 */
export function clearAppStorage() {
    Object.values(KEYS).forEach((key) => {
        window.localStorage.removeItem(key);
    });
}
