import axios from 'axios';

// Buat instance axios dengan konfigurasi default
const instance = axios.create({
  // Atur baseURL ke alamat server backend Anda.
  // Pastikan port-nya (misal: 5000) sesuai dengan yang dijalankan oleh server.js
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // Mengizinkan pengiriman cookie (jika digunakan)
});

// Tambahkan interceptor untuk menyertakan token JWT di setiap permintaan
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Ambil token dari localStorage
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;
