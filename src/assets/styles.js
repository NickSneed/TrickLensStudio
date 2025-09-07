export const styles = {
    // Merged styles from App.css and inline styles
    button: {
        margin: '10px',
        padding: '13px',
        cursor: 'pointer',
        border: '1px solid #ccc',
        borderRadius: '4px',
        backgroundColor: '#f0f0f0',
        fontFamily: 'sans-serif',
        fontSize: '14px',
        float: 'left'
    },
    input: {
        margin: '10px',
        padding: '10px',
        cursor: 'pointer',
        border: '1px solid #ccc',
        borderRadius: '4px',
        fontFamily: 'sans-serif',
        fontSize: '14px',
        float: 'left'
    },
    dropdownContainer: {
        display: 'grid',
        gridTemplateColumns: 'auto auto auto auto auto auto auto auto',
        margin: '10px 5px',
        padding: '5px',
        position: 'absolute',
        backgroundColor: 'rgba(0,0,0,0.9)',
        border: '1px solid #444',
        borderRadius: '4px',
        bottom: '60px',
        left: '0',
        right: '0',
        zIndex: 10 // Ensure it appears above other content
    },
    label: {
        display: 'block',
        margin: '5px',
        cursor: 'pointer',
        color: '#fff', // Text should be light on a dark background
        fontSize: '12px',
        textAlign: 'center'
    },
    radioInput: {
        display: 'none'
    },
    swatchContainer: {
        width: '100px',
        height: '24px',
        margin: '0 auto 5px auto', // Center the swatch above the text
        verticalAlign: 'middle',
        overflow: 'hidden',
        borderRadius: '2px',
        display: 'flex'
    },
    swatchColorBlock: {
        width: '25%',
        height: '100%'
    }
};
