import React from 'react';

const UserCard = ({ user = { name: 'Nama User', role: 'Guru' }, bookings = [] }) => {
    return (
        <div className="bg-white rounded-xl shadow-lg p-4 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 text-white flex items-center justify-center mx-auto text-xl font-bold">{(user.name || 'NU').split(' ').map(n=>n[0]).slice(0,2).join('')}</div>
            <div className="mt-3 font-semibold text-gray-800">{user.name || 'Nama User'}</div>
            <div className="text-xs text-gray-500">Status: {user.role || 'Guru/Siswa'}</div>

            <div className="mt-4 text-left">
                <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-gray-700">Ruangan Dipesan</div>
                    <a href="/my-bookings" className="text-sm text-pink-600">Lihat Semua</a>
                </div>
                <div className="mt-2 space-y-2">
                    {bookings.length === 0 && (
                        <div className="text-xs text-gray-500">Tidak ada booking</div>
                    )}
                    {bookings.slice(0,3).map(b => (
                        <div key={b._id || b.room?.name} className="text-sm text-gray-600 bg-pink-50 p-3 rounded">
                            <div className="font-medium">{b.room?.name || b.room}</div>
                            <div className="text-xs">{new Date(b.date).toLocaleDateString()} — {(b.timeSlots||[]).join(', ')}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UserCard;
