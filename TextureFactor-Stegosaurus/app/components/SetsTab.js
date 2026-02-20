"use client";

import React, { useState } from 'react';
import TextureItem from './TextureItem';

const SetsTab = ({ library, onLoad, onDelete, handleAutoOrganize, sets, previewEngine }) => {
    const [view, setView] = useState('library');
    return (
        <div className="flex flex-col h-full bg-[#111] p-6">
            <div className="flex justify-between mb-6">
                <div className="flex gap-4">
                    <button onClick={() => setView('library')} className={`text-xl font-bold ${view === 'library' ? 'text-white' : 'text-gray-500'}`}>LIBRARY</button>
                    <button onClick={() => setView('sets')} className={`text-xl font-bold ${view === 'sets' ? 'text-white' : 'text-gray-500'}`}>SETS</button>
                </div>
                <button onClick={handleAutoOrganize} className="bg-purple-600 hover:bg-purple-500 text-white text-xs px-4 py-2 rounded font-bold">✨ AUTO-ORGANIZE</button>
            </div>
            <div className="flex-1 overflow-y-auto">
                {view === 'library' ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                        {library.map((item, i) => (
                            <TextureItem key={i} item={item} engine={previewEngine} onClick={onLoad} onDelete={() => onDelete(i)} />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-8">
                        {sets.length === 0 && <div className="text-gray-500 text-center py-20 font-mono">No sets created yet. Run Auto-Organize!</div>}
                        {sets.map(set => (
                            <div key={set.id} className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800">
                                <h3 className="text-white font-bold mb-4 border-b border-gray-700 pb-2">{set.name} <span className="text-gray-500 text-xs">({set.items.length})</span></h3>
                                <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                                    {set.items.map((item, i) => <div key={i} className="aspect-square bg-black rounded overflow-hidden border border-gray-700"><img src={item.url} className="w-full h-full object-contain" alt="Set item" /></div>)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SetsTab;
