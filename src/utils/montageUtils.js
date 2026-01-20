export const getAvailableMontageTypes = (numPhotos) => {
    if (!numPhotos || numPhotos <= 0) {
        return [];
    }

    const options = ['none', 'vertical', 'horizontal', 'quadrant', 'horizontal-2/3', 'border'];

    if (numPhotos > 1) {
        options.push('horizontal-bars');
    }
    if (numPhotos > 2) {
        options.push('four-quadrant');
    }

    return options;
};
