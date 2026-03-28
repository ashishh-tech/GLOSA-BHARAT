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
    Compass,
    Bus,
    BarChart2,
    GitMerge,
    Footprints,
    Train,
    Leaf,
    Flame,
    Activity,
    ArrowRight,
    ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
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
        // Default to dark mode for the demo — looks far more impressive
        const saved = localStorage.getItem('glosa-dark');
        if (saved !== null) return saved === 'true';
        return true; // dark by default
    });
    // New feature state
    const [transitData, setTransitData] = useState(null);
    const [demandData, setDemandData] = useState(null);
    const [multimodalData, setMultimodalData] = useState(null);
    const [selectedJourney, setSelectedJourney] = useState(0);
    const [toast, setToast] = useState(null); // { msg, type: 'success'|'error' }

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4500);
    };

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
        localStorage.setItem('glosa-dark', String(isDarkMode));
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
                    } catch (_) { /* silent — non-critical location sync */ }

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
                        } catch (_) { /* silent — route advisory is non-critical */ }
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
            } catch (_) {
                setIsConnected(false); // silent — backend may not be running yet
            }
        };
        fetchJunctions();
    }, []);

    useEffect(() => {
        let failCount = 0;
        const fetchStats = async () => {
            try {
                const res = await axios.get('/api/stats');
                setStats(res.data);
                setIsConnected(true);
                failCount = 0;
            } catch (_) {
                failCount++;
                if (failCount >= 3) setIsConnected(false);
            }
        };
        fetchStats();
        const interval = setInterval(fetchStats, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchNewFeatures = async () => {
            try {
                const startName = routeInfo.start?.name || 'Your Location';
                const destName = routeInfo.destination?.name || 'Destination';

                const [tRes, dRes, mRes] = await Promise.all([
                    axios.get(`/api/transit?start=${encodeURIComponent(startName)}&dest=${encodeURIComponent(destName)}`),
                    axios.get(`/api/demand?loc=${encodeURIComponent(startName)}`),
                    axios.get(`/api/multimodal?start=${encodeURIComponent(startName)}&dest=${encodeURIComponent(destName)}`)
                ]);
                setTransitData(tRes.data);
                setDemandData(dRes.data);
                setMultimodalData(mRes.data);
            } catch (_) {
                // silent — transit/demand/multimodal data is non-critical, backend may be starting
            }
        };
        fetchNewFeatures();
        const interval = setInterval(fetchNewFeatures, 60000); // 60s — 3 concurrent calls, be gentle
        return () => clearInterval(interval);
    }, [routeInfo.start?.name, routeInfo.destination?.name, activeTab]);

    // Advisory polling — every 5s from server, smooth local countdown in between
    useEffect(() => {
        if (!selectedJunction) return;

        const poll = async () => {
            try {
                // Move mock vehicle toward junction on each poll
                setMockPosition(prev => ({
                    lat: prev.lat + (selectedJunction.lat - prev.lat) * 0.05,
                    lng: prev.lng + (selectedJunction.lng - prev.lng) * 0.05
                }));

                const res = await axios.post('/api/advisory', {
                    junctionId: selectedJunction.id,
                    lat: mockPosition.lat,
                    lng: mockPosition.lng,
                    timestamp: Date.now() / 1000
                });
                // Only update if we got a valid response
                if (res.data && res.data.secondsToChange !== undefined) {
                    setAdvisory(res.data);
                }
            } catch (_) {
                // silent — AI advisory may be temporarily unavailable
            }
        };

        poll(); // immediate first call
        const pollInterval = setInterval(poll, 5000); // poll every 5s
        return () => clearInterval(pollInterval);
    }, [selectedJunction]); // ⚠️ intentionally omit mockPosition to avoid restart loop

    // Smooth local countdown — tick secondsToChange down every second between polls
    useEffect(() => {
        const tick = setInterval(() => {
            setAdvisory(prev => {
                if (!prev || prev.secondsToChange === undefined) return prev;
                const next = Math.max(0, prev.secondsToChange - 1);
                return { ...prev, secondsToChange: next };
            });
        }, 1000);
        return () => clearInterval(tick);
    }, []);

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
            // ── Step 1: Geocode Start ──────────────────────────────────────
            let startCoords = mockPosition;
            let startName = startQuery !== 'Your location' && startQuery.trim() !== ''
                ? startQuery.trim()
                : 'Your Location';

            if (startQuery !== 'Your location' && startQuery.trim() !== '') {
                const startRes = await axios.get(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(startQuery)}&limit=1&accept-language=en`
                );
                if (startRes.data.length > 0) {
                    startCoords = { lat: parseFloat(startRes.data[0].lat), lng: parseFloat(startRes.data[0].lon) };
                    startName = startRes.data[0].display_name;
                } else {
                    throw new Error(`"${startQuery}" not found — try a city/district name`);
                }
            }

            // ── Step 2: Geocode Destination ───────────────────────────────
            const geoRes = await axios.get(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destinationQuery)}&limit=1&accept-language=en`
            );
            if (geoRes.data.length === 0) throw new Error(`"${destinationQuery}" not found — try a city/district name`);
            const dest = geoRes.data[0];
            const destCoords = { lat: parseFloat(dest.lat), lng: parseFloat(dest.lon), name: dest.display_name };

            // ── Step 3: IMMEDIATELY update routeInfo with locations ───────
            // This triggers the multimodal/demand refetch regardless of routing success
            setRouteInfo(prev => ({
                ...prev,
                start: { ...startCoords, name: startName },
                destination: destCoords
            }));

            // ── Step 4: Try OSRM routing (non-blocking on failure) ────────
            let routeSuccess = false;
            try {
                const routeRes = await axios.get(
                    `https://router.project-osrm.org/route/v1/driving/${startCoords.lng},${startCoords.lat};${destCoords.lng},${destCoords.lat}?overview=full&geometries=geojson`
                );

                if (routeRes.data.routes && routeRes.data.routes.length > 0) {
                    const path = routeRes.data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
                    const routeJunctions = junctions.filter(j =>
                        path.some(p => Math.sqrt(Math.pow(p[0] - j.lat, 2) + Math.pow(p[1] - j.lng, 2)) < 0.001)
                    );

                    setRouteInfo(prev => ({
                        ...prev,
                        path,
                        junctions: routeJunctions.map(j => ({ ...j, status: 'IDLE' })),
                    }));

                    if (routeJunctions.length > 0) setSelectedJunction(routeJunctions[0]);
                    routeSuccess = true;
                }
            } catch (_) {
                // OSRM unavailable — locations are already set above, multimodal tabs will still work
            }

            const shortStart = startName.split(',')[0];
            const shortDest = destCoords.name.split(',')[0];
            showToast(
                routeSuccess
                    ? `🚀 Route: ${shortStart} → ${shortDest}`
                    : `📍 Locations set: ${shortStart} → ${shortDest}`
            );
        } catch (err) {
            showToast('⚠️ ' + err.message, 'error');
        } finally {
            setIsRouting(false);
        }
    };

    // Quick demo routes — one-click fills and submits the routing form
    const DEMO_ROUTES = [
        { label: '🏛️ India Gate → CP', start: 'India Gate, New Delhi', dest: 'Connaught Place, New Delhi' },
        { label: '🚉 Howrah Station → Park Street', start: 'Howrah Station, Kolkata', dest: 'Park Street, Kolkata' },
        { label: '✈️ BKC → CSIA Mumbai', start: 'Bandra Kurla Complex, Mumbai', dest: 'Chhatrapati Shivaji Maharaj International Airport, Mumbai' },
    ];

    const runDemoRoute = async (route) => {
        setStartQuery(route.start);
        setDestinationQuery(route.dest);
        // Trigger geocode + route immediately
        setIsRouting(true);
        try {
            const [sRes, dRes] = await Promise.all([
                axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(route.start)}&limit=1&accept-language=en`),
                axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(route.dest)}&limit=1&accept-language=en`)
            ]);
            if (!sRes.data.length || !dRes.data.length) { showToast('Could not geocode demo route', 'error'); return; }
            const startCoords = { lat: parseFloat(sRes.data[0].lat), lng: parseFloat(sRes.data[0].lon) };
            const destCoords = { lat: parseFloat(dRes.data[0].lat), lng: parseFloat(dRes.data[0].lon), name: dRes.data[0].display_name };
            setRouteInfo(prev => ({ ...prev, start: { ...startCoords, name: sRes.data[0].display_name }, destination: destCoords }));
            setMockPosition(startCoords);
            // Try OSRM
            try {
                const routeRes = await axios.get(`https://router.project-osrm.org/route/v1/driving/${startCoords.lng},${startCoords.lat};${destCoords.lng},${destCoords.lat}?overview=full&geometries=geojson`);
                if (routeRes.data.routes?.length) {
                    const path = routeRes.data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
                    const routeJunctions = junctions.filter(j => path.some(p => Math.sqrt(Math.pow(p[0] - j.lat, 2) + Math.pow(p[1] - j.lng, 2)) < 0.001));
                    setRouteInfo(prev => ({ ...prev, path, junctions: routeJunctions.map(j => ({ ...j, status: 'IDLE' })) }));
                    if (routeJunctions.length > 0) setSelectedJunction(routeJunctions[0]);
                }
            } catch (_) { /* OSRM unavailable */ }
            showToast(`✅ Demo route loaded: ${route.label}`);
        } catch (err) {
            showToast('⚠️ Demo route failed', 'error');
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
                                {/* Quick Demo Route Chips */}
                                <div className="flex flex-wrap gap-1.5 mt-1.5 px-1">
                                    {DEMO_ROUTES.map((r, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => runDemoRoute(r)}
                                            disabled={isRouting}
                                            className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-blue-500/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 border border-blue-300/30 hover:bg-blue-500/20 transition-all disabled:opacity-50"
                                        >
                                            {r.label}
                                        </button>
                                    ))}
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
                    </header>

                    {/* Toast Notification */}
                    {toast && (
                        <div className={`fixed top-5 right-5 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border text-sm font-bold transition-all animate-in slide-in-from-right-4 duration-300 ${toast.type === 'error'
                            ? 'bg-red-600 text-white border-red-500'
                            : 'bg-emerald-600 text-white border-emerald-500'
                            }`}>
                            <span>{toast.msg}</span>
                            <button onClick={() => setToast(null)} className="opacity-70 hover:opacity-100 ml-2 text-lg leading-none">&times;</button>
                        </div>
                    )}

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
                                routePath={routeInfo.path}
                                routeJunctions={routeInfo.junctions}
                                start={routeInfo.start}
                                destination={routeInfo.destination}
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

        // ── Transit Intelligence Tab ────────────────────────────────────────
        if (activeTab === 'public-transport') {
            const routes = transitData?.routes || [];
            const tsp = transitData?.tspStats || {};
            const modeColor = { bus: 'text-orange-500', metro: 'text-blue-500' };
            const modeBg = { bus: 'bg-orange-500/10 border-orange-500/20', metro: 'bg-blue-500/10 border-blue-500/20' };
            const occupancyColor = (o, cap) => {
                const pct = (o / cap) * 100;
                if (pct > 85) return 'bg-red-500';
                if (pct > 60) return 'bg-amber-500';
                return 'bg-green-500';
            };
            return (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <header className="mb-8">
                        <div className="flex items-center gap-3 mb-1">
                            <Bus className="h-8 w-8 text-orange-500" />
                            <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">Transit Intelligence Hub</h1>
                        </div>
                        <p className="text-[var(--text-secondary)] font-bold text-sm uppercase tracking-wider">Public Transport Monitoring &amp; Transit Signal Priority (TSP)</p>
                    </header>

                    {/* TSP Stats Row */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {[
                            { label: 'Active TSP Grants', value: tsp.activeGrants || 3, icon: ShieldCheck, color: 'text-green-500' },
                            { label: 'Avg Time Saved', value: tsp.timeSavedToday || '14.2 min', icon: Clock, color: 'text-blue-500' },
                            { label: 'Routes Optimized', value: tsp.routesOptimized || 8, icon: Route, color: 'text-violet-500' },
                            { label: 'On-Time Improvement', value: tsp.onTimeImprovement || '+22%', icon: TrendingUp, color: 'text-emerald-500' },
                        ].map((m, i) => (
                            <div key={i} className="gov-card flex items-center gap-4">
                                <div className="bg-slate-100 dark:bg-white/5 p-3 rounded-xl">
                                    <m.icon className={`h-6 w-6 ${m.color}`} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">{m.label}</p>
                                    <p className="text-xl font-black text-[var(--text-primary)]">{m.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Route Cards */}
                    <div className="space-y-4">
                        <h2 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em]">Live Route Status</h2>
                        {routes.map((route, i) => {
                            const pct = Math.round((route.occupancy / route.capacity) * 100);
                            return (
                                <div key={i} className={`gov-card border ${route.tspActive ? 'border-green-500/30 bg-green-500/5' : ''}`}>
                                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className={`p-3 rounded-xl border ${modeBg[route.type] || 'bg-slate-100'}`}>
                                                {route.type === 'bus'
                                                    ? <Bus className={`h-6 w-6 ${modeColor[route.type]}`} />
                                                    : <Train className={`h-6 w-6 ${modeColor[route.type]}`} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <p className="text-xs font-black text-[var(--text-primary)] truncate">{route.name}</p>
                                                    {route.tspActive && (
                                                        <span className="flex items-center gap-1 bg-green-500/10 text-green-600 border border-green-500/20 text-[9px] font-black uppercase px-2 py-0.5 rounded-full whitespace-nowrap">
                                                            <ShieldCheck className="h-3 w-3" /> TSP Active
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 text-[10px] text-[var(--text-secondary)] font-bold uppercase">
                                                    <span>{route.stops} stops</span>
                                                    <span>•</span>
                                                    <span>{route.km} km</span>
                                                    <span>•</span>
                                                    <span className={route.status === 'on-time' ? 'text-green-600' : 'text-red-500'}>
                                                        {route.status === 'on-time' ? '✓ On Time' : `⚠ +${route.delay} min delay`}
                                                    </span>
                                                </div>
                                                <div className="mt-2">
                                                    <div className="flex justify-between text-[10px] font-bold text-[var(--text-secondary)] mb-1">
                                                        <span>Occupancy</span>
                                                        <span>{route.occupancy}/{route.capacity} ({pct}%)</span>
                                                    </div>
                                                    <div className="h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all ${occupancyColor(route.occupancy, route.capacity)}`}
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 text-center shrink-0">
                                            <div>
                                                <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase">Next Arrivals</p>
                                                <p className="text-sm font-black text-[var(--text-primary)]">{(route.nextArrivals || []).map(n => `${n}m`).join(' · ')}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase">CO₂ Saved</p>
                                                <p className="text-sm font-black text-emerald-500">{route.co2Saved}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        }

        // ── Commuter Demand Analysis Tab ────────────────────────────────────
        if (activeTab === 'demand') {
            const FALLBACK_GRID = [
                { hour: '00:00', demand: 12, mode: 'low' }, { hour: '01:00', demand: 8, mode: 'low' },
                { hour: '02:00', demand: 6, mode: 'low' }, { hour: '03:00', demand: 5, mode: 'low' },
                { hour: '04:00', demand: 9, mode: 'low' }, { hour: '05:00', demand: 22, mode: 'low' },
                { hour: '06:00', demand: 48, mode: 'medium' }, { hour: '07:00', demand: 72, mode: 'high' },
                { hour: '08:00', demand: 91, mode: 'peak' }, { hour: '09:00', demand: 98, mode: 'peak' },
                { hour: '10:00', demand: 82, mode: 'high' }, { hour: '11:00', demand: 68, mode: 'high' },
                { hour: '12:00', demand: 61, mode: 'medium' }, { hour: '13:00', demand: 58, mode: 'medium' },
                { hour: '14:00', demand: 55, mode: 'medium' }, { hour: '15:00', demand: 60, mode: 'medium' },
                { hour: '16:00', demand: 74, mode: 'high' }, { hour: '17:00', demand: 88, mode: 'peak' },
                { hour: '18:00', demand: 96, mode: 'peak' }, { hour: '19:00', demand: 93, mode: 'peak' },
                { hour: '20:00', demand: 79, mode: 'high' }, { hour: '21:00', demand: 55, mode: 'medium' },
                { hour: '22:00', demand: 34, mode: 'low' }, { hour: '23:00', demand: 18, mode: 'low' },
            ];
            const grid = (demandData?.demandGrid?.length > 0) ? demandData.demandGrid : FALLBACK_GRID;
            const hotspots = demandData?.hotspots || [];
            const forecast = demandData?.forecast || {};
            const summary = demandData?.summary || {};
            const modeSplit = summary.modeSplit || { bus: 28, metro: 42, auto: 18, walk: 12 };
            const demandColor = { peak: 'bg-red-500', high: 'bg-orange-500', medium: 'bg-amber-400', low: 'bg-green-500' };
            const trendIcon = { rising: '↑', stable: '→', falling: '↓' };
            const trendColor = { rising: 'text-red-500', stable: 'text-amber-500', falling: 'text-green-500' };


            return (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <header className="mb-8">
                        <div className="flex items-center gap-3 mb-1">
                            <BarChart2 className="h-8 w-8 text-violet-500" />
                            <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">Commuter Demand Analysis</h1>
                        </div>
                        <p className="text-[var(--text-secondary)] font-bold text-sm uppercase tracking-wider">Traffic Pattern Analysis &amp; AI-Powered Demand Forecasting</p>
                    </header>

                    {/* Summary KPIs */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Total Commuters Today', value: summary.totalCommutersToday || '2.4M', icon: Users, color: 'text-blue-500' },
                            { label: 'Peak Hour Load', value: summary.peakHourLoad || '98%', icon: Activity, color: 'text-red-500' },
                            { label: 'Avg Wait Time', value: summary.avgWaitTime || '6.2 min', icon: Clock, color: 'text-amber-500' },
                            { label: 'AI Forecast', value: `${forecast.nextHour?.demand || 91}%`, icon: Brain, color: 'text-violet-500' },
                        ].map((m, i) => (
                            <div key={i} className="gov-card flex items-center gap-4">
                                <div className="bg-slate-100 dark:bg-white/5 p-3 rounded-xl">
                                    <m.icon className={`h-6 w-6 ${m.color}`} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">{m.label}</p>
                                    <p className="text-xl font-black text-[var(--text-primary)]">{m.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Demand Heatmap */}
                        <div className="lg:col-span-2 gov-card">
                            <h3 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] mb-6">Hourly Demand Heatmap</h3>
                            <div className="flex items-end gap-1.5" style={{ height: '160px' }}>
                                {grid.map((slot, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-end justify-end">
                                        <div
                                            className={`w-full rounded-t-sm ${demandColor[slot.mode] || 'bg-slate-400'} transition-all`}
                                            style={{ height: `${Math.round(slot.demand * 1.4)}px`, minHeight: '4px' }}
                                            title={`${slot.hour}: ${slot.demand}% demand`}
                                        />
                                        <p className="text-[8px] font-black text-[var(--text-secondary)] mt-1">{slot.hour.split(':')[0]}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-4 mt-4">
                                {[['peak', 'bg-red-500'], ['high', 'bg-orange-500'], ['medium', 'bg-amber-400'], ['low', 'bg-green-500']].map(([l, c]) => (
                                    <div key={l} className="flex items-center gap-1.5">
                                        <div className={`w-3 h-3 rounded-sm ${c}`} />
                                        <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase">{l}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Mode Split + Forecast */}
                        <div className="space-y-6">
                            <div className="gov-card">
                                <h3 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] mb-4">Mode Split</h3>
                                {Object.entries(modeSplit).map(([mode, pct]) => (
                                    <div key={mode} className="mb-3">
                                        <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                                            <span className="text-[var(--text-primary)] capitalize">{mode}</span>
                                            <span className="text-[var(--text-secondary)]">{pct}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="gov-card border-l-4 border-amber-500 bg-amber-500/5">
                                <p className="text-[10px] font-black text-amber-600 uppercase tracking-wider mb-2">AI Forecast — Next Hour</p>
                                <p className="text-2xl font-black text-[var(--text-primary)] mb-1">{forecast.nextHour?.demand || 91}% Load</p>
                                <p className="text-xs text-[var(--text-secondary)] font-bold mb-3">{forecast.nextHour?.label}</p>
                                <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <p className="text-[10px] font-black text-violet-500 uppercase mb-1">AI Recommendation</p>
                                    <p className="text-xs text-[var(--text-primary)] leading-relaxed">{forecast.recommendation}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Congestion Hotspots */}
                    <div>
                        <h2 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] mb-4">Congestion Hotspots</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {hotspots.map((h, i) => (
                                <div key={i} className="gov-card flex items-center gap-4">
                                    <div className="relative w-14 h-14 shrink-0">
                                        <svg className="w-14 h-14 -rotate-90">
                                            <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                                            <circle cx="28" cy="28" r="24" fill="none" stroke={h.congestion > 85 ? '#ef4444' : h.congestion > 65 ? '#f97316' : '#22c55e'} strokeWidth="4" strokeDasharray={`${h.congestion * 1.508} 150.8`} strokeLinecap="round" />
                                        </svg>
                                        <p className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-[var(--text-primary)]">{h.congestion}%</p>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-black text-[var(--text-primary)] truncate">{h.name}</p>
                                        <p className={`text-[10px] font-black uppercase mt-1 ${trendColor[h.trend]}`}>{trendIcon[h.trend]} {h.trend}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        // ── Multimodal Connectivity Planner Tab ─────────────────────────────
        if (activeTab === 'multimodal') {
            const startName = routeInfo.start?.name ? routeInfo.start.name.split(',')[0] : 'Current Location';
            const destName = routeInfo.destination?.name ? routeInfo.destination.name.split(',')[0] : 'Destination';

            const journeys = multimodalData?.journeys || [
                {
                    id: 'mock-1', label: 'Eco-Fastest (Metro + Walk)', recommended: true,
                    totalTime: '38 mins', totalDistance: '14.2 km', cost: '₹40', emissions: '-42% CO2',
                    legs: [
                        { mode: 'walk', from: startName, to: 'Central Transit Hub', duration: '5 mins', distance: '400m' },
                        { mode: 'metro', line: 'Rapid Line', from: 'Central Transit Hub', to: 'City Center', duration: '28 mins', distance: '13 km' },
                        { mode: 'walk', from: 'City Center', to: destName, duration: '5 mins', distance: '400m' }
                    ]
                },
                {
                    id: 'mock-2', label: 'Direct Bus (GLOSA Optimized)', recommended: false,
                    totalTime: '45 mins', totalDistance: '12 km', cost: '₹25', emissions: '-15% CO2',
                    legs: [
                        { mode: 'walk', from: startName, to: 'Bus Terminal A', duration: '3 mins', distance: '200m' },
                        { mode: 'bus', route: 'Express-7', from: 'Bus Terminal A', to: 'Bus Terminal B', duration: '40 mins', distance: '11.5 km', glosaAdvisory: { recommendedSpeed: 35, junctionsAhead: 6, signalStatus: 'GREEN' } },
                        { mode: 'walk', from: 'Bus Terminal B', to: destName, duration: '2 mins', distance: '150m' }
                    ]
                }
            ];
            const modeIcon = { walk: '🚶', bus: '🚌', metro: '🚇' };
            const modePill = {
                walk: 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300',
                bus: 'bg-orange-500/10 text-orange-600 border border-orange-500/20',
                metro: 'bg-blue-500/10 text-blue-600 border border-blue-500/20',
            };
            const signalBg = { GREEN: 'bg-green-600', AMBER: 'bg-amber-500', RED: 'bg-red-600' };

            return (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <header className="mb-8">
                        <div className="flex items-center gap-3 mb-1">
                            <GitMerge className="h-8 w-8 text-cyan-500" />
                            <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">Multimodal Connectivity Planner</h1>
                        </div>
                        <p className="text-[var(--text-secondary)] font-bold text-sm uppercase tracking-wider">Smart Journey Planning — Walk · Bus · Metro · GLOSA Signal Advisory</p>
                    </header>

                    {/* Journey selector */}
                    <div className="flex gap-3 flex-wrap">
                        {journeys.map((j, i) => (
                            <button
                                key={j.id}
                                onClick={() => setSelectedJourney(i)}
                                className={`px-5 py-2.5 rounded-xl font-black text-sm transition-all border-2 ${selectedJourney === i
                                    ? 'bg-cyan-600 text-white border-cyan-600 shadow-lg'
                                    : 'border-slate-200 dark:border-slate-700 text-[var(--text-secondary)] hover:border-cyan-500 hover:text-cyan-600'
                                    } ${j.recommended ? 'ring-2 ring-offset-2 ring-cyan-400' : ''}`}
                            >
                                {j.recommended && <span className="mr-1">⭐</span>}{j.label}
                            </button>
                        ))}
                    </div>

                    {journeys[selectedJourney] && (() => {
                        const j = journeys[selectedJourney];
                        return (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Journey Summary Card */}
                                <div className="gov-card border-t-4 border-t-cyan-500 flex flex-col gap-4">
                                    <h3 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em]">Journey Summary</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { label: 'Total Time', value: j.totalTime, icon: Clock },
                                            { label: 'Distance', value: j.totalDistance, icon: Route },
                                            { label: 'Est. Cost', value: j.cost, icon: TrendingUp },
                                            { label: 'Emissions', value: j.emissions, icon: Leaf },
                                        ].map((m, i) => (
                                            <div key={i} className="bg-slate-50 dark:bg-white/5 p-3 rounded-xl">
                                                <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase mb-0.5">{m.label}</p>
                                                <p className="text-sm font-black text-[var(--text-primary)]">{m.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                    {j.recommended && (
                                        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3 flex items-center gap-2">
                                            <ShieldCheck className="h-4 w-4 text-cyan-500 shrink-0" />
                                            <p className="text-[10px] font-black text-cyan-600 uppercase">AI Recommended Route</p>
                                        </div>
                                    )}
                                </div>

                                {/* Journey Legs */}
                                <div className="lg:col-span-2 space-y-3">
                                    <h3 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em]">Journey Legs</h3>
                                    {j.legs.map((leg, li) => (
                                        <div key={li} className="gov-card flex gap-4 items-start">
                                            <div className="flex flex-col items-center">
                                                <span className="text-2xl">{modeIcon[leg.mode] || '📍'}</span>
                                                {li < j.legs.length - 1 && <div className="w-0.5 h-8 bg-slate-200 dark:bg-slate-700 my-1" />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${modePill[leg.mode]}`}>{leg.mode}</span>
                                                    {leg.line && <span className="text-[10px] font-bold text-[var(--text-secondary)]">{leg.line}</span>}
                                                    {leg.route && <span className="text-[10px] font-bold text-orange-600">Route {leg.route}</span>}
                                                </div>
                                                <p className="text-xs font-black text-[var(--text-primary)]">{leg.from} <ArrowRight className="h-3 w-3 inline" /> {leg.to}</p>
                                                <p className="text-[10px] text-[var(--text-secondary)] font-bold mt-0.5">{leg.duration} · {leg.distance}</p>

                                                {/* GLOSA Advisory inline for road legs */}
                                                {leg.glosaAdvisory && (
                                                    <div className="mt-2 flex items-center gap-3 bg-slate-50 dark:bg-white/5 p-2.5 rounded-lg border border-slate-100 dark:border-white/5">
                                                        <div className={`w-8 h-8 rounded-full ${signalBg[leg.glosaAdvisory.signalStatus] || 'bg-amber-500'} flex items-center justify-center`}>
                                                            <Zap className="h-4 w-4 text-white" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase">GLOSA Advisory</p>
                                                            <p className="text-xs font-black text-[var(--text-primary)]">{leg.glosaAdvisory.recommendedSpeed} km/h · {leg.glosaAdvisory.junctionsAhead} signals ahead</p>
                                                        </div>
                                                        <span className={`ml-auto text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${leg.glosaAdvisory.signalStatus === 'GREEN' ? 'bg-green-100 text-green-700' :
                                                            leg.glosaAdvisory.signalStatus === 'AMBER' ? 'bg-amber-100 text-amber-700' :
                                                                'bg-red-100 text-red-700'
                                                            }`}>{leg.glosaAdvisory.signalStatus}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })()}
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
                    <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} isConnected={isConnected} />
                    <main className="flex-1 p-8 h-screen overflow-y-auto scrollbar-hide min-w-0">
                        <div className="max-w-7xl mx-auto">
                            {renderContent()}
                        </div>
                    </main>
                    {/* Floating Rider Mode Button */}
                    <Link
                        to="/rider"
                        className="fixed bottom-6 right-6 z-[9998] flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl font-black text-sm text-white transition-all hover:scale-105 active:scale-95 border border-white/10"
                        style={{
                            background: 'linear-gradient(135deg, #FF9933 0%, #1a237e 100%)',
                            boxShadow: '0 8px 32px rgba(255,153,51,0.35), 0 2px 8px rgba(0,0,0,0.4)'
                        }}
                        title="Open Rider Mode (Two-Wheeler Optimized View)"
                    >
                        <span style={{ fontSize: 18 }}>🏍️</span>
                        <span className="hidden sm:inline">Rider Mode</span>
                    </Link>
                </>
            )}
        </div >
    );
};

export default Dashboard;
