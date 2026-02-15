import PropTypes from 'prop-types';
import { useEffect } from 'react';
import * as styles from './Modal.module.css';

/**
 * Modal component for displaying content in an overlay.
 *
 * @param {Object} props - The component props.
 * @param {boolean} props.isOpen - Whether the modal is currently open.
 * @param {Function} props.setIsOpen - Function to update the open state.
 * @param {string} props.title - The title displayed in the modal header.
 * @param {React.ReactNode} props.children - The content to display inside the modal.
 * @param {string} [props.type] - Optional type to adjust modal size ('small', 'full').
 */
const Modal = ({ isOpen, setIsOpen, title, children, type }) => {
    // Adds class to body to prevent scrolling
    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }

        return () => {
            document.body.classList.remove('modal-open');
        };
    }, [isOpen]);

    return (
        <div
            className={`${styles.modalwrapper} ${type === 'small' ? styles.small : ''} ${
                type === 'full' ? styles.full : ''
            }`}
            onClick={() => setIsOpen(false)}
            style={{ display: isOpen ? 'flex' : 'none' }}
        >
            <div
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className={`closeButton ${styles.close}`}
                    onClick={() => setIsOpen(!isOpen)}
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
    setIsOpen: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    children: PropTypes.node,
    type: PropTypes.string
};

export default Modal;
