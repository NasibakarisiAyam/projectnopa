import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Hash, School, Lock, UserCog, LogIn, UserPlus, LoaderCircle, BookOpen, Sparkles } from 'lucide-react';

const Login = () => {
    const isLogin = true; // Selalu dalam mode login
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const { login, register: registerUser } = useAuth();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm();

    const onSubmit = async (data) => {
        setLoading(true);
        setMessage('');

        try {
            const result = await login(data.nis, data.password);

            if (result.success) {
                setMessage(`${isLogin ? 'Login' : 'Registration'} successful!`);
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1000);
            } else {
                setMessage(result.message);
            }
        } catch (error) {
            setMessage('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
            <div className="absolute top-0 right-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

            <div className="max-w-md w-full relative z-10">
                {/* Header Card */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl shadow-lg mb-4 transform hover:scale-110 transition-transform duration-300">
                        <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2 tracking-wider">
                        Eroom
                    </h2>
                    <p className="text-gray-600 flex items-center justify-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        <span>Selamat datang kembali!</span>
                    </p>
                </div>

                {/* Main Form Card */}
                <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl p-8 border border-white/20">
                    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                        {!isLogin && (
                            <div className="transform transition-all duration-300">
                                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Nama Lengkap
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400 group-hover:text-pink-500 transition-colors" />
                                    </div>
                                    <input
                                        id="name"
                                        type="text"
                                        {...register('name', { required: 'Nama harus diisi' })}
                                        className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300 hover:border-gray-300"
                                        placeholder="Masukkan nama lengkap"
                                    />
                                </div>
                                {errors.name && (
                                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                        <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                                        {errors.name.message}
                                    </p>
                                )}
                            </div>
                        )}

                        <div>
                            <label htmlFor="nis" className="block text-sm font-semibold text-gray-700 mb-2">
                                NIS
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Hash className="h-5 w-5 text-gray-400 group-hover:text-pink-500 transition-colors" />
                                </div>
                                <input
                                    id="nis"
                                    type="text"
                                    {...register('nis', { required: 'NIS harus diisi' })}
                                    className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300 hover:border-gray-300"
                                    placeholder="Masukkan NIS"
                                />
                            </div>
                            {errors.nis && (
                                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                    <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                                    {errors.nis.message}
                                </p>
                            )}
                        </div>

                        {false && ( // Selalu false, jadi bagian ini tidak akan dirender
                            <div className="transform transition-all duration-300">
                                <label htmlFor="kelas" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Kelas
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <School className="h-5 w-5 text-gray-400 group-hover:text-pink-500 transition-colors" />
                                    </div>
                                    <input
                                        id="kelas"
                                        type="text"
                                        {...register('kelas', { required: 'Kelas harus diisi' })}
                                        className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300 hover:border-gray-300"
                                        placeholder="Contoh: XII IPA 1"
                                    />
                                </div>
                                {errors.kelas && (
                                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                        <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                                        {errors.kelas.message}
                                    </p>
                                )}
                            </div>
                        )}

                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400 group-hover:text-pink-500 transition-colors" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    {...register('password', {
                                        required: 'Password harus diisi',
                                        minLength: {
                                            value: 6,
                                            message: 'Password minimal 6 karakter',
                                        },
                                    })}
                                    className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300 hover:border-gray-300"
                                    placeholder="Masukkan password"
                                />
                            </div>
                            {errors.password && (
                                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                    <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        {false && ( // Selalu false, jadi bagian ini tidak akan dirender
                            <div className="transform transition-all duration-300">
                                <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Role
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <UserCog className="h-5 w-5 text-gray-400 group-hover:text-pink-500 transition-colors" />
                                    </div>
                                    <select
                                        id="role"
                                        {...register('role', { required: 'Role harus dipilih' })}
                                        className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300 hover:border-gray-300 appearance-none cursor-pointer"
                                    >
                                        <option value="">Pilih role</option>
                                        <option value="siswa">👨‍🎓 Siswa (Student)</option>
                                        <option value="guru">👨‍🏫 Guru (Teacher)</option>
                                        <option value="admin">👤 Admin</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                                {errors.role && (
                                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                        <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                                        {errors.role.message}
                                    </p>
                                )}
                            </div>
                        )}

                        {message && (
                            <div className={`p-4 rounded-xl border-2 backdrop-blur-sm transform transition-all duration-300 ${
                                message.includes('successful') 
                                    ? 'bg-green-50/80 border-green-200 text-green-700' 
                                    : 'bg-red-50/80 border-red-200 text-red-700'
                            }`}>
                                <div className="flex items-center gap-2">
                                    {message.includes('successful') ? (
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    ) : (
                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                    )}
                                    <span className="font-medium">{message}</span>
                                </div>
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={loading} 
                            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 group cursor-pointer"
                        >
                            {loading ? (
                                <>
                                    <LoaderCircle className="animate-spin" size={20} />
                                    <span>Memproses...</span>
                                </>
                            ) : (
                                <> <LogIn size={20} className="group-hover:translate-x-1 transition-transform" /> <span>Masuk Sekarang</span> </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Additional Info */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500">
                        Dengan melanjutkan, Anda menyetujui syarat dan ketentuan kami
                    </p>
                </div>
            </div>

            {/* Add this to your global CSS for blob animation */}
            <style>{`
                @keyframes blob {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    25% { transform: translate(20px, -50px) scale(1.1); }
                    50% { transform: translate(-20px, 20px) scale(0.9); }
                    75% { transform: translate(50px, 50px) scale(1.05); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </div>
    );
};

export default Login;