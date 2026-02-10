import PropTypes from 'prop-types';

const PhotoControls = ({
    onExport,
    onShare,
    onSelect,
    isSelected,
    isDisabled,
    imageIndex,
    format = 'png'
}) => {
    return (
        <div>
            {onExport ? (
                <button
                    className="button"
                    onClick={onExport}
                >
                    Export<span> as {format.toUpperCase()}</span>
                </button>
            ) : null}
            {onShare && typeof navigator !== 'undefined' && navigator.share ? (
                <button
                    className="button"
                    onClick={onShare}
                >
                    Share
                </button>
            ) : null}
            {onSelect ? (
                <label className="pixel-checkbox">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => onSelect(imageIndex, e.target.checked)}
                        disabled={isDisabled}
                    />
                    <span></span>
                </label>
            ) : null}
        </div>
    );
};

PhotoControls.propTypes = {
    onExport: PropTypes.func.isRequired,
    onShare: PropTypes.func,
    onSelect: PropTypes.func,
    isSelected: PropTypes.bool,
    isDisabled: PropTypes.bool,
    imageIndex: PropTypes.number,
    format: PropTypes.string
};

PhotoControls.defaultProps = {
    onShare: null,
    onSelect: null,
    isSelected: false,
    isDisabled: false,
    imageIndex: -1,
    format: 'png'
};

export default PhotoControls;
