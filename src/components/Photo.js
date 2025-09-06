import PropTypes from 'prop-types';
import { useRef, useEffect } from 'react';
import palettes from '../assets/palettes.js';

/**
 * Calculates the memory address for a specific tile within the save data.
 * Each tile is 16 bytes long.
 * @param {number} base The base address for the tile data.
 * @param {number} tileId The ID of the tile.
 * @returns {number} The calculated memory address for the tile.
 */
const getTileIndex = (base, tileId) => {
    return base + 16 * tileId;
};

/**
 * Extracts pixel data for a single photo from the save file and converts it into an ImageData object.
 * It reads the 2bpp tile data and maps it to the provided color palette.
 * @param {Uint8Array} saveData The raw save data for the Game Boy Camera.
 * @param {import('canvas').CanvasRenderingContext2D} ctx The 2D rendering context, used to create ImageData.
 * @param {number} photoIndex The index of the photo to extract (0-29).
 * @param {Array<{r: number, g: number, b: number}>} palette The color palette to apply to the image.
 * @returns {ImageData} An ImageData object representing the photo.
 */
const getImgData = (saveData, ctx, photoIndex, palette) => {
    // First photo at 0x2000, 0x1000 per photo. `photoIndex` is 1-based.
    const offset = 0x2000 + (photoIndex - 1) * 0x1000;
    let x, y, i, p, X;
    const w = 128;
    const h = 112;
    const wTiles = w >> 3;
    const hTiles = h >> 3;
    const imageData = ctx.createImageData(w, h);
    let val;
    let tdata;

    for (y = 0; y < hTiles * 8; y++) {
        for (x = 0; x < wTiles; x++) {
            tdata = getTileIndex(offset + 0, (y >> 3) * 0x10 + x);

            for (i = 0; i < 8; i++) {
                p = tdata + (y & 7) * 2;

                val = 0;
                if ((saveData[p] & (0x80 >> i)) != 0) {
                    val += 1;
                }
                if ((saveData[p + 1] & (0x80 >> i)) != 0) {
                    val += 2;
                }

                X = x * 8 + i;
                imageData.data[y * w * 4 + X * 4 + 0] = palette[val]['r'];
                imageData.data[y * w * 4 + X * 4 + 1] = palette[val]['g'];
                imageData.data[y * w * 4 + X * 4 + 2] = palette[val]['b'];
                imageData.data[y * w * 4 + X * 4 + 3] = 0xff;
            }
        }
    }

    return imageData;
};

function Photo({ data, photoIndex, paletteId }) {
    const canvasRef = useRef(null);

    const palette = palettes[paletteId];

    if (photoIndex > 30 || photoIndex < 1) {
        return;
    }

    useEffect(() => {
        // We need to check for both `data` and the canvas `ref` to be ready.
        if (data && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            // Now we can get the imageData because we have the context
            const imageData = getImgData(data, ctx, photoIndex, palette);

            // Set canvas dimensions and draw the image
            canvas.width = imageData.width;
            canvas.height = imageData.height;
            ctx.putImageData(imageData, 0, 0);
        }
    }, [data]); // The effect depends on the `data` prop.

    return (
        <>
            <canvas ref={canvasRef}></canvas>
        </>
    );
}

Photo.propTypes = {
    data: PropTypes.instanceOf(Uint8Array),
    photoIndex: PropTypes.number,
    paletteId: PropTypes.string
};

export default Photo;
