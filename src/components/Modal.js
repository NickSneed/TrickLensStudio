import PropTypes from 'prop-types';
import * as styles from './Modal.module.css';

const Modal = ({ isOpen }) => {
    return (
        <>
            <div
                className={styles.modal}
                style={{ display: isOpen ? 'block' : 'none' }}
            >
                Modal content
            </div>
        </>
    );
};

Modal.propTypes = {
    isOpen: PropTypes.bool.isRequired
};

export default Modal;
