import React from 'react';

const RoomStatus = ({ statuses = [] }) => {
    return (
        <div className="card mt-4 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Status Ruangan Hari Ini</h3>
            <ul className="space-y-2">
                {statuses.length === 0 && (
                    <li className="text-sm text-muted">Tidak ada data status</li>
                )}
                {statuses.map((s, idx) => (
                    <li key={idx} className="flex items-center justify-between py-3 px-2 bg-white rounded-md shadow-sm">
                        <div>
                            <div className="text-sm font-medium">{s.room}</div>
                            <div className="text-xs text-muted">{s.detail}</div>
                        </div>
                        <div>
                            {s.isFree ? (
                                <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">Tersedia</span>
                            ) : (
                                <span className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">Tidak Tersedia</span>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default RoomStatus;
