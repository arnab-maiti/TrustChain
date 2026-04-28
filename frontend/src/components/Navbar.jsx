import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Menu, X, User } from 'lucide-react';
import { useUser } from '../context/UserContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-light-card dark:bg-dark-card shadow-md border-b border-gray-200 dark:border-gray-700">
      <div className="container-main flex items-center justify-between h-16">
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 bg-gradient-to-br from-light-accent to-blue-600 dark:from-dark-accent dark:to-cyan-400 rounded-lg flex items-center justify-center">
            <span className="text-lg font-bold text-white">TC</span>
          </div>
          <span className="text-xl font-bold text-light-text dark:text-dark-text hidden sm:inline">
            TrustChain
          </span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-2 text-light-text dark:text-dark-text">
            <User size={18} />
            <div>
              <p className="text-sm font-medium">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {user?.role || 'role'}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="btn-secondary flex items-center gap-2 btn-sm"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-light-text dark:text-dark-text"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-light-card dark:bg-dark-card">
          <div className="container-main py-4 space-y-4">
            <div className="flex items-center gap-2 text-light-text dark:text-dark-text pb-4 border-b border-gray-200 dark:border-gray-700">
              <User size={18} />
              <div>
                <p className="text-sm font-medium">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user?.role || 'role'}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;