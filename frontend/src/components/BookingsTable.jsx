import React from 'react';
import { Calendar, Clock, User, CheckCircle, XCircle, HourglassIcon, Trash2, FileText, MapPin } from 'lucide-react';

const formatDate = (iso) => {
    try {
        return new Date(iso).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    } catch (e) {
        return iso;
    }
};

const BookingsTable = ({ bookings = [], onDelete, onViewReceipt, onApprove, onReject }) => {
    const getStatusConfig = (status) => {
        switch (status) {
            case 'approved': 
                return {
                    text: 'Disetujui',
                    icon: CheckCircle,
                    gradient: 'from-green-500 to-emerald-500',
                    bg: 'bg-green-50',
                    border: 'border-green-200',
                    text_color: 'text-green-700'
                };
            case 'pending': 
                return {
                    text: 'Menunggu',
                    icon: HourglassIcon,
                    gradient: 'from-yellow-500 to-orange-500',
                    bg: 'bg-yellow-50',
                    border: 'border-yellow-200',
                    text_color: 'text-yellow-700'
                };
            case 'rejected': 
                return {
                    text: 'Ditolak',
                    icon: XCircle,
                    gradient: 'from-red-500 to-rose-500',
                    bg: 'bg-red-50',
                    border: 'border-red-200',
                    text_color: 'text-red-700'
                };
            default: 
                return {
                    text: status,
                    icon: HourglassIcon,
                    gradient: 'from-gray-500 to-gray-600',
                    bg: 'bg-gray-50',
                    border: 'border-gray-200',
                    text_color: 'text-gray-700'
                };
        }
    };

    const timeSlotLabels = [
        '07:30 - 09:00',
        '09:00 - 10:30',
        '10:30 - 12:00',
        '13:00 - 14:30',
        '14:30 - 16:00',
        '16:00 - 17:30'
    ];

    return (
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-6 shadow-xl border border-gray-100 flex flex-col h-full w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                        Daftar Booking
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        Kelola semua booking Anda di sini
                    </p>
                </div>
                
                {/* Stats Badge */}
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full text-white shadow-lg">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold">{bookings.length} Booking</span>
                </div>
            </div>

            {/* Bookings List */}
            <div className="space-y-4 overflow-y-auto flex-grow">
                {bookings.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-4">
                            <Calendar className="w-10 h-10 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">Tidak ada booking yang ditemukan</p>
                        <p className="text-sm text-gray-400 mt-1">Booking Anda akan muncul di sini</p>
                    </div>
                ) : (
                    bookings.map(b => {
                        const statusConfig = getStatusConfig(b.status);
                        const StatusIcon = statusConfig.icon;
                        
                        return (
                            <div 
                                key={b._id || `${b.date}-${b.room?.name}`} 
                                className="group relative bg-white rounded-2xl p-5 shadow-md hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-purple-200 overflow-hidden"
                            >
                                {/* Decorative gradient line */}
                                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${statusConfig.gradient}`}></div>
                                
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    {/* Left Section - Info */}
                                    <div className="flex-1 space-y-3">
                                        {/* Room Name */}
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1 w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-lg flex-shrink-0">
                                                <MapPin className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                                                    {b.room?.name || 'Ruangan Tidak Dikenal'}
                                                </h4>
                                                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="w-4 h-4 text-pink-500" />
                                                        <span className="font-medium">{formatDate(b.date)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="w-4 h-4 text-purple-500" />
                                                        <span className="font-medium">
                                                            {(b.timeSlots || [])
                                                                .map(slotIndex => timeSlotLabels[slotIndex] || slotIndex)
                                                                .join(', ')}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
                                                    <User className="w-3.5 h-3.5" />
                                                    <span>Oleh: <span className="font-semibold">{b.user?.name || '-'}</span></span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Right Section - Status & Actions */}
                                    <div className="flex flex-col items-end space-y-3 lg:min-w-[200px]">
                                        {/* Status Badge */}
                                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 ${statusConfig.border} ${statusConfig.bg} ${statusConfig.text_color} shadow-sm`}>
                                            <StatusIcon className="w-4 h-4" />
                                            <span className="text-sm font-bold">{statusConfig.text}</span>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-wrap gap-2 justify-end">
                                            {/* Approve/Reject Buttons */}
                                            {b.status === 'pending' && (onApprove || onReject) && (
                                                <div className="flex gap-2">
                                                    {onApprove && (
                                                        <button
                                                            onClick={() => onApprove(b._id)}
                                                            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 cursor-pointer"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                            Setujui
                                                        </button>
                                                    )}
                                                    {onReject && (
                                                        <button
                                                            onClick={() => onReject(b._id)}
                                                            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 cursor-pointer"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                            Tolak
                                                        </button>
                                                    )}
                                                </div>
                                            )}

                                            {/* View Receipt Button */}
                                            {onViewReceipt && b.status === 'approved' && (
                                                <button
                                                    onClick={() => onViewReceipt(b)}
                                                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 border-2 border-blue-200 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 cursor-pointer"
                                                >
                                                    <FileText className="w-4 h-4" />
                                                    Lihat Struk
                                                </button>
                                            )}

                                            {/* Delete Button */}
                                            {onDelete && (
                                                <button 
                                                    onClick={async () => {
                                                        if (!confirm(`Apakah Anda yakin ingin menghapus booking untuk ${b.room?.name} pada ${formatDate(b.date)}?`)) return;
                                                        
                                                        try {
                                                            await onDelete(b._id);
                                                        } catch (err) {
                                                            console.error('Delete error', err);
                                                        }
                                                    }} 
                                                    className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border-2 border-red-200 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 group cursor-pointer"
                                                >
                                                    <Trash2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                                    Hapus
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

BookingsTable.defaultProps = {
    bookings: [],
    onDelete: null,
    onViewReceipt: null,
    onApprove: null,
    onReject: null,
};

export default BookingsTable;