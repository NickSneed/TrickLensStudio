/**
 * Checks if the current device is running iOS or an iPadOS-like environment.
 * This is used to conditionally show the Web Share API button.
 * @returns {boolean} True if the device is determined to be iOS-like.
 */
export const isIOS = () =>
    typeof navigator !== 'undefined' &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.userAgent.includes('Mac') &&
            typeof document !== 'undefined' &&
            'ontouchend' in document));
