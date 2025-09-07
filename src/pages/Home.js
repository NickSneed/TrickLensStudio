import { useState } from 'react';
import Photo from '../components/Photo.js';
import ToolBar from '../components/ToolBar.js';

const Home = () => {
    const [fileBuffer, setFileBuffer] = useState(null);
    const [palette, setPalette] = useState('sgb2h');

    return (
        <>
            {Array.from({ length: 30 }, (_, i) => (
                <Photo key={i} data={fileBuffer} photoIndex={i} paletteId={palette} />
            ))}
            <ToolBar palette={palette} setPalette={setPalette} setFileBuffer={setFileBuffer} />
        </>
    );
};

export default Home;
