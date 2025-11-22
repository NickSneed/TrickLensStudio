import { useState, useEffect, useRef } from 'react';
import Photo from '../components/Photo.js';
import ToolBar from '../components/ToolBar.js';
import Modal from '../components/Modal.js';
import SettingsMenu from '../components/SettingsMenu.js';
import EditModal from '../components/EditModal.js';
import { getItem, setItem } from '../utils/storageUtils.js';

const Home = () => {
    const [saveData, setSaveData] = useState(null);
    const [palette, setPalette] = useState(getItem('palette') || 'sgb2h');
    const [frame, setFrame] = useState(null);
    const [scaleFactor, setScaleFactor] = useState(getItem('scaleFactor') || 2);
    const [mainMessage, setMainMessage] = useState('Select a .sav file');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [editImage, setEditImage] = useState(null);
    const [isShowDeleted, setIsShowDeleted] = useState(getItem('isShowDeleted') || false);
    const [color, setColor] = useState(getItem('color') || 'green');
    const initialIsReversed = getItem('isReversed');
    const [isReversed, setIsReversed] = useState(
        initialIsReversed === null ? true : initialIsReversed
    );
    const fileInputRef = useRef(null);

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
        setItem('isReversed', isReversed);
    }, [isReversed]);

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
        } else {
            setMainMessage('Select a .sav file');
        }
    }, [saveData, isShowDeleted]);

    const handleMainMessageClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const allImages = Array.from({ length: 30 }, (_, i) => {
        const image = saveData?.images[i];
        if (image && (!image.isDeleted || isShowDeleted)) {
            image.index = i;
            return image;
        }
        return null;
    }).filter(Boolean);

    const activeImages = allImages.filter((image) => !image.isDeleted);
    const deletedImages = allImages.filter((image) => image.isDeleted);

    if (isReversed) {
        activeImages.reverse();
        deletedImages.reverse();
    }

    const imagesToRender = [...activeImages, ...deletedImages];

    return (
        <>
            {saveData ? (
                <div
                    className={`photoGrid scale${scaleFactor}`}
                    style={{
                        gridTemplateColumns:
                            'repeat(auto-fit, minmax(' + 160 * scaleFactor + 'px, 1fr))'
                    }}
                >
                    {imagesToRender.map((image) => (
                        <Photo
                            key={image.index}
                            image={image}
                            paletteId={palette}
                            frame={frame}
                            scaleFactor={scaleFactor}
                            showDeletedFlag={true}
                            onClick={() => setEditImage(image)}
                        />
                    ))}
                    <div style={{ clear: 'both' }}></div>
                </div>
            ) : null}
            {mainMessage ? (
                <div
                    className="mainMessage"
                    onClick={handleMainMessageClick}
                    style={{ cursor: 'pointer' }}
                >
                    {mainMessage}
                </div>
            ) : null}
            <Modal
                isOpen={editImage}
                setIsSettingsOpen={setEditImage}
                title="View"
                type="full"
                allowScroll={false}
            >
                <EditModal
                    editImage={editImage}
                    palette={palette}
                    frame={frame}
                />
            </Modal>
            <Modal
                isOpen={isSettingsOpen}
                setIsSettingsOpen={setIsSettingsOpen}
                title="Settings"
                type="small"
            >
                <SettingsMenu
                    isReversed={isReversed}
                    setIsReversed={setIsReversed}
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
                saveData={saveData}
                setSaveData={setSaveData}
                frame={frame}
                setFrame={setFrame}
                scaleFactor={scaleFactor}
                setScaleFactor={setScaleFactor}
                setIsSettingsOpen={setIsSettingsOpen}
                isSettingsOpen={isSettingsOpen}
                color={color}
                count={imagesToRender.length}
                ref={fileInputRef}
            />
        </>
    );
};

export default Home;
