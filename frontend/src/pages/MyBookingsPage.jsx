import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axios/axios';
import { toast } from 'react-toastify';
import ReceiptModal from '../components/ReceiptModal'; // Impor komponen baru

const MyBookingsPage = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [receiptModal, setReceiptModal] = useState({ isOpen: false, booking: null });

    useEffect(() => {
        fetchMyBookings();
    }, []);

    const fetchMyBookings = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/booking/my-bookings');
            setBookings(response.data || []);
        } catch (error) {
            console.error('Error fetching my bookings:', error);
            toast.error('Gagal memuat data booking Anda.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (booking) => {
        if (booking.status !== 'pending') {
            toast.warn('Hanya booking yang berstatus "Menunggu" yang bisa dibatalkan.');
            return;
        }

        const bookingId = booking._id;

        if (!window.confirm('Apakah Anda yakin ingin membatalkan booking ini?')) return;

        try {
            await axios.delete(`/booking/bookings/${bookingId}`);
            toast.success('Booking berhasil dibatalkan.');
            fetchMyBookings();
        } catch (error) {
            console.error('Error deleting booking:', error);
            toast.error(error.response?.data?.message || 'Gagal membatalkan booking.');
        }
    };

    const filteredBookings = useMemo(() => {
        if (!query) return bookings;
        const q = query.toLowerCase();
        return bookings.filter(b =>
            (b.room?.name || '').toLowerCase().includes(q) ||
            (b.status || '').toLowerCase().includes(q) ||
            (b.date || '').toString().toLowerCase().includes(q)
        );
    }, [bookings, query]);

    const getStatusPill = (status) => {
        const styles = {
            approved: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            rejected: 'bg-red-100 text-red-800',
        };
        const text = {
            approved: 'Disetujui',
            pending: 'Menunggu',
            rejected: 'Ditolak',
        };
        return (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {text[status] || status}
            </span>
        );
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 pt-20">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Booking Saya</h2>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="text-pink-600 hover:text-pink-800 text-sm font-medium transition-colors"
                        >
                            &larr; Kembali ke Dashboard
                        </button>
                    </div>

                    <div className="mb-4">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Cari berdasarkan ruangan, status, atau tanggal..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                    </div>

                    <div className="space-y-4">
                        {filteredBookings.length > 0 ? (
                            filteredBookings.map(booking => (
                                <div
                                    key={booking._id}
                                    className="border border-gray-200 rounded-lg p-4 transition-shadow hover:shadow-md"
                                >
                                    <div className="flex flex-col sm:flex-row justify-between sm:items-start">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 capitalize">
                                                {booking.room?.name || 'Ruangan tidak tersedia'}
                                            </h3>
                                            <p className="text-gray-600">{formatDate(booking.date)}</p>
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {booking.timeSlots && booking.timeSlots.length > 0 ? (
                                                    booking.timeSlots.map((slot, index) => (
                                                        <span
                                                            key={`${booking._id}-${slot}-${index}`}
                                                            className="bg-pink-100 text-pink-800 px-2 py-1 rounded text-xs"
                                                        >
                                                            Jam {slot}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-500 text-xs">Tidak ada waktu</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-3 sm:mt-0 sm:text-right">
                                            {getStatusPill(booking.status)}
                                            <p className="text-xs text-gray-500 mt-1">
                                                Dibuat: {new Date(booking.createdAt).toLocaleDateString('id-ID')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="border-t my-3"></div>
                                    <div className="flex items-center justify-end space-x-2">
                                        {booking.status === 'approved' && (
                                            <button
                                                onClick={() => setReceiptModal({ isOpen: true, booking })}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
                                            >
                                                Lihat Struk
                                            </button>
                                        )}
                                        {booking.status === 'pending' && (
                                            <button
                                                onClick={() => handleDelete(booking)}
                                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
                                            >
                                                Batalkan
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <p>Tidak ada data booking yang ditemukan.</p>
                                {query && (
                                    <p className="text-sm mt-2">
                                        Coba ubah kata kunci pencarian Anda.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Receipt Modal */}
            {receiptModal.isOpen && (
                <ReceiptModal
                    booking={receiptModal.booking}
                    onClose={() => setReceiptModal({ isOpen: false, booking: null })}
                />
            )}
        </div>
    );
};

export default MyBookingsPage;