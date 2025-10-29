import React from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getNavItems = () => {
        if (isAuthenticated()) {
            return (
                <>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className={`px-3 py-2 rounded cursor-pointer ${
                            location.pathname === '/dashboard'
                                ? 'bg-indigo-600 text-white'
                                : 'text-gray-700 hover:text-indigo-600'
                        }`}
                    >
                        Dashboard
                    </button>
                    <span className="text-gray-600 px-3 py-2">
                        Welcome, {user?.name} ({user?.role})
                    </span>
                    <button
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded cursor-pointer"
                    >
                        Logout
                    </button>
                </>
            );
        } else {
            return (
                <>
                    <button
                        onClick={() => navigate('/')}
                        className={`px-3 py-2 rounded cursor-pointer ${
                            location.pathname === '/'
                                ? 'bg-indigo-600 text-white'
                                : 'text-gray-700 hover:text-indigo-600'
                        }`}
                    >
                        Home
                    </button>
                    <button
                        onClick={() => navigate('/about')}
                        className={`px-3 py-2 rounded cursor-pointer ${
                            location.pathname === '/about'
                                ? 'bg-indigo-600 text-white'
                                : 'text-gray-700 hover:text-indigo-600'
                        }`}
                    >
                        About
                    </button>
                    <button
                        onClick={() => navigate('/contact')}
                        className={`px-3 py-2 rounded cursor-pointer ${
                            location.pathname === '/contact'
                                ? 'bg-indigo-600 text-white'
                                : 'text-gray-700 hover:text-indigo-600'
                        }`}
                    >
                        Contact
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded cursor-pointer"
                    >
                        Login
                    </button>
                </>
            );
        }
    };

    return (
        <nav className="bg-white shadow-lg sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center py-4">
                    <div
                        className="text-indigo-600 font-bold text-xl cursor-pointer"
                        onClick={() => navigate(isAuthenticated() ? '/dashboard' : '/')}
                    >
                        BookRuangan
                    </div>
                    <div className="flex space-x-4 items-center">
                        {getNavItems()}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
