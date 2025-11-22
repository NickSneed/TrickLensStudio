export const getFrameOffsets = (frame) => {
    if (!frame) {
        return { top: 0, bottom: 0, left: 0, right: 0 };
    }

    const isWild = frame.name.includes('wild');

    if (isWild) {
        return { top: 40, bottom: 72, left: 16, right: 16 };
    }

    // Default offsets for standard frames
    return { top: 16, bottom: 16, left: 16, right: 16 };
};
