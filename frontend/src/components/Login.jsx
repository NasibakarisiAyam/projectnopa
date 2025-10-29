import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
                        {isLogin ? "Don't have an account? " : 'Already have an account? '}
                        <button
                            onClick={toggleMode}
                            className="font-medium text-indigo-600 hover:text-indigo-500"
                        >
                            {isLogin ? 'Sign up' : 'Sign in'}
                        </button>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    {!isLogin && (
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Full Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                {...register('name', { required: 'Name is required' })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Enter your full name"
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                            )}
                        </div>
                    )}

                    <div>
                        <label htmlFor="nis" className="block text-sm font-medium text-gray-700">
                            NIS
                        </label>
                        <input
                            id="nis"
                            type="text"
                            {...register('nis', { required: 'NIS is required' })}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter your NIS"
                        />
                        {errors.nis && (
                            <p className="mt-1 text-sm text-red-600">{errors.nis.message}</p>
                        )}
                    </div>

                    {!isLogin && (
                        <div>
                            <label htmlFor="kelas" className="block text-sm font-medium text-gray-700">
                                Class
                            </label>
                            <input
                                id="kelas"
                                type="text"
                                {...register('kelas', { required: 'Class is required' })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Enter your class"
                            />
                            {errors.kelas && (
                                <p className="mt-1 text-sm text-red-600">{errors.kelas.message}</p>
                            )}
                        </div>
                    )}

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
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
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter your password"
                        />
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                        )}
                    </div>

                    {!isLogin && (
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                                Role
                            </label>
                            <select
                                id="role"
                                {...register('role', { required: 'Role is required' })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">Select your role</option>
                                <option value="siswa">Siswa (Student)</option>
                                <option value="guru">Guru (Teacher)</option>
                                <option value="admin">Admin</option>
                            </select>
                            {errors.role && (
                                <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                            )}
                        </div>
                    )}

                    {message && (
                        <div
                            className={`p-4 rounded-md ${
                                message.includes('successful')
                                    ? 'bg-green-50 border border-green-200 text-green-700'
                                    : 'bg-red-50 border border-red-200 text-red-700'
                            }`}
                        >
                            {message}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : isLogin ? 'Sign in' : 'Sign up'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
