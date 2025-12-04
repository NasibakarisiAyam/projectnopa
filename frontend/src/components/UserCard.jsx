import React from 'react';
import BookingsTable from './BookingsTable';

const UserCard = ({ user = { name: 'Nama User', role: 'Guru' }, bookings = [] }) => {
    return (
        <div className="bg-white rounded-xl shadow-lg p-4 flex flex-col h-full">
            <div className="text-center mb-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 text-white flex items-center justify-center mx-auto text-xl font-bold">{(user.name || 'NU').split(' ').map(n=>n[0]).slice(0,2).join('')}</div>
                <div className="mt-3 font-semibold text-gray-800">{user.name || 'Nama User'}</div>
                <div className="text-xs text-gray-500">Status: {user.role || 'Guru/Siswa'}</div>
            </div>

            <div className="flex-grow">
                <BookingsTable 
                    bookings={bookings} 
                    onDelete={null}
                    onViewReceipt={null}
                />
            </div>
        </div>
    );
};

export default UserCard;
