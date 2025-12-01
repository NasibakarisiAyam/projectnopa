import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Hash, School, Lock, UserCog, LogIn, UserPlus, LoaderCircle } from 'lucide-react';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
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
            let result;
            if (isLogin) {
                result = await login(data.nis, data.password);
            } else {
                result = await registerUser({
                    name: data.name,
                    nis: data.nis,
                    kelas: data.kelas,
                    password: data.password,
                    role: data.role,
                });
            }

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

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setMessage('');
        reset();
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        {isLogin ? 'Sign in to BookRuangan' : 'Create your account'}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                                    {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
                                    <button onClick={toggleMode} className="font-medium text-pink-600 hover:text-pink-500">
                                        {isLogin ? 'Daftar' : 'Masuk'}
                                    </button>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    {!isLogin && (
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Full Name
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="name"
                                    type="text"
                                    {...register('name', { required: 'Name is required' })}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                                    placeholder="Enter your full name"
                                />
                            </div>
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                            )}
                        </div>
                    )}

                    <div>
                        <label htmlFor="nis" className="block text-sm font-medium text-gray-700">
                            NIS
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Hash className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="nis"
                                type="text"
                                {...register('nis', { required: 'NIS is required' })}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                                placeholder="Enter your NIS"
                            />
                        </div>
                        {errors.nis && (
                            <p className="mt-1 text-sm text-red-600">{errors.nis.message}</p>
                        )}
                    </div>

                    {!isLogin && (
                        <div>
                            <label htmlFor="kelas" className="block text-sm font-medium text-gray-700">
                                Class
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <School className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="kelas"
                                    type="text"
                                    {...register('kelas', { required: 'Class is required' })}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                                    placeholder="Enter your class"
                                />
                            </div>
                            {errors.kelas && (
                                <p className="mt-1 text-sm text-red-600">{errors.kelas.message}</p>
                            )}
                        </div>
                    )}

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="password"
                                type="password"
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: {
                                        value: 6,
                                        message: 'Password must be at least 6 characters',
                                    },
                                })}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                                placeholder="Enter your password"
                            />
                        </div>
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                        )}
                    </div>

                    {!isLogin && (
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                                Role
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <UserCog className="h-5 w-5 text-gray-400" />
                                </div>
                                <select
                                    id="role"
                                    {...register('role', { required: 'Role is required' })}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                                >
                                    <option value="">Select your role</option>
                                    <option value="siswa">Siswa (Student)</option>
                                    <option value="guru">Guru (Teacher)</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            {errors.role && (
                                <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                            )}
                        </div>
                    )}

                    {message && (
                        <div className={`p-4 rounded-md ${message.includes('successful') ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                            {message}
                        </div>
                    )}

                    <div>
                        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50 flex items-center justify-center gap-2">
                            {loading ? (
                                <LoaderCircle className="animate-spin" size={20} />
                            ) : isLogin ? (
                                <LogIn size={20} />
                            ) : (
                                <UserPlus size={20} />
                            )}
                            <span>
                                {loading ? 'Memproses...' : isLogin ? 'Masuk' : 'Daftar'}
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
