import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from "./components/Login";
import Dashboard from "./pages/Dashboard";
import BookPage from "./pages/BookPage";
import AdminUserPage from "./pages/AdminUserPage"; // Pastikan ini diimpor
import MyBookingsPage from "./pages/MyBookingsPage";
import AdminBookingsPage from "./pages/AdminBookingsPage"; // Impor halaman admin booking
import SettingsPage from "./pages/SettingPage";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  React.useEffect(() => {
    const handler = (event) => {
      console.error('Unhandled rejection:', event.reason);
      try {
        const { toast } = require('react-toastify');
        const message = event.reason?.message || event.reason?.response?.data?.message || JSON.stringify(event.reason);
        toast.error(`Error: ${message}`);
      } catch (e) {
        // ignore
      }
    };
    window.addEventListener('unhandledrejection', handler);
    return () => window.removeEventListener('unhandledrejection', handler);
  }, []);

  React.useEffect(() => {
    if (!window.fetch?.__wrapped) {
      const originalFetch = window.fetch.bind(window);
      window.fetch = async (...args) => {
        const res = await originalFetch(...args);
        let data = null;
        try {
          data = await res.clone().json().catch(() => null);
        } catch (e) {
          data = null;
        }
        if (data && typeof data === 'object' && 'code' in data && data.code !== 200) {
          const err = new Error(data.message || 'API error');
          err.response = { status: data.code, data };
          return Promise.reject(err);
        }
        return res;
      };
      window.fetch.__wrapped = true;
    }
  }, []);

  return (
    <AuthProvider>
      <Router>
        <>
          <Navbar />
          <main className="flex-grow bg-pink-50">
            <Routes>
              {/* Rute Publik */}
              <Route path="/login" element={<Login />} />
              {/* Rute yang dilindungi untuk semua pengguna yang sudah login */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>

              {/* Rute yang dilindungi berdasarkan peran */}
              <Route element={<ProtectedRoute allowedRoles={["siswa", "guru"]} />}>
                <Route path="/book" element={<BookPage />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={["siswa", "guru", "admin"]} />}>
                <Route path="/my-bookings" element={<MyBookingsPage />} />
              </Route>

              {/* Rute khusus Admin */}
              <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                <Route path="/admin/bookings" element={<AdminBookingsPage />} /> {/* Rute baru untuk admin booking */}
                <Route path="/admin/users" element={<AdminUserPage />} />
              </Route>
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </>
        <ToastContainer 
          position="top-right" 
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss />
      </Router>
    </AuthProvider>
  );
}
