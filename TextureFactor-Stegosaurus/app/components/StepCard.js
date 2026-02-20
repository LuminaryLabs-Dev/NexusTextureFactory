"use client";

import React from 'react';
import GizmoOverlay from './GizmoOverlay';
import { BLEND_MODES } from '@/lib/constants';

const StepCard = ({ step, index, total, onUpdate, onToggle, onRemove, onMove, showGizmos }) => {
    const typeDef = step.typeDef;
    const isFirst = index === 0;
    const isBasic = typeDef.id === 15;

    const handleParamChange = (key, value) => {
        const newParams = { ...step.params, [key]: parseFloat(value) };
        onUpdate(step.id, { params: newParams });
    };

    const handleUnivChange = (key, value) => {
        const newUniv = { ...step.universal, [key]: parseFloat(value) };
        onUpdate(step.id, { universal: newUniv });
    };

    return (
        <div className={`transition-all duration-300 border-l-4 bg-[#2a2a2a] mb-2 ${step.active ? 'border-blue-500' : 'border-gray-600 h-[50px] opacity-60 overflow-hidden'}`}>
            <div className="flex items-center justify-between p-2 bg-[#252525]">
                <div className="flex items-center gap-3">
                    <div className="font-bold text-sm text-gray-300 font-mono">{index + 1}. {typeDef.name.toUpperCase()}</div>
                    {!step.active && <span className="text-xs text-red-400 font-mono">[DISABLED]</span>}
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => onToggle(step.id)} className={`text-xs px-2 py-1 rounded font-bold ${step.active ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-400'}`}>
                        {step.active ? 'ON' : 'OFF'}
                    </button>
                    {!isFirst && <button onClick={() => onRemove(step.id)} className="text-gray-500 hover:text-red-500 px-2">✕</button>}
                    <div className="flex flex-col ml-2">
                        {index > 0 && <button onClick={() => onMove(index, -1)} className="text-xs hover:text-white text-gray-500">▲</button>}
                        {index < total - 1 && <button onClick={() => onMove(index, 1)} className="text-xs hover:text-white text-gray-500">▼</button>}
                    </div>
                </div>
            </div>
            {step.active && (
                <div className="flex p-2 gap-4">
                    <div className="w-[128px] h-[128px] shrink-0 border border-gray-700 bg-[#111] checkerboard relative group overflow-hidden">
                        {step.previewUrl && <img src={step.previewUrl} className="w-full h-full object-contain" alt="Step preview" />}
                        {showGizmos && <GizmoOverlay step={step} />}
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                        <div className="space-y-3">
                            {!isBasic && (
                                <div className="flex flex-col gap-1">
                                    <label className="text-gray-400">Blend Mode</label>
                                    <select
                                        value={step.blendMode}
                                        onChange={(e) => onUpdate(step.id, { blendMode: parseInt(e.target.value) })}
                                        className="bg-[#333] border border-gray-600 rounded p-1 text-white"
                                        disabled={isFirst}
                                    >
                                        {BLEND_MODES.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                    </select>
                                </div>
                            )}
                            {isBasic ? (
                                <textarea
                                    className="w-full h-32 bg-[#333] border border-gray-600 rounded p-2 text-gray-300 text-xs resize-none"
                                    value={step.note || ""}
                                    onChange={(e) => onUpdate(step.id, { note: e.target.value })}
                                />
                            ) : (
                                typeDef.controls.map(c => (
                                    <div key={c.key} className="flex flex-col gap-1">
                                        <div className="flex justify-between">
                                            <label className="text-gray-400">{c.label}</label>
                                            {c.type === 'slider' && <span className="text-gray-500">{step.params[c.key]}</span>}
                                        </div>
                                        {c.type === 'slider' ? (
                                            <input
                                                type="range"
                                                min={c.min}
                                                max={c.max}
                                                step={c.step}
                                                value={step.params[c.key]}
                                                onChange={(e) => handleParamChange(c.key, e.target.value)}
                                                className="w-full slider-thumb"
                                            />
                                        ) : (
                                            <select
                                                value={step.params[c.key]}
                                                onChange={(e) => handleParamChange(c.key, e.target.value)}
                                                className="bg-[#333] border border-gray-600 rounded p-1 text-white w-full"
                                            >
                                                {c.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                            </select>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="space-y-3 border-l border-gray-700 pl-4">
                            <div className="text-gray-500 font-bold mb-1 uppercase tracking-tighter">Global Adjust</div>
                            <div className="flex flex-col gap-1">
                                <div className="flex justify-between"><label className="text-gray-400">Power</label><span className="text-gray-500">{step.universal.power}</span></div>
                                <input type="range" min="0" max="5.0" step="0.05" value={step.universal.power} onChange={(e) => handleUnivChange('power', e.target.value)} className="w-full slider-thumb" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <div className="flex justify-between"><label className="text-gray-400">Mult</label><span className="text-gray-500">{step.universal.mult}</span></div>
                                <input type="range" min="0.0" max="5.0" step="0.05" value={step.universal.mult} onChange={(e) => handleUnivChange('mult', e.target.value)} className="w-full slider-thumb" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <div className="flex justify-between"><label className="text-gray-400">Scale</label><span className="text-gray-500">{step.universal.scale}</span></div>
                                <input type="range" min="0.0" max="2.0" step="0.01" value={step.universal.scale} onChange={(e) => handleUnivChange('scale', e.target.value)} className="w-full slider-thumb" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <div className="flex justify-between"><label className="text-gray-400">Off X</label><span className="text-gray-500">{step.universal.offsetX || 0}</span></div>
                                <input type="range" min="-1.0" max="1.0" step="0.01" value={step.universal.offsetX || 0} onChange={(e) => handleUnivChange('offsetX', e.target.value)} className="w-full slider-thumb" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <div className="flex justify-between"><label className="text-gray-400">Off Y</label><span className="text-gray-500">{step.universal.offsetY || 0}</span></div>
                                <input type="range" min="-1.0" max="1.0" step="0.01" value={step.universal.offsetY || 0} onChange={(e) => handleUnivChange('offsetY', e.target.value)} className="w-full slider-thumb" />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StepCard;
