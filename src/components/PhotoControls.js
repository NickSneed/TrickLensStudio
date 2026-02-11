import PropTypes from 'prop-types';

const PhotoControls = ({ onExport, onShare, format = 'png' }) => {
    const isIOS =
        typeof navigator !== 'undefined' &&
        (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
            (navigator.userAgent.includes('Mac') &&
                typeof document !== 'undefined' &&
                'ontouchend' in document));

    return (
        <div>
            {onExport && !isIOS ? (
                <button
                    className="button"
                    onClick={onExport}
                >
                    Export<span> as {format.toUpperCase()}</span>
                </button>
            ) : null}
            {onShare && isIOS && typeof navigator !== 'undefined' && navigator.share ? (
                <button
                    className="button"
                    onClick={onShare}
                >
                    Share
                </button>
            ) : null}
        </div>
    );
};

PhotoControls.propTypes = {
    onExport: PropTypes.func.isRequired,
    onShare: PropTypes.func,
    format: PropTypes.string
};

PhotoControls.defaultProps = {
    onShare: null,
    format: 'png'
};

export default PhotoControls;
