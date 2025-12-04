import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axios/axios.js';
import { AuthContext } from '/src/context/AuthContext.jsx';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    name: '',
    nis: '',
    photo: ''
  });
  
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('/user/profile');
      setFormData({
        name: response.data.name || '',
        nis: response.data.nis || '',
        photo: response.data.photo || ''
      });
      setPhotoPreview(response.data.photo || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
      showMessage('error', 'Gagal memuat profil');
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        showMessage('error', 'Ukuran foto maksimal 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        showMessage('error', 'File harus berupa gambar');
        return;
      }

      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleUploadPhoto = async () => {
    if (!photoFile) {
      showMessage('error', 'Pilih foto terlebih dahulu');
      return;
    }

    setLoading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('profilePhoto', photoFile);

    try {
      const response = await axios.post('/user/profile/photo', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setFormData({ ...formData, photo: response.data.photoUrl });
      setPhotoPreview(response.data.photoUrl);
      setPhotoFile(null);
      
      // Update AuthContext
      if (setUser) {
        setUser({ ...user, photo: response.data.photoUrl });
      }
      
      showMessage('success', 'Foto profil berhasil diperbarui');
    } catch (error) {
      console.error('Error uploading photo:', error);
      showMessage('error', error.response?.data?.message || 'Gagal mengunggah foto');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus foto profil?')) return;

    setLoading(true);
    try {
      await axios.delete('/user/profile/photo');
      
      setFormData({ ...formData, photo: '' });
      setPhotoPreview('');
      setPhotoFile(null);
      
      // Update AuthContext
      if (setUser) {
        setUser({ ...user, photo: '' });
      }
      
      showMessage('success', 'Foto profil berhasil dihapus');
    } catch (error) {
      console.error('Error deleting photo:', error);
      showMessage('error', error.response?.data?.message || 'Gagal menghapus foto');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      showMessage('error', 'Nama tidak boleh kosong');
      return;
    }

    if (passwords.newPassword) {
      if (passwords.newPassword.length < 6) {
        showMessage('error', 'Password minimal 6 karakter');
        return;
      }
      
      if (passwords.newPassword !== passwords.confirmPassword) {
        showMessage('error', 'Password tidak cocok');
        return;
      }
    }

    setLoading(true);
    try {
      const updateData = {
        name: formData.name,
        ...(passwords.newPassword && {
          newPassword: passwords.newPassword,
          confirmPassword: passwords.confirmPassword
        })
      };

      const response = await axios.put('/user/update', updateData);
      
      // Update AuthContext
      if (setUser) {
        setUser({ ...user, name: formData.name });
      }
      
      showMessage('success', 'Profil berhasil diperbarui');
      setPasswords({ newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error updating profile:', error);
      showMessage('error', error.response?.data?.message || 'Gagal memperbarui profil');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'NU';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-6 flex items-center gap-3">
            <i className="fas fa-cog text-white text-3xl"></i>
            <h1 className="text-3xl font-bold text-white">Pengaturan Akun</h1>
          </div>

          <div className="p-8">
            {/* Alert Message */}
            {message.text && (
              <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                <i className={`fas fa-${message.type === 'success' ? 'check-circle' : 'exclamation-circle'} text-xl`}></i>
                <span className="font-medium">{message.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveChanges}>
              {/* Photo Section */}
              <div className="mb-8 p-6 border-2 border-dashed border-gray-200 rounded-xl">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-shrink-0">
                    {photoPreview ? (
                      <img 
                        src={photoPreview} 
                        alt="Profile" 
                        className="w-32 h-32 rounded-full object-cover border-4 border-pink-200 shadow-lg"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                        {getInitials(formData.name)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Foto Profil</h3>
                    <p className="text-gray-600 mb-4">Unggah foto baru untuk memperbarui profil Anda</p>
                    
                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                      <label htmlFor="photo-upload" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-all cursor-pointer shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                        <i className="fas fa-upload"></i>
                        <span>Unggah Foto</span>
                      </label>
                      <input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                        disabled={loading}
                      />
                      
                      {(photoPreview || photoFile) && (
                        <button 
                          type="button"
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={handleDeletePhoto}
                          disabled={loading}
                        >
                          <i className="fas fa-trash"></i>
                          <span>Hapus Foto</span>
                        </button>
                      )}
                    </div>
                    
                    {photoFile && (
                      <button 
                        type="button"
                        className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleUploadPhoto}
                        disabled={loading}
                      >
                        {loading ? 'Mengunggah...' : 'Konfirmasi Upload'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Name Field */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                  <i className="fas fa-user text-pink-500"></i>
                  <span>Nama</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Masukkan nama Anda"
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              {/* NIS Field (Read Only) */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                  <i className="fas fa-id-card text-pink-500"></i>
                  <span>NIS</span>
                </label>
                <input
                  type="text"
                  value={formData.nis}
                  placeholder="NIS Anda"
                  disabled
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed text-gray-600"
                />
                <small className="text-gray-500 text-sm mt-1 block">NIS tidak dapat diubah</small>
              </div>

              {/* Password Fields */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                  <i className="fas fa-lock text-pink-500"></i>
                  <span>Ganti Password</span>
                </label>
                <input
                  type="password"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  placeholder="Masukkan password baru"
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <small className="text-gray-500 text-sm mt-1 block">Kosongkan jika tidak ingin mengubah password</small>
              </div>

              <div className="mb-8">
                <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                  <i className="fas fa-lock text-pink-500"></i>
                  <span>Konfirmasi Password</span>
                </label>
                <input
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  placeholder="Konfirmasi password baru"
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <button 
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  <i className="fas fa-save"></i>
                  <span>{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                </button>
                
                <button 
                  type="button"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => navigate(-1)}
                  disabled={loading}
                >
                  <i className="fas fa-times"></i>
                  <span>Batal</span>
                </button>
              </div>
            </form>

            {/* Back to Dashboard */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button 
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-pink-600 font-medium transition-colors"
              >
                <i className="fas fa-arrow-left"></i>
                <span>Kembali ke Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;