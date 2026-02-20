"use client";

import React, { useState } from 'react';
import TextureItem from './TextureItem';
import DreamConfigPanel from './DreamConfigPanel';

const GeneratorTab = ({ dreamParams, setDreamParams, onDream, isDreaming, dreamState, onSave, onLoad, previewEngine }) => {
    const [showConfig, setShowConfig] = useState(true);
    return (
        <div className="flex flex-col h-full bg-[#0a0a0a] relative">
            <div className="p-4 border-b border-gray-800 bg-[#151515] z-30 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-white tracking-wider flex items-center gap-2"><span className="text-purple-500">✦</span> DREAM ENGINE</h2>
                    <button onClick={() => setShowConfig(!showConfig)} className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-bold border ${showConfig ? 'bg-gray-800 border-gray-600 text-white' : 'bg-[#1a1a1a] border-gray-800 text-gray-400'}`}>
                        <span>⚙️ CONFIG</span>
                        <span className="text-[10px] bg-gray-700 px-1 rounded">{showConfig ? '▲' : '▼'}</span>
                    </button>
                </div>
                {showConfig && <DreamConfigPanel params={dreamParams} setParams={setDreamParams} />}
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={dreamParams.prompt || ""}
                        onChange={(e) => setDreamParams(p => ({ ...p, prompt: e.target.value }))}
                        placeholder="Describe texture (e.g., 'Soft cloud', 'Sharp square debris')..."
                        className="flex-1 bg-[#0a0a0a] border border-gray-700 rounded px-4 py-2 text-sm text-white focus:border-purple-500 outline-none"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 pb-24 relative">
                {isDreaming && (
                    <div className="fixed top-32 left-1/2 -translate-x-1/2 bg-black/90 px-6 py-2 rounded-full border border-purple-500 text-purple-400 text-xs font-mono animate-pulse z-40 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                        {dreamState.phase}
                    </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {dreamState.results.map((item) => (
                        <TextureItem
                            key={item.id}
                            item={item}
                            engine={previewEngine}
                            isRejected={dreamState.rejectedIds.includes(item.id)}
                            rejectLabel={dreamState.rejectLabel}
                            onClick={onLoad}
                            onSave={onSave}
                        />
                    ))}
                </div>
            </div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                <button
                    onClick={onDream}
                    disabled={isDreaming}
                    className={`pointer-events-auto h-16 px-12 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold tracking-[0.2em] shadow-[0_8px_30px_rgb(0,0,0,0.6)] backdrop-blur-md border border-blue-400/30 transition-all active:scale-95 flex items-center gap-4 ${isDreaming ? 'opacity-50 cursor-wait' : ''}`}
                >
                    {isDreaming ? <span className="animate-spin text-2xl">✦</span> : <span className="text-2xl">✨</span>}
                    {isDreaming ? 'DREAMING...' : 'START DREAM'}
                </button>
            </div>
        </div>
    );
};

export default GeneratorTab;
