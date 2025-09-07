import PropTypes from 'prop-types';
import { useRef, useEffect } from 'react';
import { palettes, applyPalette } from 'gbcam-js';

function Photo({ data, photoIndex, paletteId }) {
    const canvasRef = useRef(null);
    const scale = 1;
    const palette = palettes[paletteId];

    // Check if within range
    if (photoIndex > 29 || photoIndex < 0) {
        return;
    }

    useEffect(() => {
        const renderImage = async () => {
            // We need to check for both `data` and the canvas `ref` to be ready.
            if (data && canvasRef.current) {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');

                // Now we can get the imageData because we have the context
                // Decode the photo to get palette indices
                const { width, height, photoData } = data.images[photoIndex];

                // Apply the color palette to the photo
                const pixels = applyPalette(photoData, palette);

                // Create a bitmap from the raw image data for efficient drawing
                const imageData = ctx.createImageData(width, height);
                imageData.data.set(pixels);
                const imageBitmap = await createImageBitmap(imageData);

                // Set canvas dimensions to 2x the original image size
                canvas.width = imageData.width * scale;
                canvas.height = imageData.height * scale;

                // Disable anti-aliasing to get crisp, hard-edge pixels
                ctx.imageSmoothingEnabled = false;

                // Draw the bitmap onto the canvas, scaling it up
                ctx.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height);
            }
        };

        renderImage();
    }, [data, photoIndex, palette]); // The effect depends on the `data` prop.

    return (
        <>
            {data?.images ? data.images[photoIndex].comment : null}
            <canvas style={{ display: 'block', float: 'left', margin: '10px', padding: 0 }} ref={canvasRef}></canvas>
        </>
    );
}

Photo.propTypes = {
    data: PropTypes.object,
    photoIndex: PropTypes.number,
    paletteId: PropTypes.string
};

export default Photo;
