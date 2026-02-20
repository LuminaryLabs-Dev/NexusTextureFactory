"use client";

import React, { useState } from 'react';
import StepCard from './StepCard';
import { STEP_TYPES, STEP_MENU_GROUPS } from '@/lib/constants';

const BuilderTab = ({
    steps,
    updateStep,
    toggleStep,
    addStep,
    removeStep,
    moveStep,
    showGizmos,
    setShowGizmos,
    finalUrl,
    profileName,
    setProfileName,
    erosion,
    setErosion,
    resList,
    selectedRes,
    toggleRes,
    onExport
}) => {
    const AddMenuLocal = ({ variant, idx }) => {
        const [open, setOpen] = useState(false);
        return (
            <div className={`relative ${variant === 'large' ? 'w-full' : 'flex justify-center py-2'}`}>
                <button
                    onClick={() => setOpen(!open)}
                    className={variant === 'large' ? "w-full py-4 border-2 border-dashed border-gray-700 hover:bg-[#222] text-gray-500 hover:text-white rounded-lg font-bold text-sm" : "w-6 h-6 rounded-full bg-gray-700 hover:bg-blue-500 text-white flex items-center justify-center text-xs shadow-sm font-bold"}
                >
                    +
                </button>
                {open && (
                    <div className="absolute z-50 bg-[#222] border border-gray-700 shadow-xl rounded w-48 overflow-hidden left-1/2 -translate-x-1/2 top-full mt-1">
                        {STEP_MENU_GROUPS.map(g => (
                            <div key={g.label}>
                                <div className="px-3 py-2 text-[10px] text-gray-500 font-bold bg-[#1a1a1a] border-b border-gray-800">{g.label}</div>
                                {g.keys.map(k => (
                                    <button
                                        key={k}
                                        onClick={() => { addStep(k, idx); setOpen(false); }}
                                        className="block w-full text-left px-4 py-2 hover:bg-blue-900 text-gray-300 text-xs border-b border-gray-800 last:border-0"
                                    >
                                        {STEP_TYPES[k].name}
                                    </button>
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    };

    return (
        <div className="flex flex-col h-full">
            <div className="h-10 bg-[#111] flex items-center justify-between px-4 border-b border-gray-800">
                <div className="font-bold text-gray-500 text-xs">WORKBENCH</div>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={showGizmos} onChange={(e) => setShowGizmos(e.target.checked)} className="accent-blue-500" />
                    <span className="text-xs text-gray-400 font-bold">GUIDES</span>
                </label>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-[#1a1a1a]">
                {steps.map((s, i) => (
                    <React.Fragment key={s.id}>
                        <StepCard step={s} index={i} total={steps.length} onUpdate={updateStep} onToggle={toggleStep} onRemove={removeStep} onMove={moveStep} showGizmos={showGizmos} />
                        {i < steps.length - 1 && <AddMenuLocal variant="interstitial" idx={i + 1} />}
                    </React.Fragment>
                ))}
                <div className="mt-4 mb-24">
                    <AddMenuLocal variant="large" idx={-1} />
                </div>
            </div>
            <div className="h-[280px] bg-[#151515] border-t border-gray-700 flex flex-col shrink-0">
                <div className="flex-1 flex items-center justify-center p-4 gap-8">
                    <div className="relative w-[200px] h-[200px] bg-[#111] checkerboard border-2 border-gray-600 shadow-2xl">
                        {finalUrl && (
                            <>
                                <img src={finalUrl} className="absolute inset-0 w-full h-full object-contain" alt="Final preview" />
                                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                    <filter id="erosionFilter">
                                        <feComponentTransfer>
                                            <feFuncA type="linear" slope={1 / (1 - Math.min(0.99, erosion))} intercept={-(erosion / (1 - Math.min(0.99, erosion)))} />
                                        </feComponentTransfer>
                                    </filter>
                                    <image href={finalUrl} width="100%" height="100%" filter="url(#erosionFilter)" opacity={0.8} />
                                </svg>
                                <img src={finalUrl} className="absolute inset-0 w-full h-full object-contain opacity-20" alt="Ghost preview" />
                            </>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                            <div className="w-full h-px bg-red-500"></div>
                            <div className="h-full w-px bg-red-500 absolute"></div>
                        </div>
                    </div>
                    <div className="text-gray-400 text-sm max-w-xs">
                        <h3 className="text-white font-bold mb-2">MASTER PREVIEW</h3>
                        <div className="flex items-center gap-2">
                            <label>Profile Name:</label>
                            <input value={profileName} onChange={(e) => setProfileName(e.target.value)} className="bg-[#333] border border-gray-600 px-2 py-1 rounded text-white w-32" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 items-center">
                        <div className="flex gap-1 mb-1">
                            {resList.map(res => (
                                <button
                                    key={res}
                                    onClick={() => toggleRes(res)}
                                    className={`px-2 py-1 text-[10px] rounded border font-bold transition-colors ${selectedRes.includes(res) ? 'bg-blue-600 text-white border-blue-500' : 'bg-[#333] text-gray-400 border-gray-600 hover:border-gray-400'}`}
                                >
                                    {res}
                                </button>
                            ))}
                        </div>
                        <button onClick={onExport} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded shadow-lg text-sm">DOWNLOAD TEXTURE</button>
                        <div className="text-xs text-center text-gray-500">Saves .ZIP (PNGs + JSON)</div>
                    </div>
                </div>
                <div className="h-12 bg-[#222] px-6 flex items-center gap-4 border-t border-gray-800">
                    <span className="text-xs font-bold text-gray-400 w-24">EROSION TEST</span>
                    <input type="range" min="0" max="0.99" step="0.01" value={erosion} onChange={(e) => setErosion(parseFloat(e.target.value))} className="w-full erosion-slider" />
                    <span className="text-xs font-mono text-white w-12 text-right">{(erosion * 100).toFixed(0)}%</span>
                </div>
            </div>
        </div>
    );
};

export default BuilderTab;
