import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, LogOut } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  const isActive = (path) => location.pathname === path ? 'text-light-accent dark:text-dark-accent' : 'text-gray-600 dark:text-gray-300 hover:text-light-accent dark:hover:text-dark-accent';

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <nav className="bg-light-card dark:bg-dark-card border-b border-gray-200 dark:border-gray-700 shadow-card sticky top-0 z-40">
      <div className="container-main flex items-center justify-between h-16">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-2xl font-bold text-light-accent dark:text-dark-accent hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-light-accent to-blue-600 dark:from-dark-accent dark:to-cyan-400 rounded-lg" />
          <span>TrustChain</span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className={`font-medium transition-smooth ${isActive('/')}`}
          >
            Dashboard
          </Link>
          <Link
            to="/verify"
            className={`font-medium transition-smooth ${isActive('/verify')}`}
          >
            Verify
          </Link>
          <Link
            to="/check-trust"
            className={`font-medium transition-smooth ${isActive('/check-trust')}`}
          >
            Check Trust
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun size={20} className="text-yellow-400" />
            ) : (
              <Moon size={20} className="text-gray-600" />
            )}
          </button>

          <button
            onClick={handleLogout}
            className="hidden sm:flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden bg-light-bg dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 py-3 space-y-2">
        <Link to="/" className={`block py-2 font-medium ${isActive('/')}`}>
          Dashboard
        </Link>
        <Link to="/verify" className={`block py-2 font-medium ${isActive('/verify')}`}>
          Verify
        </Link>
        <Link to="/check-trust" className={`block py-2 font-medium ${isActive('/check-trust')}`}>
          Check Trust
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;