import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, LogIn, Chrome } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, signInWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        try {
            setError('');
            setLoading(true);
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError('Failed to sign in: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            setError('');
            setLoading(true);
            await signInWithGoogle();
            navigate('/dashboard');
        } catch (err) {
            setError('Failed to sign in with Google: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full">
                {/* Logo and Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
                            alt="GOI"
                            className="h-12 dark:invert"
                        />
                        <div>
                            <h1 className="text-2xl font-black leading-none">
                                <span className="text-orange-600">GLOSA</span>
                                <span className="text-slate-800 dark:text-white">-</span>
                                <span className="text-green-600">BHARAT</span>
                            </h1>
                            <p className="text-[8px] uppercase tracking-widest text-slate-500 font-bold mt-1">
                                Government of India Initiative
                            </p>
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Welcome Back</h2>
                    <p className="text-slate-600 dark:text-slate-400">Sign in to access your dashboard</p>
                </div>

                {/* Login Card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Input */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                                    placeholder="your.email@example.com"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                                    placeholder="Enter your password"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <LogIn className="h-5 w-5" />
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-300 dark:border-slate-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white dark:bg-slate-800 text-slate-500">Or continue with</span>
                        </div>
                    </div>

                    {/* Google Sign In */}
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="w-full bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Chrome className="h-5 w-5" />
                        Sign in with Google
                    </button>

                    {/* Developer Bypass */}
                    <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}
                        className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white font-black tracking-wider uppercase text-sm py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        🚀 Enter Demo Mode (Bypass Auth)
                    </button>

                    {/* Sign Up Link */}
                    <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-bold">
                            Sign up
                        </Link>
                    </p>
                </div>

                {/* Back to Home */}
                <div className="mt-6 text-center">
                    <Link to="/" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
