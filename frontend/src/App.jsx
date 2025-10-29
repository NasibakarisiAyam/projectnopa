import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Homepage from "./pages/Homepage";
import Login from "./components/Login";
import Dashboard from "./pages/Dashboard";
import BookPage from "./pages/BookPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import AdminBookingsPage from "./pages/AdminBookingsPage";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
    return(
        <AuthProvider>
            <Router>
                <div className="App">
                    <Routes>
                        {/* Public routes */}
                        <Route path="/" element={
                            <ProtectedRoute>
                                <>
                                    <Navbar />
                                    <Dashboard />
                                </>
                            </ProtectedRoute>
                        } />
                        <Route path="/login" element={<Login />} />
                        <Route path="/about" element={
                            <>
                                <Navbar />
                                <div className="min-h-screen bg-gray-50 py-12">
                                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                        <div className="bg-white rounded-lg shadow-md p-6">
                                            <h1 className="text-3xl font-bold text-gray-900 mb-4">About BookRuangan</h1>
                                            <p className="text-gray-600">
                                                BookRuangan is a room booking management system designed for educational institutions.
                                                It allows students, teachers, and administrators to efficiently manage room reservations.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        } />
                        <Route path="/contact" element={
                            <>
                                <Navbar />
                                <div className="min-h-screen bg-gray-50 py-12">
                                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                        <div className="bg-white rounded-lg shadow-md p-6">
                                            <h1 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h1>
                                            <p className="text-gray-600">
                                                For support or inquiries, please contact our administration team.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        } />

                        {/* Protected routes */}
                        <Route path="/dashboard" element={
                            <ProtectedRoute>
                                <>
                                    <Navbar />
                                    <Dashboard />
                                </>
                            </ProtectedRoute>
                        } />

                        {/* Role-based protected routes */}
                        <Route path="/admin" element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <>
                                    <Navbar />
                                    <Dashboard />
                                </>
                            </ProtectedRoute>
                        } />
                        <Route path="/guru" element={
                            <ProtectedRoute allowedRoles={['guru', 'admin']}>
                                <>
                                    <Navbar />
                                    <Dashboard />
                                </>
                            </ProtectedRoute>
                        } />
                        <Route path="/siswa" element={
                            <ProtectedRoute allowedRoles={['siswa', 'guru', 'admin']}>
                                <>
                                    <Navbar />
                                    <Dashboard />
                                </>
                            </ProtectedRoute>
                        } />
                        <Route path="/book" element={
                            <ProtectedRoute allowedRoles={['siswa', 'guru', 'admin']}>
                                <>
                                    <Navbar />
                                    <BookPage />
                                </>
                            </ProtectedRoute>
                        } />
                        <Route path="/my-bookings" element={
                            <ProtectedRoute allowedRoles={['siswa', 'guru', 'admin']}>
                                <>
                                    <Navbar />
                                    <MyBookingsPage />
                                </>
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/bookings" element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <>
                                    <Navbar />
                                    <AdminBookingsPage />
                                </>
                            </ProtectedRoute>
                        } />

                        {/* Catch all route */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    )
}

export default App;
