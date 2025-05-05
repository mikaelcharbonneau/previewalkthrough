import { Link, useLocation } from 'react-router-dom';
import { Bell, Home, Clipboard, BarChart, Settings, LogOut } from 'lucide-react';
import HPELogo from '../ui/HPELogo';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useUser } from '../../context/UserContext';

const Header = () => {
  const location = useLocation();
  const { darkMode } = useTheme();
  const { logout } = useAuth();
  const { user } = useUser();

  const navItems = [
    { path: '/', icon: <Home size={20} />, label: 'Dashboard' },
    { path: '/inspections', icon: <Clipboard size={20} />, label: 'Inspections' },
    { path: '/reports', icon: <BarChart size={20} />, label: 'Reports' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white dark:bg-hpe-blue-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center">
              <HPELogo className="h-8 w-auto" />
              <span className="ml-3 text-lg font-medium text-hpe-blue-700 dark:text-white">Walkthrough App</span>
            </Link>
            
            <nav className="hidden md:flex space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'text-hpe-green-500 bg-hpe-green-50 dark:bg-hpe-green-900 dark:bg-opacity-30'
                      : 'text-hpe-blue-500 dark:text-white hover:bg-gray-50 dark:hover:bg-hpe-blue-800'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <button
              type="button"
              className="p-2 rounded-full text-hpe-blue-500 dark:text-white hover:bg-gray-100 dark:hover:bg-hpe-blue-800"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
            </button>
            <Link
              to="/profile"
              className="p-2 rounded-full text-hpe-blue-500 dark:text-white hover:bg-gray-100 dark:hover:bg-hpe-blue-800"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </Link>
            <div className="relative">
              <Link
                to="/profile"
                className="flex items-center space-x-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-hpe-blue-800"
              >
                <div className="avatar w-8 h-8 bg-hpe-green text-white overflow-hidden">
                  {user.avatarUrl ? (
                    <img 
                      src={user.avatarUrl} 
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="flex items-center justify-center w-full h-full">
                      {user.name.charAt(0)}
                    </span>
                  )}
                </div>
                <span className="hidden md:inline-block text-sm font-medium dark:text-white">{user.name}</span>
              </Link>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-full text-hpe-blue-500 dark:text-white hover:bg-gray-100 dark:hover:bg-hpe-blue-800"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden pb-3 overflow-x-auto flex space-x-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                isActive(item.path)
                  ? 'text-hpe-green-500 bg-hpe-green-50 dark:bg-hpe-green-900 dark:bg-opacity-30'
                  : 'text-hpe-blue-500 dark:text-white hover:bg-gray-50 dark:hover:bg-hpe-blue-800'
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;