import { useEffect } from 'react';
import { applyEffect, createMontage } from 'tricklens-js';

/**
 * Hook to apply photo effects or create montages based on selected options.
 *
 * @param {Array} editPhoto - Array of source photos (usually one, multiple for montages).
 * @param {Object} editedPhoto - The current state of the edited photo.
 * @param {string} effect - The ID of the effect to apply (e.g., 'invert', 'dither').
 * @param {string} montageType - The type of montage to create (e.g., '2x2', 'none').
 * @param {Function} setEditedPhoto - State setter to update the processed photo.
 */
export const useEffectApplier = (editPhoto, editedPhoto, effect, montageType, setEditedPhoto) => {
    useEffect(() => {
        if (!editPhoto) {
            return;
        }

        // Check if a montage should be generated based on input photos and type
        const isMontage = editPhoto?.length > 1 && montageType !== 'none';

        // Apply effect if selected, or generate montage if conditions met
        if ((editedPhoto && effect && effect !== 'none') || isMontage) {
            let newPixels = isMontage
                ? createMontage(
                      editPhoto.map((photo) => photo.pixels),
                      montageType
                  )
                : editPhoto[0].pixels;

            // Apply the specific effect to the pixel data
            newPixels = applyEffect(newPixels, effect);
            setEditedPhoto({
                ...editPhoto[0],
                pixels: newPixels
            });
        }

        // Reset to original photo if no effect and no montage
        if (effect === 'none' && !isMontage) {
            setEditedPhoto(editPhoto[0]);
        }
    }, [effect, editPhoto, montageType, setEditedPhoto]);
};
