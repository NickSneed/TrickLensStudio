import { useState } from 'react';
import Photo from '../components/Photo.js';
import ToolBar from '../components/ToolBar.js';
import '../assets/styles.css';

const Home = () => {
    const [saveData, setSaveData] = useState(null);
    const [palette, setPalette] = useState('sgb2h');
    const [frame, setFrame] = useState(null);
    const [scaleFactor, setScaleFactor] = useState(1);

    return (
        <>
            <div
                style={{
                    padding: '20px'
                }}
            >
                {saveData ? (
                    <div
                        style={{
                            padding: '0 0 70px',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(' + 160 * scaleFactor + 'px, 1fr))',
                            gap: '14px'
                        }}
                    >
                        {Array.from({ length: 30 }, (_, i) => (
                            <Photo key={i} image={saveData.images[i]} paletteId={palette} frame={frame} scaleFactor={scaleFactor} />
                        ))}
                        <div style={{ clear: 'both' }}></div>
                    </div>
                ) : null}
            </div>
            <ToolBar palette={palette} setPalette={setPalette} setSaveData={setSaveData} setFrame={setFrame} setScaleFactor={setScaleFactor} />
        </>
    );
};

export default Home;
