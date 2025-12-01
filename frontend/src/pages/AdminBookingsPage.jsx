import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axios/axios';
import { toast } from 'react-toastify';

const AdminBookingsPage = () => {
    const navigate = useNavigate();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending'); // all, pending, approved, rejected
    const [modalState, setModalState] = useState({ isOpen: false, booking: null, action: null });
    const [receiptModal, setReceiptModal] = useState({ isOpen: false, booking: null });
    const [notes, setNotes] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchAllBookings();
    }, [filter]);

    const fetchAllBookings = async () => {
        try {
            const params = filter !== 'all' ? { status: filter } : {};
            const response = await axios.get('/booking/admin/bookings', { params });
            setBookings(response.data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (bookingId, status) => {
        setActionLoading(true);
        try {
            await axios.patch(`/booking/bookings/${bookingId}/status`, {
                status,
                notes: notes.trim() || undefined
            });

            const msg = `Booking ${status === 'approved' ? 'disetujui' : 'ditolak'} berhasil`;
            toast.success(msg);
            setModalState({ isOpen: false, booking: null, action: null });
            setNotes('');
            fetchAllBookings();
        } catch (error) {
            const errMsg = error.response?.data?.message || 'Terjadi kesalahan';
            toast.error(errMsg);
        } finally {
            setActionLoading(false);
        }
    };

    const openModal = (booking, action) => {
        setModalState({ isOpen: true, booking, action });
        setNotes(''); // Reset notes when opening modal
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

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const [message, setMessage] = useState('');

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
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
                        <h2 className="text-2xl font-bold text-gray-800">Kelola Booking</h2>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                        >
                            Kembali ke Dashboard
                        </button>
                    </div>

                    {message && (
                        <div className={`mb-4 p-4 rounded-md ${message.includes('berhasil') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                            {message}
                        </div>
                    )}

                    {/* Filter */}
                    <div className="mb-6">
                        <div className="flex space-x-2">
                            {[
                                { key: 'all', label: 'Semua' },
                                { key: 'pending', label: 'Menunggu' },
                                { key: 'approved', label: 'Disetujui' },
                                { key: 'rejected', label: 'Ditolak' }
                            ].map(({ key, label }) => (
                                <button
                                    key={key}
                                    onClick={() => setFilter(key)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                                        filter === key
                                            ? 'bg-gradient-to-br from-pink-400 to-pink-600 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Bookings List */}
                    {bookings.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">Tidak ada booking {filter !== 'all' ? filter : ''}</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {bookings.map(booking => (
                                <div key={booking._id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {booking.room.name}
                                            </h3>
                                            <p className="text-gray-600">
                                                {formatDate(booking.date)}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Oleh: {booking.user.name} ({booking.user.role}) - {booking.user.kelas}
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
                                                <span key={slot} className="bg-pink-100 text-pink-800 px-2 py-1 rounded text-sm">
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

                                    <div className="text-sm text-gray-500 mb-4">
                                        Dibuat: {new Date(booking.createdAt).toLocaleString('id-ID')}
                                        {booking.approvedAt && (
                                            <span className="ml-4">
                                                Diputuskan: {new Date(booking.approvedAt).toLocaleString('id-ID')}
                                            </span>
                                        )}
                                    </div>

                                    {/* Action Buttons for Pending Bookings */}
                                    {booking.status === 'pending' && (
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => openModal(booking, 'approve')}
                                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                                            >
                                                Setujui
                                            </button>
                                            <button
                                                onClick={() => openModal(booking, 'reject')}
                                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                                            >
                                                Tolak
                                            </button>
                                        </div>
                                    )}

                                    {/* Receipt Button for Approved Bookings */}
                                    {booking.status === 'approved' && (
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => setReceiptModal({ isOpen: true, booking })}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                                            >
                                                Lihat Struk
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal for Approval/Rejection */}
            {modalState.isOpen && modalState.booking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">
                            {modalState.action === 'approve' ? 'Setujui' : 'Tolak'} Booking
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {modalState.booking.room.name} - {formatDate(modalState.booking.date)}
                        </p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Catatan (opsional):
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Tambahkan catatan jika diperlukan..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                                rows={3}
                            />
                        </div>
                        {modalState.action === 'approve' ? (
                            <div className="flex space-x-2">
                                <button onClick={() => handleStatusUpdate(modalState.booking._id, 'approved')} disabled={actionLoading} className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-4 py-2 rounded-md font-medium">
                                    {actionLoading ? 'Memproses...' : 'Konfirmasi Setujui'}
                                </button>
                                <button onClick={() => setModalState({ isOpen: false, booking: null, action: null })} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                                    Batal
                                </button>
                            </div>
                        ) : (
                            <div className="flex space-x-2">
                                <button onClick={() => handleStatusUpdate(modalState.booking._id, 'rejected')} disabled={actionLoading} className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white px-4 py-2 rounded-md font-medium">
                                    {actionLoading ? 'Memproses...' : 'Konfirmasi Tolak'}
                                </button>
                                <button onClick={() => setModalState({ isOpen: false, booking: null, action: null })} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                                    Batal
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

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
                                    <span className="font-semibold text-gray-700">Kepentingan:</span>
                                    <span className="text-gray-900">
                                        {receiptModal.booking.purpose || 'Tidak ditentukan'}
                                    </span>
                                </div>
                                {receiptModal.booking.purposeDetails && (
                                    <div className="flex justify-between">
                                        <span className="font-semibold text-gray-700">Detail Kepentingan:</span>
                                        <span className="text-gray-900">{receiptModal.booking.purposeDetails}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="font-semibold text-gray-700">Nama Pemesan:</span>
                                    <span className="text-gray-900">{receiptModal.booking.user.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold text-gray-700">Role:</span>
                                    <span className="text-gray-900">{receiptModal.booking.user.role}</span>
                                </div>
                                {receiptModal.booking.user.kelas && (
                                    <div className="flex justify-between">
                                        <span className="font-semibold text-gray-700">Kelas:</span>
                                        <span className="text-gray-900">{receiptModal.booking.user.kelas}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="font-semibold text-gray-700">Status:</span>
                                    <span className="text-green-600 font-semibold">Disetujui</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold text-gray-700">Disetujui Pada:</span>
                                    <span className="text-gray-900">
                                        {new Date(receiptModal.booking.approvedAt).toLocaleString('id-ID')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="text-center text-sm text-gray-500 mb-6">
                            <p>Booking ID: {receiptModal.booking._id}</p>
                            <p>Dibuat: {new Date(receiptModal.booking.createdAt).toLocaleString('id-ID')}</p>
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

export default AdminBookingsPage;
