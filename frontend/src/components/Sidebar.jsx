import React from 'react';
import {
    LayoutDashboard,
    Route,
    BarChart3,
    Settings,
    Bus,
    BarChart2,
    GitMerge,
    X
} from 'lucide-react';

const Sidebar = ({ isConnected, activeTab, setActiveTab, user, isOpen, setIsOpen }) => {
    const navItems = [
        { icon: LayoutDashboard, label: 'Control Center', id: 'dashboard' },
        { icon: Route, label: 'AI Advisory', id: 'simulation' },
        { icon: BarChart3, label: 'System Metrics', id: 'metrics' },
        { icon: Bus, label: 'Transit Intelligence', id: 'public-transport' },
        { icon: BarChart2, label: 'Demand Analysis', id: 'demand' },
        { icon: GitMerge, label: 'Multimodal Planner', id: 'multimodal' },
        { icon: Settings, label: 'Terminal Settings', id: 'settings' },
    ];

    return (
        <aside className={`
            fixed inset-y-0 left-0 z-[1000] w-64 bg-white dark:bg-[#0f172a] text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen transition-transform duration-300 ease-in-out
            lg:relative lg:translate-x-0 ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
        `}>
            <div className="p-6 relative">
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-6 right-4 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 lg:hidden"
                    aria-label="Close menu"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-2 mb-4">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="GOI" className="h-8 dark:invert" />
                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>
                </div>
                <h1 className="text-slate-900 dark:text-white text-xl font-black flex flex-col tracking-tight leading-none">
                    <span className="text-saffron">GLOSA</span>
                    <span className="text-sm text-navy dark:text-blue-400">BHARAT</span>
                </h1>
                <div className={`flex items-center gap-2 mt-4 text-[10px] ${isConnected ? 'text-blue-500' : 'text-red-500'} font-black uppercase tracking-widest`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-blue-500 animate-pulse' : 'bg-red-500'}`} /> {isConnected ? 'Link Active' : 'Link Offline'}
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1 scrollbar-hide">
                {navItems.map((item, idx) => {
                    const isActive = activeTab === item.id;
                    return (
                        <div key={idx} className="space-y-1">
                            <button
                                onClick={() => {
                                    setActiveTab(item.id);
                                    if (window.innerWidth < 1024) setIsOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-bold ${isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none' : 'hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'}`}
                            >
                                <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400'}`} />
                                {item.label}
                            </button>
                        </div>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 dark:bg-white/5 rounded-xl overflow-hidden">
                    {user?.photoURL ? (
                        <img
                            src={user.photoURL}
                            alt={user.displayName}
                            className="w-8 h-8 rounded-full border border-blue-600/20 shadow-sm"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0">
                            {user?.displayName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">
                            {user?.displayName || user?.username || 'Guest'}
                        </p>
                        <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 truncate uppercase">
                            {user?.email || 'System Operator'}
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
