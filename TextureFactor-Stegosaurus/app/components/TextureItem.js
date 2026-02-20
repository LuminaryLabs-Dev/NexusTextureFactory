"use client";

import React, { useState, useEffect, useRef } from 'react';

const TextureItem = ({ item, onClick, onSave, onDelete, engine, isRejected, rejectLabel }) => {
    const [frames, setFrames] = useState([]);
    const [frameIdx, setFrameIdx] = useState(0);
    const [isHovering, setIsHovering] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const hoverTimer = useRef(null);
    const animInterval = useRef(null);

    const handleMouseEnter = () => {
        if (isRejected) return;
        setIsHovering(true);
        if (frames.length > 0) return;
        hoverTimer.current = setTimeout(async () => {
            if (!engine) return;
            setIsLoading(true);
            const generatedFrames = [];
            const baseConfig = JSON.parse(JSON.stringify(item.config));
            for (let i = 0; i < 16; i++) {
                const frameConfig = baseConfig.map(step => ({ ...step, universal: { ...step.universal, offsetY: (step.universal.offsetY || 0) + (i * 0.05) } }));
                engine.renderStack(frameConfig);
                generatedFrames.push(engine.getTextureUrl(frameConfig.length - 1));
            }
            setFrames(generatedFrames);
            setIsLoading(false);
        }, 2000);
    };

    const handleMouseLeave = () => {
        setIsHovering(false);
        if (hoverTimer.current) clearTimeout(hoverTimer.current);
        setFrameIdx(0);
    };

    useEffect(() => {
        if (isHovering && frames.length > 0) {
            animInterval.current = setInterval(() => {
                setFrameIdx(prev => (prev + 1) % frames.length);
            }, 60);
        } else {
            if (animInterval.current) clearInterval(animInterval.current);
            setFrameIdx(0);
        }
        return () => { if (animInterval.current) clearInterval(animInterval.current); };
    }, [isHovering, frames]);

    const displayUrl = (isHovering && frames.length > 0) ? frames[frameIdx] : item.url;

    return (
        <div
            className={`relative aspect-square bg-[#000] checkerboard border border-gray-800 rounded overflow-hidden group dream-item-enter ${isRejected ? 'opacity-50' : 'hover:border-purple-500'}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <img src={displayUrl} className={`w-full h-full object-contain transition-opacity ${isRejected ? 'opacity-20 blur-sm' : ''}`} alt="Texture preview" />
            {isLoading && (<div className="absolute top-2 right-2"><div className="w-3 h-3 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div></div>)}
            {isRejected && <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-red-500 text-4xl font-bold">✕</span><span className="text-[10px] text-red-400 bg-black/80 px-1 rounded">{rejectLabel}</span></div>}
            {!isRejected && (
                <>
                    <div className="absolute top-1 left-1 bg-black/60 px-1 rounded text-[10px] text-gray-400 font-mono pointer-events-none">D:{(item.density * 100).toFixed(0)}%</div>
                    <div className="absolute top-5 left-1 bg-black/60 px-1 rounded text-[10px] text-blue-400 font-mono pointer-events-none">C:{(item.cScore * 100).toFixed(0)}%</div>
                    <div className="absolute top-9 left-1 bg-black/60 px-1 rounded text-[10px] text-purple-400 font-mono pointer-events-none">S:{(item.sScore * 100).toFixed(0)}%</div>
                    <div className="absolute bottom-0 inset-x-0 bg-black/80 p-1 text-[9px] text-gray-300 truncate text-center font-mono">{item.name}</div>
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {onClick && <button onClick={() => onClick(item.config)} className="w-6 h-6 bg-blue-600 text-white rounded text-xs flex items-center justify-center">✎</button>}
                        {onSave && <button onClick={() => onSave(item)} className="w-6 h-6 bg-green-600 text-white rounded text-xs flex items-center justify-center">💾</button>}
                        {onDelete && <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="w-6 h-6 bg-red-600 text-white rounded text-xs flex items-center justify-center">🗑</button>}
                    </div>
                </>
            )}
        </div>
    );
};

export default TextureItem;
