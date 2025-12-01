import React from 'react';

const GradientIcon = ({ children }) => (
    <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-gradient-to-br from-pink-400 to-purple-500 text-white shadow-dashboard" style={{ boxShadow: '0 8px 32px rgba(255,111,181,0.12)' }}>
        {children}
    </div>
);

const StatCard = ({ title, value, icon }) => (
    <div className="bg-white rounded-2xl p-8 shadow-dashboard">
        <div className="flex flex-col items-center text-left">
            <div className="mb-6">
                <GradientIcon>
                    {icon}
                </GradientIcon>
            </div>

            <div className="w-full">
                <div className="text-4xl sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600">{value}</div>
                <div className="mt-2 text-sm text-muted">{title}</div>
            </div>
        </div>
    </div>
);

const DashboardSummary = ({ totals }) => {
    const { totalBookings = 0, pending = 0, availableRooms = 0 } = totals || {};

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6 mt-6">
            <StatCard title="Booking Aktif" value={totalBookings} icon={(
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 00-1-1H6zM7 7h6v2H7V7z" />
                </svg>
            )} />

            <StatCard title="Ruangan Tersedia" value={availableRooms} icon={(
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 2a2 2 0 00-2 2v2H6a2 2 0 00-2 2v6h12V8a2 2 0 00-2-2h-2V4a2 2 0 00-2-2z" />
                </svg>
            )} />

            <StatCard title="Slot Waktu" value={pending} icon={(
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11H9v5l4 2 .5-.866L11 11V7z" clipRule="evenodd" />
                </svg>
            )} />
        </div>
    );
};

export default DashboardSummary;
