"use client";

import React from 'react';

const SettingsTab = ({ enableAI, setEnableAI }) => (
    <div className="flex flex-col h-full bg-[#111] p-12 items-center">
        <div className="max-w-2xl w-full bg-[#1a1a1a] rounded-xl border border-gray-800 p-8">
            <h2 className="text-2xl font-bold text-white mb-6 font-mono tracking-tighter">GLOBAL SETTINGS</h2>
            <div className="flex items-center justify-between py-4 border-b border-gray-700">
                <div>
                    <div className="text-white font-bold">Enable AI Inference</div>
                    <div className="text-gray-400 text-sm">Use smart naming (e.g. "Particle_Circle_Soft") and semantic matches.</div>
                </div>
                <button onClick={() => setEnableAI(!enableAI)} className={`w-12 h-6 rounded-full p-1 transition-colors ${enableAI ? 'bg-green-600' : 'bg-gray-600'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${enableAI ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
            </div>
        </div>
    </div>
);

export default SettingsTab;
