import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react'; // Impor ikon

const Header = ({ title = "SmartBooking" }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                        {user && <p className="text-sm text-pink-600">Selamat datang kembali, {user.name} ({user.role})</p>}
                    </div>
                    <button onClick={handleLogout} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                        <LogOut size={16} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Header;