import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../axios/axios';

const MyBookingsPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, approved, rejected

    useEffect(() => {
        fetchMyBookings();
    }, []);

    const fetchMyBookings = async () => {
        try {
            const response = await axios.get('/booking/my-bookings');
            setBookings(response.data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'approved': return 'Disetujui';
            case 'pending': return 'Menunggu';
            case 'rejected': return 'Ditolak';
            default: return status;
        }
    };

    const filteredBookings = bookings.filter(booking => {
        if (filter === 'all') return true;
        return booking.status === filter;
    });

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Memuat booking...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Main Content */}
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Booking Saya</h2>
                        <button
                            onClick={() => navigate('/book')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                        >
                            Buat Booking Baru
                        </button>
                    </div>

                    {/* Filter */}
                    <div className="mb-6">
                        <div className="flex space-x-2">
                            {[
                                { key: 'all', label: 'Semua' },
                                ...(user?.role !== 'guru' ? [{ key: 'pending', label: 'Menunggu' }] : []),
                                { key: 'approved', label: 'Disetujui' },
                                { key: 'rejected', label: 'Ditolak' }
                            ].map(({ key, label }) => (
                                <button
                                    key={key}
                                    onClick={() => setFilter(key)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                                        filter === key
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Bookings List */}
                    {filteredBookings.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">Belum ada booking</p>
                            <button
                                onClick={() => navigate('/book')}
                                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium"
                            >
                                Buat Booking Pertama
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredBookings.map(booking => (
                                <div key={booking._id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {booking.room.name}
                                            </h3>
                                            <p className="text-gray-600">
                                                {formatDate(booking.date)}
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                                            {getStatusText(booking.status)}
                                        </span>
                                    </div>

                                    <div className="mb-3">
                                        <p className="text-sm text-gray-600 mb-1">Jam yang dibooking:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {booking.timeSlots.map(slot => (
                                                <span key={slot} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                                                    Jam {slot}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {booking.reason && (
                                        <div className="mb-3">
                                            <p className="text-sm text-gray-600 mb-1">Alasan:</p>
                                            <p className="text-gray-800 bg-gray-50 p-2 rounded">{booking.reason}</p>
                                        </div>
                                    )}

                                    {booking.notes && (
                                        <div className="mb-3">
                                            <p className="text-sm text-gray-600 mb-1">Catatan Admin:</p>
                                            <p className="text-gray-800 bg-yellow-50 p-2 rounded border-l-4 border-yellow-400">
                                                {booking.notes}
                                            </p>
                                        </div>
                                    )}

                                    <div className="text-sm text-gray-500">
                                        Dibuat: {new Date(booking.createdAt).toLocaleString('id-ID')}
                                        {booking.approvedAt && (
                                            <span className="ml-4">
                                                Diputuskan: {new Date(booking.approvedAt).toLocaleString('id-ID')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyBookingsPage;
