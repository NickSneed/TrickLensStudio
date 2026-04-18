import PropTypes from 'prop-types';
import * as styles from './EditorLayout.module.css';

/**
 * A shared layout component for editor views.
 * Provides a two-column layout with a main content area and a controls sidebar.
 *
 * @param {object} props
 * @param {React.ReactNode} props.mainContent - The main content to display (e.g., canvas, photo).
 * @param {React.ReactNode} props.controlsContent - The controls for the editor.
 */
const EditorLayout = ({ mainContent, controlsContent }) => {
    return (
        <div className={styles.editWrapper}>
            <div className={styles.photo}>{mainContent}</div>
            <div className={styles.controls}>{controlsContent}</div>
        </div>
    );
};

EditorLayout.propTypes = {
    mainContent: PropTypes.node,
    controlsContent: PropTypes.node
};

export default EditorLayout;
