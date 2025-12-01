import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../axios/axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import DashboardSummary from '../components/DashboardSummary';
import BookingsTable from '../components/BookingsTable';
import UserCard from '../components/UserCard';
import RoomStatus from '../components/RoomStatus';
import TrendChart from '../components/TrendChart';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [calendarDate, setCalendarDate] = useState(new Date());
    const [calendarBookings, setCalendarBookings] = useState({});
    const [loading, setLoading] = useState(false);
    const [bookingsList, setBookingsList] = useState([]);
    const [totals, setTotals] = useState({});
    const [rooms, setRooms] = useState([]);
    const [roomStatuses, setRoomStatuses] = useState([]);
    const [receiptModal, setReceiptModal] = useState({ isOpen: false, booking: null });

    useEffect(() => {
        fetchCalendarBookings();
    }, [calendarDate]);

    useEffect(() => {
        // fetch bookings and rooms on mount / when user or calendar data changes
        fetchBookingsList();
        fetchRoomsAndStatuses();
    }, [user, calendarBookings]);

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

    const fetchBookingsList = async () => {
        try {
            // admin gets all bookings, others get their own
            let response;
            if (user?.role === 'admin') {
                response = await axios.get('/booking/admin/bookings');
            } else {
                response = await axios.get('/booking/my-bookings');
            }
            setBookingsList(response.data || []);
            // compute some simple totals
            const totalThisMonth = Object.values(calendarBookings).reduce((acc, arr) => acc + (arr?.length || 0), 0);
            const pendingCount = (response.data || []).filter(b => b.status === 'pending').length;
            setTotals(prev => ({ ...prev, totalBookings: totalThisMonth, pending: pendingCount }));
        } catch (error) {
            console.error('Error fetching bookings list:', error);
        }
    };

    const fetchRoomsAndStatuses = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const [roomsRes, bookingsRes] = await Promise.all([
                axios.get('/booking/rooms'),
                axios.get('/booking/bookings', { params: { date: today } })
            ]);

            const roomsData = roomsRes.data || [];
            const bookingsToday = bookingsRes.data || [];

            // compute status per room
            const statuses = roomsData.map(r => {
                const bks = bookingsToday.filter(b => (b.room?._id || b.room) === r._id || (b.room?._id === r._id));
                if (bks.length === 0) {
                    return { room: r.name, detail: 'Kosong', isFree: true };
                }
                // build combined timeslots text
                const times = bks.flatMap(b => b.timeSlots || []);
                const timesText = times.length ? `Tersisi (${[...new Set(times)].sort().join(',')})` : 'Tersisi';
                return { room: r.name, detail: timesText, isFree: false };
            });

            setRooms(roomsData);
            setRoomStatuses(statuses);
            setTotals(prev => ({ ...prev, availableRooms: roomsData.length }));
        } catch (e) {
            console.error('Error fetching rooms/statuses', e);
        }
    };

    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const dateKey = date.toISOString().split('T')[0];
            const bookings = calendarBookings[dateKey];

                if (bookings && bookings.length > 0) {
                return (
                    <div className="flex flex-col items-center mt-1">
                        <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
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
                return 'bg-pink-50 border-pink-200';
            }
        }
        return null;
    };

    const handleStatusUpdate = async (bookingId, status) => {
        try {
            await axios.patch(`/booking/bookings/${bookingId}/status`, { status });
            // Refresh bookings list
            toast.success(`Booking telah diubah menjadi ${status}`);
            fetchBookingsList();
        } catch (error) {
            console.error('Error updating booking status:', error);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getDashboardContent = () => {
        switch (user?.role) {
            case 'admin':
                return (
                    <div className="space-y-6">
                        {/* Admin Dashboard Cards */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Admin Dasbor</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="bg-green-50 p-4 rounded-lg cursor-pointer hover:bg-green-100" onClick={() => navigate('/admin/bookings')}>
                                    <h3 className="font-semibold text-green-800">Kelola Booking</h3>
                                    <p className="text-green-600">Setujui atau tolak booking siswa</p>
                                </div>
                            </div>
                        </div>

                        {/* Recent Bookings Management */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold text-gray-800">Booking Terbaru</h3>
                                <button
                                    onClick={() => navigate('/admin/bookings')}
                                    className="text-pink-600 hover:text-pink-800 text-sm font-medium"
                                >
                                    Lihat Semua →
                                </button>
                            </div>

                            {bookingsList.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">Tidak ada booking</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {bookingsList.slice(0, 5).map(booking => (
                                        <div key={booking._id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">
                                                        {booking.room.name}
                                                    </h4>
                                                    <p className="text-sm text-gray-600">
                                                        {new Date(booking.date).toLocaleDateString('id-ID')} - {booking.user.name}
                                                    </p>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    booking.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {booking.status === 'approved' ? 'Disetujui' :
                                                     booking.status === 'pending' ? 'Menunggu' : 'Ditolak'}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex flex-wrap gap-1">
                                                    {booking.timeSlots.map(slot => (
                                                        <span key={slot} className="bg-pink-100 text-pink-800 px-2 py-1 rounded text-xs">
                                                            Jam {slot}
                                                        </span>
                                                    ))}
                                                </div>

                                                {booking.status === 'pending' && (
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleStatusUpdate(booking._id, 'approved')}
                                                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium"
                                                        >
                                                            Setujui
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(booking._id, 'rejected')}
                                                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium"
                                                        >
                                                            Tolak
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Room Status Overview */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Status Ruangan Hari Ini</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {roomStatuses.map((status, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-semibold text-gray-900">{status.room}</h4>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                status.isFree ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {status.isFree ? 'Tersedia' : 'Terisi'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">{status.detail}</p>
                                    </div>
                                ))}
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
                            <div className="bg-pink-50 p-4 rounded-lg cursor-pointer hover:bg-pink-100" onClick={() => navigate('/my-bookings')}>
                                <h3 className="font-semibold text-pink-800">Book Saya</h3>
                                <p className="text-pink-600">Lihat bookingan anda</p>
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
                        <p className="text-pink-600">Selamat datang ygy!</p>
                    </div>
                );
        }
    };

    if (user?.role === 'admin') {
        return (
            <div className="min-h-screen bg-gray-100 pt-20">
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    {getDashboardContent()}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-50 pt-20">
            {/* Hero header */}
            <div className="hero-gradient min-h-[60vh] md:min-h-[70vh] py-12 flex flex-col justify-center">
                <div className="max-w-7xl mx-auto px-6">
                            <div className="text-center text-white">
                                <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600">Selamat Datang di Dashboard Anda</h1>
                            </div>

                    {/* Summary cards overlapping */}
                    <div className="mt-8">
                        <DashboardSummary totals={totals} />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-800">Kalender Ruangan</h2>
                                <div className="flex items-center space-x-2">
                                    <button className="p-2 rounded bg-pink-50 text-pink-600">&lt;</button>
                                    <div className="text-sm text-gray-500">{calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
                                    <button className="p-2 rounded bg-pink-50 text-pink-600">&gt;</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2">
                                    {loading ? (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
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

                                    <RoomStatus statuses={roomStatuses} />

                                    {/* Trend chart for recent bookings */}
                                    <TrendChart bookings={bookingsList} />
                                </div>

                                <div className="lg:col-span-1">
                                    {/* User card and booked rooms (component) */}
                                    <UserCard user={user || { name: 'Nama User', role: 'Guru' }} bookings={bookingsList.filter(b => b.user?._id === user?._id)} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <BookingsTable bookings={bookingsList} onDelete={async (id) => {
                            try {
                                await axios.delete(`/booking/bookings/${id}`);
                                setBookingsList(prev => prev.filter(b => b._id !== id));
                            } catch (e) {
                                console.error('Delete failed', e);
                                throw e;
                            }
                        }} 
                        onViewReceipt={(booking) => setReceiptModal({ isOpen: true, booking })}
                        />
                    </div>
                </div>
            </div>

            {/* Receipt Modal */}
            {receiptModal.isOpen && receiptModal.booking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Bukti Booking Ruangan</h3>
                            <p className="text-gray-600">Sistem Booking Ruangan Sekolah</p>
                        </div>

                        <div className="border-t border-b border-gray-300 py-4 mb-6">
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="font-semibold text-gray-700">Tanggal Booking:</span>
                                    <span className="text-gray-900">{formatDate(receiptModal.booking.date)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold text-gray-700">Waktu Booking:</span>
                                    <span className="text-gray-900">
                                        Jam {receiptModal.booking.timeSlots.join(', ')}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold text-gray-700">Ruangan:</span>
                                    <span className="text-gray-900">{receiptModal.booking.room.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold text-gray-700">Nama Pemesan:</span>
                                    <span className="text-gray-900">{receiptModal.booking.user.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold text-gray-700">Status:</span>
                                    <span className="text-green-600 font-semibold">Disetujui</span>
                                </div>
                                {receiptModal.booking.approvedAt && (
                                    <div className="flex justify-between">
                                        <span className="font-semibold text-gray-700">Disetujui Pada:</span>
                                        <span className="text-gray-900">
                                            {new Date(receiptModal.booking.approvedAt).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="text-center text-sm text-gray-500 mb-6">
                            <p>Booking ID: {receiptModal.booking._id}</p>
                        </div>

                        <div className="flex space-x-2">
                            <button
                                onClick={() => window.print()}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
                            >
                                Cetak Struk
                            </button>
                            <button
                                onClick={() => setReceiptModal({ isOpen: false, booking: null })}
                                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
