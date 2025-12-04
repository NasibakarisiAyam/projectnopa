import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Settings, Calendar, BookOpen, LogOut, Menu, X, Sparkles, User, ChevronDown, Shield } from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user, logout } = useAuth();
    const [open, setOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setProfileOpen(false);
    };

    const links = [
        { to: '/', label: 'Beranda', icon: Home },
        { to: '/settings', label: 'Pengaturan', icon: Settings },
        { to: '/my-bookings', label: 'Jadwal Saya', icon: Calendar },
        ...(user?.role !== 'admin' 
            ? [{ to: '/book', label: 'Pesan Ruangan', icon: BookOpen }] 
            : [
                { to: '/admin/bookings', label: 'Kelola Booking', icon: Shield }
              ])
    ];

    const getRoleBadge = (role) => {
        const badges = {
            admin: { label: 'Admin', color: 'from-red-500 to-pink-500' },
            guru: { label: 'Guru', color: 'from-blue-500 to-cyan-500' },
            siswa: { label: 'Siswa', color: 'from-purple-500 to-pink-500' }
        };
        return badges[role] || badges.siswa;
    };

    const roleBadge = getRoleBadge(user?.role);

    return (
        <>
            <header className="bg-white/80 backdrop-blur-xl shadow-lg sticky top-0 z-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Left: Logo + Brand */}
                        <div 
                            className="flex items-center space-x-3 cursor-pointer group" 
                            onClick={() => navigate(isAuthenticated() ? '/dashboard' : '/')}
                        >
                            <div className="relative">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg group-hover:shadow-xl transform group-hover:scale-110 transition-all duration-300">
                                    <BookOpen className="h-6 w-6" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                                    <Sparkles className="h-2.5 w-2.5 text-white" />
                                </div>
                            </div>
                            <div>
                                <div className="font-bold text-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent tracking-wider">
                                    Eroom
                                </div>
                                <div className="text-xs text-gray-500 -mt-1">Sistem Booking Ruangan</div>
                            </div>
                        </div>

                        {/* Center: Navigation Icons */}
                        <nav className="hidden md:flex items-center space-x-2">
                            {links.map(link => {
                                const active = location.pathname === link.to;
                                const Icon = link.icon;
                                return (
                                    <button 
                                        key={link.to} 
                                        onClick={() => navigate(link.to)}
                                        className={`relative flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 group ${
                                            active 
                                                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg' 
                                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 cursor-pointer'
                                        }`}
                                    >
                                        <Icon className={`h-5 w-5 ${active ? '' : 'group-hover:scale-110'} transition-transform`} />
                                        <span className="text-sm">{link.label}</span>
                                        {active && (
                                            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-lg"></div>
                                        )}
                                    </button>
                                );
                            })}
                        </nav>

                        {/* Right: Actions */}
                        <div className="flex items-center space-x-3">
                            {/* Quick Booking Button */}
                            {user?.role !== 'admin' && (
                                <button 
                                    onClick={() => navigate('/book')} 
                                    className="hidden lg:flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group cursor-pointer"
                                >
                                    <BookOpen className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                                    <span>Booking Sekarang</span>
                                </button>
                            )}

                            {/* User Profile / Login */}
                            {isAuthenticated() ? (
                                <div className="relative">
                                    <button 
                                        onClick={() => setProfileOpen(!profileOpen)}
                                        className="flex items-center space-x-3 px-4 py-2.5 rounded-xl border-2 border-gray-200 hover:border-gray-300 bg-white hover:shadow-md transition-all duration-300 group cursor-pointer"
                                    >
                                        {/* Avatar */}
                                        <div className="relative">
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                                {user?.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                        </div>
                                        
                                        {/* User Info */}
                                        <div className="hidden sm:block text-left">
                                            <div className="text-sm font-semibold text-gray-900">{user?.name}</div>
                                            <div className={`text-xs font-medium bg-gradient-to-r ${roleBadge.color} bg-clip-text text-transparent`}>
                                                {roleBadge.label}
                                            </div>
                                        </div>
                                        
                                        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${profileOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {profileOpen && (
                                        <>
                                            <div 
                                                className="fixed inset-0 z-10" 
                                                onClick={() => setProfileOpen(false)}
                                            ></div>
                                            <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-20 transform origin-top-right animate-in">
                                                {/* Profile Header */}
                                                <div className="px-4 py-3 border-b border-gray-100">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                                            {user?.name?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="text-sm font-semibold text-gray-900">{user?.name}</div>
                                                            <div className="text-xs text-gray-500">{user?.nis}</div>
                                                            <div className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${roleBadge.color} text-white`}>
                                                                {roleBadge.label}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Menu Items */}
                                                <div className="px-2 py-2">
                                                    <button
                                                        onClick={() => {
                                                            navigate('/settings');
                                                            setProfileOpen(false);
                                                        }}
                                                        className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors group cursor-pointer"
                                                    >
                                                        <User className="h-5 w-5 text-gray-400 group-hover:text-pink-500 transition-colors" />
                                                        <span className="text-sm font-medium">Profil Saya</span>
                                                    </button>
                                                    
                                                    <button
                                                        onClick={() => {
                                                            navigate('/settings');
                                                            setProfileOpen(false);
                                                        }}
                                                        className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors group cursor-pointer"
                                                    >
                                                        <Settings className="h-5 w-5 text-gray-400 group-hover:text-pink-500 transition-colors" />
                                                        <span className="text-sm font-medium">Pengaturan</span>
                                                    </button>
                                                </div>

                                                {/* Logout */}
                                                <div className="px-2 py-2 border-t border-gray-100">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors group cursor-pointer"
                                                    >
                                                        <LogOut className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                                        <span className="text-sm font-medium">Keluar</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <button 
                                    onClick={() => navigate('/login')} 
                                    className="px-5 py-2.5 rounded-xl border-2 border-pink-500 text-pink-600 font-semibold hover:bg-pink-50 hover:shadow-md transform hover:scale-105 transition-all duration-300 cursor-pointer"
                                >
                                    Masuk
                                </button>
                            )}

                            {/* Mobile Menu Button */}
                            <button 
                                className="md:hidden p-2.5 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer" 
                                onClick={() => setOpen(!open)} 
                                aria-label="menu"
                            >
                                {open ? (
                                    <X className="h-6 w-6 text-gray-700" />
                                ) : (
                                    <Menu className="h-6 w-6 text-gray-700" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {open && (
                <>
                    <div 
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden" 
                        onClick={() => setOpen(false)}
                    ></div>
                    
                    <div className="fixed top-20 left-0 right-0 bg-white shadow-2xl z-40 md:hidden border-t border-gray-100 rounded-b-3xl mx-4 overflow-hidden animate-in">
                        <div className="px-4 py-4 space-y-1 max-h-[calc(100vh-6rem)] overflow-y-auto">
                            {links.map(link => {
                                const active = location.pathname === link.to;
                                const Icon = link.icon;
                                return (
                                    <button 
                                        key={link.to} 
                                        onClick={() => { 
                                            navigate(link.to); 
                                            setOpen(false); 
                                        }} 
                                        className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-300 cursor-pointer ${
                                            active 
                                                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg' 
                                                : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <Icon className="h-5 w-5" />
                                        <span>{link.label}</span>
                                        {active && (
                                            <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                                        )}
                                    </button>
                                );
                            })}
                            
                            {/* Mobile Quick Booking */}
                            {user?.role !== 'admin' && (
                                <button 
                                    onClick={() => { 
                                        navigate('/book'); 
                                        setOpen(false); 
                                    }} 
                                    className="w-full flex items-center justify-center space-x-2 px-4 py-3.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold shadow-lg mt-3 cursor-pointer"
                                >
                                    <BookOpen className="h-5 w-5" />
                                    <span>Booking Sekarang</span>
                                </button>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Add animation styles */}
            <style>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-in {
                    animation: slideIn 0.2s ease-out;
                }
            `}</style>
        </>
    );
};

export default Navbar;