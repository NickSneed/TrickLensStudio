import { useState, useEffect, useRef } from 'react';
import PhotoTile from '../components/PhotoTile.js';
import ToolBar from '../components/ToolBar.js';
import Modal from '../components/Modal.js';
import SettingsMenu from '../components/SettingsMenu.js';
import EditModal from '../components/EditModal.js';
import { getItem, setItem, getStoredSave, getStoredFrame } from '../utils/storageUtils.js';
import MontageToolbar from '../components/MontageToolbar.js';
import { useSettings } from '../context/SettingsContext.js';

const Home = () => {
    const [saveData, setSaveData] = useState(() => getStoredSave());
    const [frame, setFrame] = useState(() => getStoredFrame());
    const [palette, setPalette] = useState(getItem('palette') || 'sgb2h');
    const [mainMessage, setMainMessage] = useState('Select a .sav file');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [editImages, setEditImages] = useState([]);

    // Use the global settings context
    const { settings } = useSettings();

    const [selectedPhotos, setSelectedPhotos] = useState([]);
    const fileInputRef = useRef(null);

    useEffect(() => {
        setSelectedPhotos([]);
    }, [saveData]);

    useEffect(() => {
        setItem('palette', palette);
    }, [palette]);

    useEffect(() => {
        if (saveData) {
            setMainMessage('');
            if (
                !(
                    saveData.photos &&
                    saveData.photos.some(
                        (photo) => photo && (!photo.isDeleted || settings.isShowDeleted)
                    )
                )
            ) {
                setMainMessage('No images found');
            }
        } else {
            setMainMessage('Select a .sav file');
        }
    }, [saveData, settings.isShowDeleted]);

    const handleMainMessageClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handlePhotoSelect = (imageIndex, isSelected) => {
        if (isSelected) {
            if (selectedPhotos.length < 4) {
                const photo = saveData.photos[imageIndex];
                setSelectedPhotos((prev) => [...prev, photo]);
            }
        } else {
            setSelectedPhotos((prev) => prev.filter((p) => p.index !== imageIndex));
        }
    };

    const isSelectionFull = selectedPhotos.length >= 4;

    const allImages = Array.from({ length: 30 }, (_, i) => {
        const photos = saveData?.photos[i];
        if (photos && (!photos.isDeleted || settings.isShowDeleted)) {
            photos.index = i;
            return photos;
        }
        return null;
    }).filter(Boolean);

    allImages.sort((a, b) => a.index - b.index);

    const activeImages = allImages.filter((photo) => !photo.isDeleted);
    const deletedImages = allImages.filter((photo) => photo.isDeleted);

    if (settings.isReversed) {
        activeImages.reverse();
        deletedImages.reverse();
    }

    const imagesToRender = [...activeImages, ...deletedImages];

    return (
        <>
            {saveData ? (
                <div
                    className={`photoGrid scale${settings.scaleFactor}`}
                    style={{
                        gridTemplateColumns:
                            'repeat(auto-fit, minmax(' + 160 * settings.scaleFactor + 'px, 1fr))'
                    }}
                >
                    {imagesToRender.map((photo) => {
                        const isSelected = selectedPhotos.some((p) => p.index === photo.index);
                        return (
                            <PhotoTile
                                key={photo.index}
                                image={photo}
                                paletteId={palette}
                                frame={frame}
                                isFramePadding={true}
                                scaleFactor={settings.scaleFactor}
                                showDeletedFlag={true}
                                onClick={() => setEditImages([photo])}
                                onSelect={handlePhotoSelect}
                                isSelected={isSelected}
                                isDisabled={!isSelected && isSelectionFull}
                            />
                        );
                    })}
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
                isOpen={editImages.length > 0}
                setIsOpen={setEditImages}
                title="Magic"
                type="full"
            >
                <EditModal
                    editImages={editImages}
                    palette={palette}
                    frame={frame}
                    username={saveData ? saveData.username : ''}
                />
            </Modal>
            <Modal
                isOpen={isSettingsOpen}
                setIsOpen={setIsSettingsOpen}
                title="Settings"
                type="small"
            >
                <SettingsMenu />
            </Modal>
            <MontageToolbar
                montagePhotos={selectedPhotos}
                palette={palette}
                onClick={() => setEditImages(selectedPhotos)}
                onClose={() => setSelectedPhotos([])}
            />
            <ToolBar
                palette={palette}
                setPalette={setPalette}
                saveData={saveData}
                setSaveData={setSaveData}
                frame={frame}
                setFrame={setFrame}
                setIsSettingsOpen={setIsSettingsOpen}
                isSettingsOpen={isSettingsOpen}
                color={settings.color}
                count={imagesToRender.length}
                ref={fileInputRef}
            />
        </>
    );
};

export default Home;
