import React, { useState, useEffect } from 'react';
import axios from '../axios/axios';
import { toast } from 'react-toastify';
import BookingsTable from '../components/BookingsTable';

const AdminBookingsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [receiptModal, setReceiptModal] = useState({ isOpen: false, booking: null });

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/booking/admin/bookings');
            setBookings(response.data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            toast.error('Gagal memuat daftar booking.');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (bookingId, status) => {
        try {
            await axios.patch(`/booking/bookings/${bookingId}/status`, { status });
            toast.success(`Booking berhasil ${status === 'approved' ? 'disetujui' : 'ditolak'}.`);
            fetchBookings(); // Refresh daftar booking
        } catch (error) {
            console.error('Error updating booking status:', error);
            toast.error('Gagal memperbarui status booking.');
        }
    };

    // Fungsi formatDate dari Dashboard.jsx atau BookingsTable.jsx
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Kelola Semua Booking</h1>
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
                    <span className="ml-4 text-gray-600">Memuat booking...</span>
                </div>
            ) : (
                <BookingsTable
                    bookings={bookings}
                    onApprove={(id) => handleStatusUpdate(id, 'approved')}
                    onReject={(id) => handleStatusUpdate(id, 'rejected')}
                    onViewReceipt={(booking) => setReceiptModal({ isOpen: true, booking })}
                />
            )}

            {/* Receipt Modal (sama seperti di Dashboard.jsx) */}
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
                            </div>
                        </div>

                        <div className="text-center text-sm text-gray-500 mb-6">
                            <p>Booking ID: {receiptModal.booking._id}</p>
                        </div>

                        <div className="flex space-x-2">
                            <button onClick={() => window.print()} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium">Cetak</button>
                            <button onClick={() => setReceiptModal({ isOpen: false, booking: null })} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">Tutup</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBookingsPage;