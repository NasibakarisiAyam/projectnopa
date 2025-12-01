import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../axios/axios';

const BookPage = () => {
    const { user } = useAuth();

    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [message, setMessage] = useState('');

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
        // don't call backend with missing params (prevents 500 when date is empty)
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
        // treat approved and pending bookings as unavailable
        return bookings.some(booking =>
            (booking.status === 'approved' || booking.status === 'pending') && booking.timeSlots.includes(slot)
        );
    };

    const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
        console.log('handleSubmit called', { selectedRoom, selectedDate, selectedTimeSlots, purpose, purposeDetails, user });
        setMessage('Mengirim booking...');
        if (!selectedRoom || !selectedDate || selectedTimeSlots.length === 0) {
            setMessage('Harap lengkapi semua field yang diperlukan');
            return;
        }

        // require purpose for siswa users; if 'lainnya' require details
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
            const initialStatus = user?.role === 'siswa' ? 'pending' : 'approved';
            await axios.post('/booking/bookings', {
                roomId: selectedRoom,
                date: selectedDate,
                timeSlots: selectedTimeSlots,
                // reason replaced by purpose/purposeDetails
                purpose: purpose || undefined,
                purposeDetails: purpose === 'lainnya' ? purposeDetails : undefined,
                status: initialStatus
            });

            const successMsg = initialStatus === 'pending'
                ? 'Booking berhasil dibuat dan menunggu persetujuan admin'
                : 'Booking berhasil dibuat dan disetujui';
            setMessage(successMsg);
            try { (await import('react-toastify')).toast.success(successMsg); } catch (e) { /* fallback */ }
            // visible confirmation for users
            try {
                window.alert(successMsg);
            } catch (e) {
                console.log('Alert blocked or unavailable');
            }

            // Reset form
            setSelectedRoom('');
            setSelectedDate('');
            setSelectedTimeSlots([]);
            setPurpose('');
            setPurposeDetails('');

            // Refresh bookings
            if (selectedRoom && selectedDate) {
                fetchBookingsForDate();
            }
        } catch (error) {
            const errMsg = error?.response?.data?.message || error?.message || 'Terjadi kesalahan saat membuat booking';
            setMessage(errMsg);
            try { window.alert('Gagal membuat booking: ' + errMsg); } catch (e) { /* ignore */ }
            console.error('Booking error:', error);
        } finally {
            setLoading(false);
        }
    };

    const today = new Date().toISOString().split('T')[0];
    const [step, setStep] = useState(1);
    const [purpose, setPurpose] = useState('');
    const [purposeDetails, setPurposeDetails] = useState('');

    const purposeOptions = [
        { id: 'mandiri', title: 'Belajar Mandiri', desc: 'Kegiatan belajar individu', emoji: '📚' },
        { id: 'kelompok', title: 'Kerja Kelompok', desc: 'Diskusi dan kolaborasi tim', emoji: '👥' },
        { id: 'praktikum', title: 'Praktikum', desc: 'Kegiatan laboratorium', emoji: '🔬' },
        { id: 'rapat', title: 'Rapat', desc: 'Meeting dan koordinasi', emoji: '🤝' },
        { id: 'seminar', title: 'Seminar', desc: 'Presentasi dan workshop', emoji: '🎤' },
        { id: 'lainnya', title: 'Lainnya', desc: 'Keperluan khusus lainnya', emoji: '📝' }
    ];

    return (
        <div className="min-h-screen bg-gray-100 pb-12">
            {/* Progress Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-t-xl overflow-hidden mt-6 shadow-md">
                    <div className="px-6 py-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="text-lg font-semibold">Pemesanan Ruangan</div>
                                <div className="text-sm opacity-90">Pilih ruangan untuk memulai proses pemesanan</div>
                            </div>
                        </div>
                        {/* Steps */}
                        <div className="mt-6">
                            <div className="flex items-center space-x-4">
                                {['Pilih Ruangan','Pilih Tanggal','Pilih Waktu','Tujuan','Konfirmasi'].map((label, idx) => {
                                    const n = idx+1;
                                    const active = step === n;
                                    const done = step > n;
                                    return (
                                        <div key={label} className="flex items-center">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${done ? 'bg-green-400' : active ? 'bg-white text-blue-900' : 'bg-blue-800 text-white'}`}>
                                                {done ? (
                                                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                                                ) : (
                                                    <span className={`${active ? 'font-semibold' : 'text-sm'}`}>{n}</span>
                                                )}
                                            </div>
                                            <div className="ml-3 text-sm text-white opacity-90">{label}</div>
                                            {idx < 4 && <div className="mx-4 h-0.5 bg-white/30 w-16" />}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main card */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    {message && (
                        <div className="mb-4 rounded-md p-3 text-sm text-gray-800 bg-yellow-50 border border-yellow-100">{message}</div>
                    )}
                    {step === 1 && (
                        <>
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Pilih Ruangan yang Tersedia</h3>
                            <p className="text-sm text-gray-500 mb-6">Silakan pilih ruangan yang ingin Anda booking sesuai dengan kebutuhan.</p>

                            {/* Rooms grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {rooms.map(room => {
                                    const selected = selectedRoom === room._id;
                                    return (
                                        <button key={room._id} onClick={() => setSelectedRoom(room._id)} className={`text-left bg-white rounded-lg p-4 border ${selected ? 'border-pink-500 shadow-lg' : 'border-gray-100'} hover:shadow-md`}> 
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="text-sm font-bold text-pink-600">{room.name}</div>
                                                    <div className="text-xs text-gray-500 mt-2">{room.description || 'Ruang kelas dengan fasilitas lengkap untuk kegiatan belajar mengajar.'}</div>
                                                </div>
                                                <div className="ml-4 flex-shrink-0">
                                                    <div className="w-10 h-10 rounded-md bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-semibold">{room.capacity || 0}</div>
                                                </div>
                                            </div>

                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {(room.facilities || []).slice(0,3).map(f => (
                                                    <span key={f} className="text-xs px-2 py-1 bg-pink-50 text-pink-600 rounded-full border border-pink-100">{f}</span>
                                                ))}
                                            </div>

                                            <div className="mt-4 flex items-center justify-between">
                                                <div className="text-xs text-gray-500">Kapasitas: <span className="font-semibold text-gray-800">{room.capacity || '-'}</span></div>
                                                <div className="text-sm">
                                                    {selected ? <span className="px-3 py-1 bg-pink-500 text-white rounded-full">Terpilih</span> : <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-gray-700">Pilih</span>}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mt-6">
                                <div className="bg-green-50 border border-green-100 text-green-800 px-4 py-3 rounded">Pilih ruangan untuk melanjutkan ke langkah berikutnya</div>
                            </div>

                            {/* Bottom actions */}
                            <div className="mt-6 flex items-center justify-between">
                                <button onClick={() => { /* back to previous if any */ }} className="px-4 py-2 rounded border text-gray-700">&lt; Kembali</button>
                                <button onClick={() => setStep(2)} disabled={!selectedRoom} className={`px-4 py-2 rounded text-white ${selectedRoom ? 'bg-pink-500 hover:bg-pink-600' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}>Lanjutkan</button>
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-gradient-to-br from-pink-400 to-purple-500 text-white shadow-dashboard">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 00-1-1H6zM7 7h6v2H7V7z"/></svg>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">Pilih Tanggal Booking</h3>
                                    <p className="text-sm text-gray-500 mt-2">Pilih tanggal yang diinginkan untuk booking ruangan.</p>
                                </div>
                            </div>

                                        <div className="mt-6">
                                            <input type="date" value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); }} min={today} className="w-full md:w-1/2 px-4 py-4 rounded-lg border border-gray-200 shadow-sm" />
                                        </div>

                            <div className="mt-6">
                                <div className="bg-green-50 border border-green-100 text-green-800 px-4 py-3 rounded flex items-center gap-3"> 
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11H9v5l4 2 .5-.866L11 11V7z" clipRule="evenodd"/></svg>
                                    <div className="text-sm">Pilih tanggal untuk langsung melanjutkan ke langkah berikutnya</div>
                                </div>
                            </div>

                            <div className="mt-8 border-t pt-6 flex items-center justify-between">
                                <button onClick={() => setStep(1)} className="px-4 py-2 rounded border text-gray-700">&lt; Kembali</button>
                                <button onClick={() => setStep(3)} disabled={!selectedDate} className={`px-4 py-2 rounded text-white ${selectedDate ? 'bg-gradient-to-br from-pink-400 to-pink-600 hover:from-pink-500' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}>Lanjutkan</button>
                            </div>
                        </>
                    )}

                    {step === 3 && (
                        <>
                            <div className="mt-6">
                                <h3 className="text-xl font-semibold mb-4">Pilih Jam</h3>
                                <p className="text-sm text-gray-500 mb-4">Pilih jam yang tersedia untuk ruangan yang dipilih.</p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
                                                className={`w-full px-6 py-6 text-center rounded-lg border transition ${booked ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed' : selected ? 'bg-gradient-to-br from-pink-400 to-purple-500 text-white shadow-lg border-transparent' : 'bg-white text-gray-700 border-gray-200 hover:shadow-sm'}`}
                                            >
                                                <div className="font-semibold">{label}</div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="mt-6">
                                <div className="bg-green-50 border border-green-100 text-green-800 px-4 py-3 rounded text-center">Pilih waktu untuk langsung melanjutkan ke langkah berikutnya</div>
                            </div>

                            <div className="mt-8 border-t pt-6 flex items-center justify-between">
                                <button onClick={() => setStep(2)} className="px-4 py-2 rounded border text-gray-700">&lt; Kembali</button>
                                <button onClick={() => setStep(4)} disabled={selectedTimeSlots.length === 0} className={`px-4 py-2 rounded text-white ${selectedTimeSlots.length > 0 ? 'bg-gradient-to-br from-pink-400 to-pink-600' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}>Lanjutkan</button>
                            </div>
                        </>
                    )}

                    {step === 4 && (
                        <>
                            <div className="mt-6">
                                <h3 className="text-2xl font-bold mb-2">Tujuan Penggunaan</h3>
                                <p className="text-sm text-gray-500 mb-6">Pilih tujuan penggunaan ruangan untuk keperluan administrasi.</p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                                    {purposeOptions.map(option => {
                                        const selected = purpose === option.id;
                                        return (
                                            <button
                                                key={option.id}
                                                type="button"
                                                onClick={() => setPurpose(option.id)}
                                                className={`text-left p-6 rounded-xl border transition flex flex-col items-start gap-3 ${selected ? 'ring-2 ring-pink-200 bg-pink-50 shadow-lg border-pink-100' : 'bg-white border-gray-100 hover:shadow-sm'}`}
                                            >
                                                <div className="text-4xl">{option.emoji}</div>
                                                <div className="mt-2">
                                                    <div className="text-lg font-semibold text-gray-900">{option.title}</div>
                                                    <div className="text-sm text-gray-500 mt-1">{option.desc}</div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                {purpose === 'lainnya' && (
                                    <div className="mt-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Detail Tujuan</label>
                                        <textarea value={purposeDetails} onChange={(e) => setPurposeDetails(e.target.value)} rows={3} className="w-full border border-gray-200 rounded-lg p-3" placeholder="Jelaskan tujuan penggunaan ruangan (mis. syarat khusus atau kebutuhan peralatan)"></textarea>
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 border-t pt-6 flex items-center justify-between">
                                <button onClick={() => setStep(3)} className="px-4 py-2 rounded border text-gray-700">&lt; Kembali</button>
                                <button onClick={() => setStep(5)} disabled={!purpose} className={`px-4 py-2 rounded text-white ${purpose ? 'bg-gradient-to-br from-pink-400 to-pink-600' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}>Lanjutkan</button>
                            </div>
                        </>
                    )}

                    {step === 5 && (
                        <>
                            <div className="mt-6 bg-pink-50 border border-pink-100 rounded-xl p-6">
                                <h3 className="text-2xl font-bold mb-4">Ringkasan Booking</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <div className="text-xs text-gray-500">RUANGAN</div>
                                        <div className="mt-2 font-bold text-lg">{rooms.find(r => r._id === selectedRoom)?.name || '-'}</div>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <div className="text-xs text-gray-500">TANGGAL</div>
                                        <div className="mt-2 font-bold text-lg">{selectedDate ? new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(selectedDate)) : '-'}</div>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <div className="text-xs text-gray-500">WAKTU</div>
                                        <div className="mt-2 font-bold text-lg">{selectedTimeSlots.length ? selectedTimeSlots.map(s => timeSlotLabels[s]).join(', ') : '-'}</div>
                                    </div>
                                </div>

                                <div className="mt-6 bg-white rounded-lg p-4 shadow-sm max-w-md">
                                    <div className="text-xs text-gray-500">TUJUAN</div>
                                    <div className="mt-2 font-bold text-lg">{purposeOptions.find(p => p.id === purpose)?.title || '-'}</div>
                                    {purpose === 'lainnya' && purposeDetails && (<div className="mt-2 text-sm text-gray-600">{purposeDetails}</div>)}
                                </div>
                            </div>

                            <div className="mt-8 border-t pt-6 flex items-center justify-between">
                                <button onClick={() => setStep(4)} className="px-4 py-2 rounded border text-gray-700">&lt; Kembali</button>
                                <button onClick={handleSubmit} disabled={loading} className={`px-4 py-2 rounded text-white ${loading ? 'bg-gray-300' : 'bg-gradient-to-br from-pink-400 to-pink-600'}`}>{loading ? 'Memproses...' : 'Konfirmasi & Booking'}</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookPage;

