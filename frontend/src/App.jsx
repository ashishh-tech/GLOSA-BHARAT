import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MobileRiderView from './pages/MobileRiderView';
import axios from 'axios';

// Prevent HTML responses from Cloudflare Pages from crashing the app when APIs are unreachable
axios.interceptors.response.use(
    (response) => {
        if (typeof response.data === 'string' && response.data.trim().startsWith('<')) {
            return Promise.reject(new Error('API returned HTML instead of JSON. Assuming offline.'));
        }
        return response;
    },
    (error) => Promise.reject(error)
);

function App() {
    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <div className="min-h-screen">
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/rider" element={<MobileRiderView />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
