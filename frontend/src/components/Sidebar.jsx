import React from 'react';
import {
    LayoutDashboard,
    Route,
    BarChart3,
    Settings,
    Bus,
    BarChart2,
    GitMerge,
    Zap,
    ChevronRight,
    Wifi,
    WifiOff,
} from 'lucide-react';

const NAV_ITEMS = [
    { icon: LayoutDashboard, label: 'Control Center',       id: 'dashboard',       accent: '#3b82f6' },
    { icon: Route,           label: 'AI Advisory',          id: 'simulation',      accent: '#f97316' },
    { icon: BarChart3,       label: 'System Metrics',       id: 'metrics',         accent: '#8b5cf6' },
    { icon: Bus,             label: 'Transit Intelligence', id: 'public-transport', accent: '#f59e0b' },
    { icon: BarChart2,       label: 'Demand Analysis',      id: 'demand',          accent: '#ec4899' },
    { icon: GitMerge,        label: 'Multimodal Planner',   id: 'multimodal',      accent: '#06b6d4' },
    { icon: Settings,        label: 'Terminal Settings',    id: 'settings',        accent: '#64748b' },
];

const Sidebar = ({ isConnected, activeTab, setActiveTab, user }) => {
    return (
        <aside
            className="sidebar-nav w-64 flex flex-col h-screen sticky top-0 transition-all duration-300"
            style={{ zIndex: 40 }}
        >
            {/* ── Brand ── */}
            <div className="px-5 pt-6 pb-4">
                <div className="flex items-center gap-3 mb-5">
                    {/* Icon mark */}
                    <div className="relative shrink-0">
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-orange-400/40 to-blue-600/40 blur-md" />
                        <div className="relative bg-gradient-to-br from-orange-500 to-blue-700 p-2 rounded-xl shadow-lg">
                            <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
                        </div>
                    </div>

                    {/* Name */}
                    <div className="leading-none">
                        <p className="text-[15px] font-black tracking-tight text-slate-900 dark:text-white">
                            GLOSA
                        </p>
                        <p className="text-[10px] font-black tracking-[0.18em] text-blue-500 uppercase mt-0.5">
                            BHARAT
                        </p>
                    </div>
                </div>

                {/* Live status chip */}
                <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
                        isConnected
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                            : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20'
                    }`}
                >
                    {isConnected
                        ? <Wifi className="h-3 w-3" />
                        : <WifiOff className="h-3 w-3" />
                    }
                    <span
                        className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}
                    />
                    {isConnected ? 'Live · Connected' : 'Offline'}
                </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-100 dark:bg-slate-800/80 mx-4 mb-2" />

            {/* ── Navigation ── */}
            <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5 scrollbar-hide">
                {NAV_ITEMS.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`nav-item group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left font-medium transition-all duration-200 relative ${
                                isActive
                                    ? 'nav-item-active text-white'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                            }`}
                        >
                            {/* Active left accent stripe */}
                            {isActive && (
                                <span
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-white/50"
                                />
                            )}

                            <item.icon
                                className={`h-[18px] w-[18px] shrink-0 transition-colors duration-200 ${
                                    isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                                }`}
                                style={isActive ? {} : { color: item.accent }}
                            />

                            <span className="flex-1 font-semibold text-[13px]">{item.label}</span>

                            {isActive && (
                                <ChevronRight className="h-3.5 w-3.5 text-white/50" />
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* ── Divider ── */}
            <div className="h-px bg-slate-100 dark:bg-slate-800/80 mx-4" />

            {/* ── User card ── */}
            <div className="p-3">
                <div className="flex items-center gap-3 px-2.5 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-default group">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                        {user?.photoURL ? (
                            <img
                                src={user.photoURL}
                                alt={user.displayName}
                                className="w-9 h-9 rounded-full ring-2 ring-white dark:ring-slate-900 ring-offset-1 ring-offset-slate-100 dark:ring-offset-slate-900"
                            />
                        ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-black text-white shadow-inner">
                                {user?.displayName?.charAt(0)?.toUpperCase() || 'G'}
                            </div>
                        )}
                        {/* Online indicator */}
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-slate-900 dark:text-white truncate leading-snug">
                            {user?.displayName || 'Operator'}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate font-medium uppercase tracking-wide leading-snug">
                            {user?.email ? user.email.split('@')[0] : 'system-admin'}
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
