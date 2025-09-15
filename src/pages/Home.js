import { useState, useEffect } from 'react';
import Photo from '../components/Photo.js';
import ToolBar from '../components/ToolBar.js';

const Home = () => {
    const [saveData, setSaveData] = useState(null);
    const [palette, setPalette] = useState('sgb2h');
    const [frame, setFrame] = useState(null);
    const [scaleFactor, setScaleFactor] = useState(2);
    const [mainMessage, setMainMessage] = useState('Select a .sav file');

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
            if (!(saveData.images && saveData.images.some((image) => image && !image.isDeleted))) {
                setMainMessage('No images found');
            }
        }
    }, [saveData]);

    return (
        <>
            {saveData ? (
                <div
                    className="photo-grid"
                    style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(' + 160 * scaleFactor + 'px, 1fr))' }}
                >
                    {Array.from({ length: 30 }, (_, i) => (
                        <Photo
                            key={i}
                            image={saveData.images[i]}
                            paletteId={palette}
                            frame={frame}
                            scaleFactor={scaleFactor}
                        />
                    ))}
                    <div style={{ clear: 'both' }}></div>
                </div>
            ) : null}
            {mainMessage ? <div className="main-message">{mainMessage}</div> : null}
            <div className="main-message">{mainMessage}</div>
            <ToolBar
                palette={palette}
                setPalette={setPalette}
                setSaveData={setSaveData}
                frame={frame}
                setFrame={setFrame}
                scaleFactor={scaleFactor}
                setScaleFactor={setScaleFactor}
            />
        </>
    );
};

export default Home;
