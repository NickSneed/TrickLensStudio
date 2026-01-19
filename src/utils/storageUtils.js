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
        const saved = window.localStorage.getItem('tricklens-save-data');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.images) {
                parsed.images.forEach((img) => {
                    if (img && img.photoData) {
                        // Convert Array (or legacy Object) back to Uint8Array
                        const data = Array.isArray(img.photoData)
                            ? img.photoData
                            : Object.values(img.photoData);
                        img.photoData = new Uint8Array(data);
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
            'tricklens-save-data',
            JSON.stringify(saveData, (k, v) => (v instanceof Uint8Array ? Array.from(v) : v))
        );
    } catch (e) {
        console.warn('Failed to save to localStorage', e);
    }
}

export function removeStoredSave() {
    window.localStorage.removeItem('tricklens-save-data');
}
