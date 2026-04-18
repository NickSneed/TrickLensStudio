import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import * as styles from './Modal.module.css';
import CloseButton from '../atoms/CloseButton.js';

let openModalCount = 0;

/**
 * Modal component for displaying content in an overlay.
 *
 * @param {Object} props - The component props.
 * @param {boolean} props.isOpen - Whether the modal is currently open.
 * @param {Function} props.setIsOpen - Function to update the open state.
 * @param {string} props.title - The title displayed in the modal header.
 * @param {React.ReactNode} props.children - The content to display inside the modal.
 * @param {string} [props.type] - Optional type to adjust modal size ('small', 'full').
 * @param {number} [props.zindex] - Optional z-index for the modal wrapper.
 */
const Modal = ({
    isOpen,
    setIsOpen,
    title,
    children,
    type,
    zindex = 3,
    saveScrollPosition = false
}) => {
    const scrollRef = useRef(null);

    // Adds class to body to prevent scrolling and scrolls modal to top on open
    useEffect(() => {
        if (isOpen) {
            openModalCount++;
            if (openModalCount === 1) {
                document.body.classList.add('modal-open');
            }

            if (scrollRef.current && !saveScrollPosition) {
                scrollRef.current.scrollTop = 0;
            }
        }

        return () => {
            if (isOpen) {
                openModalCount--;
                if (openModalCount === 0) {
                    document.body.classList.remove('modal-open');
                }
            }
        };
    }, [isOpen]);

    return createPortal(
        <div
            className={`
                ${styles.modalwrapper} 
                ${type === 'small' ? styles.small : ''}
                ${isOpen ? styles.open : ''}
            `}
            onClick={(e) => {
                e.stopPropagation();
                if (e.target === e.currentTarget) {
                    setIsOpen(false);
                }
            }}
            style={{ zIndex: zindex }}
        >
            <div
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
                style={{ display: 'flex', flexDirection: 'column' }}
            >
                <CloseButton
                    className={styles.close}
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(!isOpen);
                    }}
                />
                <h2>{title}</h2>
                <div
                    ref={scrollRef}
                    className={styles.modalscroll}
                >
                    <div className={styles.modalscrollinner}>{children}</div>
                </div>
            </div>
        </div>,
        document.body
    );
};

Modal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    setIsOpen: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    children: PropTypes.node,
    type: PropTypes.string,
    zindex: PropTypes.number
};

export default Modal;
