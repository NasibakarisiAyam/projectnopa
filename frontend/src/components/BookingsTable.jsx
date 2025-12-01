import React, { useState, useMemo } from 'react';
import { toast } from 'react-toastify';

const formatDate = (iso) => {
    try {
        return new Date(iso).toLocaleDateString();
    } catch (e) {
        return iso;
    }
};

const buildCSV = (rows) => {
    const header = ['Date', 'Room', 'Time Slots', 'Status', 'User'];
    const lines = [header.join(',')];
    rows.forEach(r => {
        const line = [
            `"${formatDate(r.date)}"`,
            `"${r.room?.name || r.room || ''}"`,
            `"${(r.timeSlots || []).join('|')}"`,
            `"${r.status || ''}"`,
            `"${r.user?.name || ''}"`
        ].join(',');
        lines.push(line);
    });
    return lines.join('\n');
};

const BookingsTable = ({ bookings = [], onDelete, onViewReceipt }) => {
    const [query, setQuery] = useState('');

    const filtered = useMemo(() => {
        if (!query) return bookings;
        const q = query.toLowerCase();
        return bookings.filter(b => (
            (b.room?.name || '').toLowerCase().includes(q) ||
            (b.user?.name || '').toLowerCase().includes(q) ||
            (b.status || '').toLowerCase().includes(q) ||
            (b.date || '').toString().toLowerCase().includes(q)
        ));
    }, [bookings, query]);

    const exportCSV = () => {
        const csv = buildCSV(filtered);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bookings_export.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="card rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold">Daftar Booking</h3>
                    <div className="text-sm text-muted">Kelola booking Anda di sini</div>
                </div>
                <div className="flex items-center space-x-3">
                    <input
                        className="border rounded-lg px-3 py-2 w-56 bg-white text-sm"
                        placeholder="Cari room, user, status..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button onClick={exportCSV} className="btn-primary text-sm">Export</button>
                </div>
            </div>

            <div className="space-y-3">
                {filtered.map(b => (
                    <div key={b._id || `${b.date}-${b.room?.name}`} className="flex items-center justify-between p-3 rounded-lg bg-white hover:shadow-soft-lg transition-shadow">
                        <div>
                            <div className="text-sm font-medium">{b.room?.name || b.room}</div>
                            <div className="text-xs text-muted">{formatDate(b.date)} — {(b.timeSlots || []).join(', ')}</div>
                            {onViewReceipt && b.status === 'approved' && (
                                <button
                                    onClick={() => onViewReceipt(b)}
                                    className="mt-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200"
                                >
                                    Lihat Struk
                                </button>
                            )}
                        </div>
                        <div className="text-right">
                            <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${b.status === 'approved' ? 'bg-green-100 text-green-700' : b.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{b.status}</div>
                            <div className="text-xs text-muted mt-1">{b.user?.name || '-'}</div>
                            {onDelete && (
                                <button onClick={async () => {
                                    if (!confirm('Hapus booking ini?')) return;

                                    try {
                                        await onDelete(b._id);
                                        toast.success('Booking dihapus');
                                    } catch (err) {
                                        console.error('Delete error', err);
                                        const serverMsg = err?.response?.data?.message || err?.response?.data || err?.message || 'Gagal menghapus booking';
                                        toast.error(`Hapus gagal: ${serverMsg}`);
                                    }
                                }} className="mt-3 inline-block text-sm text-red-600">Hapus</button>
                            )}
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && (
                    <div className="text-center text-muted py-6">No bookings found</div>
                )}
            </div>
        </div>
    );
};

export default BookingsTable;
