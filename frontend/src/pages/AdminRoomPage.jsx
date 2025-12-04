import React, { useState, useEffect } from 'react';
import axios from '../axios/axios';
import { toast } from 'react-toastify';
import { PlusCircle, Edit, Trash2, LoaderCircle, X, MapPin, Users } from 'lucide-react';

const RoomForm = ({ room, onSave, onCancel }) => {
    const [name, setName] = useState(room?.name || '');
    const [capacity, setCapacity] = useState(room?.capacity || '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const roomData = { name, capacity: Number(capacity) };
            await onSave(roomData);
            toast.success(`Ruangan berhasil ${room ? 'diperbarui' : 'ditambahkan'}!`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menyimpan ruangan.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-pink-600">{room ? 'Edit Ruangan' : 'Tambah Ruangan Baru'}</h2>
                    <button onClick={onCancel} className="p-2 rounded-full hover:bg-gray-100">
                        <X className="w-6 h-6 text-gray-600" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">Nama Ruangan</label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                                placeholder="Contoh: Lab Komputer 1"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="capacity" className="block text-sm font-semibold text-gray-700 mb-2">Kapasitas (Opsional)</label>
                        <div className="relative">
                            <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                id="capacity"
                                type="number"
                                value={capacity}
                                onChange={(e) => setCapacity(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                                placeholder="Contoh: 30"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={onCancel} className="px-6 py-2.5 rounded-xl text-gray-700 font-medium hover:bg-gray-100 transition">
                            Batal
                        </button>
                        <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition disabled:opacity-50 flex items-center gap-2">
                            {loading ? <LoaderCircle className="animate-spin" /> : <PlusCircle className="w-5 h-5" />}
                            Simpan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AdminRoomPage = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);

    const fetchRooms = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/booking/rooms');
            setRooms(response.data);
        } catch (error) {
            toast.error('Gagal memuat data ruangan.');
            console.error('Error fetching rooms:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    const handleAdd = () => {
        setEditingRoom(null);
        setIsModalOpen(true);
    };

    const handleEdit = (room) => {
        setEditingRoom(room);
        setIsModalOpen(true);
    };

    const handleDelete = async (roomId) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus ruangan ini?')) {
            try {
                await axios.delete(`/booking/rooms/${roomId}`);
                toast.success('Ruangan berhasil dihapus.');
                fetchRooms();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Gagal menghapus ruangan.');
            }
        }
    };

    const handleSave = async (roomData) => {
        if (editingRoom) {
            // Update
            await axios.put(`/booking/rooms/${editingRoom._id}`, roomData);
        } else {
            // Create
            await axios.post('/booking/rooms', roomData);
        }
        fetchRooms();
        setIsModalOpen(false);
        setEditingRoom(null);
    };

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-pink-600">Kelola Ruangan</h1>
                    <p className="text-gray-600 mt-1">Tambah, edit, atau hapus ruangan yang tersedia untuk booking.</p>
                </div>
                <button onClick={handleAdd} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                    <PlusCircle className="w-5 h-5" />
                    <span>Tambah Ruangan</span>
                </button>
            </div>

            {loading ? (
                <div className="text-center py-20">
                    <LoaderCircle className="w-12 h-12 text-pink-500 animate-spin mx-auto" />
                    <p className="mt-4 text-gray-600">Memuat ruangan...</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-xl p-6">
                    <ul className="divide-y divide-gray-200">
                        {rooms.map((room) => (
                            <li key={room._id} className="py-4 flex items-center justify-between">
                                <div>
                                    <p className="text-lg font-semibold text-gray-800">{room.name}</p>
                                    {room.capacity && <p className="text-sm text-gray-500">Kapasitas: {room.capacity} orang</p>}
                                </div>
                                <div className="flex items-center space-x-3">
                                    <button onClick={() => handleEdit(room)} className="p-2 rounded-full text-blue-600 hover:bg-blue-50 transition">
                                        <Edit className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => handleDelete(room._id)} className="p-2 rounded-full text-red-600 hover:bg-red-50 transition">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                    {rooms.length === 0 && (
                        <p className="text-center py-10 text-gray-500">Belum ada ruangan yang ditambahkan.</p>
                    )}
                </div>
            )}

            {isModalOpen && <RoomForm room={editingRoom} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />}
        </div>
    );
};

export default AdminRoomPage;