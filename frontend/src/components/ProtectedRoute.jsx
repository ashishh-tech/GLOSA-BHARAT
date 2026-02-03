import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { currentUser, loading } = useAuth();
    const location = useLocation();

    console.log('ProtectedRoute - Loading:', loading, 'User:', currentUser);

    if (loading) {
        console.log('ProtectedRoute - Showing loading screen');
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="text-center">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    <p className="mt-4 text-slate-600 dark:text-slate-400 font-bold">Loading...</p>
                </div>
            </div>
        );
    }

    if (!currentUser) {
        console.log('ProtectedRoute - No user, redirecting to login');
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    console.log('ProtectedRoute - User authenticated, rendering children');
    return children;
};

export default ProtectedRoute;
