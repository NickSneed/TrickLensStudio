import PropTypes from 'prop-types';
import * as styles from './MainButton.module.css';

/**
 * A reusable button component that renders content nested between its tags.
 *
 * @param {Object} props - The component props.
 * @param {Function} props.onClick - The function to call when the button is clicked.
 * @param {boolean} props.rightPadding - Whether to apply extra padding to the right.
 * @param {React.ReactNode} props.children - The content to be wrapped by the button element.
 */
const MainButton = ({ onClick, children, rightPadding }) => {
    return (
        <button
            className={`${styles.mainButton} ${rightPadding ? styles.rightPadding : ''}`}
            onClick={onClick}
        >
            {children}
        </button>
    );
};

MainButton.propTypes = {
    onClick: PropTypes.func,
    children: PropTypes.node,
    rightPadding: PropTypes.bool
};

export default MainButton;
