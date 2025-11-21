import PropTypes from 'prop-types';
import * as styles from './Modal.module.css';

const Modal = ({ isOpen, setIsSettingsOpen, title, children, type, allowScroll }) => {
    return (
        <div
            className={styles.modalwrapper}
            onClick={() => setIsSettingsOpen(false)}
            style={{ display: isOpen ? 'flex' : 'none' }}
        >
            <div
                className={`${styles.modal} ${type === 'small' ? styles.small : ''} ${
                    type === 'full' ? styles.full : ''
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className={`closeButton ${styles.close}`}
                    onClick={() => setIsSettingsOpen(!isOpen)}
                >
                    x
                </button>
                <h2>{title}</h2>
                {allowScroll ? (
                    <div className={styles.modalscroll}>{children}</div>
                ) : (
                    <div className={styles.modalnoscroll}>{children}</div>
                )}
            </div>
        </div>
    );
};

Modal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    setIsSettingsOpen: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    children: PropTypes.node,
    type: PropTypes.string,
    allowScroll: PropTypes.bool
};

export default Modal;
