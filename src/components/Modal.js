import PropTypes from 'prop-types';
import * as styles from './Modal.module.css';

const Modal = ({ isOpen, setIsSettingsOpen, title, children, type }) => {
    return (
        <div
            className={styles.modalwrapper}
            onClick={() => setIsSettingsOpen(false)}
            style={{ display: isOpen ? 'flex' : 'none' }}
        >
            <div
                className={`${styles.modal} ${type === 'small' ? styles.small : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className={`closeButton ${styles.close}`}
                    onClick={() => setIsSettingsOpen(!isOpen)}
                >
                    x
                </button>
                <h2>{title}</h2>
                <div className={styles.modalscroll}>{children}</div>
            </div>
        </div>
    );
};

Modal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    setIsSettingsOpen: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    children: PropTypes.node,
    type: PropTypes.string
};

export default Modal;
