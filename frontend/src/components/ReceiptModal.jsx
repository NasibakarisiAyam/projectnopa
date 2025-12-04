import React from 'react';
import { Check, Calendar, Clock, MapPin, User, Printer, X } from 'lucide-react';

const ReceiptModal = ({ booking, onClose }) => {
    if (!booking) return null;

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:bg-white print:p-0 print:backdrop-blur-none">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto print:shadow-none print:rounded-none print:max-h-full print:overflow-visible print:bg-white">
                {/* Header */}
                <div className="text-center mb-8 relative">
                    <button 
                        onClick={onClose}
                        className="absolute -top-2 -right-2 print:hidden bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors"
                    >
                        <X size={20} className="text-gray-600" />
                    </button>
                    
                    <div className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full p-4 mb-4">
                        <Check size={32} className="text-white" />
                    </div>
                    
                    <h3 className="text-3xl font-bold text-gray-800 mb-2">
                        Bukti Booking Ruangan
                    </h3>
                    <p className="text-gray-500 font-medium">Sistem Booking Ruangan Sekolah</p>
                </div>

                {/* Status Badge */}
                <div className="flex justify-center mb-6">
                    <div className="bg-green-50 border-2 border-green-500 rounded-full px-6 py-2 flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-green-700 font-bold text-sm">BOOKING DISETUJUI</span>
                    </div>
                </div>

                {/* Details Section */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
                    <div className="space-y-4">
                        <div className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="bg-blue-100 rounded-lg p-2 mt-0.5">
                                <Calendar size={20} className="text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-500 mb-1">Tanggal Booking</p>
                                <p className="text-gray-900 font-semibold">{formatDate(booking.date)}</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="bg-purple-100 rounded-lg p-2 mt-0.5">
                                <Clock size={20} className="text-purple-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-500 mb-1">Waktu Booking</p>
                                <p className="text-gray-900 font-semibold">
                                    Jam {booking.timeSlots?.join(', ') || '-'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="bg-green-100 rounded-lg p-2 mt-0.5">
                                <MapPin size={20} className="text-green-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-500 mb-1">Ruangan</p>
                                <p className="text-gray-900 font-semibold">{booking.room?.name || '-'}</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="bg-orange-100 rounded-lg p-2 mt-0.5">
                                <User size={20} className="text-orange-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-500 mb-1">Nama Pemesan</p>
                                <p className="text-gray-900 font-semibold">{booking.user?.name || '-'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Approval Info */}
                {booking.approvedAt && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-6 border border-green-200">
                        <p className="text-sm text-gray-600 mb-1">Disetujui Pada</p>
                        <p className="text-green-700 font-semibold">
                            {new Date(booking.approvedAt).toLocaleString('id-ID')}
                        </p>
                    </div>
                )}

                {/* Booking ID */}
                <div className="text-center mb-6 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-xs text-gray-500 mb-1">Booking ID</p>
                    <p className="text-sm font-mono font-bold text-gray-700">{booking._id}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 print:hidden">
                    <button 
                        onClick={handlePrint} 
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                    >
                        <Printer size={20} />
                        <span>Cetak Struk</span>
                    </button>
                    <button 
                        onClick={onClose} 
                        className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-semibold text-gray-700 hover:border-gray-400"
                    >
                        Tutup
                    </button>
                </div>

                {/* Footer */}
                <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                    <p className="text-xs text-gray-400">
                        Struk ini adalah bukti sah pemesanan ruangan
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ReceiptModal;