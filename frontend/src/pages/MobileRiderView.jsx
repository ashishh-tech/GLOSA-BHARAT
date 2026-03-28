import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import MapComponent from '../components/MapComponent';
import {
    Navigation,
    Search,
    MapPin,
    Zap,
    Brain,
    ChevronRight,
    X,
    AlignLeft,
    Gauge,
    Clock,
    ShieldCheck,
    Route,
    Activity,
    Wifi,
    WifiOff,
    LayoutDashboard,
    BarChart3,
    Bus,
    BarChart2,
    GitMerge,
    Settings,
    LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

// ─── Speed Gauge Ring ────────────────────────────────────────────
const SpeedGauge = ({ speed = 0, limit = 60, recommended = 40 }) => {
    const pct = Math.min(speed / Math.max(limit, 1), 1);
    const isOver = speed > limit;
    const radius = 54;
    const circ = 2 * Math.PI * radius;
    const dash = circ * pct;

    return (
        <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>
            <svg width={140} height={140} className="absolute" style={{ transform: 'rotate(-90deg)' }}>
                {/* Track */}
                <circle cx={70} cy={70} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={10} />
                {/* Fill */}
                <circle
                    cx={70} cy={70} r={radius} fill="none"
                    stroke={isOver ? '#ef4444' : speed > recommended ? '#f59e0b' : '#22c55e'}
                    strokeWidth={10}
                    strokeDasharray={`${dash} ${circ}`}
                    strokeLinecap="round"
                    style={{ transition: 'all 0.4s ease' }}
                />
            </svg>
            <div className="text-center z-10">
                <p className={`text-4xl font-black leading-none ${isOver ? 'text-red-400' : 'text-white'}`}>{Math.round(speed)}</p>
                <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">km/h</p>
            </div>
        </div>
    );
};

// ─── Signal Timer Ring ─────────────────────────────────────────
const SignalRing = ({ status, seconds }) => {
    const color = status === 'GREEN' ? '#22c55e' : status === 'RED' ? '#ef4444' : '#f59e0b';
    const ringBg = status === 'GREEN' ? 'rgba(34,197,94,0.15)' : status === 'RED' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)';
    return (
        <div className="flex flex-col items-center gap-1">
            <div
                className="w-16 h-16 rounded-full flex flex-col items-center justify-center font-black border-4"
                style={{ borderColor: color, background: ringBg, transition: 'all 0.5s' }}
            >
                <span className="text-2xl leading-none" style={{ color }}>{seconds !== undefined ? Math.round(seconds) : '--'}</span>
                <span className="text-[8px] opacity-60 text-white uppercase">sec</span>
            </div>
            <p className="text-[9px] font-black uppercase tracking-widest" style={{ color }}>{status || 'SYNCING'}</p>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────
const MobileRiderView = () => {
    let user = null;
    let logout = () => { };
    try {
        const auth = useAuth();
        user = auth.currentUser;
        logout = auth.logout;
    } catch (_) { }

    const navigate = useNavigate();

    /* ── State ── */
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [startQuery, setStartQuery] = useState('Your Location');
    const [destQuery, setDestQuery] = useState('');
    const [isRouting, setIsRouting] = useState(false);
    const [routeInfo, setRouteInfo] = useState({ path: [], junctions: [], start: null, destination: null });
    const [junctions, setJunctions] = useState([]);
    const [selectedJunction, setSelectedJunction] = useState(null);
    const [advisory, setAdvisory] = useState(null);
    const [isConnected, setIsConnected] = useState(true);
    // Default = India's geographic centre (Nagpur area). GPS will override this once available.
    const [mockPosition, setMockPosition] = useState({ lat: 21.1458, lng: 79.0882 });
    const [gpsReady, setGpsReady] = useState(false); // true once real GPS fires
    const [liveSpeed, setLiveSpeed] = useState(0);
    const [speedLimit, setSpeedLimit] = useState(50);
    const [showSearch, setShowSearch] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [toast, setToast] = useState(null);
    const watchIdRef = useRef(null);
    const prevPosRef = useRef(null);
    const prevTimeRef = useRef(null);

    /* ── Toast helper ── */
    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    /* ── Clock ── */
    useEffect(() => {
        const t = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    /* ── GPS speed tracking ── */
    // India bounding box — reject any geolocation fix outside this range.
    // Browser IP-based geolocation often returns China/Korea coords on first load.
    const INDIA_BOUNDS = { minLat: 6.0, maxLat: 37.6, minLng: 68.0, maxLng: 98.0 };
    const isWithinIndia = (lat, lng) =>
        lat >= INDIA_BOUNDS.minLat && lat <= INDIA_BOUNDS.maxLat &&
        lng >= INDIA_BOUNDS.minLng && lng <= INDIA_BOUNDS.maxLng;

    useEffect(() => {
        if (!navigator.geolocation) return;
        watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude: lat, longitude: lng, speed } = pos.coords;

                // ⚠ Ignore fixes outside India — browser often guesses from IP
                if (!isWithinIndia(lat, lng)) return;

                setMockPosition({ lat, lng });
                setGpsReady(true); // first valid Indian fix received
                if (speed !== null && speed >= 0) {
                    setLiveSpeed(speed * 3.6); // m/s → km/h
                } else if (prevPosRef.current && prevTimeRef.current) {
                    const dt = (Date.now() - prevTimeRef.current) / 1000;
                    const dLat = lat - prevPosRef.current.lat;
                    const dLng = lng - prevPosRef.current.lng;
                    const dist = Math.sqrt(dLat * dLat + dLng * dLng) * 111000;
                    if (dt > 0) setLiveSpeed((dist / dt) * 3.6);
                }
                prevPosRef.current = { lat, lng };
                prevTimeRef.current = Date.now();
            },
            () => { /* GPS denied — stay on India overview */ },
            { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
        );
        return () => {
            if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
        };
    }, []);

    /* ── Junctions ── */
    useEffect(() => {
        axios.get('/api/junctions')
            .then(res => {
                setJunctions(res.data);
                if (res.data.length) setSelectedJunction(res.data[0]);
            })
            .catch(() => setIsConnected(false));
    }, []);

    /* ── Advisory polling — use a ref for position so we never retrigger the effect ── */
    const mockPositionRef = useRef(mockPosition);
    useEffect(() => { mockPositionRef.current = mockPosition; }, [mockPosition]);

    useEffect(() => {
        if (!selectedJunction) return;
        const poll = async () => {
            try {
                // ⚠ Do NOT touch mockPosition here — GPS owns the position state.
                // Send the current GPS position (or India-centre default) to the API.
                const res = await axios.post('/api/advisory', {
                    junctionId: selectedJunction.id,
                    lat: mockPositionRef.current.lat,
                    lng: mockPositionRef.current.lng,
                    timestamp: Date.now() / 1000,
                });
                if (res.data?.secondsToChange !== undefined) setAdvisory(res.data);
            } catch (_) { }
        };
        poll();
        const interval = setInterval(poll, 5000);
        return () => clearInterval(interval);
    }, [selectedJunction]);

    /* ── Countdown ── */
    useEffect(() => {
        const tick = setInterval(() => {
            setAdvisory(prev => {
                if (!prev || prev.secondsToChange === undefined) return prev;
                return { ...prev, secondsToChange: Math.max(0, prev.secondsToChange - 1) };
            });
        }, 1000);
        return () => clearInterval(tick);
    }, []);

    /* ── Query speed limit from Overpass when junction changes ── */
    useEffect(() => {
        if (!selectedJunction) return;
        const fetchSpeedLimit = async () => {
            try {
                const query = `[out:json];way(around:200,${selectedJunction.lat},${selectedJunction.lng})[maxspeed];out 1;`;
                const res = await axios.get(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
                const ways = res.data?.elements;
                if (ways && ways.length > 0) {
                    const val = parseInt(ways[0].tags?.maxspeed, 10);
                    if (!isNaN(val)) setSpeedLimit(val);
                }
            } catch (_) { }
        };
        fetchSpeedLimit();
    }, [selectedJunction]);

    /* ── Route ── */
    const handleRoute = async (e) => {
        e.preventDefault();
        if (!destQuery.trim()) return;
        setIsRouting(true);
        try {
            const [sRes, dRes] = await Promise.all([
                startQuery !== 'Your Location'
                    ? axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(startQuery)}&limit=1&accept-language=en`)
                    : Promise.resolve({ data: [] }),
                axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destQuery)}&limit=1&accept-language=en`)
            ]);

            const startCoords = sRes.data.length
                ? { lat: parseFloat(sRes.data[0].lat), lng: parseFloat(sRes.data[0].lon), name: sRes.data[0].display_name }
                : { ...mockPosition, name: 'Your Location' };
            const destCoords = dRes.data.length
                ? { lat: parseFloat(dRes.data[0].lat), lng: parseFloat(dRes.data[0].lon), name: dRes.data[0].display_name }
                : null;

            if (!destCoords) { showToast('Destination not found', 'error'); return; }

            setRouteInfo(prev => ({ ...prev, start: startCoords, destination: destCoords }));

            const routeRes = await axios.get(
                `https://router.project-osrm.org/route/v1/driving/${startCoords.lng},${startCoords.lat};${destCoords.lng},${destCoords.lat}?overview=full&geometries=geojson`
            );
            if (routeRes.data.routes?.length) {
                const path = routeRes.data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
                const rj = junctions.filter(j => path.some(p => Math.sqrt((p[0] - j.lat) ** 2 + (p[1] - j.lng) ** 2) < 0.001));
                setRouteInfo(prev => ({ ...prev, path, junctions: rj.map(j => ({ ...j, status: 'IDLE' })) }));
                if (rj.length) setSelectedJunction(rj[0]);
            }
            showToast(`🗺 Route set to ${destCoords.name.split(',')[0]}`);
        } catch (err) {
            showToast('⚠ ' + err.message, 'error');
        } finally {
            setIsRouting(false);
            setShowSearch(false);
        }
    };

    const recSpeed = advisory?.recommendedSpeed;
    const distToJunction = advisory?.distance || null;

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: Route, label: 'AI Advisory', path: '/dashboard' },
        { icon: BarChart3, label: 'System Metrics', path: '/dashboard' },
        { icon: Bus, label: 'Transit Intelligence', path: '/dashboard' },
        { icon: BarChart2, label: 'Demand Analysis', path: '/dashboard' },
        { icon: GitMerge, label: 'Multimodal Planner', path: '/dashboard' },
        { icon: Settings, label: 'Settings', path: '/dashboard' },
    ];

    return (
        <div
            className="relative w-screen h-screen overflow-hidden bg-[#08090d] text-white"
            style={{ fontFamily: "'Inter', sans-serif" }}
        >
            {/* ── Full-Screen Map ── */}
            <div className="absolute inset-0 z-0">
                <MapComponent
                    junction={selectedJunction}
                    // Only pass vehiclePosition once GPS is ready — before that the map
                    // stays zoomed on all of India (defaultCenter in MapComponent is India Gate,
                    // but we override the initial zoom via the initialZoom prop below)
                    vehiclePosition={gpsReady ? mockPosition : null}
                    distance={advisory?.distance || 500}
                    signalStatus={advisory?.signalStatus || (routeInfo.path.length ? 'ROUTING' : 'IDLE')}
                    routePath={routeInfo.path}
                    routeJunctions={routeInfo.junctions}
                    start={routeInfo.start}
                    destination={routeInfo.destination}
                    // Show all of India (zoom 5) before GPS fires
                    initialCenter={gpsReady ? undefined : [20.5937, 78.9629]}
                    initialZoom={gpsReady ? 14 : 5}
                />
            </div>

            {/* ── Dark gradient overlay (bottom) ── */}
            <div
                className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none"
                style={{ height: '55%', background: 'linear-gradient(to top, rgba(8,9,13,0.97) 0%, rgba(8,9,13,0.75) 60%, transparent 100%)' }}
            />

            {/* ── Top Bar ── */}
            <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3"
                style={{ background: 'linear-gradient(to bottom, rgba(8,9,13,0.9) 0%, transparent 100%)' }}>
                {/* Hamburger / Menu toggle */}
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="flex flex-col gap-[5px] p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-all"
                    style={{ minWidth: 44, minHeight: 44 }}
                    aria-label="Open menu"
                >
                    <span className="block w-5 h-[2px] bg-white rounded-full" />
                    <span className="block w-4 h-[2px] bg-white/70 rounded-full" />
                    <span className="block w-5 h-[2px] bg-white rounded-full" />
                </button>

                {/* Brand */}
                <div className="flex items-center gap-2">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" className="h-7 invert opacity-80" alt="GOI" />
                    <div>
                        <p className="text-xs font-black leading-none" style={{ color: '#FF9933' }}>GLOSA</p>
                        <p className="text-[9px] font-black leading-none text-blue-400">BHARAT</p>
                    </div>
                    <div className="flex items-center gap-1 ml-1">
                        {isConnected
                            ? <Wifi className="h-3 w-3 text-green-400" />
                            : <WifiOff className="h-3 w-3 text-red-500" />}
                        <span className={`text-[8px] font-black uppercase ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                            {isConnected ? 'LIVE' : 'OFFLINE'}
                        </span>
                    </div>
                </div>

                {/* Time + Search toggle */}
                <div className="flex items-center gap-2">
                    <p className="text-[11px] font-black text-white/70">{currentTime.toLocaleTimeString([], { hour12: true, hour: '2-digit', minute: '2-digit' })}</p>
                    <button
                        onClick={() => setShowSearch(v => !v)}
                        className="p-2.5 rounded-xl bg-blue-600/90 backdrop-blur-md border border-blue-500/60 hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/50"
                        style={{ minWidth: 40, minHeight: 40 }}
                        aria-label="Search destination"
                    >
                        <Search className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* ── Search Panel (slides down) ── */}
            {showSearch && (
                <div className="absolute top-16 left-3 right-3 z-40 animate-in slide-in-from-top-3 duration-200">
                    <form
                        onSubmit={handleRoute}
                        className="rounded-2xl overflow-hidden shadow-2xl border border-white/10"
                        style={{ background: 'rgba(15,18,28,0.97)', backdropFilter: 'blur(20px)' }}
                    >
                        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
                            <div className="w-2.5 h-2.5 rounded-full border-2 border-white/40 shrink-0" />
                            <input
                                type="text"
                                value={startQuery}
                                onChange={e => setStartQuery(e.target.value)}
                                placeholder="From..."
                                className="flex-1 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/30"
                            />
                        </div>
                        <div className="flex items-center gap-3 px-4 py-3">
                            <MapPin className="h-3.5 w-3.5 text-red-400 fill-red-400 shrink-0" />
                            <input
                                type="text"
                                value={destQuery}
                                onChange={e => setDestQuery(e.target.value)}
                                placeholder="Where to?"
                                className="flex-1 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/30"
                                autoFocus
                            />
                            <button
                                type="submit"
                                disabled={isRouting}
                                className="ml-auto px-4 py-1.5 rounded-lg bg-blue-600 text-xs font-black uppercase tracking-wide hover:bg-blue-700 transition-all disabled:opacity-50"
                            >
                                {isRouting ? '...' : 'GO'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ── Bottom HUD ── */}
            <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-8 pt-4">
                {/* Main metrics row */}
                <div className="flex items-end gap-3 mb-3">

                    {/* Speed Gauge */}
                    <div className="flex flex-col items-center">
                        <SpeedGauge speed={liveSpeed} limit={speedLimit} recommended={recSpeed || 40} />
                        <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mt-1">YOUR SPEED</p>
                    </div>

                    {/* Center columns */}
                    <div className="flex-1 space-y-2.5">
                        {/* Recommended speed + Speed limit */}
                        <div className="grid grid-cols-2 gap-2">
                            <div
                                className="rounded-2xl p-3 flex flex-col"
                                style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.25)' }}
                            >
                                <div className="flex items-center gap-1.5 mb-1">
                                    <Gauge className="h-3 w-3 text-blue-400" />
                                    <p className="text-[8px] font-black text-blue-300 uppercase tracking-wider">Rec. Speed</p>
                                </div>
                                <p className="text-2xl font-black leading-none text-white">{recSpeed || '--'}</p>
                                <p className="text-[8px] text-white/40 font-bold">km/h</p>
                            </div>

                            <div
                                className="rounded-2xl p-3 flex flex-col"
                                style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}
                            >
                                <div className="flex items-center gap-1.5 mb-1">
                                    <ShieldCheck className="h-3 w-3 text-red-400" />
                                    <p className="text-[8px] font-black text-red-300 uppercase tracking-wider">Speed Limit</p>
                                </div>
                                <p className="text-2xl font-black leading-none text-white">{speedLimit}</p>
                                <p className="text-[8px] text-white/40 font-bold">km/h</p>
                            </div>
                        </div>

                        {/* AI Advisory message */}
                        <div
                            className="rounded-2xl px-3 py-2.5 flex items-center gap-2"
                            style={{ background: 'rgba(255,153,51,0.1)', border: '1px solid rgba(255,153,51,0.2)' }}
                        >
                            <Brain className="h-4 w-4 text-orange-400 shrink-0" />
                            <p className="text-[10px] font-bold text-white/80 leading-tight line-clamp-2">
                                {advisory?.message || 'Optimizing signal synchronization...'}
                            </p>
                        </div>
                    </div>

                    {/* Signal Ring */}
                    <div className="flex flex-col items-center gap-2">
                        <SignalRing status={advisory?.signalStatus} seconds={advisory?.secondsToChange} />
                        {distToJunction && (
                            <div className="text-center">
                                <p className="text-[8px] font-black text-white/40 uppercase">Signal</p>
                                <p className="text-[10px] font-black text-white">{distToJunction < 1000 ? `${Math.round(distToJunction)}m` : `${(distToJunction / 1000).toFixed(1)}km`}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Junction info strip */}
                {selectedJunction && (
                    <div
                        className="rounded-xl px-3 py-2 flex items-center justify-between"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                        <div className="flex items-center gap-2">
                            <Activity className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                            <div>
                                <p className="text-[8px] font-black text-white/40 uppercase tracking-wider">Next Signal</p>
                                <p className="text-xs font-black text-white truncate max-w-[180px]">{selectedJunction.name}</p>
                            </div>
                        </div>
                        {routeInfo.destination && (
                            <div className="text-right">
                                <p className="text-[8px] font-black text-white/40 uppercase tracking-wider">Destination</p>
                                <p className="text-xs font-black text-white truncate max-w-[100px]">
                                    {routeInfo.destination.name?.split(',')[0]}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── Sidebar overlay backdrop ── */}
            {sidebarOpen && (
                <div
                    className="absolute inset-0 z-40"
                    style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ── Sliding Sidebar ── */}
            <aside
                className="absolute top-0 left-0 h-full w-72 z-50 flex flex-col"
                style={{
                    background: 'rgba(10,12,20,0.98)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
                    transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
                    backdropFilter: 'blur(24px)',
                }}
            >
                {/* Sidebar header */}
                <div className="flex items-center justify-between px-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                    <div className="flex items-center gap-3">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" className="h-9 invert opacity-80" alt="GOI" />
                        <div>
                            <p className="text-lg font-black leading-none" style={{ color: '#FF9933' }}>GLOSA</p>
                            <p className="text-xs font-black leading-none text-blue-400">BHARAT</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                        aria-label="Close menu"
                    >
                        <X className="h-5 w-5 text-white/60" />
                    </button>
                </div>

                {/* Rider mode indicator */}
                <div className="mx-4 mt-4 mb-2 rounded-xl px-4 py-3" style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)' }}>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                        <p className="text-[9px] font-black text-blue-300 uppercase tracking-widest">Rider Mode Active</p>
                    </div>
                    <p className="text-xs font-black text-white">{user?.displayName || 'Two-Wheeler Rider'}</p>
                    <p className="text-[9px] text-white/40 truncate">{user?.email || 'GLOSA Navigation Pilot'}</p>
                </div>

                {/* Live stats mini bar */}
                <div className="mx-4 mb-4 grid grid-cols-3 gap-2">
                    {[
                        { label: 'Speed', value: `${Math.round(liveSpeed)} km/h`, color: '#22c55e' },
                        { label: 'Limit', value: `${speedLimit} km/h`, color: '#ef4444' },
                        { label: 'Signal', value: advisory?.signalStatus || '--', color: advisory?.signalStatus === 'GREEN' ? '#22c55e' : advisory?.signalStatus === 'RED' ? '#ef4444' : '#f59e0b' },
                    ].map((s, i) => (
                        <div key={i} className="rounded-xl p-2 text-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
                            <p className="text-[7px] font-black text-white/40 uppercase mb-1">{s.label}</p>
                            <p className="text-[10px] font-black" style={{ color: s.color }}>{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* Nav items */}
                <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
                    {/* Rider mode (current, highlighted) */}
                    <div className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-default" style={{ background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.3)' }}>
                        <Navigation className="h-5 w-5 text-blue-400" />
                        <span className="flex-1 text-sm font-black text-white">Rider Mode</span>
                        <span className="text-[8px] px-2 py-0.5 rounded-full font-black text-blue-300 uppercase" style={{ background: 'rgba(59,130,246,0.3)' }}>ACTIVE</span>
                    </div>

                    {navItems.map((item, idx) => (
                        <Link
                            key={idx}
                            to={item.path}
                            onClick={() => setSidebarOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all group"
                        >
                            <item.icon className="h-5 w-5 text-white/40 group-hover:text-white/70 transition-colors" />
                            <span className="flex-1 text-sm font-bold text-white/60 group-hover:text-white transition-colors">{item.label}</span>
                            <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-white/40 transition-colors" />
                        </Link>
                    ))}
                </nav>

                {/* Bottom section */}
                <div className="px-4 py-4 border-t space-y-3" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                    {/* Quick search reopen */}
                    <button
                        onClick={() => { setSidebarOpen(false); setShowSearch(true); }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-black text-sm text-white transition-all"
                        style={{ background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.3)' }}
                    >
                        <Search className="h-4 w-4 text-blue-400" />
                        Search Destination
                    </button>
                    {/* Sign out */}
                    <button
                        onClick={() => { logout(); navigate('/'); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-sm text-red-400 hover:bg-red-500/10 transition-all border border-red-500/20"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* ── Toast ── */}
            {toast && (
                <div className={`absolute top-20 left-1/2 -translate-x-1/2 z-[99] px-4 py-2.5 rounded-xl shadow-2xl text-xs font-bold transition-all animate-in slide-in-from-top-2 ${toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'} text-white`}>
                    {toast.msg}
                </div>
            )}
        </div>
    );
};

export default MobileRiderView;
