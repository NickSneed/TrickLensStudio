import { useState, useEffect, useRef } from 'react';
import Photo from '../components/Photo.js';
import ToolBar from '../components/ToolBar.js';
import Modal from '../components/Modal.js';
import SettingsMenu from '../components/SettingsMenu.js';
import EditModal from '../components/EditModal.js';
import { getItem, setItem, getStoredSave, getStoredFrame } from '../utils/storageUtils.js';
import MontageToolbar from '../components/MontageToolbar.js';

const Home = () => {
    const [saveData, setSaveData] = useState(() => getStoredSave());
    const [frame, setFrame] = useState(() => getStoredFrame());
    const [palette, setPalette] = useState(getItem('palette') || 'sgb2h');
    const [mainMessage, setMainMessage] = useState('Select a .sav file');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [editImages, setEditImages] = useState([]);
    const [settings, setSettings] = useState(() => {
        const initialIsReversed = getItem('isReversed');
        return {
            scaleFactor: getItem('scaleFactor') || 2,
            isShowDeleted: getItem('isShowDeleted') || false,
            color: getItem('color') || 'green',
            isReversed: initialIsReversed === null ? true : initialIsReversed,
            exportFormat: getItem('exportFormat') || 'png',
            exportQuality: Number(getItem('exportQuality')) || 0.9,
            theme: getItem('theme') || 'system'
        };
    });
    const [selectedPhotos, setSelectedPhotos] = useState([]);
    const fileInputRef = useRef(null);

    const handleSettingChange = (event) => {
        const { name, value, type, checked } = event.target;
        const newValue =
            type === 'checkbox'
                ? checked
                : name === 'scaleFactor' || name === 'exportQuality'
                  ? Number(value)
                  : value;

        setSettings((prevSettings) => ({
            ...prevSettings,
            [name]: newValue
        }));
    };

    useEffect(() => {
        setSelectedPhotos([]);
    }, [saveData]);

    useEffect(() => {
        setItem('palette', palette);
        setItem('scaleFactor', settings.scaleFactor);
        setItem('isShowDeleted', settings.isShowDeleted);
        setItem('color', settings.color);
        setItem('isReversed', settings.isReversed);
        setItem('exportFormat', settings.exportFormat);
        setItem('exportQuality', settings.exportQuality);
        setItem('theme', settings.theme);
    }, [palette, settings]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            // Use Ctrl on Windows/Linux and Meta (Cmd) on macOS
            const isModKey = event.ctrlKey || event.metaKey;

            if ((event.key === '+' || event.key === '=') && isModKey) {
                event.preventDefault(); // Prevent browser zoom in
                handleSettingChange({
                    target: { name: 'scaleFactor', value: Math.min(settings.scaleFactor + 1, 4) }
                });
            } else if (event.key === '-' && isModKey) {
                event.preventDefault(); // Prevent browser zoom out
                handleSettingChange({
                    target: { name: 'scaleFactor', value: Math.max(settings.scaleFactor - 1, 1) }
                });
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const applyTheme = () => {
            let themeToApply = settings.theme;
            if (themeToApply === 'system') {
                themeToApply = mediaQuery.matches ? 'dark' : 'light';
            }
            document.body.setAttribute('data-theme', themeToApply);
        };

        applyTheme();

        const handleSystemChange = () => {
            if (settings.theme === 'system') {
                applyTheme();
            }
        };

        mediaQuery.addEventListener('change', handleSystemChange);
        return () => mediaQuery.removeEventListener('change', handleSystemChange);
    }, [settings.theme]);

    useEffect(() => {
        if (saveData) {
            setMainMessage('');
            if (
                !(
                    saveData.images &&
                    saveData.images.some(
                        (image) => image && (!image.isDeleted || settings.isShowDeleted)
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
                const image = saveData.images[imageIndex];
                setSelectedPhotos((prev) => [...prev, image]);
            }
        } else {
            setSelectedPhotos((prev) => prev.filter((p) => p.index !== imageIndex));
        }
    };

    const isSelectionFull = selectedPhotos.length >= 4;

    const allImages = Array.from({ length: 30 }, (_, i) => {
        const image = saveData?.images[i];
        if (image && (!image.isDeleted || settings.isShowDeleted)) {
            image.index = i;
            return image;
        }
        return null;
    }).filter(Boolean);

    allImages.sort((a, b) => a.photoIndex - b.photoIndex);

    const activeImages = allImages.filter((image) => !image.isDeleted);
    const deletedImages = allImages.filter((image) => image.isDeleted);

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
                    {imagesToRender.map((image) => {
                        const isSelected = selectedPhotos.some((p) => p.index === image.index);
                        return (
                            <Photo
                                key={image.index}
                                image={image}
                                paletteId={palette}
                                frame={frame}
                                scaleFactor={settings.scaleFactor}
                                showDeletedFlag={true}
                                onClick={() => setEditImages([image])}
                                onSelect={handlePhotoSelect}
                                isSelected={isSelected}
                                isDisabled={!isSelected && isSelectionFull}
                                username={saveData.username}
                                exportFormat={settings.exportFormat}
                                exportQuality={settings.exportQuality}
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
                    editImage={editImages}
                    palette={palette}
                    frame={frame}
                    exportFormat={settings.exportFormat}
                    exportQuality={settings.exportQuality}
                    username={saveData ? saveData.username : ''}
                />
            </Modal>
            <Modal
                isOpen={isSettingsOpen}
                setIsOpen={setIsSettingsOpen}
                title="Settings"
                type="small"
            >
                <SettingsMenu
                    settings={settings}
                    onSettingChange={handleSettingChange}
                />
            </Modal>
            <MontageToolbar
                montagePhotos={selectedPhotos}
                palette={palette}
                onClick={() => setEditImages(selectedPhotos)}
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
