import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import './styles/global.css';
import Layout from './pages/Layout.js';
import Home from './pages/Home.js';
import { SettingsProvider } from './context/SettingsContext.js';

export default function App() {
    return (
        <SettingsProvider>
            <HashRouter>
                <Routes>
                    <Route
                        path="/"
                        element={<Layout />}
                    >
                        <Route
                            index
                            element={<Home />}
                        />
                        <Route
                            path="*"
                            element={<Home />}
                        />
                    </Route>
                </Routes>
            </HashRouter>
        </SettingsProvider>
    );
}

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<App />);
