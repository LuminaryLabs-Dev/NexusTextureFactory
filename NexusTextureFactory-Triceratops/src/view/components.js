        function TextureItemFlip({ item, onClick, onSave, onDelete, engine, isRejected, rejectLabel, flipFrames, autoAnimate = false, flipbookConfig = null }) {
            const [frames, setFrames] = useState([]); const [fi, setFi] = useState(0); const [isH, setIsH] = useState(false); const [isL, setIsL] = useState(false); const [storedUrl, setStoredUrl] = useState(item.url || null); const [flipbookReject, setFlipbookReject] = useState(''); const hT = useRef(null); const aI = useRef(null);
            const fmtScore = (value) => (typeof value === 'number' && !Number.isNaN(value) ? value.toFixed(2) : '--');
            const fmtPct = (value) => (typeof value === 'number' && !Number.isNaN(value) ? `${(value * 100).toFixed(0)}%` : '--');
            useEffect(() => {
                let revokedUrl = null;
                let cancelled = false;
                (async () => {
                    if (!item?.storageKey) {
                        setStoredUrl(item?.url || null);
                        return;
                    }
                    try {
                        const blob = await loadTextureBlob(item.storageKey);
                        if (!blob || cancelled) return;
                        const objectUrl = URL.createObjectURL(blob);
                        revokedUrl = objectUrl;
                        setStoredUrl(objectUrl);
                        if (item?.url && typeof item.url === 'string' && item.url.startsWith('blob:')) {
                            URL.revokeObjectURL(item.url);
                        }
                    } catch (_) {
                        if (!cancelled) setStoredUrl(item?.url || null);
                    }
                })();
                return () => {
                    cancelled = true;
                    if (revokedUrl) URL.revokeObjectURL(revokedUrl);
                };
            }, [item?.storageKey, item?.url]);
            const hME = () => {
                if (isRejected) return;
                setIsH(true);
                if (frames.length > 0) return;
                hT.current = setTimeout(async () => {
                    if (!engine) return;
                    setIsL(true);
                    setFlipbookReject('');
                    const generated = [];
                    const base = JSON.parse(JSON.stringify(item.config));
                    const configuredFrames = parseInt(flipbookConfig?.global?.frameCount || flipFrames || 16);
                    const total = Math.max(2, configuredFrames);
                    const seed = flipbookConfig?.global?.seedMode === 'random'
                        ? `${item?.id || item?.name || 'preview'}|${Math.random().toString(36).slice(2)}`
                        : (item?.id || item?.name || 'preview');
                    const analyses = [];
                    const deltas = [];
                    let prevAlpha = null;
                    for (let i = 0; i < total; i++) {
                        const cfg = buildAnimatedConfigFrame(base, i, total, seed, flipbookConfig);
                        engine.renderStack(cfg);
                        analyses.push(engine.analyzeTexture(cfg.length - 1));
                        const alpha = extractAlphaFromPixels(engine.readPixels(cfg.length - 1));
                        if (prevAlpha) deltas.push(computeFrameDelta(prevAlpha, alpha));
                        prevAlpha = alpha;
                        generated.push(engine.getTextureUrl(cfg.length - 1));
                    }
                    const evalResult = evaluateFlipbookFrames(analyses, deltas, flipbookConfig?.quality);
                    if (evalResult.pass) {
                        setFrames(generated);
                    } else {
                        setFrames([]);
                        setFlipbookReject(evalResult.reason.replaceAll('_', ' '));
                    }
                    setIsL(false);
                }, 500);
            };
            const hML = () => { if (autoAnimate) return; setIsH(false); if (hT.current) clearTimeout(hT.current); setFi(0); };
            useEffect(() => {
                if (!autoAnimate || isRejected) return;
                hME();
                return () => { if (hT.current) clearTimeout(hT.current); };
            }, [autoAnimate, isRejected, item?.id]);
            useEffect(() => {
                if (!autoAnimate) setIsH(false);
            }, [autoAnimate]);
            useEffect(() => { if (isH && frames.length > 0) { aI.current = setInterval(() => { setFi(p => (p + 1) % frames.length); }, 1000 / frames.length); } else { if (aI.current) clearInterval(aI.current); setFi(0); } return () => { if (aI.current) clearInterval(aI.current); }; }, [isH, frames]);
            const dU = (isH && frames.length > 0) ? frames[fi] : (storedUrl || item.url);
            return (
                <div className={`relative aspect-square bg-[#000] checkerboard border border-gray-800 rounded overflow-hidden group dream-item-enter ${isRejected ? 'opacity-50' : 'hover:border-purple-500'}`} onMouseEnter={hME} onMouseLeave={hML}>
                    <img src={dU} className={`w-full h-full object-contain transition-opacity ${isRejected ? 'opacity-20 blur-sm' : ''}`} />
                    {isL && (<div className="absolute top-2 right-2"><div className="w-3 h-3 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div></div>)}
                    {!isL && flipbookReject && <div className="absolute top-2 right-2 bg-black/80 border border-orange-500 text-orange-300 text-[8px] px-1.5 py-0.5 rounded uppercase">{flipbookReject}</div>}
                    {isRejected && <div className="absolute inset-0 flex flex-col items-center justify-center font-bold text-red-500"><span className="text-4xl">✕</span><span className="text-xs bg-black px-1">{rejectLabel}</span></div>}
                    {!isRejected && (<>
                        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <div className="bg-black/80 border border-gray-700 rounded px-2 py-1 text-[9px] font-mono text-gray-200 leading-tight">
                                <div>alpha: {fmtScore(item.density)}</div>
                                <div>simple: {fmtScore(item.sScore)}</div>
                                <div>circle: {fmtScore(item.circularity)}</div>
                                <div>square: {fmtScore(item.squareness)}</div>
                                <div>static: {fmtPct(item.staticPct)}</div>
                            </div>
                        </div>
                        <div className="absolute bottom-0 inset-x-0 bg-black/80 p-1 text-[9px] text-gray-300 truncate text-center font-mono py-1.5">{item.name}</div>
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {onClick && <button onClick={() => onClick(item.config)} className="w-6 h-6 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs flex items-center justify-center shadow-lg" title="Edit">✎</button>}
                            {onSave && <button onClick={() => onSave(item)} className="w-6 h-6 bg-green-600 hover:bg-green-500 text-white rounded text-xs flex items-center justify-center shadow-lg" title="Save">💾</button>}
                            {onDelete && <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="w-6 h-6 bg-gray-600 hover:bg-gray-500 text-white rounded text-xs flex items-center justify-center shadow-lg" title="Delete">🗑</button>}
                        </div>
                    </>)}
                </div>
            );
        }

        function VirtualizedTextureItem(props) {
            const hostRef = useRef(null);
            const [isVisible, setIsVisible] = useState(false);

            useEffect(() => {
                const el = hostRef.current;
                if (!el) return;
                if (!('IntersectionObserver' in window)) {
                    setIsVisible(true);
                    return;
                }

                const observer = new IntersectionObserver(
                    (entries) => {
                        const entry = entries[0];
                        setIsVisible(entry.isIntersecting);
                    },
                    { root: null, rootMargin: '400px', threshold: 0.01 }
                );
                observer.observe(el);
                return () => observer.disconnect();
            }, []);

            return (
                <div ref={hostRef}>
                    {isVisible ? (
                        <TextureItemFlip {...props} />
                    ) : (
                        <div className="relative aspect-square bg-[#000] checkerboard border border-gray-900 rounded overflow-hidden">
                            <div className="absolute inset-0 bg-black/10"></div>
                        </div>
                    )}
                </div>
            );
        }

        function AddMenu({ onAdd, variant, customShaderOps = [] }) {
            const [isOpen, setIsOpen] = useState(false); const menuRef = useRef(null);
            useEffect(() => { const hCO = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setIsOpen(false); }; if (isOpen) document.addEventListener("mousedown", hCO); return () => document.removeEventListener("mousedown", hCO); }, [isOpen]);
            return (
                <div className={`relative ${variant === 'large' ? 'w-full' : 'flex justify-center py-2'}`} ref={menuRef}>
                    <button onClick={() => setIsOpen(!isOpen)} className={variant === 'large' ? "w-full py-4 border-2 border-dashed border-gray-700 hover:border-gray-500 hover:bg-[#222] text-gray-500 hover:text-white rounded-lg font-bold transition-all text-sm cursor-pointer" : "w-6 h-6 rounded-full bg-gray-700 hover:bg-blue-500 text-white flex items-center justify-center text-xs shadow-sm z-10 font-bold"}>+</button>
                    {isOpen && (
                        <div className="absolute z-50 bg-[#222] border border-gray-700 shadow-xl rounded w-56 overflow-hidden left-1/2 -translate-x-1/2 top-full mt-1 max-h-72 overflow-y-auto">
                            {STEP_MENU_GROUPS.map(g => (
                                <div key={g.label}>
                                    <div className="px-3 py-2 text-[10px] text-gray-500 font-bold bg-[#1a1a1a] border-b border-gray-800">{g.label}</div>
                                    {g.keys.map(k => (<button key={k} onClick={() => { onAdd(k); setIsOpen(false); }} className="block w-full text-left px-4 py-2 hover:bg-blue-900 text-gray-300 text-xs border-b border-gray-800 last:border-0">{STEP_TYPES[k].name}</button>))}
                                </div>
                            ))}
                            {customShaderOps.length > 0 && (
                                <div>
                                    <div className="px-3 py-2 text-[10px] text-gray-500 font-bold bg-[#1a1a1a] border-b border-gray-800">CUSTOM SHADERS</div>
                                    {customShaderOps.map(op => (
                                        <button key={op.id} onClick={() => { onAdd(`CUSTOM_OP::${op.id}`); setIsOpen(false); }} className="block w-full text-left px-4 py-2 hover:bg-blue-900 text-gray-300 text-xs border-b border-gray-800 last:border-0">{op.title || 'Untitled Shader Operation'}</button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            );
        }

        function StepCard({ step, index, total, onUpdate, onToggle, onRemove, onMove, showGizmos }) {
            const td = step.typeDef; const isF = index === 0; const isB = td.id === 15;
            const hPC = (k, v) => onUpdate(step.id, { params: { ...step.params, [k]: parseFloat(v) } });
            const hUC = (k, v) => onUpdate(step.id, { universal: { ...step.universal, [k]: parseFloat(v) } });
            return (
                <div className={`transition-all duration-300 border-l-4 bg-[#2a2a2a] mb-2 ${step.active ? 'border-blue-500' : 'border-gray-600 h-[50px] opacity-60 overflow-hidden'}`}>
                    <div className="flex items-center justify-between p-2 bg-[#252525]">
                        <div className="flex items-center gap-3"><div className="font-bold text-sm text-gray-300 font-mono">{index + 1}. {td.name.toUpperCase()}</div></div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => onToggle(step.id)} className={`text-xs px-2 py-1 rounded font-bold ${step.active ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-400'}`}>{step.active ? 'ON' : 'OFF'}</button>
                            {!isF && <button onClick={() => onRemove(step.id)} className="text-gray-500 hover:text-red-500 px-2">✕</button>}
                            <div className="flex flex-col ml-2">
                                {index > 0 && <button onClick={() => onMove(index, -1)} className="text-xs hover:text-white text-gray-500">▲</button>}
                                {index < total - 1 && <button onClick={() => onMove(index, 1)} className="text-xs hover:text-white text-gray-500">▼</button>}
                            </div>
                        </div>
                    </div>
                    {step.active && (
                        <div className="flex p-2 gap-4">
                            <div className="w-[128px] h-[128px] shrink-0 border border-gray-700 bg-[#111] checkerboard relative group overflow-hidden">
                                {step.previewUrl && <img src={step.previewUrl} className="w-full h-full object-contain" />}
                                {showGizmos && <GizmoOverlayComp step={step} />}
                            </div>
                            <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                                <div className="space-y-3">
                                    {!isB && <div className="flex flex-col gap-1"><label className="text-gray-400">Blend Mode</label><select value={step.blendMode} onChange={(e) => onUpdate(step.id, { blendMode: parseInt(e.target.value) })} className="bg-[#333] border border-gray-600 rounded p-1 text-white" disabled={isF}>{BLEND_MODES.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></div>}
                                    {isB ? <textarea className="w-full h-32 bg-[#333] border border-gray-600 rounded p-2 text-gray-300 text-xs resize-none" value={step.note || ""} onChange={(e) => onUpdate(step.id, { note: e.target.value })} /> : td.controls.map(c => <div key={c.key} className="flex flex-col gap-1"><div className="flex justify-between"><label className="text-gray-400">{c.label}</label><span>{step.params[c.key]}</span></div>{c.type === 'slider' ? <input type="range" min={c.min} max={c.max} step={c.step} value={step.params[c.key]} onChange={(e) => hPC(c.key, e.target.value)} className="w-full slider-thumb" /> : <select value={step.params[c.key]} onChange={(e) => hPC(c.key, e.target.value)} className="bg-[#333] border border-gray-600 rounded p-1 text-white w-full">{c.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>}</div>)}
                                </div>
                                <div className="space-y-3 border-l border-gray-700 pl-4">
                                    <div className="text-gray-500 font-bold mb-1 uppercase text-[10px]">Global</div>
                                    <div className="flex flex-col gap-1"><div className="flex justify-between"><label className="text-gray-400">Mult</label><span>{step.universal.mult}</span></div><input type="range" min="0" max="5" step="0.05" value={step.universal.mult} onChange={(e) => hUC('mult', e.target.value)} className="w-full slider-thumb" /></div>
                                    <div className="flex flex-col gap-1"><div className="flex justify-between"><label className="text-gray-400">Scale</label><span>{step.universal.scale}</span></div><input type="range" min="0" max="2" step="0.01" value={step.universal.scale} onChange={(e) => hUC('scale', e.target.value)} className="w-full slider-thumb" /></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        function BuilderTab({ bVM, uiVM, customOpsVM }) {
            const [isMasterPreviewCollapsed, setIsMasterPreviewCollapsed] = useState(true);
            const customShaderOps = (customOpsVM?.items || []).filter(op => op.type === 'shader');
            return (
                <div className="flex flex-col h-full">
                    <div className="h-10 bg-[#111] flex items-center justify-between px-4 border-b border-gray-800"><div className="font-bold text-gray-500 text-xs uppercase tracking-tighter">Workbench</div><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={uiVM.showGizmos} onChange={(e) => uiVM.setShowGizmos(e.target.checked)} className="accent-blue-500" /><span className="text-xs text-gray-400 font-bold">GUIDES</span></label></div>
                    <div className="flex-1 overflow-y-auto ladder-scroll p-4 bg-[#1a1a1a]">
                        {bVM.steps.map((s, i) => <React.Fragment key={s.id}><StepCard step={s} index={i} total={bVM.steps.length} onUpdate={bVM.updateStep} onToggle={bVM.toggleStep} onRemove={bVM.removeStep} onMove={bVM.moveStep} showGizmos={uiVM.showGizmos} />{i < bVM.steps.length - 1 && <AddMenu variant="interstitial" onAdd={(k) => bVM.addStep(k, i + 1)} customShaderOps={customShaderOps} />}</React.Fragment>)}
                        <AddMenu variant="large" onAdd={(k) => bVM.addStep(k, -1)} customShaderOps={customShaderOps} />
                    </div>
                    <div className={`bg-[#151515] border-t border-gray-700 shrink-0 ${isMasterPreviewCollapsed ? 'h-[48px]' : 'h-[280px] p-4'}`}>
                        <button onClick={() => setIsMasterPreviewCollapsed(p => !p)} className="w-full h-12 flex items-center justify-between px-4 text-white font-bold uppercase text-xs">
                            <span>Master Preview</span>
                            <span className="text-gray-400 text-sm">{isMasterPreviewCollapsed ? '▶' : '▼'}</span>
                        </button>
                        {!isMasterPreviewCollapsed && (
                            <div className="flex-1 flex items-center justify-center gap-8">
                                <div className="relative w-[200px] h-[200px] bg-[#111] checkerboard border border-gray-600 shadow-2xl">{bVM.finalPreviewUrl && <img src={bVM.finalPreviewUrl} className="absolute inset-0 w-full h-full object-contain" />}<div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30"><div className="w-full h-px bg-red-500"></div><div className="h-full w-px bg-red-500 absolute"></div></div></div>
                                <div className="flex flex-col gap-2">
                                    <input value={bVM.profileName} onChange={(e) => bVM.setProfileName(e.target.value)} className="bg-[#333] border border-gray-600 px-2 py-1 rounded text-white text-xs font-mono mb-4" />
                                    <div className="flex gap-1 mb-2">{[256, 512, 1024, 2048].map(r => <button key={r} onClick={() => bVM.toggleRes(r)} className={`px-2 py-1 text-[10px] rounded border font-bold ${bVM.selectedRes.includes(r) ? 'bg-blue-600 text-white border-blue-500' : 'bg-[#333] text-gray-400 border-gray-600'}`}>{r}</button>)}</div>
                                    <button onClick={bVM.onExport} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded shadow-lg text-sm uppercase">Export ZIP</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        function GeneratorTab({ dVM, libVM, previewEngine, uiVM, flipbookVM }) {
            const [showC, setShowC] = useState(true);
            const results = dVM.state.results || [];
            const liveStart = Math.max(0, results.length - 24);
            return (
                <div className="flex flex-col h-full bg-[#0a0a0a] relative">
                    <div className="p-4 border-b border-gray-800 bg-[#151515] z-30 shadow-2xl">
                        <div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-bold text-white tracking-wider font-mono uppercase"><span className="text-purple-500">✦</span> Dream Engine</h2><button onClick={() => setShowC(!showC)} className="px-3 py-1 border border-gray-700 rounded text-[10px] font-bold text-gray-400">CONFIG {showC ? '▲' : '▼'}</button></div>
	                        {showC && (
	                            <div className="bg-[#1a1a1a] border border-gray-800 rounded p-4 mb-4 grid grid-cols-3 gap-8 overflow-x-auto config-scroll">
	                                <div className="space-y-3">
	                                    <div className="text-purple-400 font-bold uppercase text-[10px]">Batching</div>
	                                    <div className="flex flex-col gap-1"><div className="flex justify-between text-gray-400"><span>Batch Size</span><span>{dVM.params.batchSize}</span></div><input type="range" min="1" max="100" step="1" value={dVM.params.batchSize} onChange={(e) => dVM.setParams(p => ({ ...p, batchSize: parseInt(e.target.value) }))} className="slider-thumb w-full" /></div>
	                                    <div className="flex flex-col gap-1"><div className="flex justify-between text-gray-400"><span>Cycles</span><span>{dVM.params.batchCycles}</span></div><input type="range" min="1" max="50" step="1" value={dVM.params.batchCycles} onChange={(e) => dVM.setParams(p => ({ ...p, batchCycles: parseInt(e.target.value) }))} className="slider-thumb w-full" /></div>
	                                    <div className="flex flex-col gap-1"><div className="flex justify-between text-gray-400"><span>Gen Workers</span><span>{dVM.params.generationWorkers}</span></div><input type="range" min="1" max="5" step="1" value={dVM.params.generationWorkers} onChange={(e) => dVM.setParams(p => ({ ...p, generationWorkers: parseInt(e.target.value) }))} className="slider-thumb w-full" /></div>
	                                    <div className="flex flex-col gap-1"><div className="flex justify-between text-gray-400"><span>Pack Workers</span><span>{dVM.params.packagingWorkers}</span></div><input type="range" min="1" max="5" step="1" value={dVM.params.packagingWorkers} onChange={(e) => dVM.setParams(p => ({ ...p, packagingWorkers: parseInt(e.target.value) }))} className="slider-thumb w-full" /></div>
	                                </div>
	                                <div className="space-y-3">
	                                    <div className="text-blue-400 font-bold uppercase text-[10px]">Complexity Range</div>
	                                    <div className="flex flex-col gap-1"><div className="flex justify-between text-gray-400"><span>Min Steps</span><span>{dVM.params.minComplexity}</span></div><input type="range" min="1" max="10" step="1" value={dVM.params.minComplexity} onChange={(e) => dVM.setParams(p => ({ ...p, minComplexity: parseInt(e.target.value) }))} className="slider-thumb w-full" /></div>
	                                    <div className="flex flex-col gap-1"><div className="flex justify-between text-gray-400"><span>Max Steps</span><span>{dVM.params.maxComplexity}</span></div><input type="range" min="1" max="10" step="1" value={dVM.params.maxComplexity} onChange={(e) => dVM.setParams(p => ({ ...p, maxComplexity: parseInt(e.target.value) }))} className="slider-thumb w-full" /></div>
	                                </div>
                                <div className="space-y-3">
                                    <div className="text-orange-400 font-bold uppercase text-[10px]">Playback</div>
                                    <div className="flex flex-col gap-1"><div className="flex justify-between text-gray-400 text-[10px]"><span>Preview Frames</span><span>{dVM.params.flipFrames}</span></div><input type="range" min="4" max="16" step="4" value={dVM.params.flipFrames} onChange={(e) => dVM.setParams(p => ({ ...p, flipFrames: parseInt(e.target.value) }))} className="slider-thumb w-full" /></div>
                                </div>
                            </div>
                        )}
                        <input type="text" value={dVM.params.prompt || ""} onChange={(e) => dVM.setParams(p => ({ ...p, prompt: e.target.value }))} placeholder="Filter description..." className="w-full bg-[#0a0a0a] border border-gray-700 rounded px-4 py-2 text-sm text-white focus:border-purple-500 outline-none" />
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 pb-48 relative">
                        {dVM.isDreaming && <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-black/90 px-6 py-2 rounded-full border border-purple-500 text-purple-400 text-xs font-mono animate-pulse z-40 shadow-2xl">{dVM.state.phase} | attempts: {dVM.state.pendingAttempts || 0} | accepted: {dVM.state.pendingAccepted || 0} | rejected: {dVM.state.pendingRejected || 0}</div>}
                        <div className="grid grid-cols-6 gap-4">{results.map((it, idx) => idx >= liveStart ? <TextureItemFlip key={it.id} item={it} engine={previewEngine} flipFrames={dVM.params.flipFrames} flipbookConfig={flipbookVM?.config} autoAnimate={uiVM?.autoAnimateFrames} onDelete={() => dVM.onDeleteResult(it.id)} onSave={libVM.onSave} onClick={libVM.onLoad} /> : <VirtualizedTextureItem key={it.id} item={it} engine={previewEngine} flipFrames={dVM.params.flipFrames} flipbookConfig={flipbookVM?.config} autoAnimate={uiVM?.autoAnimateFrames} onDelete={() => dVM.onDeleteResult(it.id)} onSave={libVM.onSave} onClick={libVM.onLoad} />)}</div>
                    </div>
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-4">
                        <div className="bg-black/80 backdrop-blur-md px-6 py-2 rounded-full border border-gray-800 flex items-center gap-4 shadow-xl pointer-events-auto">
                            <label className="flex items-center cursor-pointer select-none">
                                <div className="relative">
                                    <input type="checkbox" checked={dVM.params.autoDream} onChange={(e) => dVM.setParams(p => ({ ...p, autoDream: e.target.checked }))} className="sr-only" />
                                    <div className={`w-10 h-5 rounded-full transition-colors ${dVM.params.autoDream ? 'bg-blue-600' : 'bg-gray-700'}`}></div>
                                    <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${dVM.params.autoDream ? 'translate-x-5' : ''}`}></div>
                                </div>
                                <span className="ml-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Auto Dream</span>
                            </label>
                        </div>
                        <button onClick={dVM.onDream} disabled={dVM.isDreaming} className={`h-16 px-12 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold tracking-[0.2em] shadow-2xl border border-blue-400/30 transition-all pointer-events-auto ${dVM.isDreaming ? 'opacity-50 cursor-wait' : ''}`}>{dVM.isDreaming ? 'DREAMING...' : 'START DREAM'}</button>
                    </div>
                </div>
            );
        }

        function FiltersTab({ filtersVM }) {
            const modules = filtersVM.modules || [];
            const quality = filtersVM.quality || {};
            return (
                <div className="flex flex-col h-full bg-[#111] p-6">
                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-white">FILTERS</h2>
                        <p className="text-xs text-gray-400 mt-1">Configure acceptance gates and operation modules used during generation.</p>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                        <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Acceptance Filters</div>
                        <div className="bg-[#1a1a1a] border border-gray-800 rounded overflow-hidden">
                            <div className="flex items-center justify-between px-3 py-2 bg-[#202020]">
                                <button onClick={() => filtersVM.toggleQualityExpanded('alpha')} className="text-sm font-bold text-white">Alpha Overall</button>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => filtersVM.toggleQualityEnabled('alpha')} className={`text-[10px] px-2 py-1 rounded font-bold ${quality.alpha?.enabled ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'}`}>{quality.alpha?.enabled ? 'ON' : 'OFF'}</button>
                                    <button onClick={() => filtersVM.toggleQualityExpanded('alpha')} className="text-xs text-gray-400 w-6">{quality.alpha?.expanded ? '▼' : '▶'}</button>
                                </div>
                            </div>
                            {quality.alpha?.expanded && (
                                <div className="p-3 text-xs space-y-3">
                                    <div className="flex justify-between"><span className="text-gray-400">Min Alpha Density</span><span>{quality.alpha.min.toFixed(2)}</span></div>
                                    <input type="range" min="0" max="1" step="0.01" value={quality.alpha.min} onChange={(e) => filtersVM.updateQuality('alpha', 'min', parseFloat(e.target.value))} className="w-full slider-thumb" />
                                    <div className="flex justify-between"><span className="text-gray-400">Max Alpha Density</span><span>{quality.alpha.max.toFixed(2)}</span></div>
                                    <input type="range" min="0" max="1" step="0.01" value={quality.alpha.max} onChange={(e) => filtersVM.updateQuality('alpha', 'max', parseFloat(e.target.value))} className="w-full slider-thumb" />
                                </div>
                            )}
                        </div>
                        <div className="bg-[#1a1a1a] border border-gray-800 rounded overflow-hidden">
                            <div className="flex items-center justify-between px-3 py-2 bg-[#202020]">
                                <button onClick={() => filtersVM.toggleQualityExpanded('similarity')} className="text-sm font-bold text-white">Similarity To Previous</button>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => filtersVM.toggleQualityEnabled('similarity')} className={`text-[10px] px-2 py-1 rounded font-bold ${quality.similarity?.enabled ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'}`}>{quality.similarity?.enabled ? 'ON' : 'OFF'}</button>
                                    <button onClick={() => filtersVM.toggleQualityExpanded('similarity')} className="text-xs text-gray-400 w-6">{quality.similarity?.expanded ? '▼' : '▶'}</button>
                                </div>
                            </div>
                            {quality.similarity?.expanded && (
                                <div className="p-3 text-xs space-y-3">
                                    <div className="flex justify-between"><span className="text-gray-400">Max Similarity</span><span>{quality.similarity.maxSimilarity.toFixed(2)}</span></div>
                                    <input type="range" min="0" max="1" step="0.01" value={quality.similarity.maxSimilarity} onChange={(e) => filtersVM.updateQuality('similarity', 'maxSimilarity', parseFloat(e.target.value))} className="w-full slider-thumb" />
                                    <div className="flex justify-between"><span className="text-gray-400">History Size</span><span>{quality.similarity.historySize}</span></div>
                                    <input type="range" min="10" max="500" step="10" value={quality.similarity.historySize} onChange={(e) => filtersVM.updateQuality('similarity', 'historySize', parseInt(e.target.value))} className="w-full slider-thumb" />
                                </div>
                            )}
                        </div>
                        <div className="bg-[#1a1a1a] border border-gray-800 rounded overflow-hidden">
                            <div className="flex items-center justify-between px-3 py-2 bg-[#202020]">
                                <button onClick={() => filtersVM.toggleQualityExpanded('shape')} className="text-sm font-bold text-white">Shape Bias (Circle / Square)</button>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => filtersVM.toggleQualityEnabled('shape')} className={`text-[10px] px-2 py-1 rounded font-bold ${quality.shape?.enabled ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'}`}>{quality.shape?.enabled ? 'ON' : 'OFF'}</button>
                                    <button onClick={() => filtersVM.toggleQualityExpanded('shape')} className="text-xs text-gray-400 w-6">{quality.shape?.expanded ? '▼' : '▶'}</button>
                                </div>
                            </div>
                            {quality.shape?.expanded && (
                                <div className="p-3 text-xs space-y-3">
                                    <div className="flex justify-between"><span className="text-gray-400">Min Circularity</span><span>{quality.shape.minCircularity.toFixed(2)}</span></div>
                                    <input type="range" min="0" max="1" step="0.01" value={quality.shape.minCircularity} onChange={(e) => filtersVM.updateQuality('shape', 'minCircularity', parseFloat(e.target.value))} className="w-full slider-thumb" />
                                    <div className="flex justify-between"><span className="text-gray-400">Max Circularity</span><span>{quality.shape.maxCircularity.toFixed(2)}</span></div>
                                    <input type="range" min="0" max="1" step="0.01" value={quality.shape.maxCircularity} onChange={(e) => filtersVM.updateQuality('shape', 'maxCircularity', parseFloat(e.target.value))} className="w-full slider-thumb" />
                                    <div className="flex justify-between"><span className="text-gray-400">Min Squareness</span><span>{quality.shape.minSquareness.toFixed(2)}</span></div>
                                    <input type="range" min="0" max="1" step="0.01" value={quality.shape.minSquareness} onChange={(e) => filtersVM.updateQuality('shape', 'minSquareness', parseFloat(e.target.value))} className="w-full slider-thumb" />
                                    <div className="flex justify-between"><span className="text-gray-400">Max Squareness</span><span>{quality.shape.maxSquareness.toFixed(2)}</span></div>
                                    <input type="range" min="0" max="1" step="0.01" value={quality.shape.maxSquareness} onChange={(e) => filtersVM.updateQuality('shape', 'maxSquareness', parseFloat(e.target.value))} className="w-full slider-thumb" />
                                </div>
                            )}
                        </div>
                        <div className="bg-[#1a1a1a] border border-gray-800 rounded overflow-hidden">
                            <div className="flex items-center justify-between px-3 py-2 bg-[#202020]">
                                <button onClick={() => filtersVM.toggleQualityExpanded('staticMotion')} className="text-sm font-bold text-white">Motion Static %</button>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => filtersVM.toggleQualityEnabled('staticMotion')} className={`text-[10px] px-2 py-1 rounded font-bold ${quality.staticMotion?.enabled ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'}`}>{quality.staticMotion?.enabled ? 'ON' : 'OFF'}</button>
                                    <button onClick={() => filtersVM.toggleQualityExpanded('staticMotion')} className="text-xs text-gray-400 w-6">{quality.staticMotion?.expanded ? '▼' : '▶'}</button>
                                </div>
                            </div>
                            {quality.staticMotion?.expanded && (
                                <div className="p-3 text-xs space-y-3">
                                    <div className="flex justify-between"><span className="text-gray-400">Min Static %</span><span>{(quality.staticMotion.min * 100).toFixed(0)}%</span></div>
                                    <input type="range" min="0" max="1" step="0.01" value={quality.staticMotion.min} onChange={(e) => filtersVM.updateQuality('staticMotion', 'min', parseFloat(e.target.value))} className="w-full slider-thumb" />
                                    <div className="flex justify-between"><span className="text-gray-400">Max Static %</span><span>{(quality.staticMotion.max * 100).toFixed(0)}%</span></div>
                                    <input type="range" min="0" max="1" step="0.01" value={quality.staticMotion.max} onChange={(e) => filtersVM.updateQuality('staticMotion', 'max', parseFloat(e.target.value))} className="w-full slider-thumb" />
                                </div>
                            )}
                        </div>
                        <div className="bg-[#1a1a1a] border border-gray-800 rounded overflow-hidden">
                            <div className="flex items-center justify-between px-3 py-2 bg-[#202020]">
                                <button onClick={() => filtersVM.toggleQualityExpanded('simplicity')} className="text-sm font-bold text-white">Simplicity / Smoothness</button>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => filtersVM.toggleQualityEnabled('simplicity')} className={`text-[10px] px-2 py-1 rounded font-bold ${quality.simplicity?.enabled ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'}`}>{quality.simplicity?.enabled ? 'ON' : 'OFF'}</button>
                                    <button onClick={() => filtersVM.toggleQualityExpanded('simplicity')} className="text-xs text-gray-400 w-6">{quality.simplicity?.expanded ? '▼' : '▶'}</button>
                                </div>
                            </div>
                            {quality.simplicity?.expanded && (
                                <div className="p-3 text-xs space-y-3">
                                    <div className="flex justify-between"><span className="text-gray-400">Min Simplicity</span><span>{quality.simplicity.min.toFixed(2)}</span></div>
                                    <input type="range" min="0" max="1" step="0.01" value={quality.simplicity.min} onChange={(e) => filtersVM.updateQuality('simplicity', 'min', parseFloat(e.target.value))} className="w-full slider-thumb" />
                                    <div className="flex justify-between"><span className="text-gray-400">Max Simplicity</span><span>{quality.simplicity.max.toFixed(2)}</span></div>
                                    <input type="range" min="0" max="1" step="0.01" value={quality.simplicity.max} onChange={(e) => filtersVM.updateQuality('simplicity', 'max', parseFloat(e.target.value))} className="w-full slider-thumb" />
                                </div>
                            )}
                        </div>

                        <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold pt-3">Operation Modules</div>
                        {modules.map((m, idx) => {
                            const td = STEP_TYPES[m.key];
                            return (
                                <div key={m.id} className="bg-[#1a1a1a] border border-gray-800 rounded overflow-hidden">
                                    <div className="flex items-center justify-between px-3 py-2 bg-[#202020]">
                                        <button onClick={() => filtersVM.toggleExpanded(m.id)} className="flex items-center gap-3 text-left">
                                            <span className="text-xs text-gray-500 w-6">{idx + 1}.</span>
                                            <span className="text-sm font-bold text-white">{td.name}</span>
                                            <span className="text-[10px] px-2 py-0.5 rounded bg-[#2a2a2a] text-gray-400">{td.cat}</span>
                                        </button>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => filtersVM.move(m.id, -1)} disabled={idx === 0} className={`text-xs px-2 py-1 rounded ${idx === 0 ? 'bg-[#2a2a2a] text-gray-600' : 'bg-[#2f2f2f] text-gray-300 hover:bg-[#3b3b3b]'}`}>▲</button>
                                            <button onClick={() => filtersVM.move(m.id, 1)} disabled={idx === modules.length - 1} className={`text-xs px-2 py-1 rounded ${idx === modules.length - 1 ? 'bg-[#2a2a2a] text-gray-600' : 'bg-[#2f2f2f] text-gray-300 hover:bg-[#3b3b3b]'}`}>▼</button>
                                            <button onClick={() => filtersVM.toggleEnabled(m.id)} className={`text-[10px] px-2 py-1 rounded font-bold ${m.enabled ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'}`}>{m.enabled ? 'ON' : 'OFF'}</button>
                                            <button onClick={() => filtersVM.toggleExpanded(m.id)} className="text-xs text-gray-400 w-6">{m.expanded ? '▼' : '▶'}</button>
                                        </div>
                                    </div>
                                    {m.expanded && (
                                        <div className="p-3 grid grid-cols-2 gap-4 text-xs">
                                            <div className="space-y-3">
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-gray-400">Blend Mode</label>
                                                    <select value={m.blendMode} onChange={(e) => filtersVM.updateBlend(m.id, parseInt(e.target.value))} className="bg-[#333] border border-gray-600 rounded p-1 text-white">
                                                        {BLEND_MODES.map(mode => <option key={mode.id} value={mode.id}>{mode.name}</option>)}
                                                    </select>
                                                </div>
                                                {td.controls.map(c => (
                                                    <div key={c.key} className="flex flex-col gap-1">
                                                        <div className="flex justify-between">
                                                            <label className="text-gray-400">{c.label}</label>
                                                            <span>{m.params[c.key]}</span>
                                                        </div>
                                                        {c.type === 'slider' ? (
                                                            <input type="range" min={c.min} max={c.max} step={c.step} value={m.params[c.key]} onChange={(e) => filtersVM.updateParam(m.id, c.key, parseFloat(e.target.value))} className="w-full slider-thumb" />
                                                        ) : (
                                                            <select value={m.params[c.key]} onChange={(e) => filtersVM.updateParam(m.id, c.key, parseFloat(e.target.value))} className="bg-[#333] border border-gray-600 rounded p-1 text-white w-full">
                                                                {c.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                                            </select>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="space-y-3 border-l border-gray-700 pl-4">
                                                <div className="text-gray-500 font-bold mb-1 uppercase text-[10px]">Global</div>
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex justify-between"><label className="text-gray-400">Mult</label><span>{m.universal.mult}</span></div>
                                                    <input type="range" min="0" max="5" step="0.05" value={m.universal.mult} onChange={(e) => filtersVM.updateUniversal(m.id, 'mult', parseFloat(e.target.value))} className="w-full slider-thumb" />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex justify-between"><label className="text-gray-400">Scale</label><span>{m.universal.scale}</span></div>
                                                    <input type="range" min="0" max="2" step="0.01" value={m.universal.scale} onChange={(e) => filtersVM.updateUniversal(m.id, 'scale', parseFloat(e.target.value))} className="w-full slider-thumb" />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex justify-between"><label className="text-gray-400">Power</label><span>{m.universal.power}</span></div>
                                                    <input type="range" min="0" max="4" step="0.05" value={m.universal.power} onChange={(e) => filtersVM.updateUniversal(m.id, 'power', parseFloat(e.target.value))} className="w-full slider-thumb" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        }

        function LibraryTab({ libVM, previewEngine, uiVM, flipbookVM }) {
            return (
                <div className="flex flex-col h-full bg-[#111] p-6">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-white">LIBRARY</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <div className="grid grid-cols-8 gap-4">
                            {libVM.items.map((it) => <VirtualizedTextureItem key={it.id} item={it} engine={previewEngine} onClick={libVM.onLoad} onDelete={() => libVM.onDelete(it.id)} flipFrames={16} flipbookConfig={flipbookVM?.config} autoAnimate={uiVM?.autoAnimateFrames} />)}
                        </div>
                    </div>
                </div>
            );
        }

        function SetsTab({ libVM, previewEngine, uiVM, flipbookVM }) {
            const cfg = libVM.packConfig || {};
            const setCfg = (patch) => libVM.setPackConfig(prev => ({ ...prev, ...patch }));
            return (
                <div className="flex flex-col h-full bg-[#111] p-6">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-white">SETS</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <div className="bg-[#1a1a1a] border border-gray-800 rounded p-4 mb-6">
                        <div className="text-[11px] font-bold text-gray-300 mb-3 uppercase tracking-wide">Pack Sorting Config</div>
                        <div className="flex justify-end mb-3">
                            <button onClick={() => libVM.reorganizePacks?.()} className="text-[10px] px-3 py-1.5 rounded font-bold bg-[#2f2f2f] hover:bg-[#3b3b3b] text-gray-200 border border-gray-700">
                                REORGANIZE PACKS
                            </button>
                        </div>
                        <div className="grid grid-cols-4 gap-3 text-xs">
                                <div className="flex flex-col gap-1">
                                    <label className="text-gray-400">Group By</label>
                                    <select value={cfg.groupBy || 'prefix'} onChange={(e) => setCfg({ groupBy: e.target.value })} className="bg-[#333] border border-gray-600 rounded p-1 text-white">
                                        <option value="prefix">Name Prefix</option>
                                        <option value="shape_variant">Shape + Variant</option>
                                        <option value="full">Full Name</option>
                                        <option value="volume_fill">Volume Fill</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-gray-400">Sort By</label>
                                    <select value={cfg.sortBy || 'name'} onChange={(e) => setCfg({ sortBy: e.target.value })} className="bg-[#333] border border-gray-600 rounded p-1 text-white">
                                        <option value="name">Name</option>
                                        <option value="density">Alpha Density</option>
                                        <option value="simplicity">Simplicity</option>
                                        <option value="circularity">Circularity</option>
                                        <option value="squareness">Squareness</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-gray-400">Direction</label>
                                    <select value={cfg.sortDir || 'asc'} onChange={(e) => setCfg({ sortDir: e.target.value })} className="bg-[#333] border border-gray-600 rounded p-1 text-white">
                                        <option value="asc">Ascending</option>
                                        <option value="desc">Descending</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-gray-400">Sets</label>
                                    <div className="bg-[#252525] border border-gray-700 rounded p-1.5 text-gray-300">{libVM.sets.length}</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="flex flex-col gap-1 text-xs">
                                    <div className="flex justify-between"><label className="text-gray-400">Max Items Per Pack</label><span>{cfg.maxItemsPerPack || 50}</span></div>
                                    <input type="range" min="1" max="200" step="1" value={cfg.maxItemsPerPack || 50} onChange={(e) => setCfg({ maxItemsPerPack: parseInt(e.target.value) })} className="w-full slider-thumb" />
                                </div>
                                <div className="flex flex-col gap-1 text-xs">
                                    <div className="flex justify-between"><label className="text-gray-400">Prefix Group Depth</label><span>{cfg.groupDepth || 2}</span></div>
                                    <input type="range" min="1" max="6" step="1" value={cfg.groupDepth || 2} onChange={(e) => setCfg({ groupDepth: parseInt(e.target.value) })} className="w-full slider-thumb" />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-8">{libVM.sets.map(set => (
                            <div key={set.id} className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800">
                                <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                                    {(cfg.groupBy === 'volume_fill')
                                        ? <h3 className="text-white font-bold text-sm">{set.name} <span className="text-gray-500 text-xs font-normal">({set.items.length})</span></h3>
                                        : <EditableSetName set={set} libVM={libVM} />}
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => libVM.deleteSet(set)} disabled={libVM.exportingSetId !== null} className={`text-[10px] px-3 py-1.5 rounded font-bold transition-colors ${libVM.exportingSetId !== null ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-[#2f2f2f] hover:bg-[#3b3b3b] text-gray-200'}`}>
                                            DELETE SET
                                        </button>
                                        <button onClick={() => libVM.exportSet(set)} disabled={libVM.exportingSetId !== null} className={`text-[10px] px-3 py-1.5 rounded font-bold transition-colors ${libVM.exportingSetId === set.id ? 'bg-gray-600 cursor-wait' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg'}`}>
                                            {libVM.exportingSetId === set.id ? 'PACKING...' : '⬇ DOWNLOAD FULL SET'}
                                        </button>
                                    </div>
                                </div>
                                {(libVM.exportingSetId === set.id && libVM.exportPhase) && (
                                    <div className="text-[10px] text-blue-300 mb-3 font-mono">{libVM.exportPhase}</div>
                                )}
                                {(libVM.exportingSetId === null && libVM.exportError) && (
                                    <div className="text-[10px] text-red-400 mb-3 font-mono">{libVM.exportError}</div>
                                )}
                                <div className="grid grid-cols-10 gap-2">
                                    {set.items.map((it) => <VirtualizedTextureItem key={it.id} item={it} engine={previewEngine} onClick={libVM.onLoad} onDelete={() => libVM.onDelete(it.id)} flipFrames={16} flipbookConfig={flipbookVM?.config} autoAnimate={uiVM?.autoAnimateFrames} />)}
                                </div>
                            </div>
                        ))}</div>
                    </div>
                </div>
            );
        }

        function OperationsTab({ customOpsVM }) {
            const customOps = Array.isArray(customOpsVM?.items) ? customOpsVM.items : [];
            const [blendOpen, setBlendOpen] = useState(false);
            const operationRows = Object.entries(STEP_TYPES).map(([key, def]) => ({
                key,
                name: def.name,
                category: def.cat,
                description: OPERATION_EXPLANATIONS[key] || "No description available."
            }));

            return (
                <div className="flex flex-col h-full bg-[#111] p-6">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-white">OPERATIONS</h2>
                        <p className="text-xs text-gray-400 mt-1">Reference for each built-in operation and blend mode behavior.</p>
                    </div>

                    <div className="mb-6 bg-[#1a1a1a] border border-gray-800 rounded">
                        <button onClick={() => setBlendOpen(v => !v)} className="w-full px-3 py-2 text-left flex items-center justify-between">
                            <span className="text-sm font-bold text-gray-300">Blend Modes</span>
                            <span className="text-xs text-gray-500">{blendOpen ? '▲' : '▼'}</span>
                        </button>
                        {blendOpen && (
                            <div className="grid grid-cols-1 gap-2 text-xs p-3 pt-0">
                                <div className="bg-[#111] border border-gray-800 rounded px-3 py-2"><span className="font-bold text-white">Overwrite:</span> replace previous alpha with current step output.</div>
                                <div className="bg-[#111] border border-gray-800 rounded px-3 py-2"><span className="font-bold text-white">Subtract:</span> remove current alpha from previous output.</div>
                                <div className="bg-[#111] border border-gray-800 rounded px-3 py-2"><span className="font-bold text-white">Multiply:</span> keep only overlapping alpha.</div>
                                <div className="bg-[#111] border border-gray-800 rounded px-3 py-2"><span className="font-bold text-white">Add:</span> combine alphas and clamp at full.</div>
                                <div className="bg-[#111] border border-gray-800 rounded px-3 py-2"><span className="font-bold text-white">Max (Lighten):</span> keep stronger alpha per pixel.</div>
                                <div className="bg-[#111] border border-gray-800 rounded px-3 py-2"><span className="font-bold text-white">Min (Darken):</span> keep weaker alpha per pixel.</div>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <h3 className="text-sm font-bold text-gray-300 mb-2">Step Operations</h3>
                        <div className="space-y-2">
                            {operationRows.map((row) => (
                                <div key={row.key} className="bg-[#1a1a1a] border border-gray-800 rounded px-3 py-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-white font-bold text-sm">{row.name}</span>
                                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#2a2a2a] text-gray-400">{row.category}</span>
                                    </div>
                                    <div className="text-xs text-gray-400">{row.description}</div>
                                </div>
                            ))}
                        </div>

                        <h3 className="text-sm font-bold text-gray-300 mt-6 mb-2">Custom Operations</h3>
                        {customOps.length === 0 && <div className="text-xs text-gray-500">No custom operations yet. Add from the Editor tab.</div>}
                        <div className="space-y-2">
                            {customOps.map((op) => (
                                <div key={op.id} className="bg-[#1a1a1a] border border-gray-800 rounded px-3 py-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-white font-bold text-sm">{op.title || 'Untitled Custom Operation'}</span>
                                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#2a2a2a] text-gray-400">{op.type === 'shader' ? 'CUSTOM SHADER' : 'CUSTOM JS'}</span>
                                    </div>
                                    <div className="text-xs text-gray-400">{op.description || 'No description provided.'}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        function EditorTab({ customOpsVM }) {
            const customOps = Array.isArray(customOpsVM?.items) ? customOpsVM.items : [];
            const addCustomOp = typeof customOpsVM?.add === 'function' ? customOpsVM.add : () => { };
            const [shaderCode, setShaderCode] = useState(DEFAULT_CUSTOM_GLSL);
            const [shaderStatus, setShaderStatus] = useState('Idle');
            const [shaderTitle, setShaderTitle] = useState('Custom Shader Operation');
            const [shaderDescription, setShaderDescription] = useState('');
            const [selectedShaderOpId, setSelectedShaderOpId] = useState('');
            const [jsCode, setJsCode] = useState(DEFAULT_CUSTOM_JS);
            const [jsStatus, setJsStatus] = useState('Idle');
            const [jsTitle, setJsTitle] = useState('Custom Performance Operation');
            const [jsDescription, setJsDescription] = useState('');
            const [selectedJsOpId, setSelectedJsOpId] = useState('');
            const shaderCanvasRef = useRef(null);
            const jsCanvasRef = useRef(null);
            const shaderOps = customOps.filter(op => op.type === 'shader');
            const jsOps = customOps.filter(op => op.type === 'js');

            const runShaderTest = useCallback(() => {
                const canvas = shaderCanvasRef.current;
                if (!canvas) return;
                const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true, alpha: false });
                if (!gl) {
                    setShaderStatus('WebGL unavailable');
                    return;
                }

                const vsSource = `attribute vec2 position; varying vec2 vUv; void main() { vUv = position * 0.5 + 0.5; gl_Position = vec4(position, 0.0, 1.0); }`;
                const fsSource = `precision mediump float;
varying vec2 vUv;
${shaderCode}
void main() {
    float a = clamp(customOp(vUv), 0.0, 1.0);
    gl_FragColor = vec4(1.0, 1.0, 1.0, a);
}`;

                const compileShader = (type, source) => {
                    const shader = gl.createShader(type);
                    gl.shaderSource(shader, source);
                    gl.compileShader(shader);
                    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                        const err = gl.getShaderInfoLog(shader) || 'Shader compile failed';
                        gl.deleteShader(shader);
                        throw new Error(err);
                    }
                    return shader;
                };

                try {
                    const vertex = compileShader(gl.VERTEX_SHADER, vsSource);
                    const fragment = compileShader(gl.FRAGMENT_SHADER, fsSource);
                    const program = gl.createProgram();
                    gl.attachShader(program, vertex);
                    gl.attachShader(program, fragment);
                    gl.linkProgram(program);
                    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                        const err = gl.getProgramInfoLog(program) || 'Program link failed';
                        throw new Error(err);
                    }

                    const buffer = gl.createBuffer();
                    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);

                    gl.useProgram(program);
                    const pos = gl.getAttribLocation(program, 'position');
                    gl.enableVertexAttribArray(pos);
                    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
                    gl.viewport(0, 0, canvas.width, canvas.height);
                    gl.drawArrays(gl.TRIANGLES, 0, 6);

                    gl.deleteBuffer(buffer);
                    gl.deleteProgram(program);
                    gl.deleteShader(vertex);
                    gl.deleteShader(fragment);
                    setShaderStatus('Compiled and rendered');
                } catch (err) {
                    setShaderStatus(`Shader error: ${String(err.message || err).slice(0, 180)}`);
                }
            }, [shaderCode]);

            const runJsPerfTest = useCallback(() => {
                const canvas = jsCanvasRef.current;
                if (!canvas) return;
                const ctx = canvas.getContext('2d');
                const width = canvas.width;
                const height = canvas.height;
                const image = ctx.createImageData(width, height);
                const started = performance.now();

                try {
                    const perfFn = new Function('x', 'y', 'uvx', 'uvy', 'w', 'h', jsCode);
                    for (let y = 0; y < height; y++) {
                        for (let x = 0; x < width; x++) {
                            const uvx = x / (width - 1);
                            const uvy = y / (height - 1);
                            const result = perfFn(x, y, uvx, uvy, width, height);
                            const alpha = Math.max(0, Math.min(1, Number(result) || 0));
                            const v = Math.floor(alpha * 255);
                            const idx = (y * width + x) * 4;
                            image.data[idx] = 255;
                            image.data[idx + 1] = 255;
                            image.data[idx + 2] = 255;
                            image.data[idx + 3] = v;
                        }
                    }
                    ctx.putImageData(image, 0, 0);
                    const ms = performance.now() - started;
                    setJsStatus(`Rendered in ${ms.toFixed(2)} ms`);
                } catch (err) {
                    setJsStatus(`Code error: ${String(err.message || err).slice(0, 180)}`);
                }
            }, [jsCode]);

            useEffect(() => { runShaderTest(); }, [runShaderTest]);
            useEffect(() => { runJsPerfTest(); }, [runJsPerfTest]);

            const handleSelectShaderOp = (opId) => {
                setSelectedShaderOpId(opId);
                const selected = shaderOps.find(op => op.id === opId);
                if (!selected) return;
                setShaderTitle(selected.title || '');
                setShaderDescription(selected.description || '');
                setShaderCode(selected.code || DEFAULT_CUSTOM_GLSL);
            };

            const handleSelectJsOp = (opId) => {
                setSelectedJsOpId(opId);
                const selected = jsOps.find(op => op.id === opId);
                if (!selected) return;
                setJsTitle(selected.title || '');
                setJsDescription(selected.description || '');
                setJsCode(selected.code || DEFAULT_CUSTOM_JS);
            };

            const addShaderOperation = () => {
                const newOp = {
                    id: `custom-shader-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                    type: 'shader',
                    title: shaderTitle.trim() || 'Untitled Shader Operation',
                    description: shaderDescription.trim(),
                    code: shaderCode
                };
                addCustomOp(newOp);
                setSelectedShaderOpId(newOp.id);
            };

            const addJsOperation = () => {
                const newOp = {
                    id: `custom-js-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                    type: 'js',
                    title: jsTitle.trim() || 'Untitled Performance Operation',
                    description: jsDescription.trim(),
                    code: jsCode
                };
                addCustomOp(newOp);
                setSelectedJsOpId(newOp.id);
            };

            return (
                <div className="flex flex-col h-full bg-[#111] p-6">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-white">EDITOR</h2>
                        <p className="text-xs text-gray-400 mt-1">Define and test custom shader/performance operation code blocks on a square preview.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#1a1a1a] border border-gray-800 rounded p-3">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-bold text-white">Custom Shader Block (GLSL/HLSL-style)</h3>
                                <div className="flex gap-2">
                                    <button onClick={addShaderOperation} className="text-[10px] px-2 py-1 rounded bg-green-600 hover:bg-green-500 text-white font-bold">ADD OPERATION</button>
                                    <button onClick={runShaderTest} className="text-[10px] px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold">TEST</button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-2 mb-2">
                                <select value={selectedShaderOpId} onChange={(e) => handleSelectShaderOp(e.target.value)} className="bg-[#0f0f0f] border border-gray-700 rounded px-2 py-1 text-[11px] text-gray-200">
                                    <option value="">Select custom shader operation...</option>
                                    {shaderOps.map(op => <option key={op.id} value={op.id}>{op.title}</option>)}
                                </select>
                                <input value={shaderTitle} onChange={(e) => setShaderTitle(e.target.value)} placeholder="Operation Title" className="bg-[#0f0f0f] border border-gray-700 rounded px-2 py-1 text-[11px] text-gray-200" />
                                <input value={shaderDescription} onChange={(e) => setShaderDescription(e.target.value)} placeholder="Operation Description" className="bg-[#0f0f0f] border border-gray-700 rounded px-2 py-1 text-[11px] text-gray-200" />
                            </div>
                            <p className="text-[10px] text-gray-500 mb-2">Define `customOp(vec2 uv)` and return alpha 0..1.</p>
                            <textarea value={shaderCode} onChange={(e) => setShaderCode(e.target.value)} className="w-full h-40 bg-[#0f0f0f] border border-gray-700 rounded p-2 text-[11px] text-gray-200 font-mono resize-none" />
                            <div className="mt-2 flex items-center gap-3">
                                <canvas ref={shaderCanvasRef} width="192" height="192" className="w-32 h-32 border border-gray-700 checkerboard bg-black" />
                                <div className="text-[10px] text-gray-400">{shaderStatus}</div>
                            </div>
                        </div>

                        <div className="bg-[#1a1a1a] border border-gray-800 rounded p-3">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-bold text-white">Custom Performance Code Block (JS)</h3>
                                <div className="flex gap-2">
                                    <button onClick={addJsOperation} className="text-[10px] px-2 py-1 rounded bg-green-600 hover:bg-green-500 text-white font-bold">ADD OPERATION</button>
                                    <button onClick={runJsPerfTest} className="text-[10px] px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold">TEST</button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-2 mb-2">
                                <select value={selectedJsOpId} onChange={(e) => handleSelectJsOp(e.target.value)} className="bg-[#0f0f0f] border border-gray-700 rounded px-2 py-1 text-[11px] text-gray-200">
                                    <option value="">Select custom JS operation...</option>
                                    {jsOps.map(op => <option key={op.id} value={op.id}>{op.title}</option>)}
                                </select>
                                <input value={jsTitle} onChange={(e) => setJsTitle(e.target.value)} placeholder="Operation Title" className="bg-[#0f0f0f] border border-gray-700 rounded px-2 py-1 text-[11px] text-gray-200" />
                                <input value={jsDescription} onChange={(e) => setJsDescription(e.target.value)} placeholder="Operation Description" className="bg-[#0f0f0f] border border-gray-700 rounded px-2 py-1 text-[11px] text-gray-200" />
                            </div>
                            <p className="text-[10px] text-gray-500 mb-2">Return alpha 0..1 using `(x, y, uvx, uvy, w, h)`.</p>
                            <textarea value={jsCode} onChange={(e) => setJsCode(e.target.value)} className="w-full h-40 bg-[#0f0f0f] border border-gray-700 rounded p-2 text-[11px] text-gray-200 font-mono resize-none" />
                            <div className="mt-2 flex items-center gap-3">
                                <canvas ref={jsCanvasRef} width="192" height="192" className="w-32 h-32 border border-gray-700 checkerboard bg-black" />
                                <div className="text-[10px] text-gray-400">{jsStatus}</div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        function SettingsTab({ uiVM }) {
            return (
                <div className="flex flex-col h-full bg-[#111] p-6">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-white">SETTINGS</h2>
                        <p className="text-xs text-gray-400 mt-1">Global runtime and preview behavior.</p>
                    </div>
                    <div className="max-w-xl bg-[#1a1a1a] border border-gray-800 rounded p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-bold text-white">Auto Animated Frames</div>
                                <div className="text-xs text-gray-400 mt-1">Auto-play flipbook previews for loaded texture cards without hover.</div>
                            </div>
                            <label className="flex items-center cursor-pointer select-none">
                                <div className="relative">
                                    <input type="checkbox" checked={!!uiVM.autoAnimateFrames} onChange={(e) => uiVM.setAutoAnimateFrames(e.target.checked)} className="sr-only" />
                                    <div className={`w-10 h-5 rounded-full transition-colors ${uiVM.autoAnimateFrames ? 'bg-blue-600' : 'bg-gray-700'}`}></div>
                                    <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${uiVM.autoAnimateFrames ? 'translate-x-5' : ''}`}></div>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            );
        }

        function FlipbookTab({ flipbookVM }) {
            const cfg = flipbookVM?.config;
            if (!cfg) return <div className="p-6 text-gray-400">Flipbook configuration unavailable.</div>;
            const opEntries = Object.entries(STEP_TYPES).filter(([_, td]) => Array.isArray(td.controls) && td.controls.length > 0);
            return (
                <div className="flex flex-col h-full bg-[#111] p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-white">FLIPBOOK</h2>
                            <p className="text-xs text-gray-400 mt-1">Per-operation animation controls and sequence quality gates.</p>
                        </div>
                        <button onClick={() => flipbookVM.resetDefaults()} className="text-[10px] px-3 py-1.5 rounded font-bold bg-[#2f2f2f] hover:bg-[#3b3b3b] text-gray-200 border border-gray-700">RESET DEFAULTS</button>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                        <div className="bg-[#1a1a1a] border border-gray-800 rounded p-3">
                            <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-3">Global Motion</div>
                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div className="flex items-center justify-between"><span className="text-gray-300">Enabled</span><button onClick={() => flipbookVM.updateGlobal('enabled', !cfg.global.enabled)} className={`text-[10px] px-2 py-1 rounded font-bold ${cfg.global.enabled ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'}`}>{cfg.global.enabled ? 'ON' : 'OFF'}</button></div>
                                <div className="flex flex-col gap-1">
                                    <div className="flex justify-between"><span className="text-gray-400">Frame Count</span><span>{cfg.global.frameCount}</span></div>
                                    <input type="range" min="2" max="32" step="1" value={cfg.global.frameCount} onChange={(e) => flipbookVM.updateGlobal('frameCount', parseInt(e.target.value))} className="w-full slider-thumb" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <div className="flex justify-between"><span className="text-gray-400">Strength</span><span>{cfg.global.strength.toFixed(2)}</span></div>
                                    <input type="range" min="0" max="2" step="0.01" value={cfg.global.strength} onChange={(e) => flipbookVM.updateGlobal('strength', parseFloat(e.target.value))} className="w-full slider-thumb" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <div className="flex justify-between"><span className="text-gray-400">Base Speed</span><span>{cfg.global.baseSpeed.toFixed(2)}</span></div>
                                    <input type="range" min="0.1" max="4" step="0.05" value={cfg.global.baseSpeed} onChange={(e) => flipbookVM.updateGlobal('baseSpeed', parseFloat(e.target.value))} className="w-full slider-thumb" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-[#1a1a1a] border border-gray-800 rounded p-3">
                            <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-3">Quality Gates</div>
                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div className="flex items-center justify-between"><span className="text-gray-300">Enabled</span><button onClick={() => flipbookVM.updateQuality('enabled', !cfg.quality.enabled)} className={`text-[10px] px-2 py-1 rounded font-bold ${cfg.quality.enabled ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'}`}>{cfg.quality.enabled ? 'ON' : 'OFF'}</button></div>
                                <div className="flex flex-col gap-1"><div className="flex justify-between"><span className="text-gray-400">Min Frame Density</span><span>{cfg.quality.minFrameDensity.toFixed(3)}</span></div><input type="range" min="0" max="0.3" step="0.001" value={cfg.quality.minFrameDensity} onChange={(e) => flipbookVM.updateQuality('minFrameDensity', parseFloat(e.target.value))} className="w-full slider-thumb" /></div>
                                <div className="flex flex-col gap-1"><div className="flex justify-between"><span className="text-gray-400">Max Empty Ratio</span><span>{cfg.quality.maxEmptyFrameRatio.toFixed(2)}</span></div><input type="range" min="0" max="1" step="0.01" value={cfg.quality.maxEmptyFrameRatio} onChange={(e) => flipbookVM.updateQuality('maxEmptyFrameRatio', parseFloat(e.target.value))} className="w-full slider-thumb" /></div>
                                <div className="flex flex-col gap-1"><div className="flex justify-between"><span className="text-gray-400">Min Motion Delta</span><span>{cfg.quality.minFrameDelta.toFixed(3)}</span></div><input type="range" min="0" max="0.15" step="0.001" value={cfg.quality.minFrameDelta} onChange={(e) => flipbookVM.updateQuality('minFrameDelta', parseFloat(e.target.value))} className="w-full slider-thumb" /></div>
                                <div className="flex flex-col gap-1"><div className="flex justify-between"><span className="text-gray-400">Max Motion Delta</span><span>{cfg.quality.maxFrameDelta.toFixed(3)}</span></div><input type="range" min="0.01" max="1" step="0.001" value={cfg.quality.maxFrameDelta} onChange={(e) => flipbookVM.updateQuality('maxFrameDelta', parseFloat(e.target.value))} className="w-full slider-thumb" /></div>
                            </div>
                        </div>
                        <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold pt-1">Operation Ladder</div>
                        {opEntries.map(([key, td], idx) => {
                            const op = cfg.operations?.[key];
                            if (!op) return null;
                            return (
                                <div key={key} className="bg-[#1a1a1a] border border-gray-800 rounded overflow-hidden">
                                    <div className="flex items-center justify-between px-3 py-2 bg-[#202020]">
                                        <button onClick={() => flipbookVM.toggleOperationExpanded(key)} className="flex items-center gap-3 text-left">
                                            <span className="text-xs text-gray-500 w-6">{idx + 1}.</span>
                                            <span className="text-sm font-bold text-white">{td.name}</span>
                                        </button>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => flipbookVM.toggleOperationEnabled(key)} className={`text-[10px] px-2 py-1 rounded font-bold ${op.enabled ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'}`}>{op.enabled ? 'ON' : 'OFF'}</button>
                                            <button onClick={() => flipbookVM.toggleOperationExpanded(key)} className="text-xs text-gray-400 w-6">{op.expanded ? '▼' : '▶'}</button>
                                        </div>
                                    </div>
                                    {op.expanded && (
                                        <div className="p-3 text-xs grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex justify-between"><span className="text-gray-400">Operation Speed</span><span>{op.speed.toFixed(2)}</span></div>
                                                    <input type="range" min="0.1" max="4" step="0.05" value={op.speed} onChange={(e) => flipbookVM.updateOperation(key, { speed: parseFloat(e.target.value) })} className="w-full slider-thumb" />
                                                </div>
                                                {Object.entries(op.params || {}).map(([paramKey, paramCfg]) => (
                                                    <div key={paramKey} className="bg-[#151515] border border-gray-800 rounded p-2">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="text-gray-300">{paramKey}</span>
                                                            <button onClick={() => flipbookVM.updateParam(key, paramKey, { enabled: !paramCfg.enabled })} className={`text-[10px] px-2 py-0.5 rounded font-bold ${paramCfg.enabled ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'}`}>{paramCfg.enabled ? 'ON' : 'OFF'}</button>
                                                        </div>
                                                        <div className="flex justify-between"><span className="text-gray-500">Range</span><span>{Number(paramCfg.range).toFixed(3)}</span></div>
                                                        <input type="range" min="0" max="2" step="0.001" value={paramCfg.range} onChange={(e) => flipbookVM.updateParam(key, paramKey, { range: parseFloat(e.target.value) })} className="w-full slider-thumb" />
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="space-y-2">
                                                {['mult', 'scale'].map((uKey) => {
                                                    const u = op.universal?.[uKey];
                                                    if (!u) return null;
                                                    return (
                                                        <div key={uKey} className="bg-[#151515] border border-gray-800 rounded p-2">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <span className="text-gray-300">{uKey}</span>
                                                                <button onClick={() => flipbookVM.updateUniversal(key, uKey, { enabled: !u.enabled })} className={`text-[10px] px-2 py-0.5 rounded font-bold ${u.enabled ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'}`}>{u.enabled ? 'ON' : 'OFF'}</button>
                                                            </div>
                                                            <div className="flex justify-between"><span className="text-gray-500">Range</span><span>{Number(u.range).toFixed(3)}</span></div>
                                                            <input type="range" min="0" max="1" step="0.001" value={u.range} onChange={(e) => flipbookVM.updateUniversal(key, uKey, { range: parseFloat(e.target.value) })} className="w-full slider-thumb" />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        }

        function EditableSetName({ set, libVM }) {
            const [isE, setIsE] = useState(false); const [lN, setLN] = useState(set.name); const iR = useRef(null);
            useEffect(() => { if (isE) iR.current?.focus(); }, [isE]);
            const hC = () => { setIsE(false); if (lN !== set.name) libVM.renameSet(set.baseKey || set.name, lN); };
            if (isE) return <input ref={iR} className="bg-[#333] border border-blue-500 rounded px-2 py-0.5 text-white font-bold text-sm outline-none" value={lN} onChange={(e) => setLN(e.target.value)} onBlur={hC} onKeyDown={(e) => e.key === 'Enter' && hC()} />;
            return <h3 onClick={() => setIsE(true)} className="text-white font-bold cursor-pointer hover:text-blue-400 transition-colors group flex items-center gap-2 text-sm">{set.name} <span className="opacity-0 group-hover:opacity-100 text-[8px] bg-blue-600/30 px-1 rounded text-blue-300">EDIT</span> <span className="text-gray-500 text-xs font-normal">({set.items.length})</span></h3>;
        }

        // ==========================================
        // 5. VIEW MODEL
        // ==========================================
