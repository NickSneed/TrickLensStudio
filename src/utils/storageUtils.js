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
            if (parsed.photos) {
                parsed.photos.forEach((photo) => {
                    if (photo && photo.pixels) {
                        // Convert Array (or legacy Object) back to Uint8Array
                        const data = Array.isArray(photo.pixels)
                            ? photo.pixels
                            : Object.values(photo.pixels);
                        photo.pixels = new Uint8Array(data);
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

export function getStoredFrame() {
    try {
        const saved = window.localStorage.getItem('tricklens-frame-data');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.data) {
                const data = Array.isArray(parsed.data) ? parsed.data : Object.values(parsed.data);
                parsed.data = new Uint8Array(data);
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
            'tricklens-frame-data',
            JSON.stringify(frameData, (k, v) => (v instanceof Uint8Array ? Array.from(v) : v))
        );
    } catch (e) {
        console.warn('Failed to save frame to localStorage', e);
    }
}

export function removeStoredFrame() {
    window.localStorage.removeItem('tricklens-frame-data');
}
