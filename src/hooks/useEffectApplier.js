import { useEffect } from 'react';
import { applyEffect, createMontage } from 'tricklens-js';

/**
 * Hook to apply image effects or create montages based on selected options.
 *
 * @param {Array} editImage - Array of source images (usually one, multiple for montages).
 * @param {Object} editedImage - The current state of the edited image.
 * @param {string} effect - The ID of the effect to apply (e.g., 'invert', 'dither').
 * @param {string} montageType - The type of montage to create (e.g., '2x2', 'none').
 * @param {Function} setEditedImage - State setter to update the processed image.
 */
export const useEffectApplier = (editImage, editedImage, effect, montageType, setEditedImage) => {
    useEffect(() => {
        if (!editImage) {
            return;
        }

        // Check if a montage should be generated based on input images and type
        const isMontage = editImage?.length > 1 && montageType !== 'none';

        // Apply effect if selected, or generate montage if conditions met
        if ((editedImage && effect && effect !== 'none') || isMontage) {
            let newPixels = isMontage
                ? createMontage(
                      editImage.map((photo) => photo.pixels),
                      montageType
                  )
                : editImage[0].pixels;

            // Apply the specific effect to the pixel data
            newPixels = applyEffect(newPixels, effect);
            setEditedImage({
                ...editImage[0],
                pixels: newPixels
            });
        }

        // Reset to original image if no effect and no montage
        if (effect === 'none' && !isMontage) {
            setEditedImage(editImage[0]);
        }
    }, [effect, editImage, montageType, setEditedImage]);
};
