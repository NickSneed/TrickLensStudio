import { useEffect } from 'react';
import { applyEffect, createMontage } from 'tricklens-js';

export const useEffectApplier = (editImage, editedImage, effect, montageType, setEditedImage) => {
    useEffect(() => {
        if (!editImage) {
            return;
        }

        const isMontage = editImage?.length > 1 && montageType !== 'none';

        if ((editedImage && effect && effect !== 'none') || isMontage) {
            let newPhotoData = isMontage
                ? createMontage(
                      editImage.map((image) => image.photoData),
                      montageType
                  )
                : editImage[0].photoData;
            newPhotoData = applyEffect(newPhotoData, effect);
            setEditedImage({
                ...editImage[0],
                photoData: newPhotoData
            });
        }

        if (effect === 'none' && !isMontage) {
            setEditedImage(editImage[0]);
        }
    }, [effect, editImage, montageType, setEditedImage]);
};
