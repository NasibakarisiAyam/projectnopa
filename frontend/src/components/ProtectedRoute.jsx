import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div>Memuat...</div>
            </div>
        );
    }

    // Jika tidak ada user, arahkan ke login
    // Jika ada allowedRoles, periksa apakah peran user termasuk di dalamnya
    if (!user || (allowedRoles && !allowedRoles.includes(user.role))) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;