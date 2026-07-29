import React from 'react';
import { X, FileText, Award, ShieldCheck, Zap } from 'lucide-react';

const WhitepaperModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-200">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="bg-[var(--navy)] p-2 rounded-lg">
                            <FileText className="text-white h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Project Whitepaper</h2>
                            <p className="text-xs text-[var(--green)] font-bold uppercase tracking-widest">Version 1.0.4 | Smart Mobility Initiative</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto space-y-8 text-slate-700 leading-relaxed custom-scrollbar">
                    <section>
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <div className="w-1 h-6 bg-[var(--saffron)]"></div>
                            Executive Summary
                        </h3>
                        <p>
                            The <strong>GLOSA-Bharat</strong> system is an indigenous, AI-driven software solution designed to revolutionize urban mobility in India. By leveraging real-time traffic signal predictions and vehicle telemetry, the system provides drivers with optimal speed recommendations to pass through green lights seamlessly. This reduces idle time at junctions, minimizes fuel wastage, and lowers carbon emissions across smart city corridors.
                        </p>
                    </section>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-orange-50 p-5 rounded-xl border border-orange-100">
                            <div className="flex items-center gap-3 mb-3">
                                <ShieldCheck className="text-orange-600 h-6 w-6" />
                                <h4 className="font-bold text-orange-900">National Priority</h4>
                            </div>
                            <p className="text-sm text-orange-800">
                                Aligned with India's <strong>Mission 500GW</strong> and <strong>Net Zero 2070</strong> goals. GLOSA-Bharat reduces urban congestion by up to 22% without expensive hardware upgrades.
                            </p>
                        </div>
                        <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                            <div className="flex items-center gap-3 mb-3">
                                <Zap className="text-blue-600 h-6 w-6" />
                                <h4 className="font-bold text-blue-900">AI-First Approach</h4>
                            </div>
                            <p className="text-sm text-blue-800">
                                Utilizes a distributed microservices architecture. Predictions are powered by LSTM and Random Forest models trained on localized Indian traffic patterns.
                            </p>
                        </div>
                    </div>

                    <section>
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <div className="w-1 h-6 bg-[var(--green)]"></div>
                            Technical Implementation
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[var(--navy)]">1</div>
                                <div>
                                    <p className="font-bold text-slate-800">Signal Timing Prediction</p>
                                    <p className="text-sm text-slate-500">FastAPI microservice analyzing historical and real-time data to predict phase transitions with &gt;94% accuracy.</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[var(--navy)]">2</div>
                                <div>
                                    <p className="font-bold text-slate-800">Dynamic Advisory Logic</p>
                                    <p className="text-sm text-slate-500">Meters-per-second calculation based on time-to-change and vehicle distance to ensure safe and efficient passage.</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[var(--navy)]">3</div>
                                <div>
                                    <p className="font-bold text-slate-800">Citizen-Centric UX</p>
                                    <p className="text-sm text-slate-500">Interface designed following NIC accessibility standards, ensuring clarity for diverse drivers under high-stress conditions.</p>
                                </div>
                            </li>
                        </ul>
                    </section>

                    <div className="bg-slate-900 p-6 rounded-xl text-center">
                        <Award className="text-yellow-500 h-10 w-10 mx-auto mb-3" />
                        <h4 className="text-white font-bold text-lg mb-1">Make in India Technology</h4>
                        <p className="text-slate-400 text-sm">Empowering Smart Cities via Indigenous Digital Infrastructure</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="gov-button-primary"
                    >
                        Close Document
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WhitepaperModal;
