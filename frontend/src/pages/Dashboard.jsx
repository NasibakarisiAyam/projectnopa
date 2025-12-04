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


const BookingDetailsForDate = ({ statuses, selectedDate }) => {
const bookingsExist = statuses.some(status => status.bookedSlots && status.bookedSlots.length > 0);


return (
    <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col">
        <h2 className="text-xl font-bold text-pink-600 mb-1">Detail Booking</h2>
        <p className="text-sm text-gray-500 mb-4">{selectedDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        
        {!bookingsExist ? (
            <div className="flex-grow flex items-center justify-center">
                <p className="text-gray-500">Tidak ada ruangan yang dibooking pada tanggal ini.</p>
            </div>
        ) : (
            <div className="space-y-4 overflow-y-auto">
                {statuses.map(status => (
                    status.bookedSlots && status.bookedSlots.length > 0 && (
                        <div key={status.room}>
                            <h3 className="font-semibold text-gray-800">{status.room}</h3>
                            <ul className="mt-2 space-y-2">
                                {status.bookedSlots.map((slot, index) => (
                                    <li key={index} className="text-sm bg-pink-50 p-2 rounded-lg">
                                        <div className="flex justify-between">
                                            <div>
                                                <span className="font-medium text-gray-700">{slot.time}</span>
                                                <span className="block text-pink-700">{slot.user}</span>
                                            </div>
                                            {slot.status === 'pending' && (
                                                <span className="text-xs font-semibold bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full self-center">
                                                    Pending
                                                </span>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )
                ))}
            </div>
        )}
    </div>
);

};


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
    // Fetch data for the selected date whenever it changes
    fetchCalendarBookings();
    fetchBookingsList();
    fetchRoomsAndStatuses();
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
        const selectedDate = calendarDate.toISOString().split('T')[0];
        const [roomsRes, bookingsRes] = await Promise.all([
            axios.get('/booking/rooms'),
            axios.get('/booking/bookings', { params: { date: selectedDate } })
        ]);

        const roomsData = roomsRes.data || [];
        const bookingsToday = bookingsRes.data || [];

        // compute status per room
        const timeSlotsLabels = [
            '07:30 - 09:00',
            '09:00 - 10:30',
            '10:30 - 12:00',
            '13:00 - 14:30',
            '14:30 - 16:00',
            '16:00 - 17:30'
        ];

        const statuses = roomsData.map(r => {
            // Filter bookings for the current room
            const roomBookings = bookingsToday.filter(b => {
                const roomId = b.room?._id || b.room; // Handle both populated and unpopulated room fields
                return roomId === r._id;
            });

            if (roomBookings.length === 0) {
                return { room: r.name, detail: 'Kosong', isFree: true, bookedSlots: [] };
            }

            const bookedSlotsDetails = [];
            const uniqueBookedTimeSlotLabels = new Set();

            roomBookings.forEach(booking => {
                booking.timeSlots.forEach(slotIndex => {
                    const slotLabel = timeSlotsLabels[slotIndex];
                    if (slotLabel) {
                        uniqueBookedTimeSlotLabels.add(slotLabel);
                        bookedSlotsDetails.push({
                            time: slotLabel,
                            user: booking.user?.name || 'Seseorang',
                            status: booking.status
                        });
                    }
                });
            });

            let detailSummary = 'Kosong';
            if (uniqueBookedTimeSlotLabels.size > 0) {
                // Check if all slots are booked
                const allSlotsBooked = timeSlotsLabels.every(label => uniqueBookedTimeSlotLabels.has(label));
                if (allSlotsBooked) {
                    detailSummary = 'Penuh';
                } else {
                    const sortedLabels = Array.from(uniqueBookedTimeSlotLabels).sort();
                    const hasPending = bookedSlotsDetails.some(slot => slot.status === 'pending');
                    const statusText = hasPending ? '(Menunggu Persetujuan)' : '(Dipesan)';
                    detailSummary = `Tersisi ${sortedLabels.length} slot ${statusText}`;
                }
            }

            return {
                room: r.name,
                detail: detailSummary,
                isFree: roomBookings.length === 0,
                bookedSlots: bookedSlotsDetails
            };
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
                    {/* Admin Hero Header */}
                    <div className="py-8 bg-gradient-to-br from-gray-50 via-pink-50 to-purple-50 rounded-2xl shadow-inner border border-gray-100">
                        <div className="max-w-7xl mx-auto px-6 ">
                            <div className="text-center bg-">
                                <h1 className="text-4xl font-bold mb-2 text-pink-600">Dasbor Administrator</h1>
                                <p className="text-gray-600">Pusat kendali untuk mengelola booking, pengguna, dan jadwal ruangan.</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content: Calendar */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col w-full h-full">
                                <h2 className="text-2xl font-bold text-pink-600 mb-6 text-center">Kalender Ruangan</h2>
                                {loading ? (
                                    <div className="flex items-center justify-center flex-grow">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
                                        <span className="ml-2 text-gray-600">Memuat kalender...</span>
                                    </div>
                                ) : (
                                    <div className="w-full grid-cols-2 gap-4 place-items-center">
                                        <Calendar
                                            onChange={setCalendarDate}
                                            value={calendarDate}
                                            tileContent={tileContent}
                                            tileClassName={tileClassName}
                                            className="custom-calendar rounded-xl shadow-md calendar-shadow"
                                        />
                                    </div>
                                )}
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <BookingDetailsForDate statuses={roomStatuses} selectedDate={calendarDate} />
                                </div>
                            </div>
                        </div>

                        {/* Side Content: Admin Actions */}
                        <div className="space-y-6">
                            <div className="bg-green-50 p-4 rounded-lg cursor-pointer hover:bg-green-100 transform transition-all duration-300 hover:scale-105 hover:shadow-lg" onClick={() => navigate('/admin/bookings')}>
                                <h3 className="font-semibold text-green-800">Kelola Booking</h3>
                                <p className="text-green-600">Setujui atau tolak booking siswa</p>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-lg cursor-pointer hover:bg-blue-100 transform transition-all duration-300 hover:scale-105 hover:shadow-lg" onClick={() => navigate('/admin/users')}>
                                <h3 className="font-semibold text-blue-800">Kelola Pengguna</h3>
                                <p className="text-blue-600">Tambah, edit, atau hapus pengguna</p>
                            </div>

                            {/* Room Status Overview */}
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4">Status Hari Ini</h3>
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {roomStatuses.map((status, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-3">
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
                    </div>
                </div>
            );
        case 'guru':
        case 'siswa':
            return (
                <>
                    {/* Hero header */}
                    <div className="py-8">
                        <div className="max-w-7xl mx-auto px-6">
                            <div className="text-center mb-8">
                                <h1 className="text-4xl font-bold mb-2 text-pink-600">Selamat Datang di Dashboard Anda</h1>
                                <p className="text-gray-600">Kelola jadwal booking ruangan dengan mudah. Lihat status ruangan, atur jadwal, dan pesan ruangan hanya dalam beberapa klik.</p>
                            </div>

                            {/* Summary cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-white rounded-2xl shadow-md p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                                    <div className="flex items-center justify-center w-14 h-14 rounded-full mb-4 mx-auto bg-pink-100">
                                        <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-3xl font-bold mb-1 text-pink-600">{totals.totalBookings || 0}</h3>
                                        <p className="text-gray-600 text-sm">Booking Aktif</p>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl shadow-md p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                                    <div className="flex items-center justify-center w-14 h-14 rounded-full mb-4 mx-auto bg-pink-100">
                                        <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-3xl font-bold mb-1 text-pink-600">{totals.availableRooms || 0}</h3>
                                        <p className="text-gray-600 text-sm">Ruangan Tersedia</p>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl shadow-md p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                                    <div className="flex items-center justify-center w-14 h-14 rounded-full mb-4 mx-auto bg-pink-100">
                                        <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-3xl font-bold mb-1 text-pink-600">{totals.pending || 0}</h3>
                                        <p className="text-gray-600 text-sm">Menunggu Persetujuan</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    

                    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column - Calendar */}
                            <div className="flex">
                                <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col w-full">
                                    <h2 className="text-2xl font-bold text-pink-600 mb-6 text-center">Kalender Ruangan</h2>
                                    {loading ? (
                                        <div className="flex items-center justify-center flex-grow">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
                                            <span className="ml-2 text-gray-600">Memuat kalender...</span>
                                        </div>
                                    ) : (
                                        <div className="w-full grid-cols-2 gap-4 place-items-center rounded-xl">
                                            <Calendar
                                                onChange={setCalendarDate}
                                                value={calendarDate}
                                                tileContent={tileContent}
                                                tileClassName={tileClassName}
                                                className="custom-calendar rounded-xl shadow-md calendar-shadow"
                                            />
                                        </div>
                                    )}
                                    {/* Detail Booking dipindahkan ke sini */}
                                    <div className="mt-6 pt-6 border-t border-gray-200">
                                        <BookingDetailsForDate statuses={roomStatuses} selectedDate={calendarDate} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex">
                                <UserCard user={user} bookings={bookingsList} />
                            </div>
                            
                        </div>

                    </div>
                    {/* Room Status Overview */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6 mt-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Status Ruangan untuk {calendarDate.toLocaleDateString('id-ID', {day: 'numeric', month: 'long'})}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {roomStatuses.map((status, index) => {
                                const hasPending = status.bookedSlots?.some(s => s.status === 'pending');
                                const isBookedByUser = status.bookedSlots?.some(s => s.userId === user._id && s.status === 'approved');
                                const bookingForReceipt = bookingsList.find(b => b.room?.name === status.room && b.user?._id === user._id && b.status === 'approved' && new Date(b.date).toDateString() === calendarDate.toDateString());

                                let statusText = 'Tersedia';
                                let statusClass = 'bg-green-100 text-green-800';
                                if (hasPending) {
                                    statusText = 'Menunggu Konfirmasi';
                                    statusClass = 'bg-yellow-100 text-yellow-800';
                                } else if (!status.isFree) {
                                    statusText = 'Terisi';
                                    statusClass = 'bg-red-100 text-red-800';
                                }

                                return (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-semibold text-gray-900">{status.room}</h4>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}>
                                                    {statusText}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">{status.detail}</p>
                                        </div>
                                        {isBookedByUser && bookingForReceipt && (
                                            <button
                                                onClick={() => setReceiptModal({ isOpen: true, booking: bookingForReceipt })}
                                                className="mt-3 text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-md hover:bg-blue-200 transition-colors w-full cursor-pointer"
                                            >
                                                Cetak Struk
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
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

return (
    <div className="min-h-screen bg-pink-50 pt-6 pb-6">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {getDashboardContent()}
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
                                <span className="text-gray-900">{receiptModal.booking.room?.name || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-gray-700">Nama Pemesan:</span>
                                <span className="text-gray-900">{receiptModal.booking.user?.name || '-'}</span>
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
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transform transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer"
                        >
                            Cetak Struk
                        </button>
                        <button
                            onClick={() => setReceiptModal({ isOpen: false, booking: null })}
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transform transition-all duration-300 hover:scale-105 hover:shadow-md cursor-pointer"
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
