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
import MyBookingsPage from "./pages/MyBookingsPage";
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
        <div className="App">
          <Navbar />

          <div className="w-full bg-white border-b shadow-sm">
            <div className="max-w-7xl mx-auto px-6 py-3">
              <div className="text-sm text-gray-600">&nbsp;</div>
            </div>
          </div>

          <main className="pt-6">
            <Routes>
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/login" element={<Login />} />


              <Route
                path="/contact"
                element={
                  <div className="min-h-screen bg-gray-50 py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h1>
                        <p className="text-gray-600">For support or inquiries, please contact our administration team.</p>
                      </div>
                    </div>
                  </div>
                }
              />

              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/book" element={<ProtectedRoute allowedRoles={["siswa","guru"]}><BookPage /></ProtectedRoute>} />
              <Route path="/my-bookings" element={<ProtectedRoute allowedRoles={["siswa","guru","admin"]}><MyBookingsPage /></ProtectedRoute>} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>

        <Footer />
        <ToastContainer position="top-right" newestOnTop />
      </Router>
    </AuthProvider>
  );
}
