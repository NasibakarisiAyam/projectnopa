import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../axios/axios';

const BookPage = () => {
    const { user } = useAuth();

    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [message, setMessage] = useState('');

    const timeSlots = Array.from({ length: 11 }, (_, i) => i); // 0-10

    useEffect(() => {
        fetchRooms();
    }, []);

    useEffect(() => {
        if (selectedRoom && selectedDate) {
            fetchBookingsForDate();
        }
    }, [selectedRoom, selectedDate]);

    const fetchRooms = async () => {
        try {
            const response = await axios.get('/booking/rooms');
            setRooms(response.data);
        } catch (error) {
            console.error('Error fetching rooms:', error);
        }
    };

    const fetchBookingsForDate = async () => {
        try {
            const response = await axios.get('/booking/bookings', {
                params: { date: selectedDate, roomId: selectedRoom }
            });
            setBookings(response.data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        }
    };

    const handleTimeSlotToggle = (slot) => {
        setSelectedTimeSlots(prev =>
            prev.includes(slot)
                ? prev.filter(s => s !== slot)
                : [...prev, slot]
        );
    };

    const isTimeSlotBooked = (slot) => {
        return bookings.some(booking =>
            booking.status === 'approved' && booking.timeSlots.includes(slot)
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedRoom || !selectedDate || selectedTimeSlots.length === 0) {
            setMessage('Harap lengkapi semua field yang diperlukan');
            return;
        }

        if (user.role === 'siswa' && !reason.trim()) {
            setMessage('Alasan diperlukan untuk booking siswa');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('/booking/bookings', {
                roomId: selectedRoom,
                date: selectedDate,
                timeSlots: selectedTimeSlots,
                reason: user.role === 'siswa' ? reason : undefined
            });

            setMessage('Booking berhasil dibuat dan menunggu persetujuan admin');

            // Reset form
            setSelectedRoom('');
            setSelectedDate('');
            setSelectedTimeSlots([]);
            setReason('');

            // Refresh bookings
            if (selectedRoom && selectedDate) {
                fetchBookingsForDate();
            }
        } catch (error) {
            setMessage(error.response?.data?.message || 'Terjadi kesalahan saat membuat booking');
        } finally {
            setLoading(false);
        }
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Main Content */}
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Booking Ruangan</h2>
                    <p className="text-gray-600 mb-6">
                        Pilih ruangan yang ingin Anda pesan dan tentukan waktu penggunaannya.
                        Semua booking memerlukan persetujuan admin.
                        {user?.role === 'siswa' && ' Booking siswa memerlukan alasan.'}
                    </p>

                    {message && (
                        <div className={`mb-4 p-4 rounded-md ${message.includes('berhasil') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Room Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Pilih Ruangan
                            </label>
                            <select
                                value={selectedRoom}
                                onChange={(e) => setSelectedRoom(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">Pilih ruangan...</option>
                                {rooms.map(room => (
                                    <option key={room._id} value={room._id}>
                                        {room.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Date Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Pilih Tanggal
                            </label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                min={today}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        {/* Time Slots */}
                        {selectedDate && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Pilih Jam (0-10)
                                </label>
                                <div className="grid grid-cols-6 gap-2">
                                    {timeSlots.map(slot => (
                                        <button
                                            key={slot}
                                            type="button"
                                            onClick={() => handleTimeSlotToggle(slot)}
                                            disabled={isTimeSlotBooked(slot)}
                                            className={`px-3 py-2 text-sm font-medium rounded-md ${
                                                selectedTimeSlots.includes(slot)
                                                    ? 'bg-blue-600 text-white'
                                                    : isTimeSlotBooked(slot)
                                                    ? 'bg-red-300 text-red-800 cursor-not-allowed'
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                        >
                                            Jam {slot}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-sm text-gray-500 mt-2">
                                    Merah: Sudah dibooking, Biru: Dipilih, Abu-abu: Tersedia
                                </p>
                            </div>
                        )}

                        {/* Reason (for students only) */}
                        {user?.role === 'siswa' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Alasan Booking *
                                </label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Jelaskan alasan Anda membutuhkan ruangan ini..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                    required
                                />
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-md font-medium"
                        >
                            {loading ? 'Membuat Booking...' : 'Buat Booking'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BookPage;
