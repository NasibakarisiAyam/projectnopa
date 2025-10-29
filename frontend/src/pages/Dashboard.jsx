import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../axios/axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [calendarDate, setCalendarDate] = useState(new Date());
    const [calendarBookings, setCalendarBookings] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCalendarBookings();
    }, [calendarDate]);

    const fetchCalendarBookings = async () => {
        try {
            setLoading(true);
            const month = calendarDate.getMonth() + 1;
            const year = calendarDate.getFullYear();
            const response = await axios.get('/booking/calendar', {
                params: { month, year }
            });
            setCalendarBookings(response.data);
        } catch (error) {
            console.error('Error fetching calendar bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const dateKey = date.toISOString().split('T')[0];
            const bookings = calendarBookings[dateKey];

            if (bookings && bookings.length > 0) {
                return (
                    <div className="flex flex-col items-center mt-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="text-xs text-gray-600 mt-1">
                            {bookings.length} ruangan
                        </div>
                    </div>
                );
            }
        }
        return null;
    };

    const tileClassName = ({ date, view }) => {
        if (view === 'month') {
            const dateKey = date.toISOString().split('T')[0];
            const bookings = calendarBookings[dateKey];

            if (bookings && bookings.length > 0) {
                return 'bg-blue-50 border-blue-200';
            }
        }
        return null;
    };

    const getDashboardContent = () => {
        switch (user?.role) {
            case 'admin':
                return (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Admin Dasbor</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-blue-800">Menejemen User</h3>
                                <p className="text-blue-600">Atur semua suer yang ada di sistem</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg cursor-pointer hover:bg-green-100" onClick={() => navigate('/admin/bookings')}>
                                <h3 className="font-semibold text-green-800">Kelola Booking</h3>
                                <p className="text-green-600">Setujui atau tolak booking siswa</p>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-purple-800">Pengaturan Sistem</h3>
                                <p className="text-purple-600">Atur aja lah</p>
                            </div>
                        </div>
                    </div>
                );
            case 'guru':
                return (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Dasbor guru</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-green-50 p-4 rounded-lg cursor-pointer hover:bg-green-100" onClick={() => navigate('/my-bookings')}>
                                <h3 className="font-semibold text-green-800">Book Saya</h3>
                                <p className="text-green-600">Lihat bookingan</p>
                            </div>
                            <div className="bg-yellow-50 p-4 rounded-lg cursor-pointer hover:bg-yellow-100" onClick={() => navigate('/book')}>
                                <h3 className="font-semibold text-yellow-800">Booking ruangan</h3>
                                <p className="text-yellow-600">Pesan ruangan untuk pengajaran anda</p>
                            </div>
                        </div>
                    </div>
                );
            case 'siswa':
                return (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Dasbor siswa</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg cursor-pointer hover:bg-blue-100" onClick={() => navigate('/my-bookings')}>
                                <h3 className="font-semibold text-blue-800">Book Saya</h3>
                                <p className="text-blue-600">Lihat bookingan anda</p>
                            </div>
                            <div className="bg-indigo-50 p-4 rounded-lg cursor-pointer hover:bg-indigo-100" onClick={() => navigate('/book')}>
                                <h3 className="font-semibold text-indigo-800">Booking ruangan</h3>
                                <p className="text-indigo-600">Pesan ruangan untuk pengajaran anda</p>
                            </div>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Dasbor</h2>
                        <p className="text-gray-600">Selamat datang ygy!</p>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {getDashboardContent()}

                {/* Calendar Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Kalender Booking Ruangan</h2>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-gray-600">Memuat kalender...</span>
                        </div>
                    ) : (
                        <div className="calendar-container">
                            <Calendar
                                onChange={setCalendarDate}
                                value={calendarDate}
                                tileContent={tileContent}
                                tileClassName={tileClassName}
                                className="w-full border-none"
                            />
                        </div>
                    )}
                    <div className="mt-4 text-sm text-gray-600">
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                            <span>Tanggal dengan booking ruangan</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
