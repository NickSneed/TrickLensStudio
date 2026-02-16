import { useEffect } from 'react';
import { applyEffect, createMontage } from 'tricklens-js';

/**
 * Hook to apply photo effects or create montages based on selected options.
 *
 * @param {Array} photos - Array of source photos (usually one, multiple for montages).
 * @param {string} effect - The ID of the effect to apply (e.g., 'invert', 'dither').
 * @param {string} montageType - The type of montage to create (e.g., '2x2', 'none').
 * @param {Object} effectedPhoto - The current state of the edited photo.
 * @param {Function} setEffectedPhoto - State setter to update the processed photo.
 */
export const useEffectApplier = (photos, effect, montageType, effectedPhoto, setEffectedPhoto) => {
    useEffect(() => {
        if (!photos) {
            return;
        }

        // Check if a montage should be generated based on input photos and type
        const isMontage = photos?.length > 1 && montageType !== 'none';

        // Apply effect if selected, or generate montage if conditions met
        if ((effectedPhoto && effect && effect !== 'none') || isMontage) {
            let newPixels = isMontage
                ? createMontage(
                      photos.map((photo) => photo.pixels),
                      montageType
                  )
                : photos[0].pixels;

            // Apply the specific effect to the pixel data
            newPixels = applyEffect(newPixels, effect);
            setEffectedPhoto({
                ...photos[0],
                pixels: newPixels
            });
        }

        // Reset to original photo if no effect and no montage
        if (effect === 'none' && !isMontage) {
            setEffectedPhoto(photos[0]);
        }
    }, [effect, photos, montageType, setEffectedPhoto]);
};
