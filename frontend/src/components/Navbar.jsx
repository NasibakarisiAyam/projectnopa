import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user, logout } = useAuth();
    const [open, setOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const links = [
        { to: '/', label: 'Beranda', icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2L2 7v9a1 1 0 001 1h5v-6h4v6h5a1 1 0 001-1V7l-8-5z"/></svg>
        )},
        { to: '/settings', label: 'Pengaturan', icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M11.3 1.046a1 1 0 00-2.6 0l-.2.7a7.002 7.002 0 00-1.9.9l-.6-.3a1 1 0 00-1.3.5L3 6.5a1 1 0 00.2 1.1l.6.5a7.02 7.02 0 000 1.8l-.6.5A1 1 0 003 12.5l1.7 2.5a1 1 0 001.3.5l.6-.3c.6.4 1.2.7 1.9.9l.2.7a1 1 0 002.6 0l.2-.7c.7-.2 1.3-.5 1.9-.9l.6.3a1 1 0 001.3-.5L17 12.5a1 1 0 00-.2-1.1l-.6-.5a7.02 7.02 0 000-1.8l.6-.5A1 1 0 0017 6.5L15.3 4a1 1 0 00-1.3-.5l-.6.3a7.002 7.002 0 00-1.9-.9l-.2-.7z"/></svg>
        )},
        { to: '/my-bookings', label: 'Jadwal Saya', icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M6 2a1 1 0 000 2h8a1 1 0 100-2H6zM3 6a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V6z"/></svg>
        )},
        ...(user?.role !== 'admin' ? [{ to: '/book', label: 'Pesan Ruangan', icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M6 2a1 1 0 00-1 1v1H3a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2V3a1 1 0 00-1-1H6z"/></svg>
        )}] : [])
    ];

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-3 items-center h-20">
                    {/* Left: logo + brand */}
                    <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate(isAuthenticated() ? '/dashboard' : '/')}>
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M3 11h18M5 21h14a1 1 0 001-1V8a1 1 0 00-1-1H4a1 1 0 00-1 1v12a1 1 0 001 1z" /></svg>
                        </div>
                        <div>
                            <div className="font-bold text-2xl text-gray-900">SmartBooking</div>
                        </div>
                    </div>

                    {/* Center: nav icons */}
                    <nav className="hidden md:flex justify-center space-x-6">
                        {links.map(link => {
                            const active = location.pathname === link.to || (link.to === '/' && location.pathname === '/');
                            return (
                                <button key={link.to} onClick={() => navigate(link.to)} className="flex flex-col items-center px-3 py-2 focus:outline-none">
                                    <div className={`text-sm ${active ? 'text-pink-600' : 'text-gray-700'}`}>
                                        {link.icon}
                                    </div>
                                    <span className={`mt-1 text-xs ${active ? 'text-pink-600 font-semibold' : 'text-gray-700'}`}>{link.label}</span>
                                    {active && <div className="mt-2 w-8 h-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-600"></div>}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Right: actions */}
                    <div className="flex items-center justify-end space-x-4">
                        {user?.role !== 'admin' && (
                            <button onClick={() => navigate('/book')} className="hidden lg:inline-flex items-center space-x-2 px-5 py-2 rounded-full btn-primary shadow-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M8 2a1 1 0 00-1 1v1H5a2 2 0 00-2 2v1h14V6a2 2 0 00-2-2h-2V3a1 1 0 00-1-1H8z"/></svg>
                                <span className="font-semibold">Booking Sekarang</span>
                            </button>
                        )}

                        {isAuthenticated() ? (
                            <div className="flex items-center space-x-3">
                                <div className="text-sm text-gray-700">{user?.name}</div>
                                <button onClick={handleLogout} className="text-sm text-gray-700 border rounded px-3 py-1">Keluar</button>
                            </div>
                        ) : (
                            <div>
                                <button onClick={() => navigate('/login')} className="px-3 py-1 rounded border border-pink-500 text-pink-600 hover:bg-pink-50">Masuk</button>
                            </div>
                        )}

                        <button className="md:hidden ml-2 p-2" onClick={() => setOpen(!open)} aria-label="menu">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {open && (
                <div className="md:hidden bg-white border-t">
                    <div className="px-4 py-3 space-y-2">
                        {links.map(l => (
                            <button key={l.to} onClick={() => { navigate(l.to); setOpen(false); }} className="block text-gray-700 w-full text-left">{l.label}</button>
                        ))}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;
