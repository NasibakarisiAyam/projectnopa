import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../axios/axios.js';
import { toast } from 'react-toastify';

const BookPage = () => {
    const { user } = useAuth();

    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [message, setMessage] = useState('');
    const [step, setStep] = useState(1);
    const [purpose, setPurpose] = useState('');
    const [purposeDetails, setPurposeDetails] = useState('');
    const today = new Date().toISOString().split('T')[0];

    const timeSlotLabels = [
        '07:30 - 09:00',
        '09:00 - 10:30',
        '10:30 - 12:00',
        '13:00 - 14:30',
        '14:30 - 16:00',
        '16:00 - 17:30'
    ];
    const timeSlots = timeSlotLabels.map((_, i) => i);

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
        if (!selectedDate || !selectedRoom) {
            setBookings([]);
            return;
        }

        try {
            const response = await axios.get('/booking/bookings', {
                params: { date: selectedDate, roomId: selectedRoom }
            });
            setBookings(response.data || []);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            setBookings([]);
            setMessage('Gagal mengambil jadwal booking. Silakan coba lagi.');
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
            (booking.status === 'approved' || booking.status === 'pending') && booking.timeSlots.includes(slot)
        );
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setMessage('Mengirim booking...');
        if (!selectedRoom || !selectedDate || selectedTimeSlots.length === 0) {
            setMessage('Harap lengkapi semua field yang diperlukan');
            return;
        }

        if (user?.role === 'siswa' && !purpose) {
            setMessage('Tujuan penggunaan diperlukan untuk booking (wajib untuk siswa)');
            return;
        }
        if (purpose === 'lainnya' && !purposeDetails.trim()) {
            setMessage('Mohon isi detail tujuan untuk pilihan "Lainnya"');
            return;
        }

        setLoading(true);
        try {
            const initialStatus = user?.role === 'guru' ? 'approved' : 'pending';
            await axios.post('/booking/bookings', {
                roomId: selectedRoom,
                date: selectedDate,
                timeSlots: selectedTimeSlots,
                purpose: purpose || undefined,
                purposeDetails: purpose === 'lainnya' ? purposeDetails : undefined,
                status: initialStatus
            });

            const successMsg = initialStatus === 'pending'
                ? 'Booking berhasil dibuat dan menunggu persetujuan admin'
                : 'Booking berhasil dibuat dan disetujui';
            toast.success(successMsg);
            setMessage(successMsg);

            // Panggil kembali fungsi ini untuk me-refresh data ketersediaan slot
            await fetchBookingsForDate();

            // Reset form
            setSelectedRoom('');
            setSelectedDate('');
            setSelectedTimeSlots([]);
            setPurpose('');
            setPurposeDetails('');
            setStep(1);

        } catch (error) {
            const errMsg = error?.response?.data?.message || 'Terjadi kesalahan saat membuat booking';
            setMessage(errMsg);
            toast.error(errMsg);
            console.error('Booking error:', error);
        } finally {
            setLoading(false);
        }
    };

    const purposeOptions = [
        { id: 'mandiri', title: 'Belajar Mandiri', desc: 'Kegiatan belajar individu', emoji: '📚' },
        { id: 'kelompok', title: 'Kerja Kelompok', desc: 'Diskusi dan kolaborasi tim', emoji: '👥' },
        { id: 'praktikum', title: 'Praktikum', desc: 'Kegiatan laboratorium', emoji: '🔬' },
        { id: 'rapat', title: 'Rapat', desc: 'Meeting dan koordinasi', emoji: '🤝' },
        { id: 'seminar', title: 'Seminar', desc: 'Presentasi dan workshop', emoji: '🎤' },
        { id: 'lainnya', title: 'Lainnya', desc: 'Keperluan khusus lainnya', emoji: '📝' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 pb-12">
            {/* Progress Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl overflow-hidden shadow-xl">
                    <div className="px-8 py-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">Pemesanan Ruangan</h1>
                                <p className="text-blue-100">Ikuti langkah-langkah untuk menyelesaikan booking</p>
                            </div>
                        </div>

                        {/* Progress Steps */}
                        <div className="flex items-center justify-between max-w-4xl">
                            {['Pilih Ruangan', 'Pilih Tanggal', 'Pilih Waktu', 'Tujuan', 'Konfirmasi'].map((label, idx) => {
                                const n = idx + 1;
                                const active = step === n;
                                const done = step > n;
                                return (
                                    <div key={label} className="flex items-center">
                                        <div className="flex flex-col items-center">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                                                done ? 'bg-green-400 text-white' : 
                                                active ? 'bg-white text-blue-600 shadow-lg scale-110' : 
                                                'bg-blue-700/50 text-white'
                                            }`}>
                                                {done ? (
                                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                                                    </svg>
                                                ) : (
                                                    <span>{n}</span>
                                                )}
                                            </div>
                                            <div className={`mt-2 text-xs font-medium ${active ? 'text-white' : 'text-blue-200'}`}>
                                                {label}
                                            </div>
                                        </div>
                                        {idx < 4 && (
                                            <div className={`h-1 w-16 mx-2 rounded ${done ? 'bg-green-400' : 'bg-blue-700/30'}`} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-8">
                        {/* Alert Message */}
                        {message && (
                            <div className="mb-6 p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 flex items-start gap-3">
                                <i className="fas fa-info-circle text-xl mt-0.5"></i>
                                <span>{message}</span>
                            </div>
                        )}

                        {/* Step 1: Select Room */}
                        {step === 1 && (
                            <div>
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Pilih Ruangan</h2>
                                    <p className="text-gray-600">Pilih ruangan yang ingin Anda booking sesuai kebutuhan</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {rooms.map(room => {
                                        const selected = selectedRoom === room._id;
                                        return (
                                            <button
                                                key={room._id}
                                                onClick={() => setSelectedRoom(room._id)}
                                                className={`text-left p-6 rounded-xl border-2 transition-all transform hover:scale-105 ${
                                                    selected 
                                                        ? 'border-pink-500 bg-pink-50 shadow-lg' 
                                                        : 'border-gray-200 bg-white hover:border-pink-300 hover:shadow-md'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-lg text-gray-900 mb-2">{room.name}</h3>
                                                        <p className="text-sm text-gray-600">{room.description || 'Ruang dengan fasilitas lengkap'}</p>
                                                    </div>
                                                    <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl ml-4">
                                                        {room.capacity || 0}
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                                    <span className="text-sm text-gray-600">
                                                        Kapasitas: <span className="font-semibold text-gray-900">{room.capacity || '-'} orang</span>
                                                    </span>
                                                    {selected && (
                                                        <span className="px-3 py-1 bg-pink-500 text-white text-xs font-semibold rounded-full">
                                                            Terpilih
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
                                    <button
                                        onClick={() => setStep(2)}
                                        disabled={!selectedRoom}
                                        className={`px-8 py-3 rounded-lg font-semibold transition-all inline-flex items-center gap-2 ${
                                            selectedRoom
                                                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                    >
                                        <span>Lanjutkan</span>
                                        <i className="fas fa-arrow-right"></i>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Select Date */}
                        {step === 2 && (
                            <div>
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Pilih Tanggal</h2>
                                    <p className="text-gray-600">Pilih tanggal yang diinginkan untuk booking ruangan</p>
                                </div>

                                <div className="max-w-md">
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">Tanggal Booking</label>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        min={today}
                                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all text-lg"
                                    />
                                </div>

                                <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all inline-flex items-center gap-2"
                                    >
                                        <i className="fas fa-arrow-left"></i>
                                        <span>Kembali</span>
                                    </button>
                                    <button
                                        onClick={() => setStep(3)}
                                        disabled={!selectedDate}
                                        className={`px-8 py-3 rounded-lg font-semibold transition-all inline-flex items-center gap-2 ${
                                            selectedDate
                                                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                    >
                                        <span>Lanjutkan</span>
                                        <i className="fas fa-arrow-right"></i>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Select Time Slots */}
                        {step === 3 && (
                            <div>
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Pilih Waktu</h2>
                                    <p className="text-gray-600">Pilih slot waktu yang tersedia. Slot abu-abu sudah dipesan.</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {timeSlots.map(slot => {
                                        const label = timeSlotLabels[slot];
                                        const booked = isTimeSlotBooked(slot);
                                        const selected = selectedTimeSlots.includes(slot);
                                        return (
                                            <button
                                                key={slot}
                                                type="button"
                                                onClick={() => { if (!booked) handleTimeSlotToggle(slot); }}
                                                disabled={booked}
                                                className={`p-5 rounded-xl border-2 font-semibold text-center transition-all transform ${
                                                    booked
                                                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                                        : selected
                                                        ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white border-transparent shadow-lg scale-105'
                                                        : 'bg-white text-gray-700 border-gray-300 hover:border-pink-400 hover:shadow-md hover:scale-105'
                                                }`}
                                            >
                                                <i className={`fas ${booked ? 'fa-lock' : selected ? 'fa-check-circle' : 'fa-clock'} mb-2 text-lg`}></i>
                                                <div className="text-sm">{label}</div>
                                                {booked && <div className="text-xs mt-1 opacity-75">Tidak Tersedia</div>}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
                                    <button
                                        onClick={() => setStep(2)}
                                        className="px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all inline-flex items-center gap-2"
                                    >
                                        <i className="fas fa-arrow-left"></i>
                                        <span>Kembali</span>
                                    </button>
                                    <button
                                        onClick={() => setStep(4)}
                                        disabled={selectedTimeSlots.length === 0}
                                        className={`px-8 py-3 rounded-lg font-semibold transition-all inline-flex items-center gap-2 ${
                                            selectedTimeSlots.length > 0
                                                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                    >
                                        <span>Lanjutkan</span>
                                        <i className="fas fa-arrow-right"></i>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Purpose */}
                        {step === 4 && (
                            <div>
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Tujuan Penggunaan</h2>
                                    <p className="text-gray-600">Pilih tujuan penggunaan ruangan untuk keperluan administrasi</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {purposeOptions.map(option => {
                                        const selected = purpose === option.id;
                                        return (
                                            <button
                                                key={option.id}
                                                type="button"
                                                onClick={() => setPurpose(option.id)}
                                                className={`p-6 rounded-xl border-2 transition-all text-left ${
                                                    selected
                                                        ? 'border-pink-500 bg-pink-50 shadow-lg'
                                                        : 'border-gray-200 bg-white hover:border-pink-300 hover:shadow-md'
                                                }`}
                                            >
                                                <div className="text-5xl mb-4">{option.emoji}</div>
                                                <h3 className="text-lg font-bold text-gray-900 mb-2">{option.title}</h3>
                                                <p className="text-sm text-gray-600">{option.desc}</p>
                                                {selected && (
                                                    <div className="mt-4 flex items-center gap-2 text-pink-600 font-semibold text-sm">
                                                        <i className="fas fa-check-circle"></i>
                                                        <span>Terpilih</span>
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                {purpose === 'lainnya' && (
                                    <div className="mt-8 max-w-2xl">
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            Detail Tujuan <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={purposeDetails}
                                            onChange={(e) => setPurposeDetails(e.target.value)}
                                            rows={4}
                                            className="w-full border-2 border-gray-200 rounded-lg p-4 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all"
                                            placeholder="Jelaskan secara detail tujuan penggunaan ruangan..."
                                        />
                                    </div>
                                )}

                                <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
                                    <button
                                        onClick={() => setStep(3)}
                                        className="px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all inline-flex items-center gap-2"
                                    >
                                        <i className="fas fa-arrow-left"></i>
                                        <span>Kembali</span>
                                    </button>
                                    <button
                                        onClick={() => setStep(5)}
                                        disabled={!purpose || (purpose === 'lainnya' && !purposeDetails.trim())}
                                        className={`px-8 py-3 rounded-lg font-semibold transition-all inline-flex items-center gap-2 ${
                                            purpose && (purpose !== 'lainnya' || purposeDetails.trim())
                                                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                    >
                                        <span>Lanjutkan</span>
                                        <i className="fas fa-arrow-right"></i>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 5: Confirmation */}
                        {step === 5 && (
                            <div>
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Konfirmasi Booking</h2>
                                    <p className="text-gray-600">Periksa kembali detail booking Anda sebelum mengirim</p>
                                </div>

                                <div className="bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-200 rounded-2xl p-8">
                                    <div className="space-y-6">
                                        <div className="flex items-start justify-between pb-4 border-b border-pink-200">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-pink-500 flex items-center justify-center">
                                                    <i className="fas fa-door-open text-white"></i>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-600">Ruangan</div>
                                                    <div className="text-lg font-bold text-gray-900">
                                                        {rooms.find(r => r._id === selectedRoom)?.name || '-'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-start justify-between pb-4 border-b border-pink-200">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
                                                    <i className="fas fa-calendar text-white"></i>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-600">Tanggal</div>
                                                    <div className="text-lg font-bold text-gray-900">
                                                        {selectedDate ? new Intl.DateTimeFormat('id-ID', {
                                                            weekday: 'long',
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric'
                                                        }).format(new Date(selectedDate + 'T00:00:00')) : '-'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-start justify-between pb-4 border-b border-pink-200">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                                                    <i className="fas fa-clock text-white"></i>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-sm text-gray-600 mb-2">Waktu</div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {selectedTimeSlots.map(s => (
                                                            <span key={s} className="px-3 py-1 bg-white rounded-full text-sm font-semibold text-gray-700 border border-pink-300">
                                                                {timeSlotLabels[s]}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                                                    <i className="fas fa-bullseye text-white"></i>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-600">Tujuan</div>
                                                    <div className="text-lg font-bold text-gray-900">
                                                        {purposeOptions.find(p => p.id === purpose)?.title || '-'}
                                                    </div>
                                                    {purpose === 'lainnya' && purposeDetails && (
                                                        <div className="mt-2 text-sm text-gray-600 bg-white rounded-lg p-3 border border-pink-200">
                                                            {purposeDetails}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
                                    <button
                                        onClick={() => setStep(4)}
                                        className="px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all inline-flex items-center gap-2"
                                    >
                                        <i className="fas fa-arrow-left"></i>
                                        <span>Kembali</span>
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className={`px-8 py-4 rounded-lg font-bold transition-all inline-flex items-center gap-3 text-lg ${
                                            loading
                                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl'
                                        }`}
                                    >
                                        {loading ? (
                                            <>
                                                <i className="fas fa-spinner fa-spin"></i>
                                                <span>Memproses...</span>
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-check-circle"></i>
                                                <span>Konfirmasi & Pesan</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookPage;