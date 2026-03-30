import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Zap,
    ArrowRight,
    Trophy,
    Sun,
    Moon
} from 'lucide-react';
import { motion } from 'framer-motion';
import WhitepaperModal from '../components/WhitepaperModal';

const LandingPage = () => {
    const [isWhitepaperOpen, setIsWhitepaperOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return document.documentElement.classList.contains('dark') ||
            window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    return (
        <div className="bg-[var(--bg-primary)] min-h-screen font-sans selection:bg-blue-100 selection:text-blue-900 transition-colors duration-300 relative overflow-hidden">
            {/* Indian Theme Background Elements */}
            <div className="chakra-bg" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-white to-green-600 opacity-50 z-[60]" />
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-white to-green-600 opacity-50 z-[60]" />

            <WhitepaperModal isOpen={isWhitepaperOpen} onClose={() => setIsWhitepaperOpen(false)} />

            {/* Header / Navbar */}
            <nav className="fixed top-0 w-full z-50 bg-[var(--bg-card)]/80 backdrop-blur-xl border-b border-[var(--border-color)] px-4 sm:px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="GOI" className="h-8 sm:h-10 dark:invert" />
                        <div className="h-6 sm:h-8 w-px bg-[var(--border-color)] mx-0.5 sm:mx-1"></div>
                        <div>
                            <h1 className="text-lg sm:text-xl font-black text-[var(--text-primary)] leading-none tracking-tight">
                                <span className="text-saffron">GLOSA</span>
                                <span className="text-navy dark:text-white">-</span>
                                <span className="text-green">BHARAT</span>
                            </h1>
                            <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-[var(--text-secondary)] font-bold mt-1">Government of India Initiative</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-8">
                        <div className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                            <a href="#" className="hover:text-saffron transition-colors border-b-2 border-transparent hover:border-saffron pb-1">Atmanirbhar Bharat</a>
                            <a href="#" className="hover:text-green transition-colors border-b-2 border-transparent hover:border-green pb-1">Digital India</a>
                        </div>
                        
                        <div className="flex items-center gap-2 sm:gap-4 border-l border-[var(--border-color)] pl-3 sm:pl-8">
                            <button
                                onClick={() => setIsDarkMode(!isDarkMode)}
                                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                {isDarkMode ? <Sun className="h-4 w-4 text-yellow-500" /> : <Moon className="h-4 w-4 text-slate-800" />}
                            </button>
                            <Link
                                to="/login"
                                className="bg-[#000080] dark:bg-blue-700 px-4 sm:px-6 py-2 rounded-sm hover:brightness-110 transition-all shadow-md active:translate-y-0.5 font-black uppercase text-[10px] sm:text-[11px] tracking-widest text-white leading-none flex items-center justify-center whitespace-nowrap"
                                style={{ color: 'white' }}
                            >
                                LOGIN
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="pt-24 sm:pt-32 pb-20 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 px-4 py-1.5 rounded-full mb-6 border border-orange-100 dark:border-orange-900/30">
                            <Trophy className="h-3 w-3 text-orange-600" />
                            <span className="text-[10px] font-black text-orange-700 dark:text-orange-400 uppercase tracking-widest">Atmanirbhar Bharat Initiative</span>
                        </div>

                        <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-[var(--text-primary)] leading-[1.05] mb-8 tracking-tighter">
                            <span className="text-saffron">Indigenizing</span> <br />
                            <span className="text-[var(--text-primary)]">Urban</span> <br />
                            <span className="text-green">Mobility</span>
                        </h1>

                        <p className="text-lg sm:text-xl text-[var(--text-secondary)] font-bold max-w-xl mb-10 leading-relaxed border-l-4 border-saffron pl-6">
                            Implementing the National GLOSA Framework for optimized traffic flow. Built to strengthen the <span className="text-saffron italic">Atmanirbhar</span> vision.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 mb-20 text-center">
                            <Link to="/dashboard" className="group bg-blue-600 text-white px-8 py-5 rounded-2xl text-lg font-bold shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all hover:-translate-y-1 flex items-center justify-center gap-3">
                                Start Simulation <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        <div className="flex items-center gap-12 opacity-40 grayscale dark:invert dark:opacity-60">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/4/4e/Aatmanirbhar_Bharat_Logo.png" alt="Make in India" className="h-12" />
                            <img src="https://upload.wikimedia.org/wikipedia/en/thumb/9/95/Digital_India_logo.svg/1200px-Digital_India_logo.svg.png" alt="Digital India" className="h-10" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="relative"
                    >
                        {/* Decorative Background for Image */}
                        <div className="absolute -inset-4 bg-gradient-to-tr from-blue-100 to-green-100 rounded-[3rem] blur-3xl opacity-30 -z-10 animate-pulse" />

                        <div className="bg-[var(--bg-card)] p-4 rounded-[2.5rem] shadow-2xl shadow-slate-200 dark:shadow-none border border-[var(--border-color)] relative overflow-hidden group min-h-[500px]">
                            <img
                                src="https://images.unsplash.com/photo-1545147980-c9d3e0e8b78e?auto=format&fit=crop&q=80&w=1500"
                                alt="Smart City Infrastructure"
                                className="w-full h-[500px] object-cover rounded-[2rem] group-hover:scale-105 transition-transform duration-1000"
                                onError={(e) => {
                                    e.target.src = "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=1500";
                                }}
                            />
                            {/* Overlay UI elements to make it look "techy" */}
                            <div className="absolute top-10 left-10 glass-panel bg-[var(--bg-card)]/90 backdrop-blur px-4 py-2 rounded-xl shadow-lg border border-[var(--border-color)]">
                                <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1">Live Telemetry</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-sm font-bold text-[var(--text-primary)]">45.2 KM/H (Advisory)</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Features Grid */}
                <div className="max-w-7xl mx-auto mt-32 grid md:grid-cols-4 gap-6">
                    {[
                        { img: "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=400&h=300&fit=crop", title: "Eco-Conscious", desc: "Targeting 15% reduction in national fuel imports through traffic optimization." },
                        { img: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop", title: "National AI", desc: "Indigenous neural networks trained on diverse Indian road patterns." },
                        { img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop", title: "Secure Cloud", desc: "Data processed locally on sovereign secured infrastructure." },
                        { img: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop", title: "Smart Tier-II", desc: "Scalable architecture for the next 100 Indian Smart Cities." }
                    ].map((f, i) => (
                        <div key={i} className="group p-8 rounded-none border border-[var(--border-color)] border-t-4 border-t-saffron hover:bg-[var(--bg-hover)] transition-all bg-[var(--bg-card)] official-card shadow-sm flex flex-col items-start text-left">
                            <div className="w-full h-32 rounded-none overflow-hidden mb-6 filter grayscale group-hover:grayscale-0 transition-all bg-slate-100 dark:bg-slate-800 border border-[var(--border-color)]">
                                <img
                                    src={f.img}
                                    alt={f.title}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                            </div>
                            <h3 className="text-lg font-black text-navy dark:text-white mb-2 uppercase tracking-wide">{f.title}</h3>
                            <p className="text-xs text-[var(--text-secondary)] font-bold leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </main>

            {/* Impact Footer Segment */}
            <section className="bg-[var(--bg-card)] py-20 border-y border-[var(--border-color)]">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-black text-[var(--text-primary)] mb-8 tracking-tight">Contributing to India's Global Excellence in Smart Mobility</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div>
                            <p className="text-3xl font-black text-blue-600 mb-1 tracking-tight">20%</p>
                            <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Congestion Reduction</p>
                        </div>
                        <div>
                            <p className="text-3xl font-black text-green-600 mb-1 tracking-tight">1.2M</p>
                            <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">CO2 Tons Reduced</p>
                        </div>
                        <div>
                            <p className="text-3xl font-black text-orange-600 mb-1 tracking-tight">100+</p>
                            <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Smart Junctions</p>
                        </div>
                        <div>
                            <p className="text-3xl font-black text-purple-600 mb-1 tracking-tight">9+ Cities</p>
                            <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Pilot Deployments</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[var(--bg-card)] py-12 px-6 border-t border-[var(--border-color)] text-center">
                <div className="flex flex-col items-center gap-6">
                    <div className="flex items-center gap-2 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-pointer dark:invert">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="India Emblem" className="h-10" />
                        <div className="h-8 w-px bg-slate-300 mx-1"></div>
                        <span className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest">Ministry of Smart Cities</span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] font-bold max-w-lg mx-auto">
                        Developed as part of the National Mobility Initiative.
                        © 2026 Smart Infrastructure India. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
