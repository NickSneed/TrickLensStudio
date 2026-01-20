import { useEffect } from 'react';
import { applyEffect, createMontage } from 'tricklens-js';

export const useEffectApplier = (
    editImage,
    editedImage,
    effect,
    montagePhotos,
    montageType,
    setEditedImage
) => {
    useEffect(() => {
        if (!editImage) {
            return;
        }

        const isMontage = montagePhotos?.length > 0 && montageType !== 'none';

        if ((editedImage && effect && effect !== 'none') || isMontage) {
            let newPhotoData = isMontage
                ? createMontage([editImage.photoData, ...montagePhotos], montageType)
                : editImage.photoData;
            newPhotoData = applyEffect(newPhotoData, effect);
            setEditedImage({
                ...editImage,
                photoData: newPhotoData
            });
        }

        if (effect === 'none' && !isMontage) {
            setEditedImage(editImage);
        }
    }, [effect, editImage, editedImage, montagePhotos, montageType, setEditedImage]);
};
