import { useState } from 'react';
import Photo from '../components/Photo.js';
import FileLoader from '../components/FileLoader.js';

const Home = () => {
    const [fileBuffer, setFileBuffer] = useState(null);

    return (
        <>
            <FileLoader setFileBuffer={setFileBuffer} />
            <br />
            {Array.from({ length: 30 }, (_, i) => (
                <Photo key={i} data={fileBuffer} photoIndex={i + 1} paletteId={'sgb1a'} />
            ))}
        </>
    );
};

export default Home;
