import PropTypes from 'prop-types';
import { usePhotoRenderer } from '../hooks/usePhotoRenderer.js';

const PhotoThumb = ({ image, paletteId, scaleFactor = 0.2 }) => {
    const { displayCanvasRef } = usePhotoRenderer(image, null, null, paletteId, null, scaleFactor);

    // Return if there is no image
    if (!image) {
        return null;
    }

    // Return canvas
    return <canvas ref={displayCanvasRef}></canvas>;
};

PhotoThumb.propTypes = {
    image: PropTypes.object.isRequired,
    paletteId: PropTypes.string,
    scaleFactor: PropTypes.number
};

export default PhotoThumb;
