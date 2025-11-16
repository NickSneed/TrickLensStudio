import { useState, useEffect } from 'react';
import Photo from '../components/Photo.js';
import ToolBar from '../components/ToolBar.js';
import Modal from '../components/Modal.js';
import SettingsMenu from '../components/SettingsMenu.js';
import { getItem, setItem } from '../utils/storageUtils.js';

const Home = () => {
    const [saveData, setSaveData] = useState(null);
    const [palette, setPalette] = useState(getItem('palette') || 'sgb2h');
    const [frame, setFrame] = useState(null);
    const [scaleFactor, setScaleFactor] = useState(getItem('scaleFactor') || 2);
    const [mainMessage, setMainMessage] = useState('Select a .sav file');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isShowDeleted, setIsShowDeleted] = useState(getItem('isShowDeleted') || false);
    const [color, setColor] = useState(getItem('color') || 'green');

    useEffect(() => {
        setItem('palette', palette);
    }, [palette]);

    useEffect(() => {
        setItem('scaleFactor', scaleFactor);
    }, [scaleFactor]);

    useEffect(() => {
        setItem('isShowDeleted', isShowDeleted);
    }, [isShowDeleted]);

    useEffect(() => {
        setItem('color', color);
    }, [color]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            // Use Ctrl on Windows/Linux and Meta (Cmd) on macOS
            const isModKey = event.ctrlKey || event.metaKey;

            if ((event.key === '+' || event.key === '=') && isModKey) {
                event.preventDefault(); // Prevent browser zoom in
                setScaleFactor((prevScale) => Math.min(prevScale + 1, 4));
            } else if (event.key === '-' && isModKey) {
                event.preventDefault(); // Prevent browser zoom out
                setScaleFactor((prevScale) => Math.max(prevScale - 1, 1));
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (saveData) {
            setMainMessage('');
            if (
                !(
                    saveData.images &&
                    saveData.images.some((image) => image && (!image.isDeleted || isShowDeleted))
                )
            ) {
                setMainMessage('No images found');
            }
        }
    }, [saveData, isShowDeleted]);

    return (
        <>
            {saveData ? (
                <div
                    className="photo-grid"
                    style={{
                        gridTemplateColumns:
                            'repeat(auto-fit, minmax(' + 160 * scaleFactor + 'px, 1fr))'
                    }}
                >
                    {Array.from(
                        { length: 30 },
                        (_, i) =>
                            saveData.images[i] &&
                            (!saveData.images[i].isDeleted || isShowDeleted) && (
                                <Photo
                                    key={i}
                                    image={saveData.images[i]}
                                    paletteId={palette}
                                    frame={frame}
                                    scaleFactor={scaleFactor}
                                />
                            )
                    )}
                    <div style={{ clear: 'both' }}></div>
                </div>
            ) : null}
            {mainMessage ? <div className="main-message">{mainMessage}</div> : null}
            <div className="main-message">{mainMessage}</div>
            <Modal
                isOpen={isSettingsOpen}
                setIsSettingsOpen={setIsSettingsOpen}
                title="Settings"
                type="small"
            >
                <SettingsMenu
                    isShowDeleted={isShowDeleted}
                    setIsShowDeleted={setIsShowDeleted}
                    scaleFactor={scaleFactor}
                    setScaleFactor={setScaleFactor}
                    color={color}
                    setColor={setColor}
                />
            </Modal>
            <ToolBar
                palette={palette}
                setPalette={setPalette}
                setSaveData={setSaveData}
                frame={frame}
                setFrame={setFrame}
                scaleFactor={scaleFactor}
                setScaleFactor={setScaleFactor}
                setIsSettingsOpen={setIsSettingsOpen}
                isSettingsOpen={isSettingsOpen}
                color={color}
            />
        </>
    );
};

export default Home;
