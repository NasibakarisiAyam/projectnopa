import axios from 'axios';

// Dapatkan base URL dari environment variables.
// VITE_API_BASE_URL akan diatur di Vercel.
// Jika tidak ada, gunakan URL lokal sebagai fallback untuk development.
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const instance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Penting untuk mengirim cookie (session/token)
});

export default instance;