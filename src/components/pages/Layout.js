import { Outlet } from 'react-router-dom';

/**
 * Layout component that provides a wrapper for the application routes.
 * Uses React Router's Outlet to render child routes.
 *
 * @returns {JSX.Element} The rendered layout.
 */
const Layout = () => {
    return (
        <>
            <Outlet />
        </>
    );
};

export default Layout;
