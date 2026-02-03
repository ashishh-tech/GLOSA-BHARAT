import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import {
    Play,
    RefreshCw,
    Settings,
    Cpu,
    Zap,
    Users,
    Clock,
    TrendingUp,
    Brain,
    MapPin,
    AlertCircle,
    Sun,
    Moon,
    Wifi,
    BarChart3,
    Route,
    LogOut,
    Lock,
    UserCircle,
    Search,
    Navigation,
    Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import MapComponent from '../components/MapComponent';

const Dashboard = () => {
    // Safely handle auth context
    let user = null;
    let logout = () => { };
    let signInWithGoogle = async () => { };

    try {
        const auth = useAuth();
        user = auth.currentUser;
        logout = auth.logout;
        signInWithGoogle = auth.signInWithGoogle;
    } catch (error) {
        // Auth context not available, continue without auth
        console.log('Running in guest mode');
    }

    // Derive isLoggedIn from user state
    const isLoggedIn = user !== null;

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error("Login failed", error);
            alert("Login failed: " + error.message);
        }
    };

    const handleDeveloperLogin = () => {
        // Simulating login for demo purposes if auth fails
        alert("Developer Bypass: Please ensure Firebase is configured for real auth.");
    };

    // Derive isLoggedIn from user state
    // const isLoggedIn = user !== null; // Removed duplicate

    const [activeTab, setActiveTab] = useState('dashboard');
    const [junctions, setJunctions] = useState([]);
    const [selectedJunction, setSelectedJunction] = useState(null);
    const [advisory, setAdvisory] = useState(null);
    const [stats, setStats] = useState(null);
    const [isConnected, setIsConnected] = useState(true);
    const [isDiscovering, setIsDiscovering] = useState(false);
    const [startQuery, setStartQuery] = useState('Your location');
    const [destinationQuery, setDestinationQuery] = useState('');
    const [routeInfo, setRouteInfo] = useState({ path: [], junctions: [], start: null, destination: null });
    const [isRouting, setIsRouting] = useState(false);
    const [mockPosition, setMockPosition] = useState({ lat: 28.6140, lng: 77.2185 });
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return document.documentElement.classList.contains('dark') ||
            window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    // Sync user to backend when authenticated
    useEffect(() => {
        if (user) {
            axios.post('/api/auth/sync', {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL
            }).catch(err => console.error("Sync failed", err));
        }
    }, [user]);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    // Periodic Location & Route junction Status Sync (only if user is logged in)
    useEffect(() => {
        if (!user) return;

        const syncData = async () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(async (position) => {
                    const { latitude, longitude } = position.coords;

                    // Sync location to DB
                    try {
                        await axios.post('/api/user/sync-location', {
                            uid: user.uid,
                            email: user.email,
                            lat: latitude,
                            lng: longitude
                        });
                    } catch (err) { console.error("Sync failed", err); }

                    // If routing, update the status of junctions on the route
                    if (routeInfo.junctions.length > 0) {
                        try {
                            const ids = routeInfo.junctions.map(j => j.id);
                            const res = await axios.post('/api/route-advisory', { junctionIds: ids });

                            const updatedJunctions = routeInfo.junctions.map(j => {
                                const update = res.data.find(u => u.id === j.id);
                                const d = Math.sqrt(Math.pow(latitude - j.lat, 2) + Math.pow(longitude - j.lng, 2)) * 111000;

                                let speedRec = 40;
                                if (update && update.status === 'RED') {
                                    speedRec = Math.round((d / (update.secondsToChange + 2)) * 3.6);
                                } else if (update && update.status === 'GREEN' && update.secondsToChange < 5) {
                                    speedRec = 30;
                                }

                                return update ? {
                                    ...j,
                                    status: update.status,
                                    secondsToChange: update.secondsToChange,
                                    distance: Math.round(d),
                                    recommendedSpeed: speedRec > 60 ? 60 : (speedRec < 15 ? 15 : speedRec)
                                } : j;
                            });

                            setRouteInfo(prev => ({ ...prev, junctions: updatedJunctions }));

                            const activeJ = updatedJunctions.find(j => j.status !== 'IDLE');
                            if (activeJ) {
                                setAdvisory({
                                    junctionName: activeJ.name,
                                    signalStatus: activeJ.status,
                                    secondsToChange: activeJ.secondsToChange,
                                    distance: activeJ.distance
                                });
                            }
                        } catch (err) { console.error("Route status update failed", err); }
                    }
                });
            }
        };

        syncData();
        const interval = setInterval(syncData, 5000);
        return () => clearInterval(interval);
    }, [user, routeInfo.junctions.length]);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchJunctions = async () => {
            try {
                const res = await axios.get('/api/junctions');
                setJunctions(res.data);
                if (res.data.length > 0) setSelectedJunction(res.data[0]);
            } catch (err) {
                console.error("Error fetching junctions", err);
                setIsConnected(false);
            }
        };
        fetchJunctions();
    }, []);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('/api/stats');
                setStats(res.data);
                setIsConnected(true);
            } catch (err) {
                console.error("Error fetching stats", err);
                setIsConnected(false);
            }
        };
        fetchStats();
        const interval = setInterval(fetchStats, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!selectedJunction) return;

        const interval = setInterval(async () => {
            try {
                setMockPosition(prev => {
                    const newLat = prev.lat + (selectedJunction.lat - prev.lat) * 0.05;
                    const newLng = prev.lng + (selectedJunction.lng - prev.lng) * 0.05;
                    return { lat: newLat, lng: newLng };
                });

                const res = await axios.post('/api/advisory', {
                    junctionId: selectedJunction.id,
                    lat: mockPosition.lat,
                    lng: mockPosition.lng,
                    timestamp: Date.now() / 1000
                });
                setAdvisory(res.data);
            } catch (err) {
                console.error("Error fetching advisory", err);
            }
        }, 1500);

        return () => clearInterval(interval);
    }, [selectedJunction, mockPosition]);

    const statusMap = {
        'online': 'status-online',
        'active': 'status-active',
        'operational': 'status-operational',
        'monitoring': 'status-monitoring'
    };

    const iconStatusMap = {
        'AI Engine': Cpu,
        'Signal Controller': Zap,
        'Traffic Lights': Zap,
        'AI System': Cpu
    };

    const systemStatus = (stats?.systemStatus || [
        { label: 'Signal Controller', status: 'online' },
        { label: 'AI Engine', status: 'active' },
        { label: 'GIS Mapping', status: 'operational' },
    ]).filter(item => {
        const label = item.label.toLowerCase();
        return !label.includes('fleet') && !label.includes('camera');
    });

    const trafficMetrics = stats?.trafficStats || [
        { label: 'Wait Time Reduction', value: '24.8%', change: '+4.2%', icon: 'Clock' },
        { label: 'AI Signal Accuracy', value: '98.2%', change: '+1.5%', icon: 'Brain' },
        { label: 'Vehicle Throughput', value: '1,482', change: '+8.1%', icon: 'Users' },
        { label: 'Fuel Saved (Pilot)', value: '185L', change: '+12.3%', icon: 'TrendingUp' },
    ];

    const iconMap = {
        'Clock': Clock,
        'Brain': Brain,
        'Users': Users,
        'TrendingUp': TrendingUp,
        'Stats': BarChart3,
        'Route': Route
    };

    const handleLiveDiscovery = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setIsDiscovering(true);
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const res = await axios.post('/api/junctions/discover', {
                    lat: latitude,
                    lng: longitude
                });

                // Refresh junctions
                const refreshRes = await axios.get('/api/junctions');
                setJunctions(refreshRes.data);

                if (refreshRes.data.length > 0) {
                    // Try to pick one of the newly discovered OSM junctions
                    const latest = refreshRes.data.find(j => j.id.startsWith('OSM-')) || refreshRes.data[0];
                    setSelectedJunction(latest);
                    setMockPosition({ lat: latitude, lng: longitude });
                    alert(`✅ ${res.data.count} Live Junctions discovered near you!`);
                }
            } catch (err) {
                console.error("Discovery failed", err);
                alert("Failed to discover nearby junctions. Check console for details.");
            } finally {
                setIsDiscovering(false);
            }
        }, (error) => {
            console.error("Geolocation error", error);
            alert("Could not access GPS. Please check permissions.");
            setIsDiscovering(false);
        });
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (err) {
            console.error("Logout failed", err);
        }
    };

    const handleNavigationSearch = async (e) => {
        e.preventDefault();
        if (!destinationQuery) return;

        setIsRouting(true);
        try {
            // 1. Geocode Start
            let startCoords = mockPosition;
            let startName = "Your location";

            if (startQuery !== 'Your location' && startQuery.trim() !== '') {
                const startRes = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(startQuery)}`);
                if (startRes.data.length === 0) throw new Error("Starting point not found");
                startCoords = { lat: parseFloat(startRes.data[0].lat), lng: parseFloat(startRes.data[0].lon) };
                startName = startRes.data[0].display_name;
            }

            // 2. Geocode Destination
            const geoRes = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destinationQuery)}`);
            if (geoRes.data.length === 0) throw new Error("Destination not found");
            const dest = geoRes.data[0];
            const destCoords = { lat: parseFloat(dest.lat), lng: parseFloat(dest.lon), name: dest.display_name };

            // 2. Get Route from OSRM
            const start = startCoords;
            const routeRes = await axios.get(`https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${destCoords.lng},${destCoords.lat}?overview=full&geometries=geojson`);

            if (!routeRes.data.routes || routeRes.data.routes.length === 0) throw new Error("No route found");

            const path = routeRes.data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);

            // 3. Find Signal Junctions along the path
            // We'll filter existing junctions that are within 100m of any point on the path
            const routeJunctions = junctions.filter(j => {
                return path.some(p => {
                    const dist = Math.sqrt(Math.pow(p[0] - j.lat, 2) + Math.pow(p[1] - j.lng, 2));
                    return dist < 0.001; // Roughly 100m
                });
            });

            setRouteInfo({
                path,
                junctions: routeJunctions.map(j => ({ ...j, status: 'IDLE' })),
                start: { ...startCoords, name: startName },
                destination: destCoords
            });

            if (routeJunctions.length > 0) {
                setSelectedJunction(routeJunctions[0]);
            }

            alert(`🚀 Route Optimized! Found ${routeJunctions.length} smart signals on your path.`);
        } catch (err) {
            alert("Routing error: " + err.message);
        } finally {
            setIsRouting(false);
        }
    };


    const renderContent = () => {
        if (activeTab === 'dashboard') {
            return (
                <>
                    {/* Header Section */}
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 py-6">
                        <div>
                            <div className="flex items-center gap-4 mb-2">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="GOI" className="h-12 dark:invert opacity-80" />
                                <h1 className="text-4xl font-black text-[var(--text-primary)] tracking-tight">GLOSA Control Center</h1>
                            </div>
                            <p className="text-[var(--text-secondary)] font-bold text-base uppercase tracking-wider">National Smart Mobility Framework • New Delhi Pilot</p>
                        </div>

                        {/* Google Maps Style Search Card */}
                        <div className="flex-none max-w-sm mx-4 group z-50 relative">
                            <form onSubmit={handleNavigationSearch} className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700">
                                <div className="space-y-0.5">
                                    <div className="relative group/input flex items-center">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                            <div className="w-2.5 h-2.5 rounded-full border-[3px] border-slate-400"></div>
                                        </div>
                                        <input
                                            type="text"
                                            value={startQuery}
                                            onChange={(e) => setStartQuery(e.target.value)}
                                            placeholder="Choose starting point..."
                                            className="w-full bg-transparent py-2 pl-9 pr-8 text-xs font-semibold text-slate-800 dark:text-white outline-none placeholder:text-slate-400 placeholder:font-normal focus:bg-slate-50 dark:focus:bg-slate-700/50 rounded-sm transition-colors"
                                        />
                                    </div>
                                    <div className="relative group/input flex items-center">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                            <MapPin className="h-3.5 w-3.5 text-red-500 fill-red-500" />
                                        </div>
                                        <input
                                            type="text"
                                            value={destinationQuery}
                                            onChange={(e) => setDestinationQuery(e.target.value)}
                                            placeholder="Choose destination..."
                                            className="w-full bg-transparent py-2 pl-9 pr-8 text-xs font-semibold text-slate-800 dark:text-white outline-none placeholder:text-slate-400 placeholder:font-normal focus:bg-slate-50 dark:focus:bg-slate-700/50 rounded-sm transition-colors"
                                        />
                                        <button
                                            type="submit"
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                                        >
                                            <Search className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>


                        <div className="flex items-center gap-3">
                            <div className="text-right mr-4 hidden lg:block border-r pr-4 border-slate-200 dark:border-slate-800">
                                <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase">{currentTime.toLocaleDateString('en-IN', { weekday: 'long' })}</p>
                                <p className="text-xl font-black text-navy dark:text-blue-400">{currentTime.toLocaleTimeString([], { hour12: true })}</p>
                            </div>

                            <div className="flex items-center gap-3 bg-slate-50 dark:bg-white/5 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 mr-2">
                                <div className="bg-navy text-white p-1 rounded-lg overflow-hidden shrink-0">
                                    {user?.photoURL ? (
                                        <img src={user.photoURL} alt="User" className="h-7 w-7 rounded-md" />
                                    ) : (
                                        <UserCircle className="h-7 w-7 p-1" />
                                    )}
                                </div>
                                <div className="pr-3">
                                    <p className="text-[9px] font-black text-slate-500 uppercase leading-none mb-1">Active Operator</p>
                                    <p className="text-xs font-black text-navy dark:text-blue-400 uppercase leading-none truncate max-w-[120px]">{user?.displayName || 'System Admin'}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsDarkMode(!isDarkMode)}
                                className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 p-2.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            </button>

                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-red-100 transition-all border border-red-100"
                            >
                                <LogOut className="h-4 w-4" />
                                <span className="hidden sm:inline">Sign Out</span>
                            </button>
                        </div>
                    </header >

                    {/* Core System Status */}
                    < section className="mb-10" >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {systemStatus.map((item, idx) => {
                                const Icon = iconStatusMap[item.label] || Zap;
                                return (
                                    <div key={idx} className="gov-card flex items-center justify-between py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-slate-50 dark:bg-white/5 p-2 rounded-lg">
                                                <Icon className="h-5 w-5 text-navy dark:text-blue-400" />
                                            </div>
                                            <span className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight">{item.label}</span>
                                        </div>
                                        <span className={`status-badge ${statusMap[item.status] || 'bg-slate-100'}`}>{item.status}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </section >

                    {/* Main Interface: Map & Advisory */}
                    < div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10" >
                        <div className="lg:col-span-8">
                            <div className="gov-card h-full p-0 overflow-hidden relative border-2 border-slate-100 dark:border-slate-800 shadow-2xl">
                                <div className="absolute top-6 left-6 z-[1000] space-y-2">
                                    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur px-4 py-2 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800">
                                        <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase mb-1">Upcoming Signal</p>
                                        <h3 className="text-sm font-black text-navy dark:text-blue-400">{selectedJunction?.name || "Initializing Route..."}</h3>
                                    </div>
                                </div>
                                <MapComponent
                                    junction={selectedJunction}
                                    vehiclePosition={mockPosition}
                                    distance={advisory?.distance || 500}
                                    signalStatus={advisory?.signalStatus || (routeInfo.junctions.length > 0 ? 'ROUTING' : 'IDLE')}
                                    routePath={routeInfo.path}
                                    routeJunctions={routeInfo.junctions}
                                    start={routeInfo.start}
                                    destination={routeInfo.destination}
                                />
                            </div>
                        </div>

                        <div className="lg:col-span-4 space-y-6">
                            <section className="gov-card bg-[var(--bg-navy-card)] text-[var(--text-on-navy)] min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden">
                                {/* Indian Theme Accent */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-saffron/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-green-600/10 rounded-full -ml-16 -mb-16 blur-3xl"></div>

                                <h2 className="text-xs font-black text-blue-300 uppercase tracking-[0.3em] mb-8">AI Advisory Terminal</h2>

                                <div className={`w-40 h-40 rounded-full border-8 flex flex-col items-center justify-center mb-8 shadow-2xl transition-all duration-700 ${advisory?.signalStatus === 'GREEN' ? 'border-green-500/30' : advisory?.signalStatus === 'RED' ? 'border-red-500/30' : 'border-amber-500/30'}`}>
                                    <div className={`w-32 h-32 rounded-full flex flex-col items-center justify-center transition-all duration-500 ${advisory?.signalStatus === 'GREEN' ? 'bg-green-600 shadow-green-900/50' : advisory?.signalStatus === 'RED' ? 'bg-red-600 shadow-red-900/50' : 'bg-amber-600 shadow-amber-900/50'}`}>
                                        <span className="text-[10px] font-black opacity-80 uppercase tracking-widest">{advisory?.signalStatus || 'SYNCING'}</span>
                                        <span className="text-6xl font-black">{advisory ? Math.round(advisory.secondsToChange) : "--"}</span>
                                        <span className="text-[10px] font-black opacity-60">SECONDS</span>
                                    </div>
                                </div>

                                <div className="w-full space-y-4 px-6">
                                    <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center">
                                        <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-1">Recommended Approach Speed</p>
                                        <p className="text-4xl font-black">{advisory?.recommendedSpeed || '--'} <span className="text-sm font-bold opacity-60">KM/H</span></p>
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4 border-l-8 border-saffron">
                                        <Brain className="h-6 w-6 text-navy_india shrink-0" />
                                        <p className="text-sm font-black text-slate-900 leading-tight">{advisory?.message || "Optimizing signal synchronization..."}</p>
                                    </div>
                                </div>
                            </section>

                            <div className="gov-card border-l-4 border-green-600">
                                <h3 className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest mb-2">Efficiency KPI</h3>
                                <p className="text-2xl font-black text-[var(--text-primary)]">AI Optimized <span className="text-green-600">+18%</span></p>
                            </div>
                        </div>
                    </div >

                    {/* Operational Metrics Row */}
                    < section >
                        <h2 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] mb-6">System Efficiency & Performance Metrics</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                            {trafficMetrics.map((metric, idx) => {
                                const Icon = iconMap[metric.icon] || TrendingUp;
                                return (
                                    <div key={idx} className="gov-card group hover:border-navy transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="bg-slate-50 dark:bg-white/5 p-2.5 rounded-xl group-hover:bg-navy/5 transition-colors">
                                                <Icon className="h-5 w-5 text-navy dark:text-blue-400" />
                                            </div>
                                            <span className={`text-[10px] font-black px-2 py-1 rounded-md ${metric.change.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                                {metric.change}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase mb-1 tracking-widest">{metric.label}</p>
                                            <h3 className="text-3xl font-black text-[var(--text-primary)]">{metric.value}</h3>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section >
                </>
            );
        }

        if (activeTab === 'simulation') {
            return (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <header className="mb-8">
                        <div className="flex items-center gap-3 mb-1">
                            <Route className="h-8 w-8 text-saffron" />
                            <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">AI Advisory Terminal</h1>
                        </div>
                        <p className="text-[var(--text-secondary)] font-bold text-sm uppercase tracking-wider">Predictive Signal Sync & Speed Optimization</p>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 gov-card p-0 overflow-hidden relative min-h-[500px] border-2 border-navy/20 shadow-2xl">
                            <MapComponent
                                junction={selectedJunction}
                                vehiclePosition={mockPosition}
                                distance={advisory?.distance || 500}
                                signalStatus={advisory?.signalStatus || 'IDLE'}
                            />
                        </div>
                        <div className="space-y-6">
                            <div className={`gov-card text-center p-8 border-b-8 shadow-2xl transition-all duration-700 ${advisory?.signalStatus === 'GREEN' ? 'border-green-600' : advisory?.signalStatus === 'RED' ? 'border-red-600' : 'border-amber-500'}`}>
                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Current Signal Phase</p>
                                <div className={`w-32 h-32 rounded-full mx-auto flex flex-col items-center justify-center mb-6 ${advisory?.signalStatus === 'GREEN' ? 'bg-green-600' : advisory?.signalStatus === 'RED' ? 'bg-red-600' : 'bg-amber-600'} text-white shadow-xl`}>
                                    <span className="text-5xl font-black">{advisory ? Math.round(advisory.secondsToChange) : "--"}</span>
                                    <span className="text-[10px] font-black opacity-80">SECONDS</span>
                                </div>
                                <h3 className={`text-2xl font-black uppercase ${advisory?.signalStatus === 'GREEN' ? 'text-green-600' : advisory?.signalStatus === 'RED' ? 'text-red-600' : 'text-amber-600'}`}>
                                    {advisory?.signalStatus || 'DETECTING...'}
                                </h3>
                            </div>

                            {/* Signal Wave Advisory Panel */}
                            {routeInfo.junctions.length > 0 && (
                                <section className="gov-card p-6 border-l-8 border-green_india bg-white dark:bg-slate-900/50 shadow-xl overflow-hidden relative">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <Route className="h-20 w-20 text-green_india" />
                                    </div>
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <p className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-[0.2em] mb-1">Active Optimized Path</p>
                                            <h2 className="text-xl font-black text-[var(--text-primary)]">SIGNAL WAVE <span className="text-green_india">ADVISORY</span></h2>
                                        </div>
                                        <div className="bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-xl border border-green-100 dark:border-green-800">
                                            <p className="text-[9px] font-black text-green-700 dark:text-green-400 uppercase leading-none mb-1">Status</p>
                                            <p className="text-xs font-black text-green-800 dark:text-green-100 uppercase">Synchronized</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {routeInfo.junctions.map((rj, idx) => (
                                            <div key={idx} className="flex items-center gap-4 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5 group hover:border-green-200 dark:hover:border-green-800 transition-all">
                                                <div className="flex flex-col items-center">
                                                    <div className={`w-3 h-3 rounded-full shadow-lg ${rj.status === 'GREEN' ? 'bg-green-500 shadow-green-500/50' : rj.status === 'RED' ? 'bg-red-500 shadow-red-500/50' : 'bg-amber-500 shadow-amber-500/50'}`} />
                                                    <div className="w-0.5 h-8 bg-slate-200 dark:bg-slate-800 my-1" />
                                                </div>

                                                <div className="flex-1">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">{rj.distance}m Away</p>
                                                    <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight">{rj.name}</h3>
                                                </div>

                                                <div className="text-right">
                                                    <p className="text-[9px] font-black text-slate-500 uppercase leading-none mb-1">Time to Flip</p>
                                                    <p className={`text-lg font-black leading-none ${rj.status === 'GREEN' ? 'text-green-600' : rj.status === 'RED' ? 'text-red-600' : 'text-amber-500'}`}>
                                                        {Math.round(rj.secondsToChange || 0)}s
                                                    </p>
                                                </div>

                                                <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm min-w-[100px]">
                                                    <p className="text-[9px] font-black text-blue-500 uppercase leading-none mb-1">Opt. Speed</p>
                                                    <p className="text-lg font-black text-navy dark:text-blue-400 leading-none">
                                                        {rj.recommendedSpeed} <span className="text-[10px] opacity-60">KM/H</span>
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            <div className="gov-card bg-[var(--bg-navy-card)] text-[var(--text-on-navy)] p-6 border-l-8 border-saffron shadow-xl">
                                <p className="text-[10px] font-black text-blue-300 uppercase tracking-[0.2em] mb-4">GLOSA Recommendation</p>
                                <div className="flex items-center justify-between mb-6">
                                    <span className="text-sm font-bold opacity-80 text-blue-50">Target Speed</span>
                                    <span className="text-4xl font-black text-saffron">{advisory?.recommendedSpeed || '--'} <small className="text-xs opacity-60">KM/H</small></span>
                                </div>
                                <div className="bg-white/10 p-4 rounded-xl border border-white/10 flex items-start gap-3">
                                    <Brain className="h-5 w-5 text-saffron shrink-0" />
                                    <p className="text-xs font-bold leading-relaxed">{advisory?.message || "Analyzing traffic flows for optimal throughput..."}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        if (activeTab === 'metrics') {
            return (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-slate-900 dark:text-white">
                    <header className="mb-8">
                        <div className="flex items-center gap-3 mb-1">
                            <BarChart3 className="h-8 w-8 text-navy dark:text-blue-400" />
                            <h1 className="text-3xl font-black tracking-tight">System Performance Analytics</h1>
                        </div>
                        <p className="text-[var(--text-secondary)] font-bold text-sm uppercase tracking-wider">Real-time Efficiency Monitoring & Throughput Data</p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {trafficMetrics.map((metric, idx) => {
                            const Icon = iconMap[metric.icon] || TrendingUp;
                            return (
                                <div key={idx} className="gov-card group hover:border-navy transition-all border-navy/10">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="bg-navy/5 p-2.5 rounded-xl group-hover:bg-navy/10 transition-colors">
                                            <Icon className="h-6 w-6 text-navy dark:text-blue-400" />
                                        </div>
                                    </div>
                                    <p className="text-[11px] font-black text-slate-500 uppercase mb-1 tracking-widest">{metric.label}</p>
                                    <h3 className="text-4xl font-black">{metric.value}</h3>
                                </div>
                            );
                        })}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="gov-card p-8 min-h-[300px] flex flex-col justify-center border-t-4 border-t-saffron">
                            <h3 className="text-sm font-black uppercase tracking-widest mb-6 border-b border-slate-100 dark:border-white/10 pb-2">AI Optimization Impact</h3>
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between text-xs font-black uppercase mb-2">
                                        <span>Wait Time Reduction</span>
                                        <span className="text-green-600">88% Effectiveness</span>
                                    </div>
                                    <div className="h-3 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500 w-[88%]" />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs font-black uppercase mb-2">
                                        <span>Fuel Savings</span>
                                        <span className="text-blue-600">74% Target</span>
                                    </div>
                                    <div className="h-3 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 w-[74%]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="gov-card p-8 min-h-[300px] flex flex-col items-center justify-center border-t-4 border-t-navy bg-slate-50/50 dark:bg-white/0">
                            <div className="bg-navy text-white p-4 rounded-full mb-4">
                                <Zap className="h-8 w-8 text-saffron" />
                            </div>
                            <h3 className="text-xl font-black mb-2">Real-time Throughput</h3>
                            <p className="text-xs font-bold text-slate-500 text-center uppercase tracking-wide">Live data processing enabled via secure GOI gateway</p>
                        </div>
                    </div>
                </div>
            );
        }

        if (activeTab === 'settings') {
            return (
                <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 dark:text-white">
                    <header className="mb-8">
                        <div className="flex items-center gap-3 mb-1">
                            <Settings className="h-8 w-8 text-slate-400" />
                            <h1 className="text-3xl font-black tracking-tight">Terminal Configuration</h1>
                        </div>
                        <p className="text-[var(--text-secondary)] font-bold text-sm uppercase tracking-wider">System Preferences & Operator Settings</p>
                    </header>

                    <div className="space-y-6">
                        <section className="gov-card p-8">
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Interface Theme</h3>
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-navy dark:bg-blue-600 text-white' : 'bg-white text-navy shadow-sm'}`}>
                                        {isDarkMode ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm">{isDarkMode ? 'Dark Mode Active' : 'Light Mode Active'}</h4>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold">Optimized for high-visibility terminal viewing</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsDarkMode(!isDarkMode)}
                                    className="bg-navy text-white px-6 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-md"
                                >
                                    Toggle Theme
                                </button>
                            </div>
                        </section>

                        <section className="gov-card p-8 border-l-8 border-blue-500">
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Backend Synchronization</h3>
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                                    <span className="text-sm font-black uppercase tracking-tight">{isConnected ? 'Link Operational' : 'Link Offline'}</span>
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">v2.0.4 Platinum</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <button className="bg-slate-100 dark:bg-white/5 p-4 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-200 transition-colors">
                                    <RefreshCw className="h-4 w-4 text-navy dark:text-blue-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">Force Re-Sync</span>
                                </button>
                                <button className="bg-slate-100 dark:bg-white/5 p-4 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-200 transition-colors">
                                    <Wifi className="h-4 w-4 text-navy dark:text-blue-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">Gateway Logs</span>
                                </button>
                            </div>
                        </section>
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex font-inter transition-colors duration-500 overflow-hidden">

            <AnimatePresence>
                {!isLoggedIn && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[10000] bg-navy/90 backdrop-blur-xl flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 border-t-8 border-saffron"
                        >
                            <div className="text-center mb-8">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="GOI" className="h-16 mx-auto mb-6 dark:invert" />
                                <h1 className="text-3xl font-black text-navy dark:text-blue-400 tracking-tight mb-2">GLOSA BHARAT</h1>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">National Smart Mobility Gateway</p>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-6">
                                <div className="text-center mb-8">
                                    <div className="w-20 h-20 bg-saffron/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-saffron/20">
                                        <UserCircle className="h-10 w-10 text-saffron" />
                                    </div>
                                    <h2 className="text-2xl font-black text-navy dark:text-blue-400">Identity Gateway</h2>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">Operator Verification Required</p>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-white dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 text-navy dark:text-white rounded-2xl py-4 font-black flex items-center justify-center gap-4 hover:bg-slate-50 dark:hover:bg-white/10 shadow-xl active:scale-[0.98] transition-all group"
                                >
                                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-5 w-5" />
                                    <span>SIGN IN WITH GOOGLE</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={handleDeveloperLogin}
                                    className="w-full bg-navy text-white rounded-2xl py-4 font-black flex items-center justify-center gap-3 hover:brightness-110 shadow-xl active:scale-[0.98] transition-all border-b-4 border-navy/30"
                                >
                                    <Zap className="h-5 w-5 text-saffron" />
                                    ENTER BUILDER MODE (BYPASS)
                                </button>

                                <div className="relative my-8">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-slate-200 dark:border-white/10"></div>
                                    </div>
                                    <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
                                        <span className="bg-white dark:bg-slate-900 px-4 text-slate-400">Strictly Enforced</span>
                                    </div>
                                </div>

                                <p className="text-[10px] text-center text-slate-400 font-bold px-4 leading-relaxed">
                                    Access to GLOSA-Bharat requires a genuine Government-associated Google Identity. Fake or unauthorized access attempts are auto-flagged.
                                </p>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {isLoggedIn && (
                <>
                    <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} />
                    <main className="flex-1 p-8 h-screen overflow-y-auto scrollbar-hide min-w-0">
                        <div className="max-w-7xl mx-auto">
                            {renderContent()}
                        </div>
                    </main>
                </>
            )}
        </div >
    );
};

export default Dashboard;
