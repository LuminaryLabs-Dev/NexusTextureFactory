"use client";

import React from 'react';

const NavBar = ({ activeTab, setActiveTab }) => (
    <div className="h-12 bg-[#1a1a1a] flex items-center justify-center gap-8 border-b border-gray-800 shrink-0">
        <button onClick={() => setActiveTab('builder')} className={`tab-btn text-xs font-bold tracking-widest ${activeTab === 'builder' ? 'text-white active' : 'text-gray-500 hover:text-gray-300'}`}>BUILDER</button>
        <button onClick={() => setActiveTab('generator')} className={`tab-btn text-xs font-bold tracking-widest ${activeTab === 'generator' ? 'text-white active' : 'text-gray-500 hover:text-gray-300'}`}>GENERATOR</button>
        <button onClick={() => setActiveTab('sets')} className={`tab-btn text-xs font-bold tracking-widest ${activeTab === 'sets' ? 'text-white active' : 'text-gray-500 hover:text-gray-300'}`}>SETS</button>
        <button onClick={() => setActiveTab('settings')} className={`tab-btn text-xs font-bold tracking-widest ${activeTab === 'settings' ? 'text-white active' : 'text-gray-500 hover:text-gray-300'}`}>SETTINGS</button>
    </div>
);

export default NavBar;
