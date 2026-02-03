import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Sign up with email and password
    const signup = async (email, password) => {
        try {
            setError(null);
            const result = await createUserWithEmailAndPassword(auth, email, password);
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Login with email and password
    const login = async (email, password) => {
        try {
            setError(null);
            const result = await signInWithEmailAndPassword(auth, email, password);
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Sign in with Google
    const signInWithGoogle = async () => {
        try {
            setError(null);
            const result = await signInWithPopup(auth, googleProvider);
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Logout
    const logout = async () => {
        try {
            setError(null);
            await signOut(auth);
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        loading,
        error,
        signup,
        login,
        signInWithGoogle,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
