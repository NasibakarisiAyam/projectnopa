import React, { useState, useEffect } from 'react';
import axios from '../axios/axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const AdminUserPage = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({ isOpen: false, mode: 'add', data: null });
    const [formData, setFormData] = useState({ name: '', nis: '', kelas: '', password: '', role: 'siswa' });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/admin/users');
            setUsers(data);
        } catch (error) {
            toast.error('Gagal memuat data pengguna.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (mode, user = null) => {
        setModal({ isOpen: true, mode, data: user });
        if (mode === 'edit' && user) {
            setFormData({ name: user.name, nis: user.nis, kelas: user.kelas || '', password: '', role: user.role });
        } else {
            setFormData({ name: '', nis: '', kelas: '', password: '', role: 'siswa' });
        }
    };

    const closeModal = () => {
        setModal({ isOpen: false, mode: 'add', data: null });
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const payload = { ...formData };
        if (!payload.password) {
            delete payload.password; // Jangan kirim password kosong
        }

        try {
            if (modal.mode === 'add') {
                await axios.post('/admin/users', payload);
                toast.success('Pengguna berhasil ditambahkan.');
            } else {
                await axios.put(`/admin/users/${modal.data._id}`, payload);
                toast.success('Pengguna berhasil diperbarui.');
            }
            fetchUsers();
            closeModal();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Terjadi kesalahan.');
            console.error(error);
        }
    };

    const handleDelete = async (userId) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
            try {
                await axios.delete(`/admin/users/${userId}`);
                toast.success('Pengguna berhasil dihapus.');
                fetchUsers();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Gagal menghapus pengguna.');
                console.error(error);
            }
        }
    };

    if (loading) return <div className="text-center p-10">Memuat pengguna...</div>;

    return (
        <div className="min-h-screen bg-gray-100 pt-20">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Kelola Pengguna</h2>
                        <button onClick={() => openModal('add')} className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700">
                            Tambah Pengguna
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                            <thead>
                                <tr>
                                    <th className="py-2 px-4 border-b">Nama</th>
                                    <th className="py-2 px-4 border-b">NIS</th>
                                    <th className="py-2 px-4 border-b">Kelas</th>
                                    <th className="py-2 px-4 border-b">Peran</th>
                                    <th className="py-2 px-4 border-b">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user._id}>
                                        <td className="py-2 px-4 border-b">{user.name}</td>
                                        <td className="py-2 px-4 border-b">{user.nis}</td>
                                        <td className="py-2 px-4 border-b">{user.kelas || '-'}</td>
                                        <td className="py-2 px-4 border-b">{user.role}</td>
                                        <td className="py-2 px-4 border-b">
                                            <button onClick={() => openModal('edit', user)} className="text-blue-600 hover:text-blue-800 mr-2">Edit</button>
                                            <button onClick={() => handleDelete(user._id)} className="text-red-600 hover:text-red-800">Hapus</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {modal.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">{modal.mode === 'add' ? 'Tambah Pengguna Baru' : 'Edit Pengguna'}</h3>
                        <form onSubmit={handleFormSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Nama</label>
                                <input type="text" name="name" value={formData.name} onChange={handleFormChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">NIS</label>
                                <input type="text" name="nis" value={formData.nis} onChange={handleFormChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Kelas</label>
                                <input type="text" name="kelas" value={formData.kelas} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Password</label>
                                <input type="password" name="password" value={formData.password} onChange={handleFormChange} placeholder={modal.mode === 'edit' ? 'Kosongkan jika tidak ingin diubah' : ''} required={modal.mode === 'add'} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Peran</label>
                                <select name="role" value={formData.role} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500">
                                    <option value="siswa">Siswa</option>
                                    <option value="guru">Guru</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button type="button" onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">Batal</button>
                                <button type="submit" className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUserPage;