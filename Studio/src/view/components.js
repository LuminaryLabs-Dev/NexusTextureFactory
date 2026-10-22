        const INTEGRATIONS_GUIDE_TEXT = `INTEGRATIONS GUIDE

Purpose
- Use this tab as the operator guide for the local toolkit.
- The toolkit is a local optional HTTP sidecar and is not required for GitHub Pages.
- Browser-driving tools are exposed through the toolkit catalog, but executed through Codex Browser View and local Playwright MCP.

How to use the tools
1. Start the local toolkit server if you want HTTP tool access.
2. Open Spinosaurus locally or on GitHub Pages.
3. Check toolkit health and load the catalog.
4. Run a categorized tool from the toolkit panel or through HTTP.
5. For browser-driving tools, follow the returned operator instructions in Codex Browser View.

HTTP paths
- GET /toolkit/health
- GET /toolkit/catalog
- POST /toolkit/run
- GET /toolkit/runs/latest
- GET /toolkit/logs

Tool categories
- session
- app
- capture
- inspect
- input
- preview
- loop

Execution modes
- server_local: handled entirely by the local toolkit server
- external_operator: carried out in Codex Browser View / local Playwright MCP
- hybrid: server bookkeeping plus Browser View execution

Recommended loop
1. GET /toolkit/catalog
2. POST /toolkit/run with a category and tool
3. Follow the returned instructions
4. Capture before and after evidence in Browser View when the result is visual
5. GET /toolkit/runs/latest and GET /toolkit/logs to review the latest state

Clipboard copy
- The copy button copies this guide text exactly.
- If clipboard access is blocked by the browser, use the visible guide text as the source of truth.
`;

	        function TextureItemFlip({ item, onClick, onSave, onDelete, onPreview, engine, isRejected, rejectLabel, flipFrames, autoAnimate = false, flipbookConfig = null, dragEnabled = false, onReorder = null, onSendToFront = null, onSendToBack = null, displayName = null, maskViewMode = DEFAULT_MASK_VIEW_MODE }) {
            const [frames, setFrames] = useState([]); const [fi, setFi] = useState(0); const [isH, setIsH] = useState(false); const [isL, setIsL] = useState(false); const [storedUrl, setStoredUrl] = useState(item.url || null); const [displayUrl, setDisplayUrl] = useState(item.url || null); const [flipbookReject, setFlipbookReject] = useState(''); const hT = useRef(null); const aI = useRef(null);
            const fmtScore = (value) => (typeof value === 'number' && !Number.isNaN(value) ? value.toFixed(2) : '--');
            const fmtPct = (value) => (typeof value === 'number' && !Number.isNaN(value) ? `${(value * 100).toFixed(0)}%` : '--');
            const onDragStart = (e) => {
                if (!dragEnabled || !item?.id) return;
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('application/x-ntf-id', String(item.id));
                e.dataTransfer.setData('text/plain', String(item.id));
            };
            const onDragOver = (e) => {
                if (!dragEnabled) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
            };
            const onDrop = (e) => {
                if (!dragEnabled) return;
                e.preventDefault();
                const sourceId = e.dataTransfer.getData('application/x-ntf-id') || e.dataTransfer.getData('text/plain');
                if (!sourceId || sourceId === String(item?.id)) return;
                if (typeof onReorder === 'function') onReorder(sourceId, item.id);
            };
	            useEffect(() => {
	                let revokedUrl = null;
	                let cancelled = false;
	                (async () => {
	                    if (item?.url) {
	                        setStoredUrl(item.url);
	                        return;
	                    }
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
	                    } catch (_) {
	                        if (!cancelled) setStoredUrl(item?.url || null);
	                    }
	                })();
                return () => {
                    cancelled = true;
                    if (revokedUrl) URL.revokeObjectURL(revokedUrl);
                };
            }, [item?.storageKey, item?.url]);
            useEffect(() => {
                let cancelled = false;
                if (!storedUrl || maskViewMode !== 'bw') {
                    setDisplayUrl(storedUrl || item?.url || null);
                    return;
                }
                const img = new Image();
                img.onload = () => {
                    if (cancelled) return;
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.fillStyle = 'black';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);
                    setDisplayUrl(canvas.toDataURL('image/png'));
                };
                img.onerror = () => {
                    if (!cancelled) setDisplayUrl(storedUrl || item?.url || null);
                };
                img.src = storedUrl;
                return () => { cancelled = true; };
            }, [storedUrl, item?.url, maskViewMode]);
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
                    for (let i = 0; i < total; i++) {
                        const cfg = buildAnimatedConfigFrame(base, i, total, seed, flipbookConfig);
                        engine.renderStack(cfg);
                        generated.push(engine.getTextureUrl(cfg.length - 1, { mode: maskViewMode }));
                    }
                    setFrames(generated);
                    setIsL(false);
                }, 500);
            };
            const hML = () => { if (autoAnimate) return; setIsH(false); if (hT.current) clearTimeout(hT.current); setFi(0); };
            useEffect(() => {
                if (!autoAnimate || isRejected) return;
                hME();
                return () => { if (hT.current) clearTimeout(hT.current); };
            }, [autoAnimate, isRejected, item?.id, maskViewMode]);
            useEffect(() => {
                if (!autoAnimate) setIsH(false);
            }, [autoAnimate]);
            useEffect(() => {
                setFrames([]);
                setFi(0);
            }, [maskViewMode, item?.id]);
            useEffect(() => { if (isH && frames.length > 0) { aI.current = setInterval(() => { setFi(p => (p + 1) % frames.length); }, 1000 / frames.length); } else { if (aI.current) clearInterval(aI.current); setFi(0); } return () => { if (aI.current) clearInterval(aI.current); }; }, [isH, frames]);
            const dU = (isH && frames.length > 0) ? frames[fi] : (displayUrl || storedUrl || item.url);
            return (
                <div
                    className={`relative aspect-square bg-[#000] checkerboard border border-gray-800 rounded overflow-hidden group dream-item-enter ${isRejected ? 'opacity-50' : 'hover:border-purple-500'} ${dragEnabled ? 'cursor-move' : ''}`}
                    onMouseEnter={hME}
                    onMouseLeave={hML}
                    draggable={dragEnabled}
                    onDragStart={onDragStart}
                    onDragOver={onDragOver}
                    onDrop={onDrop}
                >
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
                                <div>change: {fmtPct(item.changeScore)}</div>
                                <div>jitter: {fmtPct(item.jitterScore)}</div>
                            </div>
                        </div>
                        <div className="absolute bottom-0 inset-x-0 bg-black/80 p-1 text-[9px] text-gray-300 truncate text-center font-mono py-1.5">{displayName || item.name}</div>
	                        <div className="absolute top-2 right-2 flex flex-col items-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex gap-1">
	                            {onClick && <button onClick={() => onClick(item.config)} className="w-6 h-6 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs flex items-center justify-center shadow-lg" title="Edit">✎</button>}
                                {onPreview && <button onClick={() => onPreview(item.id)} className="min-w-[28px] h-6 px-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded text-[9px] flex items-center justify-center shadow-lg font-bold" title="Preview">3D</button>}
	                            {onSave && <button onClick={() => onSave(item)} className="w-6 h-6 bg-green-600 hover:bg-green-500 text-white rounded text-xs flex items-center justify-center shadow-lg" title="Save">💾</button>}
	                            {onDelete && <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="w-6 h-6 bg-gray-600 hover:bg-gray-500 text-white rounded text-xs flex items-center justify-center shadow-lg" title="Delete">🗑</button>}
                            </div>
                            {onSendToFront && <button onClick={(e) => { e.stopPropagation(); onSendToFront(item.id); }} className="w-6 h-6 bg-[#1f3b61] hover:bg-[#295181] text-white rounded text-xs flex items-center justify-center shadow-lg" title="Send to Front">↑</button>}
                            {onSendToBack && <button onClick={(e) => { e.stopPropagation(); onSendToBack(item.id); }} className="w-6 h-6 bg-[#3b2f1f] hover:bg-[#5a482e] text-white rounded text-xs flex items-center justify-center shadow-lg" title="Send to Back">↓</button>}
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

        function OpenSlotTile() {
            return (
                <div className="relative aspect-square bg-[#000] checkerboard border border-dashed border-gray-700 rounded overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-gray-500 uppercase tracking-wide">
                        Open Slot
                    </div>
                </div>
            );
        }

        function FactoryLadderItem({ item, onClick, onPreview, maskViewMode = DEFAULT_MASK_VIEW_MODE }) {
            const [storedUrl, setStoredUrl] = useState(item.url || null);
            const [displayUrl, setDisplayUrl] = useState(item.url || null);
            const fmtScore = (value) => (typeof value === 'number' && !Number.isNaN(value) ? value.toFixed(2) : '--');
            const fmtPct = (value) => (typeof value === 'number' && !Number.isNaN(value) ? `${(value * 100).toFixed(0)}%` : '--');
            useEffect(() => {
                let revokedUrl = null;
                let cancelled = false;
                (async () => {
                    if (item?.url) {
                        setStoredUrl(item.url);
                        return;
                    }
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
                    } catch (_) {
                        if (!cancelled) setStoredUrl(item?.url || null);
                    }
                })();
                return () => {
                    cancelled = true;
                    if (revokedUrl) URL.revokeObjectURL(revokedUrl);
                };
            }, [item?.storageKey, item?.url]);
            useEffect(() => {
                let cancelled = false;
                if (!storedUrl || maskViewMode !== 'bw') {
                    setDisplayUrl(storedUrl || item?.url || null);
                    return;
                }
                const img = new Image();
                img.onload = () => {
                    if (cancelled) return;
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.fillStyle = 'black';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);
                    setDisplayUrl(canvas.toDataURL('image/png'));
                };
                img.onerror = () => {
                    if (!cancelled) setDisplayUrl(storedUrl || item?.url || null);
                };
                img.src = storedUrl;
                return () => { cancelled = true; };
            }, [storedUrl, item?.url, maskViewMode]);
            return (
                <div className="w-full h-[92px] bg-[#111] border border-gray-800 hover:border-blue-500/70 rounded overflow-hidden flex items-stretch text-left">
                    <div className="w-[92px] h-[92px] shrink-0 checkerboard bg-black border-r border-gray-800">
                        <button onClick={() => onClick?.(item.config)} className="w-full h-full">
                            <img src={displayUrl || storedUrl || item.url} className="w-full h-full object-contain" />
                        </button>
                    </div>
                    <div className="flex-1 px-3 py-2 flex flex-col justify-between min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <button onClick={() => onClick?.(item.config)} className="text-[11px] text-white font-mono truncate text-left">{item.name}</button>
                            {onPreview && <button onClick={() => onPreview(item.id)} className="text-[9px] px-2 py-1 rounded bg-violet-600 hover:bg-violet-500 text-white font-bold shrink-0">3D</button>}
                        </div>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-gray-400 font-mono">
                            <div>alpha: {fmtScore(item.density)}</div>
                            <div>simple: {fmtScore(item.sScore)}</div>
                            <div>circle: {fmtScore(item.circularity)}</div>
                            <div>square: {fmtScore(item.squareness)}</div>
                            <div>change: {fmtPct(item.changeScore)}</div>
                            <div>jitter: {fmtPct(item.jitterScore)}</div>
                        </div>
                    </div>
                </div>
            );
        }

        function VirtualizedFactoryItem(props) {
            const hostRef = useRef(null);
            const [isVisible, setIsVisible] = useState(false);
            useEffect(() => {
                const el = hostRef.current;
                if (!el) return;
                if (!('IntersectionObserver' in window)) {
                    setIsVisible(true);
                    return;
                }
                const observer = new IntersectionObserver((entries) => {
                    const entry = entries[0];
                    setIsVisible(entry.isIntersecting);
                }, { root: null, rootMargin: '500px', threshold: 0.01 });
                observer.observe(el);
                return () => observer.disconnect();
            }, []);
            return (
                <div ref={hostRef}>
                    {isVisible ? (
                        <FactoryLadderItem {...props} />
                    ) : (
                        <div className="w-full h-[92px] bg-[#111] border border-gray-900 rounded"></div>
                    )}
                </div>
            );
        }

        function OpenFactorySlotRow() {
            return (
                <div className="w-full h-[92px] bg-[#111] border border-dashed border-gray-700 rounded flex items-center justify-center text-[10px] font-mono uppercase tracking-wide text-gray-500">
                    Open Slot
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
            const [page, setPage] = useState(1);
            const results = dVM.state.results || [];
            const pageSize = 200;
            const totalPages = Math.max(1, Math.ceil(results.length / pageSize));
            useEffect(() => {
                setPage((p) => {
                    const clamped = Math.max(1, Math.min(p, totalPages));
                    return clamped;
                });
            }, [totalPages]);
            const pageStart = (page - 1) * pageSize;
            const pageEnd = pageStart + pageSize;
            const pageResults = results.slice(pageStart, pageEnd);
            const liveStart = Math.max(0, pageResults.length - 24);
            const cfg = libVM?.packConfig || {};
            const reorderEnabled = cfg.groupBy === 'volume_fill' && (cfg.sortBy || 'none') === 'none';
            const complexityRangeRef = useRef(null);
            const complexityDragHandleRef = useRef(null);
            const complexityMinBound = 1;
            const complexityMaxBound = 20;
            const complexitySpan = complexityMaxBound - complexityMinBound;
            const minComplexity = Math.max(complexityMinBound, Math.min(complexityMaxBound, dVM.params.minComplexity));
            const maxComplexity = Math.max(complexityMinBound, Math.min(complexityMaxBound, dVM.params.maxComplexity));
            const minComplexityPercent = ((minComplexity - complexityMinBound) / complexitySpan) * 100;
            const maxComplexityPercent = ((maxComplexity - complexityMinBound) / complexitySpan) * 100;
            const overdrive = Math.max(0, Math.min(1, Number(dVM.params.overdrive ?? 0)));
            const overdrivePercent = Math.round(overdrive * 100);
            const onMinComplexityChange = (value) => {
                const rawMin = Math.max(complexityMinBound, Math.min(parseInt(value), complexityMaxBound));
                dVM.setParams((p) => {
                    const nextMax = rawMin > p.maxComplexity ? rawMin : p.maxComplexity;
                    return { ...p, minComplexity: rawMin, maxComplexity: nextMax };
                });
            };
            const onMaxComplexityChange = (value) => {
                const rawMax = Math.min(complexityMaxBound, Math.max(parseInt(value), complexityMinBound));
                dVM.setParams((p) => {
                    const nextMin = rawMax < p.minComplexity ? rawMax : p.minComplexity;
                    return { ...p, minComplexity: nextMin, maxComplexity: rawMax };
                });
            };
            const getComplexityFromClientX = (clientX) => {
                const element = complexityRangeRef.current;
                if (!element) return minComplexity;
                const rect = element.getBoundingClientRect();
                if (rect.width <= 0) return minComplexity;
                const t = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
                return Math.round(complexityMinBound + t * complexitySpan);
            };
            const applyComplexityFromPointer = (handle, value) => {
                if (handle === 'min') onMinComplexityChange(value);
                else onMaxComplexityChange(value);
            };
            const onComplexityMouseDown = (e) => {
                const clickedValue = getComplexityFromClientX(e.clientX);
                const distToMin = Math.abs(clickedValue - minComplexity);
                const distToMax = Math.abs(clickedValue - maxComplexity);
                const nearestHandle = distToMin <= distToMax ? 'min' : 'max';
                complexityDragHandleRef.current = nearestHandle;
                applyComplexityFromPointer(nearestHandle, clickedValue);
                const onMove = (moveEvent) => {
                    if (!complexityDragHandleRef.current) return;
                    const value = getComplexityFromClientX(moveEvent.clientX);
                    applyComplexityFromPointer(complexityDragHandleRef.current, value);
                };
                const onUp = () => {
                    complexityDragHandleRef.current = null;
                    window.removeEventListener('mousemove', onMove);
                    window.removeEventListener('mouseup', onUp);
                };
                window.addEventListener('mousemove', onMove);
                window.addEventListener('mouseup', onUp);
                e.preventDefault();
            };
            return (
                <div className="flex flex-col h-full bg-[#0a0a0a] relative">
                    <div className="p-4 border-b border-gray-800 bg-[#151515] z-30 shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-white tracking-wider font-mono uppercase"><span className="text-purple-500">✦</span> Dream Engine</h2>
                            <div className="flex items-center gap-2">
                                <button onClick={() => dVM.onClearAll?.()} disabled={results.length === 0} className={`px-3 py-1 rounded text-[10px] font-bold border ${results.length === 0 ? 'border-gray-800 text-gray-600 cursor-not-allowed bg-[#171717]' : 'border-red-800 text-red-300 hover:text-white hover:bg-red-700/60 bg-[#1f1515]'}`}>CLEAR ALL</button>
                                <button onClick={() => setShowC(!showC)} className="px-3 py-1 border border-gray-700 rounded text-[10px] font-bold text-gray-400">CONFIG {showC ? '▲' : '▼'}</button>
                            </div>
                        </div>
	                        {showC && (
		                            <div className="bg-[#1a1a1a] border border-gray-800 rounded p-4 mb-4 overflow-x-auto config-scroll">
                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex justify-between text-gray-400"><span>Overdrive</span><span>{overdrivePercent}%</span></div>
                                            <input type="range" min="0" max="1" step="0.01" value={overdrive} onChange={(e) => dVM.setParams(p => ({ ...p, overdrive: parseFloat(e.target.value) }))} className="slider-thumb w-full" />
                                        </div>
		                                    <div className="flex flex-col gap-1">
	                                        <div className="flex justify-between text-gray-400"><span>Complexity</span><span>{minComplexity}-{maxComplexity}</span></div>
                                            <div ref={complexityRangeRef} className="relative h-4 cursor-pointer" onMouseDown={onComplexityMouseDown}>
                                                <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 rounded bg-[#333]"></div>
                                                <div className="absolute top-1/2 h-1 -translate-y-1/2 rounded bg-blue-500" style={{ left: `${minComplexityPercent}%`, right: `${100 - maxComplexityPercent}%` }}></div>
                                                <div className="absolute top-1/2 z-20 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500" style={{ left: `${minComplexityPercent}%` }}></div>
                                                <div className="absolute top-1/2 z-20 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500" style={{ left: `${maxComplexityPercent}%` }}></div>
                                            </div>
		                                    </div>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex justify-between text-gray-400"><span>Seed Variation</span><span>{Number(dVM.params.randStrength || 0).toFixed(2)}</span></div>
                                            <input type="range" min="0" max="1" step="0.01" value={dVM.params.randStrength || 0} onChange={(e) => dVM.setParams(p => ({ ...p, randStrength: parseFloat(e.target.value) }))} disabled={!uiVM?.useWorkbenchSeed} className={`slider-thumb w-full ${uiVM?.useWorkbenchSeed ? '' : 'opacity-40 cursor-not-allowed'}`} />
                                            <div className="text-[10px] text-gray-500">{uiVM?.useWorkbenchSeed ? 'Applies only to active seeded workbench steps.' : 'Enable workbench seeding in Settings to use this.'}</div>
                                        </div>
                                    </div>
                            </div>
                        )}
                        <input type="text" value={dVM.params.prompt || ""} onChange={(e) => dVM.setParams(p => ({ ...p, prompt: e.target.value }))} placeholder="Filter description..." className="w-full bg-[#0a0a0a] border border-gray-700 rounded px-4 py-2 text-sm text-white focus:border-purple-500 outline-none" />
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 pb-48 relative">
                        {dVM.isDreaming && <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-black/90 px-6 py-2 rounded-full border border-purple-500 text-purple-400 text-xs font-mono animate-pulse z-40 shadow-2xl">{dVM.state.phase} | attempts: {dVM.state.pendingAttempts || 0} | accepted: {dVM.state.pendingAccepted || 0} | rejected: {dVM.state.pendingRejected || 0} | gen:{dVM.state.activeGenWorkers || 0} | backfill:{dVM.state.activeBackfillWorkers || 0} | queue:{dVM.state.pendingBackfill || 0}</div>}
                        <div className="grid grid-cols-2 gap-2">{pageResults.map((it, idx) => {
                            if (it?.__slotOpen) return <OpenFactorySlotRow key={it.id} />;
                            const itemProps = { item: it, onClick: libVM.onLoad, onPreview: libVM.openInPreview, maskViewMode: uiVM?.maskViewMode };
                            return idx >= liveStart ? <FactoryLadderItem key={it.id} {...itemProps} /> : <VirtualizedFactoryItem key={it.id} {...itemProps} />;
                        })}</div>
                        <div className="mt-4 flex items-center justify-center gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className={`px-3 py-1.5 rounded text-[10px] font-bold border ${page <= 1 ? 'border-gray-800 text-gray-600 cursor-not-allowed bg-[#171717]' : 'border-gray-700 text-gray-200 hover:bg-[#2a2a2a] bg-[#1d1d1d]'}`}>PREV</button>
                            <div className="px-3 py-1.5 rounded text-[10px] font-mono text-gray-300 border border-gray-800 bg-[#151515]">PAGE {page} / {totalPages}</div>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className={`px-3 py-1.5 rounded text-[10px] font-bold border ${page >= totalPages ? 'border-gray-800 text-gray-600 cursor-not-allowed bg-[#171717]' : 'border-gray-700 text-gray-200 hover:bg-[#2a2a2a] bg-[#1d1d1d]'}`}>NEXT</button>
                        </div>
                    </div>
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center">
                        <button
                            onClick={dVM.isDreaming ? dVM.onStop : dVM.onDream}
                            className={`h-16 px-12 text-white rounded-full font-bold tracking-[0.2em] shadow-2xl transition-all pointer-events-auto ${dVM.isDreaming ? 'bg-[#2a1515] hover:bg-red-700/70 border border-red-700/60' : 'bg-blue-600 hover:bg-blue-500 border border-blue-400/30'}`}
                        >
                            {dVM.isDreaming ? 'STOP' : 'DREAM'}
                        </button>
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
                                <button onClick={() => filtersVM.toggleQualityExpanded('temporalChange')} className="text-sm font-bold text-white">Temporal Change</button>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => filtersVM.toggleQualityEnabled('temporalChange')} className={`text-[10px] px-2 py-1 rounded font-bold ${quality.temporalChange?.enabled ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'}`}>{quality.temporalChange?.enabled ? 'ON' : 'OFF'}</button>
                                    <button onClick={() => filtersVM.toggleQualityExpanded('temporalChange')} className="text-xs text-gray-400 w-6">{quality.temporalChange?.expanded ? '▼' : '▶'}</button>
                                </div>
                            </div>
                            {quality.temporalChange?.expanded && (
                                <div className="p-3 text-xs space-y-3">
                                    <div className="flex justify-between"><span className="text-gray-400">Min Change</span><span>{(quality.temporalChange.minChange * 100).toFixed(0)}%</span></div>
                                    <input type="range" min="0" max="1" step="0.01" value={quality.temporalChange.minChange} onChange={(e) => filtersVM.updateQuality('temporalChange', 'minChange', parseFloat(e.target.value))} className="w-full slider-thumb" />
                                    <div className="flex justify-between"><span className="text-gray-400">Max Change</span><span>{(quality.temporalChange.maxChange * 100).toFixed(0)}%</span></div>
                                    <input type="range" min="0" max="1" step="0.01" value={quality.temporalChange.maxChange} onChange={(e) => filtersVM.updateQuality('temporalChange', 'maxChange', parseFloat(e.target.value))} className="w-full slider-thumb" />
                                    <div className="flex justify-between"><span className="text-gray-400">Max Jitter</span><span>{(quality.temporalChange.maxJitter * 100).toFixed(0)}%</span></div>
                                    <input type="range" min="0" max="1" step="0.01" value={quality.temporalChange.maxJitter} onChange={(e) => filtersVM.updateQuality('temporalChange', 'maxJitter', parseFloat(e.target.value))} className="w-full slider-thumb" />
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
                            {libVM.items.map((it) => <VirtualizedTextureItem key={it.id} item={it} engine={previewEngine} onClick={libVM.onLoad} onPreview={libVM.openInPreview} onDelete={() => libVM.onDelete(it.id)} flipFrames={16} flipbookConfig={flipbookVM?.config} autoAnimate={uiVM?.autoAnimateFrames} maskViewMode={uiVM?.maskViewMode} />)}
                        </div>
                    </div>
                </div>
            );
        }

        function SetsTab({ libVM, previewEngine, uiVM, flipbookVM }) {
            const cfg = libVM.packConfig || {};
            const setCfg = (patch) => libVM.setPackConfig(prev => ({ ...prev, ...patch }));
            const reorderEnabled = cfg.groupBy === 'volume_fill' && (cfg.sortBy || 'none') === 'none';
            const gridColumns = Math.max(1, Math.min(12, Number(uiVM?.gridColumns ?? DEFAULT_SET_GRID_COLUMNS) || DEFAULT_SET_GRID_COLUMNS));
            const getExportStemPreview = (value) => {
                const raw = String(value || '').trim();
                const tokens = raw.match(/[A-Za-z0-9]+/g) || [];
                if (tokens.length === 0) return 'TexturePack';
                return tokens.map((token) => token.charAt(0).toUpperCase() + token.slice(1)).join('') || 'TexturePack';
            };
            const getSetItemPreviewName = (setName, itemIndex) => `${getExportStemPreview(setName)}_${String(itemIndex + 1).padStart(2, '0')}_x<res>.png`;
            return (
                <div className="flex flex-col h-full bg-[#111] p-6">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-white">SETS</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <div className="bg-[#1a1a1a] border border-gray-800 rounded p-4 mb-6">
                        <div className="text-[11px] font-bold text-gray-300 mb-3 uppercase tracking-wide">Pack Sorting Config</div>
                        <div className="flex justify-end mb-3 gap-2">
                            <button onClick={() => libVM.deleteAllSets?.()} disabled={libVM.exportingSetId !== null || (libVM.items || []).length === 0} className={`text-[10px] px-3 py-1.5 rounded font-bold border ${libVM.exportingSetId !== null || (libVM.items || []).length === 0 ? 'bg-[#171717] border-gray-800 text-gray-600 cursor-not-allowed' : 'bg-[#2a1515] border-red-900 text-red-300 hover:bg-red-700/50 hover:text-white'}`}>
                                DELETE ALL SETS
                            </button>
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
                                    <select value={cfg.sortBy || 'none'} onChange={(e) => setCfg({ sortBy: e.target.value })} className="bg-[#333] border border-gray-600 rounded p-1 text-white">
                                        <option value="none">None</option>
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
                                    <div className="min-w-0">
                                        <EditableSetName set={set} libVM={libVM} />
                                        <div className="text-[10px] text-gray-500 font-mono mt-1 truncate">
                                            {`${getExportStemPreview(set.name)}_01_x<res>.png`}
                                        </div>
                                    </div>
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
                                <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))` }}>
	                                    {set.items.map((it, idx) => <VirtualizedTextureItem key={it.id} item={it} displayName={getSetItemPreviewName(set.name, idx)} engine={previewEngine} onClick={libVM.onLoad} onPreview={libVM.openInPreview} onDelete={() => libVM.onDelete(it.id)} flipFrames={16} flipbookConfig={flipbookVM?.config} autoAnimate={uiVM?.autoAnimateFrames} maskViewMode={uiVM?.maskViewMode} dragEnabled={reorderEnabled} onReorder={libVM.reorderByDrag} onSendToFront={reorderEnabled ? libVM.sendToFront : null} onSendToBack={reorderEnabled ? libVM.sendToBack : null} />)}
	                                </div>
	                            </div>
	                        ))}</div>
                    </div>
                </div>
            );
        }

        function PreviewEmptyState({ previewVM }) {
            return (
                <div className="h-full flex items-center justify-center">
                    <div className="max-w-md border border-gray-800 bg-[#1a1a1a] p-6 text-center">
                        <div className="text-lg font-bold text-white mb-2">Select A Source Texture</div>
                        <div className="text-sm text-gray-400">Pick a saved texture from the source dropdown or use the `3D` action on a Factory or Sets card.</div>
                        <div className="mt-4">
                            <select value={previewVM.activeSourceId || ''} onChange={(e) => previewVM.selectSource(e.target.value || null)} className="w-full bg-[#252525] border border-gray-700 px-3 py-2 text-sm text-white">
                                <option value="">Choose a texture...</option>
                                {previewVM.sourceItems.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            );
        }

        function PreviewUnsupportedState() {
            return (
                <div className="h-full flex items-center justify-center">
                    <div className="max-w-md border border-red-900/60 bg-[#181010] p-6 text-center">
                        <div className="text-lg font-bold text-red-200 mb-2">Preview Requires WebGL</div>
                        <div className="text-sm text-red-100/70">This browser or GPU context does not expose the rendering features the preview runtime needs.</div>
                    </div>
                </div>
            );
        }

        function PreviewLayerList({ previewVM }) {
            const preset = previewVM.activePreset;
            if (!preset) return null;
            return (
                <div className="h-full flex flex-col bg-[#161616] border-b border-gray-800 xl:border-b-0 xl:border-r">
                    <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
                        <div className="text-sm font-bold text-white">Layers</div>
                        <button onClick={() => previewVM.addLayer()} className="text-[10px] px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold">ADD</button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        {preset.layers.map((layer, idx) => (
                            <div key={layer.id} onClick={() => previewVM.selectLayer(layer.id)} className={`w-full text-left rounded border p-3 cursor-pointer ${previewVM.selectedLayerId === layer.id ? 'border-blue-500 bg-[#1a2332]' : 'border-gray-800 bg-[#1b1b1b]'}`}>
                                <div className="flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                        <div className="text-sm text-white font-bold truncate">{layer.name}</div>
                                        <div className="text-[10px] text-gray-500">{layer.maxParticles} particles</div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button onClick={(e) => { e.stopPropagation(); previewVM.updateLayerSection(layer.id, 'root', { enabled: !layer.enabled }); }} className={`text-[10px] px-2 py-1 rounded ${layer.enabled ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'}`}>{layer.enabled ? 'ON' : 'OFF'}</button>
                                        <button onClick={(e) => { e.stopPropagation(); previewVM.reorderLayer(layer.id, -1); }} disabled={idx === 0} className="text-xs px-2 py-1 rounded bg-[#262626] text-gray-300 disabled:text-gray-600">▲</button>
                                        <button onClick={(e) => { e.stopPropagation(); previewVM.reorderLayer(layer.id, 1); }} disabled={idx === preset.layers.length - 1} className="text-xs px-2 py-1 rounded bg-[#262626] text-gray-300 disabled:text-gray-600">▼</button>
                                        <button onClick={(e) => { e.stopPropagation(); previewVM.duplicateLayer(layer.id); }} className="text-[10px] px-2 py-1 rounded bg-[#2f2f2f] text-gray-200">COPY</button>
                                        <button onClick={(e) => { e.stopPropagation(); previewVM.deleteLayer(layer.id); }} className="text-[10px] px-2 py-1 rounded bg-[#311919] text-red-300">DEL</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        function PreviewField({ label, children }) {
            return (
                <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-gray-400">{label}</label>
                    {children}
                </div>
            );
        }

        function PreviewVec3Editor({ label, value, onChange, step = 0.01 }) {
            return (
                <PreviewField label={label}>
                    <div className="grid grid-cols-3 gap-2">
                        {value.map((entry, index) => (
                            <input key={index} type="number" step={step} value={entry} onChange={(e) => onChange(value.map((item, itemIndex) => itemIndex === index ? parseFloat(e.target.value || 0) : item))} className="bg-[#232323] border border-gray-700 rounded px-2 py-1 text-xs text-white" />
                        ))}
                    </div>
                </PreviewField>
            );
        }

        function PreviewRangeEditor({ label, value, onChange, step = 0.01 }) {
            return (
                <PreviewField label={label}>
                    <div className="grid grid-cols-2 gap-2">
                        <input type="number" step={step} value={value[0]} onChange={(e) => onChange([parseFloat(e.target.value || 0), value[1]])} className="bg-[#232323] border border-gray-700 rounded px-2 py-1 text-xs text-white" />
                        <input type="number" step={step} value={value[1]} onChange={(e) => onChange([value[0], parseFloat(e.target.value || 0)])} className="bg-[#232323] border border-gray-700 rounded px-2 py-1 text-xs text-white" />
                    </div>
                </PreviewField>
            );
        }

        function PreviewJsonEditor({ previewVM }) {
            return (
                <div className="border border-gray-800 bg-[#1a1a1a] overflow-hidden">
                    <div className="px-3 py-2 border-b border-gray-800 flex items-center justify-between">
                        <div className="text-sm font-bold text-white">Preset JSON</div>
                        <div className="flex gap-2">
                            <button onClick={() => previewVM.resetJsonDraft()} className="text-[10px] px-2 py-1 border border-gray-700 bg-[#2f2f2f] text-gray-200 font-bold">RESET</button>
                            <button onClick={() => previewVM.applyJsonDraft(previewVM.jsonDraft)} className="text-[10px] px-2 py-1 border border-blue-500 bg-blue-600 text-white font-bold">APPLY</button>
                        </div>
                    </div>
                    {previewVM.jsonError && <div className="px-3 py-2 text-xs text-red-300 whitespace-pre-wrap border-b border-red-950/60 bg-[#240f12]">{previewVM.jsonError}</div>}
                    <textarea value={previewVM.jsonDraft} onChange={(e) => previewVM.setJsonDraft(e.target.value)} className="w-full h-[260px] bg-[#101010] text-gray-200 text-xs font-mono p-3 outline-none resize-none" spellCheck={false} />
                </div>
            );
        }

        const PREVIEW_MODULE_META = [
            { key: 'main', label: 'Main', subtitle: 'scene + runtime' },
            { key: 'emission', label: 'Emission', subtitle: 'emit rate and bursts' },
            { key: 'shape', label: 'Shape', subtitle: 'spawn area and direction' },
            { key: 'velocityOverLifetime', label: 'Velocity Over Lifetime', subtitle: 'gravity and drag' },
            { key: 'forceOverLifetime', label: 'Force Over Lifetime', subtitle: 'vortex and radial forces' },
            { key: 'limitVelocityOverLifetime', label: 'Limit Velocity Over Lifetime', subtitle: 'speed clamp' },
            { key: 'noise', label: 'Noise', subtitle: 'simulation variation' },
            { key: 'colorOverLifetime', label: 'Color Over Lifetime', subtitle: 'gradient tint' },
            { key: 'colorBySpeed', label: 'Color By Speed', subtitle: 'speed-based tint' },
            { key: 'sizeOverLifetime', label: 'Size Over Lifetime', subtitle: 'size curve' },
            { key: 'sizeBySpeed', label: 'Size By Speed', subtitle: 'speed-based scale' },
            { key: 'rotationOverLifetime', label: 'Rotation Over Lifetime', subtitle: 'spin curve' },
            { key: 'rotationBySpeed', label: 'Rotation By Speed', subtitle: 'speed-based spin' },
            { key: 'collision', label: 'Collision', subtitle: 'world collision settings' },
            { key: 'subEmitters', label: 'Sub Emitters', subtitle: 'spawn child particles' },
            { key: 'textureSheetAnimation', label: 'Texture Sheet Animation', subtitle: 'sprite sheet playback' },
            { key: 'inheritVelocity', label: 'Inherit Velocity', subtitle: 'carry emitter motion' },
            { key: 'lifetimeByEmitterSpeed', label: 'Lifetime By Emitter Speed', subtitle: 'lifetime from emission speed' },
            { key: 'trails', label: 'Trails', subtitle: 'particle trails' },
            { key: 'customData', label: 'Custom Data', subtitle: 'custom payload channels' },
            { key: 'renderer', label: 'Renderer', subtitle: 'render mode and sprite map' }
        ];

        const PREVIEW_MODULE_MODES = {
            emission: ['continuous', 'burst'],
            shape: PREVIEW_EMITTER_SHAPES,
            renderer: ['billboard'],
            trails: ['ribbon']
        };

        function PreviewModuleCard({ title, subtitle, expanded, enabled, onToggleExpanded, onToggleEnabled, children, mode, onModeChange, modes = [] }) {
            return (
                <div className="border border-gray-800 rounded bg-[#161616] overflow-hidden">
                    <button onClick={onToggleExpanded} className="w-full px-3 py-2 flex items-center justify-between text-left bg-[#181818] border-b border-gray-800">
                        <div className="min-w-0">
                            <div className="text-sm font-bold text-white">{title}</div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-wide">{subtitle}</div>
                        </div>
                        <div className="flex items-center gap-2">
                            {modes.length > 0 && (
                                <select value={mode} onChange={(e) => onModeChange?.(e.target.value)} onClick={(e) => e.stopPropagation()} className="bg-[#232323] border border-gray-700 rounded px-2 py-1 text-[10px] text-white">
                                    {modes.map((item) => <option key={item} value={item}>{item}</option>)}
                                </select>
                            )}
                            {onToggleEnabled && <button onClick={(e) => { e.stopPropagation(); onToggleEnabled(); }} className={`text-[10px] px-2 py-1 rounded font-bold ${enabled ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'}`}>{enabled ? 'ON' : 'OFF'}</button>}
                            <span className="text-gray-500 text-xs">{expanded ? '▲' : '▼'}</span>
                        </div>
                    </button>
                    {expanded && <div className="p-3 space-y-3">{children}</div>}
                </div>
            );
        }

        function PreviewModuleEditor({ previewVM, layer, moduleKey }) {
            const defaults = createDefaultPreviewModules();
            const module = layer.modules?.[moduleKey] || defaults[moduleKey];
            const applyModulePatches = (modulePatchMap = {}, flatPatch = {}) => {
                const nextModules = { ...(layer.modules || defaults) };
                Object.entries(modulePatchMap).forEach(([key, patch]) => {
                    const current = nextModules[key] || defaults[key];
                    nextModules[key] = {
                        ...current,
                        ...patch,
                        settings: { ...(current.settings || {}), ...(patch.settings || {}) }
                    };
                });
                previewVM.updateLayerSection(layer.id, 'root', { modules: nextModules, ...flatPatch });
            };
            const updateModule = (modulePatch = {}, flatPatch = {}) => applyModulePatches({ [moduleKey]: modulePatch }, flatPatch);
            const asCurve = (value) => {
                if (Array.isArray(value) && value.length === 3) return value;
                const range = Array.isArray(value) && value.length === 2 ? value : [0, 1];
                return [range[0], (range[0] + range[1]) * 0.5, range[1]];
            };
            const boolRow = (label, value, setter) => (
                <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-gray-300">{label}</span>
                    <button onClick={setter} className={`text-[10px] px-2 py-1 rounded font-bold ${value ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'}`}>{value ? 'ON' : 'OFF'}</button>
                </div>
            );
            switch (moduleKey) {
                case 'main':
                    return (
                        <div className="space-y-3">
                            <PreviewField label="Background"><input type="color" value={previewVM.activePreset.scene.background} onChange={(e) => previewVM.updateSceneField('background', e.target.value)} className="w-full h-9 bg-transparent border border-gray-700 rounded" /></PreviewField>
                            <div className="grid grid-cols-2 gap-3">
                                <PreviewField label="Camera FOV"><input type="number" value={previewVM.activePreset.scene.cameraFov} onChange={(e) => previewVM.updateSceneField('cameraFov', parseFloat(e.target.value || 45))} className="bg-[#232323] border border-gray-700 rounded px-2 py-1 text-xs text-white" /></PreviewField>
                                <PreviewField label="Distance"><input type="number" value={previewVM.activePreset.scene.cameraDistance} onChange={(e) => previewVM.updateSceneField('cameraDistance', parseFloat(e.target.value || 6))} className="bg-[#232323] border border-gray-700 rounded px-2 py-1 text-xs text-white" /></PreviewField>
                                <PreviewField label="Pitch"><input type="number" value={previewVM.activePreset.scene.cameraPitch} onChange={(e) => previewVM.updateSceneField('cameraPitch', parseFloat(e.target.value || 18))} className="bg-[#232323] border border-gray-700 rounded px-2 py-1 text-xs text-white" /></PreviewField>
                                <PreviewField label="Yaw"><input type="number" value={previewVM.activePreset.scene.cameraYaw} onChange={(e) => previewVM.updateSceneField('cameraYaw', parseFloat(e.target.value || 24))} className="bg-[#232323] border border-gray-700 rounded px-2 py-1 text-xs text-white" /></PreviewField>
                            </div>
                            {boolRow('Scene Loop', previewVM.activePreset.scene.loop, () => previewVM.updateSceneField('loop', !previewVM.activePreset.scene.loop))}
                            {boolRow('Grid', previewVM.activePreset.scene.grid, () => previewVM.updateSceneField('grid', !previewVM.activePreset.scene.grid))}
                            <PreviewRangeEditor label="Lifetime" value={module.settings.lifetime} onChange={(value) => updateModule({ settings: { lifetime: value } }, { particle: { lifetime: value } })} />
                            <PreviewRangeEditor label="Start Speed" value={module.settings.startSpeed} onChange={(value) => updateModule({ settings: { startSpeed: value } }, { emitter: { speed: value } })} />
                            <PreviewRangeEditor label="Start Size" value={module.settings.startSize} onChange={(value) => updateModule({ settings: { startSize: value } }, { particle: { size: value } })} />
                            <PreviewRangeEditor label="Start Rotation" value={module.settings.startRotation} onChange={(value) => updateModule({ settings: { startRotation: value } }, { particle: { spin: value } })} />
                            <div className="grid grid-cols-2 gap-3">
                                <PreviewField label="Color Start"><input type="color" value={module.settings.startColorStart} onChange={(e) => updateModule({ settings: { startColorStart: e.target.value } }, { particle: { colorStart: e.target.value } })} className="w-full h-9 bg-transparent border border-gray-700 rounded" /></PreviewField>
                                <PreviewField label="Color End"><input type="color" value={module.settings.startColorEnd} onChange={(e) => updateModule({ settings: { startColorEnd: e.target.value } }, { particle: { colorEnd: e.target.value } })} className="w-full h-9 bg-transparent border border-gray-700 rounded" /></PreviewField>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <PreviewField label="Duration"><input type="number" step="0.01" value={module.settings.duration} onChange={(e) => updateModule({ settings: { duration: parseFloat(e.target.value || 0) } }, { emitter: { duration: parseFloat(e.target.value || 0) } })} className="bg-[#232323] border border-gray-700 rounded px-2 py-1 text-xs text-white" /></PreviewField>
                                <PreviewField label="Simulation Speed"><input type="number" step="0.01" value={module.settings.simulationSpeed} onChange={(e) => updateModule({ settings: { simulationSpeed: parseFloat(e.target.value || 1) } })} className="bg-[#232323] border border-gray-700 rounded px-2 py-1 text-xs text-white" /></PreviewField>
                            </div>
                            {boolRow('Main Loop', module.settings.loop, () => updateModule({ settings: { loop: !module.settings.loop } }, { emitter: { loop: !module.settings.loop } }))}
                        </div>
                    );
                case 'emission':
                    return (
                        <div className="space-y-3">
                            {boolRow('Enabled', module.enabled, () => updateModule({ enabled: !module.enabled }))}
                            <PreviewField label="Mode"><select value={module.mode || 'continuous'} onChange={(e) => updateModule({ mode: e.target.value })} className="bg-[#232323] border border-gray-700 rounded px-2 py-1 text-xs text-white"><option value="continuous">continuous</option><option value="burst">burst</option></select></PreviewField>
                            <div className="grid grid-cols-2 gap-3">
                                <PreviewField label="Rate"><input type="number" value={module.settings.rate} onChange={(e) => updateModule({ settings: { rate: parseFloat(e.target.value || 0) } }, { emitter: { rate: parseFloat(e.target.value || 0) } })} className="bg-[#232323] border border-gray-700 rounded px-2 py-1 text-xs text-white" /></PreviewField>
                                <PreviewField label="Burst"><input type="number" value={module.settings.burst} onChange={(e) => {
                                    const burst = parseFloat(e.target.value || 0);
                                    updateModule({ settings: { burst, bursts: burst > 0 ? [{ time: module.settings.burstTime || 0, count: burst, cycles: 1, interval: 0 }] : [] } }, { emitter: { burst } });
                                }} className="bg-[#232323] border border-gray-700 rounded px-2 py-1 text-xs text-white" /></PreviewField>
                            </div>
                            <PreviewField label="Burst Time"><input type="number" step="0.01" value={module.settings.burstTime || 0} onChange={(e) => {
                                const burstTime = parseFloat(e.target.value || 0);
                                const burst = parseFloat(module.settings.burst || 0);
                                updateModule({ settings: { burstTime, bursts: burst > 0 ? [{ time: burstTime, count: burst, cycles: 1, interval: 0 }] : [] } });
                            }} className="bg-[#232323] border border-gray-700 rounded px-2 py-1 text-xs text-white" /></PreviewField>
                            {boolRow('Loop', module.settings.loop, () => updateModule({ settings: { loop: !module.settings.loop } }, { emitter: { loop: !module.settings.loop } }))}
                            <PreviewField label="Duration"><input type="number" value={module.settings.duration} onChange={(e) => updateModule({ settings: { duration: parseFloat(e.target.value || 0) } }, { emitter: { duration: parseFloat(e.target.value || 0) } })} className="bg-[#232323] border border-gray-700 rounded px-2 py-1 text-xs text-white" /></PreviewField>
                        </div>
                    );
                case 'shape':
                    return (
                        <div className="space-y-3">
                            {boolRow('Enabled', module.enabled, () => updateModule({ enabled: !module.enabled }))}
                            <PreviewField label="Mode"><select value={module.mode || 'cone'} onChange={(e) => updateModule({ mode: e.target.value, settings: { shape: e.target.value } }, { emitter: { shape: e.target.value } })} className="bg-[#232323] border border-gray-700 rounded px-2 py-1 text-xs text-white">{PREVIEW_EMITTER_SHAPES.map((shape) => <option key={shape} value={shape}>{shape}</option>)}</select></PreviewField>
                            <PreviewVec3Editor label="Position" value={module.settings.position} onChange={(value) => updateModule({ settings: { position: value } }, { emitter: { position: value } })} />
                            <PreviewVec3Editor label="Rotation" value={module.settings.rotation} onChange={(value) => updateModule({ settings: { rotation: value } }, { emitter: { rotation: value } })} />
                            <PreviewVec3Editor label="Size" value={module.settings.size} onChange={(value) => updateModule({ settings: { size: value } }, { emitter: { size: value } })} />
                            <PreviewVec3Editor label="Direction" value={module.settings.direction} onChange={(value) => updateModule({ settings: { direction: value } }, { emitter: { direction: value } })} />
                            <PreviewField label="Spread"><input type="number" step="0.01" value={module.settings.spread} onChange={(e) => updateModule({ settings: { spread: parseFloat(e.target.value || 0) } }, { emitter: { spread: parseFloat(e.target.value || 0) } })} className="bg-[#232323] border border-gray-700 rounded px-2 py-1 text-xs text-white" /></PreviewField>
                        </div>
                    );
                case 'velocityOverLifetime':
                    return <div className="space-y-3">{boolRow('Enabled', module.enabled, () => updateModule({ enabled: !module.enabled }))}<PreviewVec3Editor label="Linear" value={module.settings.linear} onChange={(value) => updateModule({ settings: { linear: value } })} /><PreviewVec3Editor label="Gravity" value={module.settings.gravity} onChange={(value) => updateModule({ settings: { gravity: value } }, { simulation: { gravity: value } })} /><PreviewField label="Drag"><input type="number" step="0.01" value={module.settings.drag} onChange={(e) => updateModule({ settings: { drag: parseFloat(e.target.value || 0) } }, { simulation: { drag: parseFloat(e.target.value || 0) } })} className="bg-[#232323] border border-gray-700 rounded px-2 py-1 text-xs text-white" /></PreviewField></div>;
                case 'forceOverLifetime':
                    return <div className="space-y-3">{boolRow('Enabled', module.enabled, () => updateModule({ enabled: !module.enabled }))}<PreviewVec3Editor label="Force" value={module.settings.force} onChange={(value) => updateModule({ settings: { force: value } })} /><div className="grid grid-cols-2 gap-3"><PreviewField label="Vortex Strength"><input type="number" step="0.01" value={module.settings.vortexStrength} onChange={(e) => updateModule({ settings: { vortexStrength: parseFloat(e.target.value || 0) } }, { simulation: { vortexStrength: parseFloat(e.target.value || 0) } })} className="bg-[#232323] border border-gray-700 rounded px-2 py-1 text-xs text-white" /></PreviewField><PreviewField label="Radial Attraction"><input type="number" step="0.01" value={module.settings.radialAttraction} onChange={(e) => updateModule({ settings: { radialAttraction: parseFloat(e.target.value || 0) } }, { simulation: { radialAttraction: parseFloat(e.target.value || 0) } })} className="bg-[#232323] border border-gray-700 rounded px-2 py-1 text-xs text-white" /></PreviewField></div></div>;
                case 'limitVelocityOverLifetime':
                    return <div className="space-y-3">{boolRow('Enabled', module.enabled, () => updateModule({ enabled: !module.enabled }))}<div className="grid grid-cols-2 gap-3"><PreviewField label="Speed Limit"><input type="number" step="0.01" value={module.settings.speedLimit} onChange={(e) => updateModule({ settings: { speedLimit: parseFloat(e.target.value || 0) } }, { simulation: { speedLimit: parseFloat(e.target.value || 0) } })} className="bg-[#232323] border border-gray-700 rounded px-2 py-1 text-xs text-white" /></PreviewField><PreviewField label="Dampen"><input type="number" step="0.01" value={module.settings.dampen} onChange={(e) => updateModule({ settings: { dampen: parseFloat(e.target.value || 0) } })} className="bg-[#232323] border border-gray-700 rounded px-2 py-1 text-xs text-white" /></PreviewField></div></div>;
                case 'noise':
                    return <div className="space-y-3">{boolRow('Enabled', module.enabled, () => updateModule({ enabled: !module.enabled }))}<div className="grid grid-cols-3 gap-3"><PreviewField label="Noise Strength"><input type="number" step="0.01" value={module.settings.noiseStrength} onChange={(e) => updateModule({ settings: { noiseStrength: parseFloat(e.target.value || 0) } }, { simulation: { noiseStrength: parseFloat(e.target.value || 0) } })} className="bg-[#232323] border border-gray-700 rounded px-2 py-1 text-xs text-white" /></PreviewField><PreviewField label="Noise Scale"><input type="number" step="0.01" value={module.settings.noiseScale} onChange={(e) => updateModule({ settings: { noiseScale: parseFloat(e.target.value || 0) } }, { simulation: { noiseScale: parseFloat(e.target.value || 0) } })} className="bg-[#232323] border border-gray-700 rounded px-2 py-1 text-xs text-white" /></PreviewField><PreviewField label="Scroll Speed"><input type="number" step="0.01" value={module.settings.scrollSpeed} onChange={(e) => updateModule({ settings: { scrollSpeed: parseFloat(e.target.value || 0) } })} className="bg-[#232323] border border-gray-700 rounded px-2 py-1 text-xs text-white" /></PreviewField></div></div>;
                case 'colorOverLifetime':
                    return <div className="space-y-3">{boolRow('Enabled', module.enabled, () => updateModule({ enabled: !module.enabled }))}<div className="grid grid-cols-2 gap-3"><PreviewField label="Color Start"><input type="color" value={module.settings.colorStart} onChange={(e) => updateModule({ settings: { colorStart: e.target.value } }, { particle: { colorStart: e.target.value } })} className="w-full h-9 bg-transparent border border-gray-700 rounded" /></PreviewField><PreviewField label="Color End"><input type="color" value={module.settings.colorEnd} onChange={(e) => updateModule({ settings: { colorEnd: e.target.value } }, { particle: { colorEnd: e.target.value } })} className="w-full h-9 bg-transparent border border-gray-700 rounded" /></PreviewField></div></div>;
                case 'colorBySpeed':
                    return <div className="space-y-3">{boolRow('Enabled', module.enabled, () => updateModule({ enabled: !module.enabled }))}<div className="grid grid-cols-2 gap-3"><PreviewField label="Min Speed"><input type="number" step="0.01" value={module.settings.minSpeed} onChange={(e) => updateModule({ settings: { minSpeed: parseFloat(e.target.value || 0) } })} className="bg-[#232323] border border-gray-700 rounded px-2 py-1 text-xs text-white" /></PreviewField><PreviewField label="Max Speed"><input type="number" step="0.01" value={module.settings.maxSpeed} onChange={(e) => updateModule({ settings: { maxSpeed: parseFloat(e.target.value || 0) } })} className="bg-[#232323] border border-gray-700 rounded px-2 py-1 text-xs text-white" /></PreviewField></div><div className="grid grid-cols-2 gap-3"><PreviewField label="Low Speed"><input type="color" value={module.settings.lowSpeedColor} onChange={(e) => updateModule({ settings: { lowSpeedColor: e.target.value } })} className="w-full h-9 bg-transparent border border-gray-700 rounded" /></PreviewField><PreviewField label="High Speed"><input type="color" value={module.settings.highSpeedColor} onChange={(e) => updateModule({ settings: { highSpeedColor: e.target.value } })} className="w-full h-9 bg-transparent border border-gray-700 rounded" /></PreviewField></div></div>;
                case 'sizeOverLifetime':
                    return <div className="space-y-3">{boolRow('Enabled', module.enabled, () => updateModule({ enabled: !module.enabled }))}<PreviewVec3Editor label="Curve" value={module.settings.curve || asCurve(module.settings.size)} onChange={(value) => updateModule({ settings: { curve: value, size: [value[0], value[2]] } }, { render: { sizeOverLife: value } })} /></div>;
                case 'sizeBySpeed':
                    return <div className="space-y-3">{boolRow('Enabled', module.enabled, () => updateModule({ enabled: !module.enabled }))}<div className="grid grid-cols-2 gap-3"><PreviewField label="Min Speed"><input type="number" step="0.01" value={module.settings.minSpeed} onChange={(e) => updateModule({ settings: { minSpeed: parseFloat(e.target.value || 0) } })} className="bg-[#232323] border border-gray-700 rounded px-2 py-1 text-xs text-white" /></PreviewField><PreviewField label="Max Speed"><input type="number" step="0.01" value={module.settings.maxSpeed} onChange={(e) => updateModule({ settings: { maxSpeed: parseFloat(e.target.value || 0) } })} className="bg-[#232323] border border-gray-700 rounded px-2 py-1 text-xs text-white" /></PreviewField></div><PreviewRangeEditor label="Scale Range" value={module.settings.scale} onChange={(value) => updateModule({ settings: { scale: value } })} /></div>;
                case 'rotationOverLifetime':
                    return <div className="space-y-3">{boolRow('Enabled', module.enabled, () => updateModule({ enabled: !module.enabled }))}<PreviewRangeEditor label="Spin Range" value={module.settings.spin} onChange={(value) => updateModule({ settings: { spin: value } }, { particle: { spin: value } })} /></div>;
                case 'rotationBySpeed':
                    return <div className="space-y-3">{boolRow('Enabled', module.enabled, () => updateModule({ enabled: !module.enabled }))}<div className="grid grid-cols-2 gap-3"><PreviewField label="Min Speed"><input type="number" step="0.01" value={module.settings.minSpeed} onChange={(e) => updateModule({ settings: { minSpeed: parseFloat(e.target.value || 0) } })} className="bg-[#232323] border border-gray-700 rounded px-2 py-1 text-xs text-white" /></PreviewField><PreviewField label="Max Speed"><input type="number" step="0.01" value={module.settings.maxSpeed} onChange={(e) => updateModule({ settings: { maxSpeed: parseFloat(e.target.value || 0) } })} className="bg-[#232323] border border-gray-700 rounded px-2 py-1 text-xs text-white" /></PreviewField></div><PreviewRangeEditor label="Speed Spin" value={module.settings.spin} onChange={(value) => updateModule({ settings: { spin: value } })} /></div>;
                case 'collision':
                    return <div className="space-y-3">{boolRow('Enabled', module.enabled, () => updateModule({ enabled: !module.enabled }))}<div className="grid grid-cols-2 gap-3"><PreviewField label="Plane Y"><input type="number" step="0.01" value={module.settings.planeY} onChange={(e) => updateModule({ settings: { planeY: parseFloat(e.target.value || 0) } })} className="bg-[#232323] border border-gray-700 rounded px-2 py-1 text-xs text-white" /></PreviewField><PreviewField label="Bounce"><input type="number" step="0.01" value={module.settings.bounce} onChange={(e) => updateModule({ settings: { bounce: parseFloat(e.target.value || 0) } })} className="bg-[#232323] border border-gray-700 rounded px-2 py-1 text-xs text-white" /></PreviewField><PreviewField label="Dampen"><input type="number" step="0.01" value={module.settings.dampen} onChange={(e) => updateModule({ settings: { dampen: parseFloat(e.target.value || 0) } })} className="bg-[#232323] border border-gray-700 rounded px-2 py-1 text-xs text-white" /></PreviewField><PreviewField label="Lifetime Loss"><input type="number" step="0.01" value={module.settings.lifetimeLoss} onChange={(e) => updateModule({ settings: { lifetimeLoss: parseFloat(e.target.value || 0) } })} className="bg-[#232323] border border-gray-700 rounded px-2 py-1 text-xs text-white" /></PreviewField></div></div>;
                case 'subEmitters':
                    return <div className="space-y-3">{boolRow('Enabled', module.enabled, () => updateModule({ enabled: !module.enabled }))}<PreviewField label="Target Layer"><select value={module.settings.targetLayerId || ''} onChange={(e) => updateModule({ settings: { targetLayerId: e.target.value || null } })} className="bg-[#232323] border border-gray-700 rounded px-2 py-1 text-xs text-white"><option value="">Self</option>{previewVM.activePreset?.layers?.filter((candidate) => candidate.id !== layer.id).map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.name}</option>)}</select></PreviewField><div className="grid grid-cols-3 gap-3"><PreviewField label="On Birth"><input type="number" value={module.settings.birthCount} onChange={(e) => updateModule({ settings: { birthCount: parseFloat(e.target.value || 0) } })} className="bg-[#232323] border border-gray-700 rounded px-2 py-1 text-xs text-white" /></PreviewField><PreviewField label="On Death"><input type="number" value={module.settings.deathCount} onChange={(e) => updateModule({ settings: { deathCount: parseFloat(e.target.value || 0) } })} className="bg-[#232323] border border-gray-700 rounded px-2 py-1 text-xs text-white" /></PreviewField><PreviewField label="On Collision"><input type="number" value={module.settings.collisionCount} onChange={(e) => updateModule({ settings: { collisionCount: parseFloat(e.target.value || 0) } })} className="bg-[#232323] border border-gray-700 rounded px-2 py-1 text-xs text-white" /></PreviewField></div></div>;
                case 'textureSheetAnimation':
                    return <div className="space-y-3">{boolRow('Enabled', module.enabled, () => updateModule({ enabled: !module.enabled }))}<div className="grid grid-cols-2 gap-3"><PreviewField label="Columns"><input type="number" value={module.settings.columns} onChange={(e) => updateModule({ settings: { columns: parseFloat(e.target.value || 1) } })} className="bg-[#232323] border border-gray-700 rounded px-2 py-1 text-xs text-white" /></PreviewField><PreviewField label="Rows"><input type="number" value={module.settings.rows} onChange={(e) => updateModule({ settings: { rows: parseFloat(e.target.value || 1) } })} className="bg-[#232323] border border-gray-700 rounded px-2 py-1 text-xs text-white" /></PreviewField><PreviewField label="Cycles"><input type="number" value={module.settings.cycles} onChange={(e) => updateModule({ settings: { cycles: parseFloat(e.target.value || 1) } })} className="bg-[#232323] border border-gray-700 rounded px-2 py-1 text-xs text-white" /></PreviewField><PreviewField label="Start Frame"><input type="number" value={module.settings.startFrame} onChange={(e) => updateModule({ settings: { startFrame: parseFloat(e.target.value || 0) } })} className="bg-[#232323] border border-gray-700 rounded px-2 py-1 text-xs text-white" /></PreviewField></div>{boolRow('Random Row', module.settings.randomRow, () => updateModule({ settings: { randomRow: !module.settings.randomRow } }))}<PreviewRangeEditor label="Frame Over Life" value={module.settings.frameOverLife} onChange={(value) => updateModule({ settings: { frameOverLife: value } })} /></div>;
                case 'inheritVelocity':
                    return <div className="space-y-3">{boolRow('Enabled', module.enabled, () => updateModule({ enabled: !module.enabled }))}<PreviewField label="Factor"><input type="number" step="0.01" value={module.settings.factor} onChange={(e) => updateModule({ settings: { factor: parseFloat(e.target.value || 0) } })} className="bg-[#232323] border border-gray-700 rounded px-2 py-1 text-xs text-white" /></PreviewField></div>;
                case 'lifetimeByEmitterSpeed':
                    return <div className="space-y-3">{boolRow('Enabled', module.enabled, () => updateModule({ enabled: !module.enabled }))}<div className="grid grid-cols-2 gap-3"><PreviewField label="Min Speed"><input type="number" step="0.01" value={module.settings.minSpeed} onChange={(e) => updateModule({ settings: { minSpeed: parseFloat(e.target.value || 0) } })} className="bg-[#232323] border border-gray-700 rounded px-2 py-1 text-xs text-white" /></PreviewField><PreviewField label="Max Speed"><input type="number" step="0.01" value={module.settings.maxSpeed} onChange={(e) => updateModule({ settings: { maxSpeed: parseFloat(e.target.value || 0) } })} className="bg-[#232323] border border-gray-700 rounded px-2 py-1 text-xs text-white" /></PreviewField></div><PreviewRangeEditor label="Lifetime Scale" value={module.settings.lifetimeScale} onChange={(value) => updateModule({ settings: { lifetimeScale: value } })} /></div>;
                case 'trails':
                    return <div className="space-y-3">{boolRow('Enabled', module.enabled, () => updateModule({ enabled: !module.enabled }))}<PreviewField label="Length"><input type="number" value={module.settings.length} onChange={(e) => updateModule({ settings: { length: parseFloat(e.target.value || 2) } })} className="bg-[#232323] border border-gray-700 rounded px-2 py-1 text-xs text-white" /></PreviewField><PreviewVec3Editor label="Width Over Trail" value={module.settings.widthOverTrail} onChange={(value) => updateModule({ settings: { widthOverTrail: value } })} /><PreviewVec3Editor label="Alpha Over Trail" value={module.settings.alphaOverTrail} onChange={(value) => updateModule({ settings: { alphaOverTrail: value } })} /></div>;
                case 'customData':
                    return <div className="space-y-3">{boolRow('Enabled', module.enabled, () => updateModule({ enabled: !module.enabled }))}<PreviewRangeEditor label="Data 1" value={module.settings.data1} onChange={(value) => updateModule({ settings: { data1: value } })} /><PreviewRangeEditor label="Data 2" value={module.settings.data2} onChange={(value) => updateModule({ settings: { data2: value } })} /></div>;
                case 'renderer':
                    return <div className="space-y-3">{boolRow('Enabled', module.enabled, () => updateModule({ enabled: !module.enabled }))}<div className="grid grid-cols-2 gap-3"><PreviewField label="Blend"><select value={module.settings.blend} onChange={(e) => updateModule({ settings: { blend: e.target.value } }, { render: { blend: e.target.value } })} className="bg-[#232323] border border-gray-700 rounded px-2 py-1 text-xs text-white">{PREVIEW_BLEND_MODES.map((mode) => <option key={mode} value={mode}>{mode}</option>)}</select></PreviewField><PreviewField label="Billboard"><select value={module.settings.billboard} onChange={(e) => updateModule({ settings: { billboard: e.target.value } }, { render: { billboard: e.target.value } })} className="bg-[#232323] border border-gray-700 rounded px-2 py-1 text-xs text-white">{PREVIEW_BILLBOARD_MODES.map((mode) => <option key={mode} value={mode}>{mode}</option>)}</select></PreviewField><PreviewField label="Alpha Clip"><input type="number" step="0.001" value={module.settings.alphaClip} onChange={(e) => updateModule({ settings: { alphaClip: parseFloat(e.target.value || 0) } }, { render: { alphaClip: parseFloat(e.target.value || 0) } })} className="bg-[#232323] border border-gray-700 rounded px-2 py-1 text-xs text-white" /></PreviewField><PreviewField label="Sprite Mode"><select value={module.settings.materialSource || 'selected_or_fallback'} onChange={(e) => updateModule({ settings: { materialSource: e.target.value } })} className="bg-[#232323] border border-gray-700 rounded px-2 py-1 text-xs text-white"><option value="selected_or_fallback">selected_or_fallback</option><option value="fallback_square_50">fallback_square_50</option></select></PreviewField></div><PreviewVec3Editor label="Alpha Over Life" value={module.settings.alphaOverLife} onChange={(value) => updateModule({ settings: { alphaOverLife: value } }, { render: { alphaOverLife: value } })} /><PreviewVec3Editor label="Size Over Life" value={module.settings.sizeOverLife} onChange={(value) => applyModulePatches({ renderer: { settings: { sizeOverLife: value } }, sizeOverLifetime: { settings: { curve: value, size: [value[0], value[2]] } } }, { render: { sizeOverLife: value } })} /></div>;
                default:
                    return <div className="text-xs text-gray-400">No module editor yet.</div>;
            }
        }

        function PreviewInspector({ previewVM }) {
            const preset = previewVM.activePreset;
            const layer = previewVM.selectedLayer;
            if (!preset || !layer) return null;
            return (
                <div className="h-full overflow-y-auto p-4 space-y-3 bg-[#121212]">
                    {PREVIEW_MODULE_META.map((meta) => (
                        <PreviewModuleCard
                            key={meta.key}
                            title={meta.label}
                            subtitle={meta.subtitle}
                            expanded={!!layer.modules?.[meta.key]?.expanded}
                            enabled={meta.key === 'main' ? true : layer.modules?.[meta.key]?.enabled !== false}
                            mode={layer.modules?.[meta.key]?.mode || ''}
                            modes={PREVIEW_MODULE_MODES[meta.key] || []}
                            onToggleExpanded={() => previewVM.updateLayerSection(layer.id, 'root', {
                                modules: {
                                    ...(layer.modules || createDefaultPreviewModules()),
                                    [meta.key]: {
                                        ...(layer.modules?.[meta.key] || createDefaultPreviewModules()[meta.key]),
                                        expanded: !layer.modules?.[meta.key]?.expanded
                                    }
                                }
                            })}
                            onToggleEnabled={meta.key === 'main' ? null : () => previewVM.updateLayerSection(layer.id, 'root', {
                                modules: {
                                    ...(layer.modules || createDefaultPreviewModules()),
                                    [meta.key]: {
                                        ...(layer.modules?.[meta.key] || createDefaultPreviewModules()[meta.key]),
                                        enabled: !(layer.modules?.[meta.key]?.enabled !== false)
                                    }
                                }
                            })}
                            onModeChange={(nextMode) => previewVM.updateLayerSection(layer.id, 'root', {
                                modules: {
                                    ...(layer.modules || createDefaultPreviewModules()),
                                    [meta.key]: {
                                        ...(layer.modules?.[meta.key] || createDefaultPreviewModules()[meta.key]),
                                        mode: nextMode
                                    }
                                }
                            })}
                        >
                            <PreviewModuleEditor previewVM={previewVM} layer={layer} moduleKey={meta.key} />
                        </PreviewModuleCard>
                    ))}
                    <PreviewJsonEditor previewVM={previewVM} />
                </div>
            );
        }

        function PreviewTab({ previewVM }) {
            const canvasRef = useRef(null);
            const [viewPanelOpen, setViewPanelOpen] = useState(false);
            const [recordPanelOpen, setRecordPanelOpen] = useState(false);
            useEffect(() => {
                if (canvasRef.current) previewVM.setCanvasHost(canvasRef.current);
                return () => previewVM.setCanvasHost(null);
            }, []);
            if (!previewVM.supported) return <PreviewUnsupportedState />;
            return (
                <div className="h-full bg-[#111]">
                    <div className="grid h-full min-h-0 grid-cols-1 grid-rows-[240px,minmax(360px,1fr),minmax(320px,auto)] xl:grid-cols-[280px,minmax(480px,1fr),420px] xl:grid-rows-1">
                        <div className="order-2 min-h-[220px] xl:order-1 xl:min-h-0">
                            <PreviewUnityHierarchyPane previewVM={previewVM} />
                        </div>
                        <div className="order-1 flex min-h-[360px] min-w-0 flex-col border-b border-gray-800 bg-[#111] xl:order-2 xl:border-b-0">
                            <PreviewUnityToolbar previewVM={previewVM} viewPanelOpen={viewPanelOpen} onToggleViewPanel={() => setViewPanelOpen((value) => !value)} recordPanelOpen={recordPanelOpen} onToggleRecordPanel={() => setRecordPanelOpen((value) => !value)} />
                            <div className="relative min-h-0 flex-1 bg-[#0c0c0c]">
                                <canvas ref={canvasRef} className="w-full h-full block preview-canvas-host" />
                                {recordPanelOpen ? <PreviewUnityRecordPanel previewVM={previewVM} onClose={() => setRecordPanelOpen(false)} /> : null}
                                {viewPanelOpen ? <PreviewUnityViewPanel previewVM={previewVM} onClose={() => setViewPanelOpen(false)} /> : null}
                            </div>
                        </div>
                        <div className="order-3 min-h-[320px] border-t border-gray-800 xl:min-h-0 xl:border-l xl:border-t-0">
                            <PreviewUnityInspector previewVM={previewVM} />
                        </div>
                    </div>
                </div>
            );
        }

        function CaptureTab({ captureVM }) {
            const canvasRef = useRef(null);
            useEffect(() => {
                if (canvasRef.current) captureVM.setCanvasHost(canvasRef.current);
                captureVM.checkToolkitHealth?.();
                return () => captureVM.setCanvasHost(null);
            }, []);
            if (!captureVM.supported) return <PreviewUnsupportedState />;
            const capture = captureVM.captureConfig || createDefaultCaptureLineupConfig(captureVM.activeSet?.name || 'Texture Set', captureVM.presetName || 'Turbulence Demo');
            const exportState = captureVM.exportState || {};
            const reviewState = captureVM.reviewState || {};
            const focusState = captureVM.focusState || {};
            const toolkitHealth = captureVM.toolkitHealth || {};
            const ffmpegReady = toolkitHealth.status === 'ok' && toolkitHealth.ffmpeg_available === true;
            const activeSet = captureVM.activeSet;
            const captureActivityOptions = [
                { value: 'all_together', label: 'All Together' },
                { value: 'focused_only', label: 'Focused Only' },
                { value: 'hybrid_fade', label: 'Hybrid Fade' }
            ];
            const captureBehaviorCopy = capture.activityMode === 'focused_only'
                ? 'Focused-only mode: only the camera-focused stage actively emits.'
                : (capture.activityMode === 'hybrid_fade'
                    ? 'Hybrid mode: all stages stay live while the camera-focused stage is emphasized.'
                    : 'Default mode: straight X-axis lane pass with all stages simulating together.');
            const resolutionValue = capture.width === 1280 && capture.height === 720
                ? '1280x720'
                : (capture.width === 1920 && capture.height === 1080
                    ? '1920x1080'
                    : (capture.width === 1024 && capture.height === 1024 ? '1024x1024' : 'custom'));
            const captureStatusLabel = String(captureVM.status || 'idle').replace(/_/g, ' ');
            let captureOverlay = null;
            if (captureVM.status === 'mounting') captureOverlay = { title: 'Mounting Capture View', body: 'Preparing the capture canvas and WebGL runtime.' };
            else if (captureVM.status === 'loading_set') captureOverlay = { title: 'Loading Set Textures', body: 'Building one staged particle stack for each texture in the selected set.' };
            else if (captureVM.status === 'empty_set') captureOverlay = { title: 'No Set Available', body: 'Create or select a saved set to populate the capture lineup.' };
            else if (captureVM.status === 'running_fallback_sprite') captureOverlay = { title: 'Fallback Sprite Mode', body: 'The lineup is live, but the saved set textures could not be loaded so fallback square particles are being shown.' };
            else if (captureVM.status === 'error') captureOverlay = { title: 'Capture Runtime Error', body: 'The lineup runtime failed to initialize or load the staged set.' };
            const updateResolution = (value) => {
                if (value === '1280x720') captureVM.updateCaptureConfig({ width: 1280, height: 720 });
                else if (value === '1920x1080') captureVM.updateCaptureConfig({ width: 1920, height: 1080 });
                else if (value === '1024x1024') captureVM.updateCaptureConfig({ width: 1024, height: 1024 });
            };
            return (
                <div className="h-full bg-[#111]">
                    <div className="grid h-full min-h-0 grid-cols-1 grid-rows-[280px,minmax(360px,1fr),minmax(340px,auto)] xl:grid-cols-[300px,minmax(560px,1fr),400px] xl:grid-rows-1">
                        <div className="order-2 min-h-[240px] border-t border-gray-800 bg-[#111] xl:order-1 xl:min-h-0 xl:border-r xl:border-t-0">
                            <div className="flex h-full flex-col">
                                <div className="border-b border-gray-800 px-3 py-3">
                                    <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">Capture Set</div>
                                    <div className="mt-2">
                                        <UnityPreviewSelect value={captureVM.activeSetId || ''} onChange={(e) => captureVM.selectSet(e.target.value)}>
                                            {captureVM.sets.map((set) => <option key={set.id} value={set.id}>{set.name}</option>)}
                                        </UnityPreviewSelect>
                                    </div>
                                    <div className="mt-2 border border-gray-800 bg-[#1a1a1a] px-3 py-3 text-[11px] text-gray-400">
                                        <div className="text-white">{activeSet?.name || 'No set selected'}</div>
                                        <div className="mt-1">{activeSet?.items?.length || 0} textures in lineup order</div>
                                        <div className="mt-1">Preset source: {captureVM.presetName || 'None'}</div>
                                    </div>
                                </div>
                                <div className="min-h-0 flex-1 overflow-y-auto p-2">
                                    <div className="space-y-2">
                                        {(activeSet?.items || []).map((item, index) => (
                                            <div key={item.id || `${item.name}-${index}`} className={`flex items-center gap-3 border p-2 ${focusState.index === index ? 'border-blue-500 bg-[#202020]' : 'border-gray-800 bg-[#1a1a1a]'}`}>
                                                <div className="flex h-14 w-14 items-center justify-center overflow-hidden border border-gray-700 bg-[#0f0f0f]">
                                                    {item?.url ? <img src={item.url} alt={item.name || `Texture ${index + 1}`} className="h-full w-full object-contain" /> : <div className="text-[10px] uppercase tracking-[0.16em] text-gray-500">No Img</div>}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="truncate text-sm font-semibold text-white">{item.name || `Texture ${index + 1}`}</div>
                                                    <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-gray-500">Stack {index + 1}</div>
                                                    {focusState.index === index ? <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-300">Camera Focus</div> : null}
                                                </div>
                                            </div>
                                        ))}
                                        {!activeSet?.items?.length ? <div className="border border-dashed border-gray-700 bg-[#161616] p-4 text-sm text-gray-400">No saved set is available for capture yet.</div> : null}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="order-1 flex min-h-[360px] min-w-0 flex-col border-b border-gray-800 bg-[#111] xl:order-2 xl:border-b-0">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-800 bg-[#151515] px-3 py-3">
                                <div>
                                    <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">Capture</div>
                                    <div className="mt-1 text-sm text-white">Straight X-axis lineup view for the selected set</div>
                                    <div className="mt-1 text-[11px] text-gray-400">{captureBehaviorCopy}</div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <div className="border border-gray-700 bg-[#252525] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-200">{captureStatusLabel}</div>
                                    <div className="border border-gray-700 bg-[#252525] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-200">{activeSet?.items?.length || 0} stacks</div>
                                    <div className="border border-gray-700 bg-[#252525] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-200">{focusState.stackName ? `Camera Focus: ${focusState.stackName}` : 'Camera Focus: none'}</div>
                                    <button onClick={() => captureVM.resetSimulation?.()} className="border border-gray-700 bg-[#2f2f2f] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-200">Reset</button>
                                </div>
                            </div>
                            <div className="relative min-h-0 flex-1 bg-[#0c0c0c]">
                                <canvas ref={canvasRef} className="preview-canvas-host block h-full w-full" />
                                {captureOverlay ? (
                                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
                                        <div className="max-w-md border border-gray-700 bg-[#1a1a1a]/94 px-5 py-4 text-center shadow-2xl shadow-black/60">
                                            <div className="text-sm font-bold uppercase tracking-[0.16em] text-white">{captureOverlay.title}</div>
                                            <div className="mt-2 text-sm text-gray-400">{captureOverlay.body}</div>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                        <div className="order-3 min-h-[340px] border-t border-gray-800 bg-[#111] xl:min-h-0 xl:border-l xl:border-t-0">
                            <div className="flex h-full flex-col">
                                <div className="border-b border-gray-800 px-3 py-3">
                                    <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">Export</div>
                                    <div className="mt-1 text-sm text-white">Save the set lineup to Downloads as MP4</div>
                                </div>
                                <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <UnityPreviewField label="Duration (s)"><UnityPreviewInput value={capture.durationSeconds} readOnly /></UnityPreviewField>
                                        <UnityPreviewField label="FPS"><UnityPreviewInput type="number" step="1" value={capture.fps} onChange={(e) => captureVM.updateCaptureField('fps', parseInt(e.target.value || 30, 10))} /></UnityPreviewField>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <UnityPreviewField label="Seconds / Stack"><UnityPreviewInput type="number" step="0.25" value={capture.secondsPerStack} onChange={(e) => captureVM.updateCaptureField('secondsPerStack', parseFloat(e.target.value || 2))} /></UnityPreviewField>
                                        <UnityPreviewField label="Focused Stack"><UnityPreviewInput value={focusState.index >= 0 ? `${focusState.index + 1}` : '--'} readOnly /></UnityPreviewField>
                                    </div>
                                    <UnityPreviewField label="Resolution Preset">
                                        <UnityPreviewSelect value={resolutionValue} onChange={(e) => updateResolution(e.target.value)}>
                                            <option value="1280x720">1280x720</option>
                                            <option value="1920x1080">1920x1080</option>
                                            <option value="1024x1024">1024x1024</option>
                                            <option value="custom">custom</option>
                                        </UnityPreviewSelect>
                                    </UnityPreviewField>
                                    <div className="grid grid-cols-2 gap-3">
                                        <UnityPreviewField label="Width"><UnityPreviewInput type="number" step="1" value={capture.width} onChange={(e) => captureVM.updateCaptureField('width', parseInt(e.target.value || 1920, 10))} /></UnityPreviewField>
                                        <UnityPreviewField label="Height"><UnityPreviewInput type="number" step="1" value={capture.height} onChange={(e) => captureVM.updateCaptureField('height', parseInt(e.target.value || 1080, 10))} /></UnityPreviewField>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <UnityPreviewField label="Stack Spacing"><UnityPreviewInput type="number" step="0.1" value={capture.stackSpacing} onChange={(e) => captureVM.updateCaptureField('stackSpacing', parseFloat(e.target.value || 5))} /></UnityPreviewField>
                                        <UnityPreviewField label="Travel Distance"><UnityPreviewInput type="number" step="0.1" value={capture.travelDistance} onChange={(e) => captureVM.updateCaptureField('travelDistance', parseFloat(e.target.value || 40))} /></UnityPreviewField>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <UnityPreviewField label="Reveal Lead"><UnityPreviewInput type="number" step="0.1" value={capture.revealLeadSeconds} onChange={(e) => captureVM.updateCaptureField('revealLeadSeconds', parseFloat(e.target.value || 0.55))} /></UnityPreviewField>
                                        <UnityPreviewField label="Hold"><UnityPreviewInput type="number" step="0.1" value={capture.holdSeconds} onChange={(e) => captureVM.updateCaptureField('holdSeconds', parseFloat(e.target.value || 1.55))} /></UnityPreviewField>
                                        <UnityPreviewField label="Fade"><UnityPreviewInput type="number" step="0.1" value={capture.fadeSeconds} onChange={(e) => captureVM.updateCaptureField('fadeSeconds', parseFloat(e.target.value || 1.15))} /></UnityPreviewField>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <UnityPreviewField label="Camera Mode">
                                            <UnityPreviewSelect value={capture.cameraMode} onChange={(e) => captureVM.updateCaptureField('cameraMode', e.target.value)}>
                                                {PREVIEW_CAPTURE_CAMERA_MODES.map((mode) => <option key={mode} value={mode}>{mode}</option>)}
                                            </UnityPreviewSelect>
                                        </UnityPreviewField>
                                        <UnityPreviewField label="Activity Mode">
                                            <UnityPreviewSelect value={capture.activityMode || 'all_together'} onChange={(e) => captureVM.updateCaptureField('activityMode', e.target.value)}>
                                                {captureActivityOptions.map((mode) => <option key={mode.value} value={mode.value}>{mode.label}</option>)}
                                            </UnityPreviewSelect>
                                        </UnityPreviewField>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <UnityPreviewField label="Stage Mode">
                                            <UnityPreviewSelect value={capture.stageMode} onChange={(e) => captureVM.updateCaptureField('stageMode', e.target.value)}>
                                                {PREVIEW_CAPTURE_STAGE_MODES.map((mode) => <option key={mode} value={mode}>{mode}</option>)}
                                            </UnityPreviewSelect>
                                        </UnityPreviewField>
                                        <UnityPreviewField label="Stage Spacing"><UnityPreviewInput type="number" step="0.1" value={capture.stageSpacing} onChange={(e) => captureVM.updateCaptureField('stageSpacing', parseFloat(e.target.value || 5))} /></UnityPreviewField>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <UnityPreviewField label="Start Mode">
                                            <UnityPreviewSelect value={capture.simulationStartMode} onChange={(e) => captureVM.updateCaptureField('simulationStartMode', e.target.value)}>
                                                {PREVIEW_CAPTURE_START_MODES.map((mode) => <option key={mode} value={mode}>{mode}</option>)}
                                            </UnityPreviewSelect>
                                        </UnityPreviewField>
                                        <UnityPreviewField label="Warmup (s)"><UnityPreviewInput type="number" step="0.05" value={capture.warmupSeconds} onChange={(e) => captureVM.updateCaptureField('warmupSeconds', parseFloat(e.target.value || 0.65))} /></UnityPreviewField>
                                    </div>
                                    {capture.cameraMode === 'stage_scroll_x' && (
                                        <UnityPreviewField label="Scroll Travel"><UnityPreviewInput type="number" step="0.1" value={capture.stageScrollTravel} onChange={(e) => captureVM.updateCaptureField('stageScrollTravel', parseFloat(e.target.value || 40))} /></UnityPreviewField>
                                    )}
                                    {(capture.cameraMode === 'orbit_yaw' || capture.cameraMode === 'orbit_drift') && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <UnityPreviewField label="Orbit Radius"><UnityPreviewInput type="number" step="0.1" value={capture.orbitRadius} onChange={(e) => captureVM.updateCaptureField('orbitRadius', parseFloat(e.target.value || 8.4))} /></UnityPreviewField>
                                            <UnityPreviewField label="Orbit Speed"><UnityPreviewInput type="number" step="0.01" value={capture.orbitSpeed} onChange={(e) => captureVM.updateCaptureField('orbitSpeed', parseFloat(e.target.value || 0.08))} /></UnityPreviewField>
                                        </div>
                                    )}
                                    {(capture.cameraMode === 'dolly_x' || capture.cameraMode === 'dolly_z') && (
                                        <UnityPreviewField label="Dolly Distance"><UnityPreviewInput type="number" step="0.1" value={capture.dollyDistance} onChange={(e) => captureVM.updateCaptureField('dollyDistance', parseFloat(e.target.value || 14))} /></UnityPreviewField>
                                    )}
                                    {capture.cameraMode === 'pedestal_y' && (
                                        <UnityPreviewField label="Pedestal Height"><UnityPreviewInput type="number" step="0.1" value={capture.pedestalHeight} onChange={(e) => captureVM.updateCaptureField('pedestalHeight', parseFloat(e.target.value || 4.5))} /></UnityPreviewField>
                                    )}
                                    <UnityPreviewField label="Output Name"><UnityPreviewInput value={capture.outputName} onChange={(e) => captureVM.updateCaptureField('outputName', e.target.value)} /></UnityPreviewField>
                                    <div className={`border px-3 py-3 text-xs ${ffmpegReady ? 'border-blue-700 bg-[#182033] text-blue-100' : 'border-red-900 bg-[#211313] text-red-100'}`}>
                                        {ffmpegReady ? `Toolkit ready: ${toolkitHealth.ffmpeg_version || toolkitHealth.ffmpeg_path || 'ffmpeg found'}` : (toolkitHealth.ffmpeg_error || toolkitHealth.last_error || 'Toolkit health has not passed yet.')}
                                    </div>
                                    <div className="border border-gray-800 bg-[#1a1a1a] px-3 py-3">
                                        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-gray-400">
                                            <span>Export Status</span>
                                            <span>{(exportState.status || 'idle').replace(/_/g, ' ')}</span>
                                        </div>
                                        <div className="mt-2 h-2 overflow-hidden bg-[#252525]">
                                            <div className="h-full bg-blue-500 transition-[width]" style={{ width: `${Math.max(0, Math.min(100, (exportState.progress || 0) * 100))}%` }} />
                                        </div>
                                        <div className="mt-2 text-xs text-gray-300">{exportState.message || 'Ready to save a set capture.'}</div>
                                        <div className="mt-1 text-[11px] text-gray-500">{exportState.currentFrame || 0} / {exportState.totalFrames || Math.round((capture.durationSeconds || 0) * (capture.fps || 0))} frames</div>
                                        {exportState.outputPath ? <div className="mt-2 break-all text-[11px] text-blue-200">{exportState.outputPath}</div> : null}
                                        {exportState.error ? <div className="mt-2 text-[11px] text-red-300">{exportState.error}</div> : null}
                                    </div>
                                    <div className="border border-gray-800 bg-[#1a1a1a] px-3 py-3">
                                        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-gray-400">
                                            <span>Review</span>
                                            <span>{(reviewState.status || 'idle').replace(/_/g, ' ')}</span>
                                        </div>
                                        <div className="mt-2 text-xs text-gray-300">{reviewState.summary || 'Saved capture reviews will extract frames to Downloads and summarize the result here.'}</div>
                                        {reviewState.frameDir ? <div className="mt-2 break-all text-[11px] text-blue-200">{reviewState.frameDir}</div> : null}
                                        {Array.isArray(reviewState.issues) && reviewState.issues.length ? <div className="mt-2 text-[11px] text-amber-200">{reviewState.issues.join(' ')}</div> : null}
                                        {reviewState.error ? <div className="mt-2 text-[11px] text-red-300">{reviewState.error}</div> : null}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <button onClick={() => captureVM.checkToolkitHealth?.()} className="border border-gray-700 bg-[#2f2f2f] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-200">Check Toolkit</button>
                                        <button onClick={() => captureVM.reviewSavedCaptureVideo?.()} disabled={!(exportState.outputPath || reviewState.outputPath) || exportState.exporting} className="border border-gray-700 bg-[#2f2f2f] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-200 disabled:opacity-40">Review Saved Video</button>
                                        <button onClick={() => captureVM.startCaptureVideoExport?.()} disabled={!ffmpegReady || exportState.exporting || !activeSet?.items?.length} className="flex-1 border border-blue-500 bg-blue-600 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white disabled:opacity-40">Download Video</button>
                                        <button onClick={() => captureVM.cancelCaptureVideoExport?.()} disabled={!exportState.exporting} className="border border-red-900 bg-[#2a1515] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-red-200 disabled:opacity-40">Cancel</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        function formatUnityPreviewNumber(value, digits = 2) {
            if (typeof value !== 'number' || Number.isNaN(value)) return '--';
            return value.toFixed(digits).replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1');
        }

        function formatUnityPreviewRange(value, digits = 2) {
            const range = normalizePreviewRange(value || [0, 0], [0, 0]);
            return `${formatUnityPreviewNumber(range[0], digits)}-${formatUnityPreviewNumber(range[1], digits)}`;
        }

        function buildUnityScalarParameter(mode, currentValue, fallbackRange = [0, 1], fallbackCurve = [0, 1, 0]) {
            const normalized = normalizePreviewScalarParameter(currentValue, createPreviewScalarParameter('two_constants', { constants: fallbackRange }));
            if (mode === 'constant') {
                const range = scalarParameterToRange(normalized, fallbackRange);
                return createPreviewScalarParameter('constant', { constant: range[0] });
            }
            if (mode === 'two_constants') return createPreviewScalarParameter('two_constants', { constants: scalarParameterToRange(normalized, fallbackRange) });
            if (mode === 'curve') {
                const curve = normalized.mode === 'curve' ? normalized.curve : createPreviewCurveDefinition(scalarParameterToCurvePoints(normalized, fallbackCurve));
                return createPreviewScalarParameter('curve', { curve });
            }
            if (mode === 'two_curves') {
                if (normalized.mode === 'two_curves') return createPreviewScalarParameter('two_curves', { curves: normalized.curves });
                const curve = normalized.mode === 'curve' ? normalized.curve : createPreviewCurveDefinition(scalarParameterToCurvePoints(normalized, fallbackCurve));
                return createPreviewScalarParameter('two_curves', { curves: [curve, clonePreviewCurveDefinition(curve)] });
            }
            return createPreviewScalarParameter('two_constants', { constants: fallbackRange });
        }

        function buildUnityColorParameter(mode, currentValue, fallbackColors = ['#ffffff', '#ffffff']) {
            const normalized = normalizePreviewColorParameter(currentValue, createPreviewColorParameter('two_colors', { colors: fallbackColors }));
            const endpoints = colorParameterToEndpointColors(normalized, fallbackColors[0], fallbackColors[1]);
            if (mode === 'color') return createPreviewColorParameter('color', { color: endpoints[0] });
            if (mode === 'two_colors') return createPreviewColorParameter('two_colors', { colors: endpoints });
            if (mode === 'gradient') {
                const gradient = normalized.mode === 'gradient' ? normalized.gradient : createPreviewGradientDefinition(endpoints);
                return createPreviewColorParameter('gradient', { gradient });
            }
            if (mode === 'two_gradients') {
                if (normalized.mode === 'two_gradients') return createPreviewColorParameter('two_gradients', { gradients: normalized.gradients });
                const gradient = normalized.mode === 'gradient' ? normalized.gradient : createPreviewGradientDefinition(endpoints);
                return createPreviewColorParameter('two_gradients', { gradients: [gradient, clonePreviewGradientDefinition(gradient)] });
            }
            return createPreviewColorParameter('two_colors', { colors: fallbackColors });
        }

        function summarizeUnityPreviewModule(moduleKey, module) {
            const settings = module?.settings || {};
            switch (moduleKey) {
                case 'main':
                    return `Lifetime ${formatUnityPreviewRange(scalarParameterToRange(settings.lifetimeParam ?? settings.lifetime, [1.1, 1.85]))} | Speed ${formatUnityPreviewRange(scalarParameterToRange(settings.startSpeedParam ?? settings.startSpeed, [1.6, 3.1]))} | Size ${formatUnityPreviewRange(scalarParameterToRange(settings.startSizeParam ?? settings.startSize, [0.12, 0.26]))}`;
                case 'emission':
                    return `Rate ${formatUnityPreviewNumber(settings.rate || 0)} | ${normalizePreviewBursts(settings.bursts, []).length} burst${normalizePreviewBursts(settings.bursts, []).length === 1 ? '' : 's'}`;
                case 'noise':
                    return `Strength ${formatUnityPreviewNumber(settings.noiseStrength || 0)} | Scale ${formatUnityPreviewNumber(settings.noiseScale || 0)}`;
                case 'shape':
                    return `${settings.shape || 'cone'} | Spread ${formatUnityPreviewNumber(settings.spread || 0)}`;
                case 'renderer':
                    return `${settings.blend || 'additive'} | ${(settings.materialSource || 'selected_or_fallback').replace(/_/g, ' ')}`;
                default:
                    return module?.enabled === false ? 'Disabled' : 'Configured';
            }
        }

        const UNITY_PREVIEW_MODULE_META = [
            { key: 'main', label: 'Main', subtitle: 'core particle settings' },
            { key: 'emission', label: 'Emission', subtitle: 'rate and bursts' },
            { key: 'shape', label: 'Shape', subtitle: 'spawn volume and heading' },
            { key: 'velocityOverLifetime', label: 'Velocity Over Lifetime', subtitle: 'linear motion and drag' },
            { key: 'forceOverLifetime', label: 'Force Over Lifetime', subtitle: 'forces and attraction' },
            { key: 'limitVelocityOverLifetime', label: 'Limit Velocity Over Lifetime', subtitle: 'speed clamp' },
            { key: 'noise', label: 'Noise', subtitle: 'turbulence' },
            { key: 'colorOverLifetime', label: 'Color Over Lifetime', subtitle: 'gradient tint' },
            { key: 'colorBySpeed', label: 'Color By Speed', subtitle: 'speed remap tint' },
            { key: 'sizeOverLifetime', label: 'Size Over Lifetime', subtitle: 'life curve' },
            { key: 'sizeBySpeed', label: 'Size By Speed', subtitle: 'speed remap scale' },
            { key: 'rotationOverLifetime', label: 'Rotation Over Lifetime', subtitle: 'life spin' },
            { key: 'rotationBySpeed', label: 'Rotation By Speed', subtitle: 'speed remap spin' },
            { key: 'collision', label: 'Collision', subtitle: 'ground collision' },
            { key: 'subEmitters', label: 'Sub Emitters', subtitle: 'birth, death, collision' },
            { key: 'textureSheetAnimation', label: 'Texture Sheet Animation', subtitle: 'sprite sheet playback' },
            { key: 'inheritVelocity', label: 'Inherit Velocity', subtitle: 'emitter carry' },
            { key: 'lifetimeByEmitterSpeed', label: 'Lifetime By Emitter Speed', subtitle: 'lifetime scaling' },
            { key: 'trails', label: 'Trails', subtitle: 'ribbon history' },
            { key: 'customData', label: 'Custom Data', subtitle: 'two payload channels' },
            { key: 'renderer', label: 'Renderer', subtitle: 'blend and sprite source' }
        ];

        const UNITY_PREVIEW_MODULE_MODES = {
            shape: PREVIEW_EMITTER_SHAPES
        };

        function UnityPreviewField({ label, children, trailing = null }) {
            return (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-3">
                        <label className="text-[11px] text-gray-400">{label}</label>
                        {trailing}
                    </div>
                    {children}
                </div>
            );
        }

        function UnityPreviewInput(props) {
            return <input {...props} className={`w-full rounded-none border border-gray-700 bg-[#252525] px-2 py-1.5 text-sm text-white outline-none focus:border-blue-500 ${props.className || ''}`} />;
        }

        function UnityPreviewSelect(props) {
            return <select {...props} className={`w-full rounded-none border border-gray-700 bg-[#252525] px-2 py-1.5 text-sm text-white outline-none focus:border-blue-500 ${props.className || ''}`} />;
        }

        function UnityPreviewToggle({ value, onChange, labelOn = 'ON', labelOff = 'OFF' }) {
            return (
                <button onClick={() => onChange(!value)} className={`border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${value ? 'border-blue-500 bg-blue-600 text-white' : 'border-gray-700 bg-[#2f2f2f] text-gray-300'}`}>
                    {value ? labelOn : labelOff}
                </button>
            );
        }

        function UnityPreviewMenu({ label = 'Actions', triggerClassName = '', actions = [] }) {
            const [open, setOpen] = useState(false);
            const hostRef = useRef(null);
            useEffect(() => {
                if (!open) return undefined;
                const handleDown = (event) => {
                    if (!hostRef.current?.contains(event.target)) setOpen(false);
                };
                document.addEventListener('mousedown', handleDown);
                return () => document.removeEventListener('mousedown', handleDown);
            }, [open]);
            return (
                <div className="relative" ref={hostRef}>
                    <button onClick={() => setOpen((value) => !value)} className={triggerClassName}>{label}</button>
                    {open && (
                        <div className="absolute right-0 top-full z-40 mt-1 min-w-[180px] overflow-hidden border border-gray-700 bg-[#1a1a1a] shadow-2xl shadow-black/40">
                            {actions.filter(Boolean).map((action) => (
                                <button
                                    key={action.label}
                                    onClick={() => {
                                        setOpen(false);
                                        action.onClick?.();
                                    }}
                                    className={`block w-full border-b border-gray-800 px-3 py-2 text-left text-[11px] last:border-b-0 ${action.danger ? 'text-red-200 hover:bg-[#2a1515]' : 'text-gray-200 hover:bg-[#252525]'}`}
                                >
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        function UnityPreviewCurveSparkline({ curve }) {
            const normalized = normalizePreviewCurveDefinition(curve, [0, 1, 0]);
            const points = Array.from({ length: 20 }, (_, index) => {
                const t = index / 19;
                const y = evaluatePreviewCurveDefinition(normalized, t);
                return { x: t * 100, y: 100 - clampPreviewValue(((y + 1) / 2) * 100, 2, 98) };
            });
            const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' ');
            return (
                <svg viewBox="0 0 100 100" className="h-10 w-full bg-[#111]">
                    <path d="M 0 84 L 100 84" stroke="#374151" strokeWidth="2" fill="none" />
                    <path d={path} stroke="#3b82f6" strokeWidth="3" fill="none" />
                </svg>
            );
        }

        function UnityPreviewGradientSwatch({ gradient }) {
            const stops = normalizePreviewGradientDefinition(gradient, ['#ffffff', '#ffffff']).stops;
            const background = `linear-gradient(90deg, ${stops.map((stop) => `${stop.color} ${Math.round(stop.time * 100)}%`).join(', ')})`;
            return <div className="h-10 w-full border border-gray-700" style={{ background }} />;
        }

        function UnityPreviewOverlay({ title, rect, onClose, children }) {
            const top = Math.min((rect?.bottom || 120) + 8, Math.max(24, window.innerHeight - 360));
            const left = Math.min(rect?.left || 120, Math.max(24, window.innerWidth - 380));
            return (
                <>
                    <button onClick={onClose} className="fixed inset-0 z-40 bg-black/20" aria-label="Close editor" />
                    <div className="fixed z-50 w-[340px] border border-gray-700 bg-[#1a1a1a] shadow-2xl shadow-black/50" style={{ top, left }}>
                        <div className="flex items-center justify-between border-b border-gray-800 px-3 py-2">
                            <div className="text-sm font-semibold text-white">{title}</div>
                            <button onClick={onClose} className="text-xs text-gray-400">Close</button>
                        </div>
                        <div className="max-h-[360px] overflow-y-auto p-3">{children}</div>
                    </div>
                </>
            );
        }

        function UnityPreviewCurveField({ label, curve, onChange }) {
            const buttonRef = useRef(null);
            const [open, setOpen] = useState(false);
            const normalized = normalizePreviewCurveDefinition(curve, [0, 1, 0]);
            return (
                <UnityPreviewField label={label}>
                    <button ref={buttonRef} onClick={() => setOpen(true)} className="border border-gray-700 bg-[#252525] p-2 text-left">
                        <UnityPreviewCurveSparkline curve={normalized} />
                        <div className="mt-2 text-[10px] uppercase tracking-[0.16em] text-gray-500">
                            {normalized.keys.map((key) => `${formatUnityPreviewNumber(key.value, 2)}@${formatUnityPreviewNumber(key.time, 2)}`).join(' | ')}
                        </div>
                    </button>
                    {open && (
                        <UnityPreviewOverlay title={label} rect={buttonRef.current?.getBoundingClientRect()} onClose={() => setOpen(false)}>
                            <div className="space-y-3">
                                {normalized.keys.map((key, index) => (
                                    <div key={`${key.time}-${index}`} className="grid grid-cols-[1fr,1fr,1fr,auto] gap-2 border border-gray-800 bg-[#151515] p-2">
                                        <UnityPreviewInput type="number" step="0.01" value={key.time} onChange={(e) => {
                                            const next = clonePreviewCurveDefinition(normalized);
                                            next.keys[index].time = clampPreviewValue(parseFloat(e.target.value || 0), 0, 1);
                                            next.keys.sort((a, b) => a.time - b.time);
                                            onChange(next);
                                        }} />
                                        <UnityPreviewInput type="number" step="0.01" value={key.value} onChange={(e) => {
                                            const next = clonePreviewCurveDefinition(normalized);
                                            next.keys[index].value = parseFloat(e.target.value || 0);
                                            onChange(next);
                                        }} />
                                        <UnityPreviewSelect value={key.tangent || 'smooth'} onChange={(e) => {
                                            const next = clonePreviewCurveDefinition(normalized);
                                            next.keys[index].tangent = e.target.value;
                                            onChange(next);
                                        }}>
                                            {PREVIEW_CURVE_TANGENT_MODES.map((mode) => <option key={mode} value={mode}>{mode}</option>)}
                                        </UnityPreviewSelect>
                                        <button disabled={normalized.keys.length <= 2} onClick={() => {
                                            const next = clonePreviewCurveDefinition(normalized);
                                            next.keys.splice(index, 1);
                                            onChange(next);
                                        }} className="border border-gray-700 bg-[#2f2f2f] px-2 text-xs text-gray-200 disabled:opacity-40">-</button>
                                    </div>
                                ))}
                                <button onClick={() => {
                                    const next = clonePreviewCurveDefinition(normalized);
                                    next.keys.push({ time: 0.5, value: evaluatePreviewCurveDefinition(normalized, 0.5), tangent: 'smooth' });
                                    next.keys.sort((a, b) => a.time - b.time);
                                    onChange(next);
                                }} className="border border-blue-500 bg-blue-600 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white">Add Key</button>
                            </div>
                        </UnityPreviewOverlay>
                    )}
                </UnityPreviewField>
            );
        }

        function UnityPreviewGradientField({ label, gradient, onChange }) {
            const buttonRef = useRef(null);
            const [open, setOpen] = useState(false);
            const normalized = normalizePreviewGradientDefinition(gradient, ['#ffffff', '#ffffff']);
            return (
                <UnityPreviewField label={label}>
                    <button ref={buttonRef} onClick={() => setOpen(true)} className="border border-gray-700 bg-[#252525] p-2 text-left">
                        <UnityPreviewGradientSwatch gradient={normalized} />
                        <div className="mt-2 text-[10px] uppercase tracking-[0.16em] text-gray-500">
                            {normalized.stops.map((stop) => `${stop.color}@${formatUnityPreviewNumber(stop.time, 2)}`).join(' | ')}
                        </div>
                    </button>
                    {open && (
                        <UnityPreviewOverlay title={label} rect={buttonRef.current?.getBoundingClientRect()} onClose={() => setOpen(false)}>
                            <div className="space-y-3">
                                {normalized.stops.map((stop, index) => (
                                    <div key={`${stop.time}-${index}`} className="grid grid-cols-[100px,1fr,auto] gap-2 border border-gray-800 bg-[#151515] p-2">
                                        <UnityPreviewInput type="number" step="0.01" value={stop.time} onChange={(e) => {
                                            const next = clonePreviewGradientDefinition(normalized);
                                            next.stops[index].time = clampPreviewValue(parseFloat(e.target.value || 0), 0, 1);
                                            next.stops.sort((a, b) => a.time - b.time);
                                            onChange(next);
                                        }} />
                                        <UnityPreviewInput type="color" value={stop.color} onChange={(e) => {
                                            const next = clonePreviewGradientDefinition(normalized);
                                            next.stops[index].color = e.target.value;
                                            onChange(next);
                                        }} className="h-11 p-1" />
                                        <button disabled={normalized.stops.length <= 2} onClick={() => {
                                            const next = clonePreviewGradientDefinition(normalized);
                                            next.stops.splice(index, 1);
                                            onChange(next);
                                        }} className="border border-gray-700 bg-[#2f2f2f] px-2 text-xs text-gray-200 disabled:opacity-40">-</button>
                                    </div>
                                ))}
                                <button onClick={() => {
                                    const next = clonePreviewGradientDefinition(normalized);
                                    next.stops.push({ time: 0.5, color: normalized.stops[normalized.stops.length - 1]?.color || '#ffffff' });
                                    next.stops.sort((a, b) => a.time - b.time);
                                    onChange(next);
                                }} className="border border-blue-500 bg-blue-600 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white">Add Stop</button>
                            </div>
                        </UnityPreviewOverlay>
                    )}
                </UnityPreviewField>
            );
        }

        function UnityPreviewScalarParameterEditor({ label, parameter, onChange, fallbackRange = [0, 1], fallbackCurve = [0, 1, 0] }) {
            const normalized = normalizePreviewScalarParameter(parameter, createPreviewScalarParameter('two_constants', { constants: fallbackRange }));
            return (
                <div className="border border-gray-800 bg-[#1a1a1a] p-2.5">
                    <UnityPreviewField label={label} trailing={
                        <UnityPreviewSelect value={normalized.mode} onChange={(e) => onChange(buildUnityScalarParameter(e.target.value, normalized, fallbackRange, fallbackCurve))} className="max-w-[180px] text-xs">
                            {PREVIEW_SCALAR_PARAMETER_MODES.map((mode) => <option key={mode} value={mode}>{mode.replace(/_/g, ' ')}</option>)}
                        </UnityPreviewSelect>
                    }>
                        <div className="hidden" />
                    </UnityPreviewField>
                    <div className="mt-2 space-y-3">
                        {normalized.mode === 'constant' && <UnityPreviewInput type="number" step="0.01" value={normalized.constant} onChange={(e) => onChange(createPreviewScalarParameter('constant', { constant: parseFloat(e.target.value || 0) }))} />}
                        {normalized.mode === 'two_constants' && (
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <div className="text-[10px] uppercase tracking-[0.16em] text-gray-500">Min</div>
                                    <UnityPreviewInput type="number" step="0.01" value={normalized.constants[0]} onChange={(e) => onChange(createPreviewScalarParameter('two_constants', { constants: [parseFloat(e.target.value || 0), normalized.constants[1]] }))} />
                                </div>
                                <div className="space-y-1">
                                    <div className="text-[10px] uppercase tracking-[0.16em] text-gray-500">Max</div>
                                    <UnityPreviewInput type="number" step="0.01" value={normalized.constants[1]} onChange={(e) => onChange(createPreviewScalarParameter('two_constants', { constants: [normalized.constants[0], parseFloat(e.target.value || 0)] }))} />
                                </div>
                            </div>
                        )}
                        {normalized.mode === 'curve' && <UnityPreviewCurveField label="Curve" curve={normalized.curve} onChange={(curve) => onChange(createPreviewScalarParameter('curve', { curve }))} />}
                        {normalized.mode === 'two_curves' && (
                            <div className="space-y-3">
                                <UnityPreviewCurveField label="Curve A" curve={normalized.curves[0]} onChange={(curve) => onChange(createPreviewScalarParameter('two_curves', { curves: [curve, normalized.curves[1]] }))} />
                                <UnityPreviewCurveField label="Curve B" curve={normalized.curves[1]} onChange={(curve) => onChange(createPreviewScalarParameter('two_curves', { curves: [normalized.curves[0], curve] }))} />
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        function UnityPreviewColorParameterEditor({ label, parameter, onChange, fallbackColors = ['#ffffff', '#ffffff'] }) {
            const normalized = normalizePreviewColorParameter(parameter, createPreviewColorParameter('two_colors', { colors: fallbackColors }));
            return (
                <div className="border border-gray-800 bg-[#1a1a1a] p-2.5">
                    <UnityPreviewField label={label} trailing={
                        <UnityPreviewSelect value={normalized.mode} onChange={(e) => onChange(buildUnityColorParameter(e.target.value, normalized, fallbackColors))} className="max-w-[180px] text-xs">
                            {PREVIEW_COLOR_PARAMETER_MODES.map((mode) => <option key={mode} value={mode}>{mode.replace(/_/g, ' ')}</option>)}
                        </UnityPreviewSelect>
                    }>
                        <div className="hidden" />
                    </UnityPreviewField>
                    <div className="mt-2 space-y-3">
                        {normalized.mode === 'color' && <UnityPreviewInput type="color" value={normalized.color} onChange={(e) => onChange(createPreviewColorParameter('color', { color: e.target.value }))} className="h-11 p-1" />}
                        {normalized.mode === 'two_colors' && (
                            <div className="grid grid-cols-2 gap-2">
                                <UnityPreviewInput type="color" value={normalized.colors[0]} onChange={(e) => onChange(createPreviewColorParameter('two_colors', { colors: [e.target.value, normalized.colors[1]] }))} className="h-11 p-1" />
                                <UnityPreviewInput type="color" value={normalized.colors[1]} onChange={(e) => onChange(createPreviewColorParameter('two_colors', { colors: [normalized.colors[0], e.target.value] }))} className="h-11 p-1" />
                            </div>
                        )}
                        {normalized.mode === 'gradient' && <UnityPreviewGradientField label="Gradient" gradient={normalized.gradient} onChange={(gradient) => onChange(createPreviewColorParameter('gradient', { gradient }))} />}
                        {normalized.mode === 'two_gradients' && (
                            <div className="space-y-3">
                                <UnityPreviewGradientField label="Gradient A" gradient={normalized.gradients[0]} onChange={(gradient) => onChange(createPreviewColorParameter('two_gradients', { gradients: [gradient, normalized.gradients[1]] }))} />
                                <UnityPreviewGradientField label="Gradient B" gradient={normalized.gradients[1]} onChange={(gradient) => onChange(createPreviewColorParameter('two_gradients', { gradients: [normalized.gradients[0], gradient] }))} />
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        function UnityPreviewBurstListEditor({ bursts, onChange }) {
            const safeBursts = normalizePreviewBursts(bursts, []);
            return (
                <div className="border border-gray-800 bg-[#1a1a1a] p-2.5">
                    <div className="mb-3 flex items-center justify-between">
                        <div className="text-[11px] uppercase tracking-[0.16em] text-gray-400">Bursts</div>
                        <button onClick={() => onChange([...(safeBursts || []), { time: 0, count: 8, cycles: 1, interval: 0 }])} className="border border-blue-500 bg-blue-600 px-2.5 py-1 text-[10px] font-bold text-white">ADD</button>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-[10px] uppercase tracking-[0.16em] text-gray-500">
                        <div>Time</div>
                        <div>Count</div>
                        <div>Cycles</div>
                        <div>Interval</div>
                    </div>
                    <div className="mt-2 space-y-2">
                        {safeBursts.length === 0 && <div className="border border-dashed border-gray-700 px-3 py-4 text-xs text-gray-500">No bursts configured.</div>}
                        {safeBursts.map((burst, index) => (
                            <div key={`${burst.time}-${index}`} className="grid grid-cols-[1fr,1fr,1fr,1fr,auto] gap-2 border border-gray-800 bg-[#151515] p-2">
                                <UnityPreviewInput type="number" step="0.01" value={burst.time} onChange={(e) => onChange(safeBursts.map((entry, entryIndex) => entryIndex === index ? { ...entry, time: parseFloat(e.target.value || 0) } : entry))} />
                                <UnityPreviewInput type="number" step="1" value={burst.count} onChange={(e) => onChange(safeBursts.map((entry, entryIndex) => entryIndex === index ? { ...entry, count: parseInt(e.target.value || 0, 10) } : entry))} />
                                <UnityPreviewInput type="number" step="1" value={burst.cycles} onChange={(e) => onChange(safeBursts.map((entry, entryIndex) => entryIndex === index ? { ...entry, cycles: parseInt(e.target.value || 1, 10) } : entry))} />
                                <UnityPreviewInput type="number" step="0.01" value={burst.interval} onChange={(e) => onChange(safeBursts.map((entry, entryIndex) => entryIndex === index ? { ...entry, interval: parseFloat(e.target.value || 0) } : entry))} />
                                <button onClick={() => onChange(safeBursts.filter((_, entryIndex) => entryIndex !== index))} className="border border-gray-700 bg-[#2f2f2f] px-2 text-xs text-gray-200">-</button>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        function PreviewUnityHierarchyPane({ previewVM }) {
            const preset = previewVM.activePreset;
            if (!preset) return null;
            return (
                <div className="flex h-full min-h-0 flex-col border-b border-gray-800 bg-[#111] xl:border-b-0 xl:border-r">
                    <div className="border-b border-gray-800 px-3 py-3">
                        <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">Hierarchy</div>
                        <div className="mt-2 border border-gray-800 bg-[#1a1a1a] px-3 py-3">
                            <div className="text-[10px] uppercase tracking-[0.16em] text-gray-500">Preset</div>
                            <div className="mt-1 text-sm font-semibold text-white">{preset.name}</div>
                            <div className="mt-3 flex items-center justify-between">
                                <div className="text-[10px] uppercase tracking-[0.16em] text-gray-500">Layers</div>
                                <button onClick={() => previewVM.addLayer()} className="border border-blue-500 bg-blue-600 px-2.5 py-1 text-[10px] font-bold text-white">ADD</button>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 space-y-1 overflow-y-auto p-2">
                        {preset.layers.map((layer) => {
                            const selected = previewVM.selectedLayerId === layer.id;
                            return (
                                <div key={layer.id} className={`border px-3 py-2 ${selected ? 'border-blue-500 bg-[#202020]' : 'border-gray-800 bg-[#1a1a1a]'}`}>
                                    <div className="flex items-start gap-3">
                                        <button onClick={() => previewVM.updateLayerSection(layer.id, 'root', { enabled: !layer.enabled })} className={`mt-0.5 border px-2 py-1 text-[9px] font-bold uppercase tracking-[0.16em] ${layer.enabled ? 'border-blue-500 bg-blue-600 text-white' : 'border-gray-700 bg-[#2f2f2f] text-gray-300'}`}>
                                            {layer.enabled ? 'On' : 'Off'}
                                        </button>
                                        <button onClick={() => previewVM.selectLayer(layer.id)} className="min-w-0 flex-1 text-left">
                                            <div className="truncate text-sm font-semibold text-white">{layer.name}</div>
                                            <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-gray-500">{layer.maxParticles} particles</div>
                                        </button>
                                        <UnityPreviewMenu
                                            label="•••"
                                            triggerClassName="border border-gray-700 bg-[#252525] px-2 py-1 text-[10px] text-gray-200"
                                            actions={[
                                                { label: 'Move Up', onClick: () => previewVM.reorderLayer(layer.id, -1) },
                                                { label: 'Move Down', onClick: () => previewVM.reorderLayer(layer.id, 1) },
                                                { label: 'Duplicate Layer', onClick: () => previewVM.duplicateLayer(layer.id) },
                                                { label: 'Delete Layer', onClick: () => previewVM.deleteLayer(layer.id), danger: true }
                                            ]}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        }

        function PreviewUnityToolbar({ previewVM, viewPanelOpen, onToggleViewPanel, recordPanelOpen, onToggleRecordPanel }) {
            const invalidPreset = previewVM.status === 'invalid_preset';
            const usingFallbackSprite = !previewVM.activeSourceItem;
            const exporting = previewVM.exportState?.exporting === true;
            return (
                <div className="flex flex-wrap items-center gap-2 border-b border-gray-800 bg-[#151515] px-3 py-3">
                    <div className="flex min-w-[240px] flex-1 flex-wrap items-center gap-3">
                        <UnityPreviewSelect value={previewVM.activeSourceId || ''} onChange={(e) => previewVM.selectSource(e.target.value || null)} className="max-w-[260px]">
                            <option value="">Fallback square (50% alpha)</option>
                            {previewVM.sourceItems.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                        </UnityPreviewSelect>
                        <UnityPreviewSelect value={previewVM.activePresetId || ''} onChange={(e) => previewVM.selectPreset(e.target.value)} className="max-w-[220px]">
                            {previewVM.presets.map((preset) => <option key={preset.id} value={preset.id}>{preset.name}</option>)}
                        </UnityPreviewSelect>
                        <UnityPreviewMenu
                            label="Preset"
                            triggerClassName="border border-gray-700 bg-[#252525] px-3 py-2 text-[11px] font-semibold text-gray-200"
                            actions={[
                                { label: 'New Preset', onClick: () => previewVM.createPreset() },
                                { label: 'Duplicate Preset', onClick: () => previewVM.duplicatePreset() },
                                { label: 'Rename Preset', onClick: () => {
                                    const nextName = window.prompt('Rename preset', previewVM.activePreset?.name || '');
                                    if (nextName !== null) previewVM.renamePreset(previewVM.activePresetId, nextName);
                                } },
                                { label: 'Reset Preset', onClick: () => previewVM.replaceWithDefault() },
                                { label: 'Delete Preset', onClick: () => previewVM.deletePreset(), danger: true }
                            ]}
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <button onClick={() => previewVM.setPlaying(!previewVM.isPlaying)} disabled={invalidPreset} className={`border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] ${previewVM.isPlaying ? 'border-blue-500 bg-blue-600 text-white' : 'border-gray-700 bg-[#2f2f2f] text-gray-200'} disabled:opacity-40`}>
                            {previewVM.isPlaying ? 'Pause' : 'Play'}
                        </button>
                        <button onClick={() => previewVM.resetSimulation()} disabled={invalidPreset} className="border border-gray-700 bg-[#2f2f2f] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-200 disabled:opacity-40">Reset Sim</button>
                        <button onClick={onToggleRecordPanel} className={`border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] ${recordPanelOpen ? 'border-blue-500 bg-blue-600 text-white' : 'border-gray-700 bg-[#2f2f2f] text-gray-200'}`}>{exporting ? 'Recording' : 'Record'}</button>
                        <button onClick={onToggleViewPanel} className={`border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] ${viewPanelOpen ? 'border-blue-500 bg-blue-600 text-white' : 'border-gray-700 bg-[#2f2f2f] text-gray-200'}`}>View</button>
                        <div className={`border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${usingFallbackSprite ? 'border-gray-700 bg-[#252525] text-gray-200' : 'border-blue-500 bg-[#182033] text-blue-200'}`}>
                            {usingFallbackSprite ? 'Fallback' : 'Source'}
                        </div>
                        <div className="border border-gray-700 bg-[#252525] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-200">
                            {previewVM.status.replace(/_/g, ' ')}
                        </div>
                        <div className="flex min-w-[180px] items-center gap-2 border border-gray-700 bg-[#252525] px-3 py-2">
                            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">Time</span>
                            <input type="range" min="0" max="3" step="0.01" value={previewVM.timeScale} onChange={(e) => previewVM.setTimeScale(parseFloat(e.target.value))} className="slider-thumb w-full" />
                            <span className="w-8 text-right font-mono text-[10px] text-gray-200">{previewVM.timeScale.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            );
        }

        function PreviewUnityRecordPanel({ previewVM, onClose }) {
            const capture = previewVM.capture || createDefaultPreviewPreset().scene.capture;
            const exportState = previewVM.exportState || {};
            const toolkitHealth = previewVM.toolkitHealth || {};
            const ffmpegReady = toolkitHealth.status === 'ok' && toolkitHealth.ffmpeg_available === true;
            useEffect(() => {
                previewVM.checkToolkitHealth?.();
            }, []);
            const updateSizePreset = (value) => {
                if (value === '1280x720') previewVM.updateCaptureFields({ width: 1280, height: 720 });
                else if (value === '1920x1080') previewVM.updateCaptureFields({ width: 1920, height: 1080 });
                else if (value === '1024x1024') previewVM.updateCaptureFields({ width: 1024, height: 1024 });
            };
            const resolutionValue = capture.width === 1280 && capture.height === 720
                ? '1280x720'
                : (capture.width === 1920 && capture.height === 1080
                    ? '1920x1080'
                    : (capture.width === 1024 && capture.height === 1024 ? '1024x1024' : 'custom'));
            return (
                <div className="absolute left-4 top-16 z-20 w-[360px] border border-gray-700 bg-[#1a1a1a] shadow-2xl shadow-black/50">
                    <div className="flex items-center justify-between border-b border-gray-800 px-3 py-2">
                        <div>
                            <div className="text-sm font-semibold text-white">Offline MP4 Export</div>
                            <div className="text-[11px] text-gray-500">Fixed-step render through toolkit + ffmpeg</div>
                        </div>
                        <button onClick={onClose} className="text-xs text-gray-400">Close</button>
                    </div>
                    <div className="space-y-2 p-3">
                        <div className="grid grid-cols-2 gap-3">
                            <UnityPreviewField label="Duration (s)"><UnityPreviewInput type="number" step="1" value={capture.durationSeconds} onChange={(e) => previewVM.updateCaptureField('durationSeconds', parseFloat(e.target.value || 120))} /></UnityPreviewField>
                            <UnityPreviewField label="FPS"><UnityPreviewInput type="number" step="1" value={capture.fps} onChange={(e) => previewVM.updateCaptureField('fps', parseInt(e.target.value || 30, 10))} /></UnityPreviewField>
                        </div>
                        <UnityPreviewField label="Resolution Preset">
                            <UnityPreviewSelect value={resolutionValue} onChange={(e) => updateSizePreset(e.target.value)}>
                                <option value="1280x720">1280x720</option>
                                <option value="1920x1080">1920x1080</option>
                                <option value="1024x1024">1024x1024</option>
                                <option value="custom">custom</option>
                            </UnityPreviewSelect>
                        </UnityPreviewField>
                        <div className="grid grid-cols-2 gap-3">
                            <UnityPreviewField label="Width"><UnityPreviewInput type="number" step="1" value={capture.width} onChange={(e) => previewVM.updateCaptureField('width', parseInt(e.target.value || 1280, 10))} /></UnityPreviewField>
                            <UnityPreviewField label="Height"><UnityPreviewInput type="number" step="1" value={capture.height} onChange={(e) => previewVM.updateCaptureField('height', parseInt(e.target.value || 720, 10))} /></UnityPreviewField>
                        </div>
                        <UnityPreviewField label="Camera Mode">
                            <UnityPreviewSelect value={capture.cameraMode} onChange={(e) => previewVM.updateCaptureField('cameraMode', e.target.value)}>
                                {PREVIEW_CAPTURE_CAMERA_MODES.map((mode) => <option key={mode} value={mode}>{mode}</option>)}
                            </UnityPreviewSelect>
                        </UnityPreviewField>
                        <UnityPreviewField label="Stage Mode">
                            <UnityPreviewSelect value={capture.stageMode} onChange={(e) => previewVM.updateCaptureField('stageMode', e.target.value)}>
                                {PREVIEW_CAPTURE_STAGE_MODES.map((mode) => <option key={mode} value={mode}>{mode}</option>)}
                            </UnityPreviewSelect>
                        </UnityPreviewField>
                        <div className="grid grid-cols-2 gap-3">
                            <UnityPreviewField label="Stage Spacing"><UnityPreviewInput type="number" step="0.1" value={capture.stageSpacing} onChange={(e) => previewVM.updateCaptureField('stageSpacing', parseFloat(e.target.value || 5))} /></UnityPreviewField>
                            <UnityPreviewField label="Start Mode">
                                <UnityPreviewSelect value={capture.simulationStartMode} onChange={(e) => previewVM.updateCaptureField('simulationStartMode', e.target.value)}>
                                    {PREVIEW_CAPTURE_START_MODES.map((mode) => <option key={mode} value={mode}>{mode}</option>)}
                                </UnityPreviewSelect>
                            </UnityPreviewField>
                        </div>
                        <UnityPreviewField label="Output Name"><UnityPreviewInput value={capture.outputName} onChange={(e) => previewVM.updateCaptureField('outputName', e.target.value)} /></UnityPreviewField>
                        {(capture.cameraMode === 'orbit_yaw' || capture.cameraMode === 'orbit_drift') && (
                            <div className="grid grid-cols-2 gap-3">
                                <UnityPreviewField label="Orbit Radius"><UnityPreviewInput type="number" step="0.1" value={capture.orbitRadius} onChange={(e) => previewVM.updateCaptureField('orbitRadius', parseFloat(e.target.value || 7.2))} /></UnityPreviewField>
                                <UnityPreviewField label="Orbit Speed"><UnityPreviewInput type="number" step="0.01" value={capture.orbitSpeed} onChange={(e) => previewVM.updateCaptureField('orbitSpeed', parseFloat(e.target.value || 0.08))} /></UnityPreviewField>
                            </div>
                        )}
                        {capture.cameraMode === 'orbit_drift' && (
                            <UnityPreviewField label="Drift Amount"><UnityPreviewInput type="number" step="0.1" value={capture.orbitDriftAmount} onChange={(e) => previewVM.updateCaptureField('orbitDriftAmount', parseFloat(e.target.value || 8))} /></UnityPreviewField>
                        )}
                        {(capture.cameraMode === 'dolly_x' || capture.cameraMode === 'dolly_z') && (
                            <UnityPreviewField label="Dolly Distance"><UnityPreviewInput type="number" step="0.1" value={capture.dollyDistance} onChange={(e) => previewVM.updateCaptureField('dollyDistance', parseFloat(e.target.value || 12))} /></UnityPreviewField>
                        )}
                        {capture.cameraMode === 'pedestal_y' && (
                            <UnityPreviewField label="Pedestal Height"><UnityPreviewInput type="number" step="0.1" value={capture.pedestalHeight} onChange={(e) => previewVM.updateCaptureField('pedestalHeight', parseFloat(e.target.value || 4))} /></UnityPreviewField>
                        )}
                        {capture.cameraMode === 'stage_scroll_x' && (
                            <UnityPreviewField label="Stage Scroll Travel"><UnityPreviewInput type="number" step="0.1" value={capture.stageScrollTravel} onChange={(e) => previewVM.updateCaptureField('stageScrollTravel', parseFloat(e.target.value || 40))} /></UnityPreviewField>
                        )}
                        {capture.cameraMode === 'keyframed' && (
                            <div className="border border-gray-800 bg-[#151515] p-2.5">
                                <div className="mb-2 text-[11px] uppercase tracking-[0.16em] text-gray-400">Keyframes</div>
                                <div className="space-y-2">
                                    {(capture.keyframes || []).map((keyframe, index) => (
                                        <div key={`${keyframe.time}-${index}`} className="grid grid-cols-3 gap-2">
                                            <UnityPreviewInput type="number" step="0.01" value={keyframe.time} onChange={(e) => {
                                                const next = (capture.keyframes || []).map((entry, entryIndex) => entryIndex === index ? { ...entry, time: parseFloat(e.target.value || 0) } : entry);
                                                previewVM.updateCaptureField('keyframes', next);
                                            }} />
                                            <UnityPreviewInput type="text" value={(keyframe.position || []).join(', ')} onChange={(e) => {
                                                const values = String(e.target.value || '').split(',').map((item) => parseFloat(item.trim() || 0)).slice(0, 3);
                                                const next = (capture.keyframes || []).map((entry, entryIndex) => entryIndex === index ? { ...entry, position: values } : entry);
                                                previewVM.updateCaptureField('keyframes', next);
                                            }} />
                                            <UnityPreviewInput type="text" value={(keyframe.target || []).join(', ')} onChange={(e) => {
                                                const values = String(e.target.value || '').split(',').map((item) => parseFloat(item.trim() || 0)).slice(0, 3);
                                                const next = (capture.keyframes || []).map((entry, entryIndex) => entryIndex === index ? { ...entry, target: values } : entry);
                                                previewVM.updateCaptureField('keyframes', next);
                                            }} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className={`border px-3 py-3 text-xs ${ffmpegReady ? 'border-blue-700 bg-[#182033] text-blue-100' : 'border-red-900 bg-[#211313] text-red-100'}`}>
                            {ffmpegReady ? `Toolkit ready: ${toolkitHealth.ffmpeg_version || toolkitHealth.ffmpeg_path || 'ffmpeg found'}` : (toolkitHealth.ffmpeg_error || toolkitHealth.last_error || 'Toolkit health has not passed yet.')}
                        </div>
                        <div className="border border-gray-800 bg-[#151515] px-3 py-3">
                            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-gray-400">
                                <span>Status</span>
                                <span>{(exportState.status || 'idle').replace(/_/g, ' ')}</span>
                            </div>
                            <div className="mt-2 h-2 overflow-hidden bg-[#252525]">
                                <div className="h-full bg-blue-500 transition-[width]" style={{ width: `${Math.max(0, Math.min(100, (exportState.progress || 0) * 100))}%` }} />
                            </div>
                            <div className="mt-2 text-xs text-gray-300">{exportState.message || 'Ready to render.'}</div>
                            <div className="mt-1 text-[11px] text-gray-500">{exportState.currentFrame || 0} / {exportState.totalFrames || Math.round((capture.durationSeconds || 0) * (capture.fps || 0))} frames</div>
                            {exportState.outputPath ? <div className="mt-1 break-all text-[11px] text-blue-200">{exportState.outputPath}</div> : null}
                            {exportState.error ? <div className="mt-1 text-[11px] text-red-300">{exportState.error}</div> : null}
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => previewVM.checkToolkitHealth?.()} className="border border-gray-700 bg-[#2f2f2f] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-200">Check Toolkit</button>
                            <button onClick={() => previewVM.startVideoExport?.()} disabled={!ffmpegReady || exportState.exporting || previewVM.status === 'invalid_preset'} className="flex-1 border border-blue-500 bg-blue-600 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white disabled:opacity-40">Start Render</button>
                            <button onClick={() => previewVM.cancelVideoExport?.()} disabled={!exportState.exporting} className="border border-red-900 bg-[#2a1515] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-red-200 disabled:opacity-40">Cancel</button>
                        </div>
                    </div>
                </div>
            );
        }

        function PreviewUnityViewPanel({ previewVM, onClose }) {
            const scene = previewVM.activePreset?.scene;
            if (!scene) return null;
            return (
                <div className="absolute right-4 top-16 z-20 w-[320px] border border-gray-700 bg-[#1a1a1a] shadow-2xl shadow-black/50">
                    <div className="flex items-center justify-between border-b border-gray-800 px-3 py-2">
                        <div>
                            <div className="text-sm font-semibold text-white">View Controls</div>
                            <div className="text-[11px] text-gray-500">Scene and camera only</div>
                        </div>
                        <button onClick={onClose} className="text-xs text-gray-400">Close</button>
                    </div>
                    <div className="space-y-2 p-3">
                        <UnityPreviewField label="Background"><UnityPreviewInput type="color" value={scene.background} onChange={(e) => previewVM.updateSceneField('background', e.target.value)} className="h-11 p-1" /></UnityPreviewField>
                        <div className="grid grid-cols-2 gap-3">
                            <UnityPreviewField label="Camera FOV"><UnityPreviewInput type="number" value={scene.cameraFov} onChange={(e) => previewVM.updateSceneField('cameraFov', parseFloat(e.target.value || 45))} /></UnityPreviewField>
                            <UnityPreviewField label="Distance"><UnityPreviewInput type="number" value={scene.cameraDistance} onChange={(e) => previewVM.updateSceneField('cameraDistance', parseFloat(e.target.value || 6))} /></UnityPreviewField>
                            <UnityPreviewField label="Pitch"><UnityPreviewInput type="number" value={scene.cameraPitch} onChange={(e) => previewVM.updateSceneField('cameraPitch', parseFloat(e.target.value || 18))} /></UnityPreviewField>
                            <UnityPreviewField label="Yaw"><UnityPreviewInput type="number" value={scene.cameraYaw} onChange={(e) => previewVM.updateSceneField('cameraYaw', parseFloat(e.target.value || 24))} /></UnityPreviewField>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <UnityPreviewField label="Grid"><UnityPreviewToggle value={scene.grid !== false} onChange={(value) => previewVM.updateSceneField('grid', value)} /></UnityPreviewField>
                            <UnityPreviewField label="Scene Loop"><UnityPreviewToggle value={scene.loop !== false} onChange={(value) => previewVM.updateSceneField('loop', value)} /></UnityPreviewField>
                        </div>
                        <button onClick={() => previewVM.resetSceneCamera()} className="w-full border border-blue-500 bg-blue-600 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white">Reset Camera</button>
                    </div>
                </div>
            );
        }

        function PreviewUnityModuleEditor({ previewVM, layer, moduleKey }) {
            const defaults = createDefaultPreviewModules();
            const modules = clonePreviewModules(layer.modules || defaults);
            const module = modules[moduleKey] || defaults[moduleKey];
            const settings = module.settings || {};
            const updateModules = (patchMap) => {
                const nextModules = clonePreviewModules(layer.modules || defaults);
                Object.entries(patchMap).forEach(([key, patch]) => {
                    nextModules[key] = {
                        ...nextModules[key],
                        ...patch,
                        settings: { ...(nextModules[key]?.settings || {}), ...(patch.settings || {}) }
                    };
                });
                previewVM.updateLayerSection(layer.id, 'root', { modules: nextModules });
            };
            const updateModule = (patch) => updateModules({ [moduleKey]: patch });
            if (moduleKey === 'main') {
                return (
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <UnityPreviewField label="Duration"><UnityPreviewInput type="number" step="0.01" value={settings.duration} onChange={(e) => updateModule({ settings: { duration: parseFloat(e.target.value || 0) } })} /></UnityPreviewField>
                            <UnityPreviewField label="Simulation Speed"><UnityPreviewInput type="number" step="0.01" value={settings.simulationSpeed} onChange={(e) => updateModule({ settings: { simulationSpeed: parseFloat(e.target.value || 1) } })} /></UnityPreviewField>
                        </div>
                        <UnityPreviewField label="Loop"><UnityPreviewToggle value={settings.loop !== false} onChange={(value) => updateModule({ settings: { loop: value } })} /></UnityPreviewField>
                        <UnityPreviewScalarParameterEditor label="Start Lifetime" parameter={settings.lifetimeParam ?? settings.lifetime} onChange={(parameter) => updateModule({ settings: { lifetimeParam: parameter, lifetime: scalarParameterToRange(parameter, [1.1, 1.85]) } })} fallbackRange={[1.1, 1.85]} fallbackCurve={[1.1, 1.45, 1.85]} />
                        <UnityPreviewScalarParameterEditor label="Start Speed" parameter={settings.startSpeedParam ?? settings.startSpeed} onChange={(parameter) => updateModule({ settings: { startSpeedParam: parameter, startSpeed: scalarParameterToRange(parameter, [1.6, 3.1]) } })} fallbackRange={[1.6, 3.1]} fallbackCurve={[1.6, 2.3, 3.1]} />
                        <UnityPreviewScalarParameterEditor label="Start Size" parameter={settings.startSizeParam ?? settings.startSize} onChange={(parameter) => updateModule({ settings: { startSizeParam: parameter, startSize: scalarParameterToRange(parameter, [0.12, 0.26]) } })} fallbackRange={[0.12, 0.26]} fallbackCurve={[0.12, 0.18, 0.26]} />
                        <UnityPreviewScalarParameterEditor label="Start Rotation" parameter={settings.startRotationParam ?? settings.startRotation} onChange={(parameter) => updateModule({ settings: { startRotationParam: parameter, startRotation: scalarParameterToRange(parameter, [-0.35, 0.35]) } })} fallbackRange={[-0.35, 0.35]} fallbackCurve={[-0.35, 0, 0.35]} />
                        <UnityPreviewColorParameterEditor label="Start Color" parameter={settings.startColorParam ?? [settings.startColorStart, settings.startColorEnd]} onChange={(parameter) => {
                            const [start, end] = colorParameterToEndpointColors(parameter, settings.startColorStart || '#eef8ff', settings.startColorEnd || '#9dd9ff');
                            updateModule({ settings: { startColorParam: parameter, startColorStart: start, startColorEnd: end } });
                        }} fallbackColors={[settings.startColorStart || '#eef8ff', settings.startColorEnd || '#9dd9ff']} />
                    </div>
                );
            }
            if (moduleKey === 'emission') {
                return (
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <UnityPreviewField label="Rate over Time"><UnityPreviewInput type="number" step="1" value={settings.rate} onChange={(e) => updateModule({ settings: { rate: parseFloat(e.target.value || 0) } })} /></UnityPreviewField>
                            <UnityPreviewField label="Duration"><UnityPreviewInput type="number" step="0.01" value={settings.duration} onChange={(e) => updateModule({ settings: { duration: parseFloat(e.target.value || 0) } })} /></UnityPreviewField>
                        </div>
                        <UnityPreviewField label="Loop"><UnityPreviewToggle value={settings.loop !== false} onChange={(value) => updateModule({ settings: { loop: value } })} /></UnityPreviewField>
                        <UnityPreviewBurstListEditor bursts={settings.bursts} onChange={(bursts) => updateModule({ settings: { bursts, burst: bursts[0]?.count || 0, burstTime: bursts[0]?.time || 0 } })} />
                    </div>
                );
            }
            if (moduleKey === 'shape') {
                return <div className="space-y-3"><PreviewVec3Editor label="Position" value={settings.position} onChange={(value) => updateModule({ settings: { position: value } })} /><PreviewVec3Editor label="Rotation" value={settings.rotation} onChange={(value) => updateModule({ settings: { rotation: value } })} /><PreviewVec3Editor label="Size" value={settings.size} onChange={(value) => updateModule({ settings: { size: value } })} /><PreviewVec3Editor label="Direction" value={settings.direction} onChange={(value) => updateModule({ settings: { direction: value } })} /><UnityPreviewField label="Spread"><UnityPreviewInput type="number" step="0.01" value={settings.spread} onChange={(e) => updateModule({ settings: { spread: parseFloat(e.target.value || 0) } })} /></UnityPreviewField></div>;
            }
            if (moduleKey === 'colorOverLifetime') {
                return <UnityPreviewColorParameterEditor label="Color" parameter={settings.colorParam ?? [settings.colorStart, settings.colorEnd]} onChange={(parameter) => {
                    const [start, end] = colorParameterToEndpointColors(parameter, settings.colorStart || '#dff5ff', settings.colorEnd || '#4fc3ff');
                    updateModule({ settings: { colorParam: parameter, colorStart: start, colorEnd: end } });
                }} fallbackColors={[settings.colorStart || '#dff5ff', settings.colorEnd || '#4fc3ff']} />;
            }
            if (moduleKey === 'sizeOverLifetime') {
                return <UnityPreviewScalarParameterEditor label="Size" parameter={settings.curveParam ?? settings.curve} onChange={(parameter) => updateModules({
                    sizeOverLifetime: { settings: { curveParam: parameter, curve: scalarParameterToCurvePoints(parameter, [0.4, 1.3, 0.06]), size: scalarParameterToRange(parameter, [0.4, 0.06]) } },
                    renderer: { settings: { sizeOverLifeParam: parameter, sizeOverLife: scalarParameterToCurvePoints(parameter, [0.4, 1.3, 0.06]) } }
                })} fallbackRange={[0.4, 0.06]} fallbackCurve={[0.4, 1.3, 0.06]} />;
            }
            if (moduleKey === 'rotationOverLifetime') {
                return <UnityPreviewScalarParameterEditor label="Spin" parameter={settings.spinParam ?? settings.spin} onChange={(parameter) => updateModule({ settings: { spinParam: parameter, spin: scalarParameterToRange(parameter, [-3.2, 3.2]) } })} fallbackRange={[-3.2, 3.2]} fallbackCurve={[-3.2, 0, 3.2]} />;
            }
            if (moduleKey === 'renderer') {
                return (
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <UnityPreviewField label="Blend"><UnityPreviewSelect value={settings.blend} onChange={(e) => updateModule({ settings: { blend: e.target.value } })}>{PREVIEW_BLEND_MODES.map((mode) => <option key={mode} value={mode}>{mode}</option>)}</UnityPreviewSelect></UnityPreviewField>
                            <UnityPreviewField label="Sprite Source"><UnityPreviewSelect value={settings.materialSource || 'selected_or_fallback'} onChange={(e) => updateModule({ settings: { materialSource: e.target.value } })}><option value="selected_or_fallback">selected_or_fallback</option><option value="fallback_square_50">fallback_square_50</option></UnityPreviewSelect></UnityPreviewField>
                            <UnityPreviewField label="Alpha Clip"><UnityPreviewInput type="number" step="0.001" value={settings.alphaClip} onChange={(e) => updateModule({ settings: { alphaClip: parseFloat(e.target.value || 0) } })} /></UnityPreviewField>
                            <UnityPreviewField label="Billboard"><div className="border border-gray-700 bg-[#252525] px-3 py-2 text-sm text-gray-300">spherical</div></UnityPreviewField>
                        </div>
                        <UnityPreviewScalarParameterEditor label="Alpha Over Life" parameter={settings.alphaOverLifeParam ?? settings.alphaOverLife} onChange={(parameter) => updateModule({ settings: { alphaOverLifeParam: parameter, alphaOverLife: scalarParameterToCurvePoints(parameter, [0.35, 1, 0]) } })} fallbackRange={[0.35, 1]} fallbackCurve={[0.35, 1, 0]} />
                        <UnityPreviewScalarParameterEditor label="Size Over Life" parameter={settings.sizeOverLifeParam ?? settings.sizeOverLife} onChange={(parameter) => updateModules({
                            renderer: { settings: { sizeOverLifeParam: parameter, sizeOverLife: scalarParameterToCurvePoints(parameter, [0.4, 1.3, 0.06]) } },
                            sizeOverLifetime: { settings: { curveParam: parameter, curve: scalarParameterToCurvePoints(parameter, [0.4, 1.3, 0.06]), size: scalarParameterToRange(parameter, [0.4, 0.06]) } }
                        })} fallbackRange={[0.4, 0.06]} fallbackCurve={[0.4, 1.3, 0.06]} />
                    </div>
                );
            }
            switch (moduleKey) {
                case 'velocityOverLifetime':
                    return <div className="space-y-3"><PreviewVec3Editor label="Linear" value={settings.linear} onChange={(value) => updateModule({ settings: { linear: value } })} /><PreviewVec3Editor label="Gravity" value={settings.gravity} onChange={(value) => updateModule({ settings: { gravity: value } })} /><UnityPreviewField label="Drag"><UnityPreviewInput type="number" step="0.01" value={settings.drag} onChange={(e) => updateModule({ settings: { drag: parseFloat(e.target.value || 0) } })} /></UnityPreviewField></div>;
                case 'forceOverLifetime':
                    return <div className="space-y-3"><PreviewVec3Editor label="Force" value={settings.force} onChange={(value) => updateModule({ settings: { force: value } })} /><div className="grid grid-cols-2 gap-3"><UnityPreviewField label="Vortex Strength"><UnityPreviewInput type="number" step="0.01" value={settings.vortexStrength} onChange={(e) => updateModule({ settings: { vortexStrength: parseFloat(e.target.value || 0) } })} /></UnityPreviewField><UnityPreviewField label="Radial Attraction"><UnityPreviewInput type="number" step="0.01" value={settings.radialAttraction} onChange={(e) => updateModule({ settings: { radialAttraction: parseFloat(e.target.value || 0) } })} /></UnityPreviewField></div></div>;
                case 'limitVelocityOverLifetime':
                    return <div className="grid grid-cols-2 gap-3"><UnityPreviewField label="Speed Limit"><UnityPreviewInput type="number" step="0.01" value={settings.speedLimit} onChange={(e) => updateModule({ settings: { speedLimit: parseFloat(e.target.value || 0) } })} /></UnityPreviewField><UnityPreviewField label="Dampen"><UnityPreviewInput type="number" step="0.01" value={settings.dampen} onChange={(e) => updateModule({ settings: { dampen: parseFloat(e.target.value || 0) } })} /></UnityPreviewField></div>;
                case 'noise':
                    return <div className="grid grid-cols-3 gap-3"><UnityPreviewField label="Strength"><UnityPreviewInput type="number" step="0.01" value={settings.noiseStrength} onChange={(e) => updateModule({ settings: { noiseStrength: parseFloat(e.target.value || 0) } })} /></UnityPreviewField><UnityPreviewField label="Scale"><UnityPreviewInput type="number" step="0.01" value={settings.noiseScale} onChange={(e) => updateModule({ settings: { noiseScale: parseFloat(e.target.value || 0) } })} /></UnityPreviewField><UnityPreviewField label="Scroll"><UnityPreviewInput type="number" step="0.01" value={settings.scrollSpeed} onChange={(e) => updateModule({ settings: { scrollSpeed: parseFloat(e.target.value || 0) } })} /></UnityPreviewField></div>;
                case 'colorBySpeed':
                    return <div className="space-y-3"><div className="grid grid-cols-2 gap-3"><UnityPreviewField label="Min Speed"><UnityPreviewInput type="number" step="0.01" value={settings.minSpeed} onChange={(e) => updateModule({ settings: { minSpeed: parseFloat(e.target.value || 0) } })} /></UnityPreviewField><UnityPreviewField label="Max Speed"><UnityPreviewInput type="number" step="0.01" value={settings.maxSpeed} onChange={(e) => updateModule({ settings: { maxSpeed: parseFloat(e.target.value || 0) } })} /></UnityPreviewField></div><div className="grid grid-cols-2 gap-3"><UnityPreviewField label="Low Speed"><UnityPreviewInput type="color" value={settings.lowSpeedColor} onChange={(e) => updateModule({ settings: { lowSpeedColor: e.target.value } })} className="h-11 p-1" /></UnityPreviewField><UnityPreviewField label="High Speed"><UnityPreviewInput type="color" value={settings.highSpeedColor} onChange={(e) => updateModule({ settings: { highSpeedColor: e.target.value } })} className="h-11 p-1" /></UnityPreviewField></div></div>;
                case 'sizeBySpeed':
                    return <div className="space-y-3"><div className="grid grid-cols-2 gap-3"><UnityPreviewField label="Min Speed"><UnityPreviewInput type="number" step="0.01" value={settings.minSpeed} onChange={(e) => updateModule({ settings: { minSpeed: parseFloat(e.target.value || 0) } })} /></UnityPreviewField><UnityPreviewField label="Max Speed"><UnityPreviewInput type="number" step="0.01" value={settings.maxSpeed} onChange={(e) => updateModule({ settings: { maxSpeed: parseFloat(e.target.value || 0) } })} /></UnityPreviewField></div><PreviewRangeEditor label="Scale" value={settings.scale} onChange={(value) => updateModule({ settings: { scale: value } })} /></div>;
                case 'rotationBySpeed':
                    return <div className="space-y-3"><div className="grid grid-cols-2 gap-3"><UnityPreviewField label="Min Speed"><UnityPreviewInput type="number" step="0.01" value={settings.minSpeed} onChange={(e) => updateModule({ settings: { minSpeed: parseFloat(e.target.value || 0) } })} /></UnityPreviewField><UnityPreviewField label="Max Speed"><UnityPreviewInput type="number" step="0.01" value={settings.maxSpeed} onChange={(e) => updateModule({ settings: { maxSpeed: parseFloat(e.target.value || 0) } })} /></UnityPreviewField></div><PreviewRangeEditor label="Speed Spin" value={settings.spin} onChange={(value) => updateModule({ settings: { spin: value } })} /></div>;
                case 'collision':
                    return <div className="grid grid-cols-2 gap-3"><UnityPreviewField label="Plane Y"><UnityPreviewInput type="number" step="0.01" value={settings.planeY} onChange={(e) => updateModule({ settings: { planeY: parseFloat(e.target.value || 0) } })} /></UnityPreviewField><UnityPreviewField label="Bounce"><UnityPreviewInput type="number" step="0.01" value={settings.bounce} onChange={(e) => updateModule({ settings: { bounce: parseFloat(e.target.value || 0) } })} /></UnityPreviewField><UnityPreviewField label="Dampen"><UnityPreviewInput type="number" step="0.01" value={settings.dampen} onChange={(e) => updateModule({ settings: { dampen: parseFloat(e.target.value || 0) } })} /></UnityPreviewField><UnityPreviewField label="Lifetime Loss"><UnityPreviewInput type="number" step="0.01" value={settings.lifetimeLoss} onChange={(e) => updateModule({ settings: { lifetimeLoss: parseFloat(e.target.value || 0) } })} /></UnityPreviewField></div>;
                case 'subEmitters':
                    return <div className="space-y-3"><UnityPreviewField label="Target Layer"><UnityPreviewSelect value={settings.targetLayerId || ''} onChange={(e) => updateModule({ settings: { targetLayerId: e.target.value || null } })}><option value="">Self</option>{previewVM.activePreset?.layers?.filter((candidate) => candidate.id !== layer.id).map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.name}</option>)}</UnityPreviewSelect></UnityPreviewField><div className="grid grid-cols-3 gap-3"><UnityPreviewField label="Birth"><UnityPreviewInput type="number" step="1" value={settings.birthCount} onChange={(e) => updateModule({ settings: { birthCount: parseInt(e.target.value || 0, 10) } })} /></UnityPreviewField><UnityPreviewField label="Death"><UnityPreviewInput type="number" step="1" value={settings.deathCount} onChange={(e) => updateModule({ settings: { deathCount: parseInt(e.target.value || 0, 10) } })} /></UnityPreviewField><UnityPreviewField label="Collision"><UnityPreviewInput type="number" step="1" value={settings.collisionCount} onChange={(e) => updateModule({ settings: { collisionCount: parseInt(e.target.value || 0, 10) } })} /></UnityPreviewField></div></div>;
                case 'textureSheetAnimation':
                    return <div className="space-y-3"><div className="grid grid-cols-2 gap-3"><UnityPreviewField label="Columns"><UnityPreviewInput type="number" step="1" value={settings.columns} onChange={(e) => updateModule({ settings: { columns: parseInt(e.target.value || 1, 10) } })} /></UnityPreviewField><UnityPreviewField label="Rows"><UnityPreviewInput type="number" step="1" value={settings.rows} onChange={(e) => updateModule({ settings: { rows: parseInt(e.target.value || 1, 10) } })} /></UnityPreviewField><UnityPreviewField label="Cycles"><UnityPreviewInput type="number" step="1" value={settings.cycles} onChange={(e) => updateModule({ settings: { cycles: parseInt(e.target.value || 1, 10) } })} /></UnityPreviewField><UnityPreviewField label="Start Frame"><UnityPreviewInput type="number" step="1" value={settings.startFrame} onChange={(e) => updateModule({ settings: { startFrame: parseInt(e.target.value || 0, 10) } })} /></UnityPreviewField></div><UnityPreviewField label="Random Row"><UnityPreviewToggle value={settings.randomRow === true} onChange={(value) => updateModule({ settings: { randomRow: value } })} /></UnityPreviewField><PreviewRangeEditor label="Frame Over Life" value={settings.frameOverLife} onChange={(value) => updateModule({ settings: { frameOverLife: value } })} /></div>;
                case 'inheritVelocity':
                    return <UnityPreviewField label="Factor"><UnityPreviewInput type="number" step="0.01" value={settings.factor} onChange={(e) => updateModule({ settings: { factor: parseFloat(e.target.value || 0) } })} /></UnityPreviewField>;
                case 'lifetimeByEmitterSpeed':
                    return <div className="space-y-3"><div className="grid grid-cols-2 gap-3"><UnityPreviewField label="Min Speed"><UnityPreviewInput type="number" step="0.01" value={settings.minSpeed} onChange={(e) => updateModule({ settings: { minSpeed: parseFloat(e.target.value || 0) } })} /></UnityPreviewField><UnityPreviewField label="Max Speed"><UnityPreviewInput type="number" step="0.01" value={settings.maxSpeed} onChange={(e) => updateModule({ settings: { maxSpeed: parseFloat(e.target.value || 0) } })} /></UnityPreviewField></div><PreviewRangeEditor label="Lifetime Scale" value={settings.lifetimeScale} onChange={(value) => updateModule({ settings: { lifetimeScale: value } })} /></div>;
                case 'trails':
                    return <div className="space-y-3"><UnityPreviewField label="Length"><UnityPreviewInput type="number" step="1" value={settings.length} onChange={(e) => updateModule({ settings: { length: parseInt(e.target.value || 2, 10) } })} /></UnityPreviewField><UnityPreviewCurveField label="Width Over Trail" curve={createPreviewCurveDefinition(settings.widthOverTrail || [0.7, 0.35, 0])} onChange={(curve) => updateModule({ settings: { widthOverTrail: curveDefinitionToPoints(curve) } })} /><UnityPreviewCurveField label="Alpha Over Trail" curve={createPreviewCurveDefinition(settings.alphaOverTrail || [0.55, 0.18, 0])} onChange={(curve) => updateModule({ settings: { alphaOverTrail: curveDefinitionToPoints(curve) } })} /></div>;
                case 'customData':
                    return <div className="space-y-3"><PreviewRangeEditor label="Data 1" value={settings.data1} onChange={(value) => updateModule({ settings: { data1: value } })} /><PreviewRangeEditor label="Data 2" value={settings.data2} onChange={(value) => updateModule({ settings: { data2: value } })} /></div>;
                default:
                    return <div className="text-xs text-gray-400">No editor yet.</div>;
            }
        }

        function PreviewUnityAccordionCard({ meta, module, expanded, onToggleExpanded, onToggleEnabled, onModeChange, children }) {
            return (
                <div className="overflow-hidden border border-gray-800 bg-[#1a1a1a]">
                    <div className="flex items-start justify-between gap-3 border-b border-gray-800 bg-[#151515] px-3 py-2">
                        <button onClick={onToggleExpanded} className="min-w-0 flex-1 text-left">
                            <div className="flex items-center gap-3">
                                <div className="text-sm font-semibold text-white">{meta.label}</div>
                                <div className="truncate text-[10px] uppercase tracking-[0.16em] text-gray-500">{meta.subtitle}</div>
                            </div>
                            <div className="mt-2 truncate text-[11px] text-gray-400">{summarizeUnityPreviewModule(meta.key, module)}</div>
                        </button>
                        <div className="flex items-center gap-2">
                            {(UNITY_PREVIEW_MODULE_MODES[meta.key] || []).length > 0 && (
                                <UnityPreviewSelect value={module.settings?.shape || module.mode || ''} onChange={(e) => onModeChange?.(e.target.value)} className="max-w-[132px] text-xs">
                                    {(UNITY_PREVIEW_MODULE_MODES[meta.key] || []).map((item) => <option key={item} value={item}>{item}</option>)}
                                </UnityPreviewSelect>
                            )}
                            {meta.key === 'main'
                                ? <div className="border border-blue-500 bg-blue-600 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white">Core</div>
                                : <UnityPreviewToggle value={module.enabled !== false} onChange={() => onToggleEnabled?.()} />}
                            <div className="border border-gray-700 bg-[#252525] px-2.5 py-1 text-[10px] font-bold text-gray-300">{expanded ? '▲' : '▼'}</div>
                        </div>
                    </div>
                    {expanded && <div className="space-y-2 p-3">{children}</div>}
                </div>
            );
        }

        function PreviewUnityInspector({ previewVM }) {
            const layer = previewVM.selectedLayer;
            if (!layer) return null;
            return (
                <div className="flex h-full min-h-0 flex-col bg-[#111]">
                    <div className="border-b border-gray-800 px-3 py-3">
                        <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">Inspector</div>
                        <div className="mt-2 text-lg font-semibold text-white">{layer.name}</div>
                        <div className="text-xs text-gray-500">Unity-style module stack</div>
                    </div>
                    <div className="flex-1 space-y-2 overflow-y-auto p-3">
                        {UNITY_PREVIEW_MODULE_META.map((meta) => {
                            const module = layer.modules?.[meta.key] || createDefaultPreviewModules()[meta.key];
                            const expanded = previewVM.expandedModuleKey ? previewVM.expandedModuleKey === meta.key : meta.key === 'main';
                            return (
                                <PreviewUnityAccordionCard
                                    key={meta.key}
                                    meta={meta}
                                    module={module}
                                    expanded={expanded}
                                    onToggleExpanded={() => previewVM.setExpandedModule(layer.id, expanded ? null : meta.key)}
                                    onToggleEnabled={() => previewVM.updateLayerSection(layer.id, 'root', {
                                        modules: {
                                            ...(layer.modules || createDefaultPreviewModules()),
                                            [meta.key]: {
                                                ...module,
                                                enabled: module.enabled === false
                                            }
                                        }
                                    })}
                                    onModeChange={(nextMode) => previewVM.updateLayerSection(layer.id, 'root', {
                                        modules: {
                                            ...(layer.modules || createDefaultPreviewModules()),
                                            [meta.key]: {
                                                ...module,
                                                mode: nextMode,
                                                settings: { ...(module.settings || {}), shape: nextMode }
                                            }
                                        }
                                    })}
                                >
                                    <PreviewUnityModuleEditor previewVM={previewVM} layer={layer} moduleKey={meta.key} />
                                </PreviewUnityAccordionCard>
                            );
                        })}
                        <div className="overflow-hidden border border-gray-800 bg-[#1a1a1a]">
                            <button onClick={() => previewVM.toggleAdvancedPanel(layer.id)} className="flex w-full items-center justify-between px-4 py-3 text-left">
                                <div>
                                    <div className="text-sm font-semibold text-white">Advanced</div>
                                    <div className="text-[11px] text-gray-500">Preset JSON and raw editing</div>
                                </div>
                                <div className="border border-gray-700 bg-[#252525] px-2.5 py-1 text-[10px] font-bold text-gray-300">{previewVM.advancedOpen ? '▲' : '▼'}</div>
                            </button>
                            {previewVM.advancedOpen && <div className="border-t border-gray-800 p-3"><PreviewJsonEditor previewVM={previewVM} /></div>}
                        </div>
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

        function SettingsTab({ uiVM, dVM, toolkitVM }) {
            const [selectedCategoryId, setSelectedCategoryId] = useState('session');
            const [selectedToolId, setSelectedToolId] = useState('start');
            const selectedCategory = (toolkitVM?.catalog || []).find((item) => item.id === selectedCategoryId) || null;
            const selectedTool = selectedCategory?.tools?.find((item) => item.id === selectedToolId) || selectedCategory?.tools?.[0] || null;
            useEffect(() => {
                if (!selectedCategory && (toolkitVM?.catalog || []).length > 0) {
                    setSelectedCategoryId(toolkitVM.catalog[0].id);
                    setSelectedToolId(toolkitVM.catalog[0].tools?.[0]?.id || '');
                }
            }, [toolkitVM?.catalog, selectedCategory]);
            useEffect(() => {
                if (!selectedCategory) return;
                const match = selectedCategory.tools?.some((item) => item.id === selectedToolId);
                if (!match) setSelectedToolId(selectedCategory.tools?.[0]?.id || '');
            }, [selectedCategory, selectedToolId]);
            return (
                <div className="flex flex-col h-full bg-[#111] p-6">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-white">SETTINGS</h2>
                        <p className="text-xs text-gray-400 mt-1">Global runtime and preview behavior.</p>
                    </div>
                    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,640px),minmax(0,1fr)] gap-6">
                    <div className="bg-[#1a1a1a] border border-gray-800 rounded p-4 space-y-4">
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
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-bold text-white">Use Workbench As Dream Seed</div>
                                <div className="text-xs text-gray-400 mt-1">When enabled, Dream starts from the active workbench stack before adding extra randomized operations.</div>
                            </div>
                            <label className="flex items-center cursor-pointer select-none">
                                <div className="relative">
                                    <input type="checkbox" checked={!!uiVM.useWorkbenchSeed} onChange={(e) => uiVM.setUseWorkbenchSeed(e.target.checked)} className="sr-only" />
                                    <div className={`w-10 h-5 rounded-full transition-colors ${uiVM.useWorkbenchSeed ? 'bg-blue-600' : 'bg-gray-700'}`}></div>
                                    <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${uiVM.useWorkbenchSeed ? 'translate-x-5' : ''}`}></div>
                                </div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-bold text-white">Mask View Mode</div>
                                <div className="text-xs text-gray-400 mt-1">Controls whether previews are shown as transparent alpha or flattened B/W masks.</div>
                            </div>
                            <div className="flex gap-2">
                                {(uiVM?.maskViewModes || MASK_VIEW_MODES).map((mode) => (
                                    <button key={mode.id} onClick={() => uiVM?.setMaskViewMode(mode.id)} className={`text-[10px] px-3 py-1.5 rounded font-bold border ${uiVM?.maskViewMode === mode.id ? 'bg-blue-600 border-blue-500 text-white' : 'bg-[#2a2a2a] border-gray-700 text-gray-300'}`}>{mode.name.toUpperCase()}</button>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 text-xs">
                            <div className="flex justify-between text-gray-400">
                                <span>Set Grid Columns</span>
                                <span>{uiVM?.gridColumns ?? DEFAULT_SET_GRID_COLUMNS}</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="12"
                                step="1"
                                value={uiVM?.gridColumns ?? DEFAULT_SET_GRID_COLUMNS}
                                onChange={(e) => uiVM?.setGridColumns(parseInt(e.target.value, 10))}
                                className="w-full slider-thumb"
                            />
                            <div className="text-[10px] text-gray-500">Controls how many cards appear across in the Sets tab.</div>
                        </div>
	                        <div className="flex flex-col gap-1 text-xs">
	                            <div className="flex justify-between text-gray-400">
	                                <span>Playback Frame Count</span>
                                <span>{dVM?.params?.flipFrames ?? 16}</span>
                            </div>
                            <input type="range" min="4" max="16" step="4" value={dVM?.params?.flipFrames ?? 16} onChange={(e) => dVM?.setParams(p => ({ ...p, flipFrames: parseInt(e.target.value) }))} className="w-full slider-thumb" />
                        </div>
                        <div className="flex flex-col gap-1 text-xs">
                            <div className="flex justify-between text-gray-400">
                                <span>Gen Workers</span>
                                <span>{dVM?.params?.generationWorkers ?? 5}</span>
                            </div>
                            <input type="range" min="1" max="5" step="1" value={dVM?.params?.generationWorkers ?? 5} onChange={(e) => dVM?.setParams(p => ({ ...p, generationWorkers: parseInt(e.target.value) }))} className="w-full slider-thumb" />
                        </div>
                        <div className="flex flex-col gap-1 text-xs">
                            <div className="flex justify-between text-gray-400">
                                <span>Pack Workers</span>
                                <span>{dVM?.params?.packagingWorkers ?? 5}</span>
                            </div>
                            <input type="range" min="1" max="5" step="1" value={dVM?.params?.packagingWorkers ?? 5} onChange={(e) => dVM?.setParams(p => ({ ...p, packagingWorkers: parseInt(e.target.value) }))} className="w-full slider-thumb" />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-bold text-white">Factory Fill Mode</div>
                                <div className="text-xs text-gray-400 mt-1">Slide appends new cards; Slot Fill moves the current bottom-most card into the deleted slot immediately.</div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => dVM?.setParams(p => ({ ...p, resultFillMode: 'slide' }))} className={`text-[10px] px-3 py-1.5 rounded font-bold border ${dVM?.params?.resultFillMode === 'slide' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-[#2a2a2a] border-gray-700 text-gray-300'}`}>SLIDE</button>
                                <button onClick={() => dVM?.setParams(p => ({ ...p, resultFillMode: 'slot' }))} className={`text-[10px] px-3 py-1.5 rounded font-bold border ${dVM?.params?.resultFillMode === 'slot' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-[#2a2a2a] border-gray-700 text-gray-300'}`}>SLOT FILL</button>
                            </div>
                        </div>
                    </div>
                    <div className="bg-[#1a1a1a] border border-gray-800 rounded p-4 space-y-4">
                        <div>
                            <h3 className="text-sm font-bold text-white">Toolkit</h3>
                            <p className="text-xs text-gray-400 mt-1">Optional local HTTP tool surface for categorized toolkit runs and operator instructions.</p>
                        </div>
                        <div className="flex flex-col gap-1 text-xs">
                            <div className="flex justify-between text-gray-400">
                                <span>Toolkit URL</span>
                                <span>{toolkitVM?.health?.status || 'idle'}</span>
                            </div>
                            <input value={toolkitVM?.baseUrl || TOOLKIT_DEFAULT_URL} onChange={(e) => toolkitVM?.setBaseUrl(e.target.value)} className="bg-[#0f0f0f] border border-gray-700 rounded px-3 py-2 text-xs text-white font-mono" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => toolkitVM?.checkHealth()} className="text-[10px] px-3 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold">CHECK HEALTH</button>
                            <button onClick={() => toolkitVM?.loadCatalog()} className="text-[10px] px-3 py-2 rounded bg-[#2f2f2f] hover:bg-[#3b3b3b] text-gray-100 font-bold">LOAD CATALOG</button>
                            <button onClick={() => toolkitVM?.runTool(selectedCategoryId, selectedToolId, {})} className="text-[10px] px-3 py-2 rounded bg-violet-600 hover:bg-violet-500 text-white font-bold">RUN SELECTED TOOL</button>
                            <button onClick={() => toolkitVM?.runTool('preview', 'open', {})} className="text-[10px] px-3 py-2 rounded bg-[#2f2f2f] hover:bg-[#3b3b3b] text-gray-100 font-bold">RUN PREVIEW.OPEN</button>
                            <button onClick={() => toolkitVM?.loadLatestRun()} className="text-[10px] px-3 py-2 rounded bg-green-700 hover:bg-green-600 text-white font-bold">LOAD LATEST RUN</button>
                            <button onClick={() => toolkitVM?.loadLogs()} className="text-[10px] px-3 py-2 rounded bg-green-600 hover:bg-green-500 text-white font-bold">LOAD LOGS</button>
                        </div>
                        <div className="grid grid-cols-1 gap-3 text-xs">
                            <div className="bg-[#121212] border border-gray-800 rounded p-3">
                                <div className="text-[10px] uppercase tracking-wide text-gray-500 mb-2">Health</div>
                                <div className="text-gray-300 font-mono break-all">status: {toolkitVM?.health?.status || 'idle'}</div>
                                <div className="text-gray-400 font-mono">server_ready: {toolkitVM?.health?.server_ready ? 'true' : 'false'}</div>
                                <div className="text-gray-400 font-mono">toolkit_ready: {toolkitVM?.health?.toolkit_ready ? 'true' : 'false'}</div>
                            </div>
                            <div className="bg-[#121212] border border-gray-800 rounded p-3">
                                <div className="text-[10px] uppercase tracking-wide text-gray-500 mb-2">Categories</div>
                                <div className="text-gray-300 font-mono break-all">{(toolkitVM?.catalog || []).map((item) => item.id).join(', ') || '--'}</div>
                            </div>
                            <div className="bg-[#121212] border border-gray-800 rounded p-3 space-y-2">
                                <div className="text-[10px] uppercase tracking-wide text-gray-500">Selected Tool</div>
                                <div className="grid grid-cols-2 gap-2">
                                    <select value={selectedCategoryId} onChange={(e) => setSelectedCategoryId(e.target.value)} className="bg-[#0f0f0f] border border-gray-700 rounded px-2 py-2 text-xs text-white">
                                        {(toolkitVM?.catalog || []).map((category) => <option key={category.id} value={category.id}>{category.id}</option>)}
                                    </select>
                                    <select value={selectedToolId} onChange={(e) => setSelectedToolId(e.target.value)} className="bg-[#0f0f0f] border border-gray-700 rounded px-2 py-2 text-xs text-white">
                                        {(selectedCategory?.tools || []).map((tool) => <option key={tool.id} value={tool.id}>{tool.id}</option>)}
                                    </select>
                                </div>
                                <div className="text-gray-300 font-mono break-all">{selectedTool?.description || '--'}</div>
                                <div className="text-gray-400 font-mono">execution_mode: {selectedTool?.execution_mode || '--'}</div>
                            </div>
                            <div className="bg-[#121212] border border-gray-800 rounded p-3">
                                <div className="text-[10px] uppercase tracking-wide text-gray-500 mb-2">Last Run</div>
                                <div className="text-gray-300 font-mono break-all">{toolkitVM?.lastRun?.category ? `${toolkitVM.lastRun.category}.${toolkitVM.lastRun.tool}` : '--'}</div>
                                <div className="text-gray-400 font-mono break-all">{toolkitVM?.lastRun?.instructions || '--'}</div>
                            </div>
                            <div className="bg-[#121212] border border-gray-800 rounded p-3">
                                <div className="text-[10px] uppercase tracking-wide text-gray-500 mb-2">Last Error</div>
                                <div className="text-red-300 font-mono whitespace-pre-wrap break-all">{toolkitVM?.lastError || toolkitVM?.health?.last_error || '--'}</div>
                            </div>
                            <div className="bg-[#121212] border border-gray-800 rounded p-3">
                                <div className="text-[10px] uppercase tracking-wide text-gray-500 mb-2">Tool Detail</div>
                                <div className="max-h-48 overflow-y-auto space-y-1">
                                    {(toolkitVM?.catalog || []).map((category) => (
                                        <div key={category.id} className="text-[10px] text-gray-300 font-mono break-all">
                                            {category.id}: {category.tools.map((tool) => tool.id).join(', ')}
                                        </div>
                                    ))}
                                    {(toolkitVM?.catalog || []).length === 0 && <div className="text-[10px] text-gray-500 font-mono">No catalog loaded.</div>}
                                </div>
                            </div>
                        </div>
                    </div>
                    </div>
                </div>
            );
        }

        function IntegrationsTab() {
            const [copyStatus, setCopyStatus] = useState('');
            const handleCopyGuide = async () => {
                try {
                    const text = INTEGRATIONS_GUIDE_TEXT;
                    await navigator.clipboard.writeText(text);
                    const confirmed = await navigator.clipboard.readText().catch(() => '');
                    if (confirmed === text) setCopyStatus('Copied to clipboard and verified');
                    else setCopyStatus('Copy attempted; clipboard readback unavailable');
                    window.setTimeout(() => setCopyStatus(''), 1800);
                } catch (error) {
                    try {
                        const fallback = document.createElement('textarea');
                        fallback.value = INTEGRATIONS_GUIDE_TEXT;
                        fallback.style.position = 'fixed';
                        fallback.style.opacity = '0';
                        document.body.appendChild(fallback);
                        fallback.focus();
                        fallback.select();
                        const copied = document.execCommand('copy');
                        document.body.removeChild(fallback);
                        setCopyStatus(copied ? 'Copied with fallback command' : `Copy failed: ${error?.message || 'clipboard unavailable'}`);
                    } catch (fallbackError) {
                        setCopyStatus(`Copy failed: ${fallbackError?.message || error?.message || 'clipboard unavailable'}`);
                    }
                }
            };
            return (
                <div className="flex flex-col h-full bg-[#111] p-6 overflow-hidden">
                    <div className="mb-6 flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-white">INTEGRATIONS</h2>
                            <p className="text-xs text-gray-400 mt-1">Guide for the available toolkit tools and how to use them.</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <button onClick={handleCopyGuide} className="text-[10px] px-3 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold">COPY GUIDE</button>
                            {copyStatus && <div className="text-[10px] text-gray-400 font-mono">{copyStatus}</div>}
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto rounded border border-gray-800 bg-[#1a1a1a] p-4">
                        <pre className="whitespace-pre-wrap text-xs leading-5 text-gray-200 font-mono">{INTEGRATIONS_GUIDE_TEXT}</pre>
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
            useEffect(() => { setLN(set.name); }, [set.name]);
            const hC = () => {
                const nextName = (lN || '').trim();
                setIsE(false);
                if (!nextName || nextName === set.name) return;
                libVM.renameSet(set, nextName);
            };
            if (isE) {
                return (
                    <div className="flex items-center gap-2 min-w-0">
                        <input ref={iR} className="bg-[#333] border border-blue-500 rounded px-2 py-0.5 text-white font-bold text-sm outline-none min-w-[12rem]" value={lN} onChange={(e) => setLN(e.target.value)} onBlur={hC} onKeyDown={(e) => e.key === 'Enter' && hC()} />
                        <span className="text-gray-500 text-xs font-normal shrink-0">({set.items.length})</span>
                    </div>
                );
            }
            return (
                <div className="flex items-center gap-2 min-w-0">
                    <h3 className="text-white font-bold text-sm truncate">{set.name}</h3>
                    <button
                        type="button"
                        aria-label={`Rename ${set.name}`}
                        onClick={() => { setLN(set.name); setIsE(true); }}
                        className="text-gray-400 hover:text-blue-300 transition-colors text-xs leading-none shrink-0"
                    >
                        ✎
                    </button>
                    <span className="text-gray-500 text-xs font-normal shrink-0">({set.items.length})</span>
                </div>
            );
        }

        // ==========================================
        // 5. VIEW MODEL
        // ==========================================
