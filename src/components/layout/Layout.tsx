import { Outlet } from 'react-router-dom';
import Header from './Header';
import { useTheme } from '../../context/ThemeContext';

const Layout = () => {
  const { darkMode } = useTheme();
  
  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'dark' : ''}`}>
      <Header />
      <main className="flex-1 p-4 md:p-6 bg-gray-50 dark:bg-hpe-blue-950">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;