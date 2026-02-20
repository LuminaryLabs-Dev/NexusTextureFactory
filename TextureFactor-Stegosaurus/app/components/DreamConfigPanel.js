"use client";

import React from 'react';

const DreamConfigPanel = ({ params, setParams }) => {
    return (
        <div className="bg-[#1a1a1a] border border-gray-800 p-4 grid grid-cols-3 gap-6 text-xs rounded-lg mb-4 shadow-xl">
            <div className="space-y-3">
                <div className="text-purple-400 font-bold uppercase border-b border-purple-900/30 pb-1 tracking-tighter">Generator</div>
                <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-gray-400"><span>Batch Size</span><span>{params.batchSize}</span></div>
                    <input type="range" min="10" max="100" step="10" value={params.batchSize} onChange={(e) => setParams(p => ({ ...p, batchSize: parseInt(e.target.value) }))} className="slider-thumb w-full" />
                </div>
                <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-gray-400"><span>Cycles</span><span>{params.batchCycles}</span></div>
                    <input type="range" min="1" max="100" step="1" value={params.batchCycles} onChange={(e) => setParams(p => ({ ...p, batchCycles: parseInt(e.target.value) }))} className="slider-thumb w-full" />
                </div>
            </div>
            <div className="space-y-3">
                <div className="text-blue-400 font-bold uppercase border-b border-blue-900/30 pb-1 tracking-tighter">DNA</div>
                <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-gray-400"><span>Complexity</span><span>{params.randCount}</span></div>
                    <input type="range" min="1" max="10" step="1" value={params.randCount} onChange={(e) => setParams(p => ({ ...p, randCount: parseInt(e.target.value) }))} className="slider-thumb w-full" />
                </div>
                <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-gray-400"><span>Chaos</span><span>{params.randStrength}</span></div>
                    <input type="range" min="0" max="1" step="0.1" value={params.randStrength} onChange={(e) => setParams(p => ({ ...p, randStrength: parseFloat(e.target.value) }))} className="slider-thumb w-full" />
                </div>
            </div>
            <div className="space-y-3">
                <div className="text-green-400 font-bold uppercase border-b border-green-900/30 pb-1 tracking-tighter">Filters</div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-[10px] text-gray-400"><span>MinD</span><span>{params.minDensity}</span></div>
                        <input type="range" min="0" max="1" step="0.05" value={params.minDensity} onChange={(e) => setParams(p => ({ ...p, minDensity: parseFloat(e.target.value) }))} className="slider-thumb w-full" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-[10px] text-gray-400"><span>MaxD</span><span>{params.maxDensity}</span></div>
                        <input type="range" min="0" max="1" step="0.05" value={params.maxDensity} onChange={(e) => setParams(p => ({ ...p, maxDensity: parseFloat(e.target.value) }))} className="slider-thumb w-full" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-[10px] text-gray-400"><span>MinS</span><span>{params.minSimplicity}</span></div>
                        <input type="range" min="0" max="1" step="0.05" value={params.minSimplicity} onChange={(e) => setParams(p => ({ ...p, minSimplicity: parseFloat(e.target.value) }))} className="slider-thumb w-full" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-[10px] text-gray-400"><span>MaxS</span><span>{params.maxSimplicity}</span></div>
                        <input type="range" min="0" max="1" step="0.05" value={params.maxSimplicity} onChange={(e) => setParams(p => ({ ...p, maxSimplicity: parseFloat(e.target.value) }))} className="slider-thumb w-full" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DreamConfigPanel;
