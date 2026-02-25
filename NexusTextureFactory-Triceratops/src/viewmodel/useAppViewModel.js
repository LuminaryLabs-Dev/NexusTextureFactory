	        function useAppViewModel() {
            const [activeTab, setActiveTab] = useState('generator'); const [showGizmos, setShowGizmos] = useState(true); const [enableAI, setEnableAI] = useState(true); const [autoAnimateFrames, setAutoAnimateFrames] = useState(false);
            const [erosion, setErosion] = useState(0); const [profileName, setProfileName] = useState("Texture_01");
            const [storageUsedBytes, setStorageUsedBytes] = useState(0); const [storageQuotaBytes, setStorageQuotaBytes] = useState(0);
            const [selectedRes, setSelectedRes] = useState([2048]);
            const [steps, setSteps] = useState([{ id: 's1', typeDef: STEP_TYPES.BASE_SHAPE, active: true, blendMode: 0, params: STEP_TYPES.BASE_SHAPE.params, universal: { power: 1, mult: 1, scale: 1, offsetX: 0, offsetY: 0 }, previewUrl: null }]);
            const [previewUrls, setPreviewUrls] = useState([]); const [finalPreviewUrl, setFinalPreviewUrl] = useState(null);
	            const [customOperations, setCustomOperations] = useState([]);
	            const [filterModules, setFilterModules] = useState(createDefaultFilterModules());
            const [qualityFilters, setQualityFilters] = useState({
                alpha: { enabled: true, min: 0.15, max: 0.75, expanded: true },
                similarity: { enabled: false, maxSimilarity: 0.9, historySize: 200, expanded: false },
                shape: { enabled: false, minCircularity: 0.2, maxCircularity: 1.0, minSquareness: 0.2, maxSquareness: 1.0, expanded: false },
                temporalChange: { enabled: true, minChange: 0.12, maxChange: 0.95, maxJitter: 0.2, expanded: false },
                simplicity: { enabled: true, min: 0.1, max: 0.9, expanded: false }
            });
            const [packConfig, setPackConfig] = useState({
                groupBy: 'volume_fill',
                groupDepth: 2,
                maxItemsPerPack: 50,
                sortBy: 'none',
                sortDir: 'asc'
            });
            const [flipbookConfig, setFlipbookConfig] = useState(createDefaultFlipbookConfig());
	            const [dreamParams, setDreamParams] = useState({ batchSize: 20, batchCycles: 1, generationWorkers: 5, packagingWorkers: 5, refineCycles: 1, minDensity: 0.15, maxDensity: 0.75, minSimplicity: 0.1, maxSimplicity: 0.9, varianceStrictness: 0.1, randStrength: 0.5, flipFrames: 16, prompt: "", minComplexity: 5, maxComplexity: 10, autoDream: false });

            const autoDreamRef = useRef(false);
            useEffect(() => { autoDreamRef.current = dreamParams.autoDream; }, [dreamParams.autoDream]);

		            const [isDreaming, setIsDreaming] = useState(false); const [dreamState, setDreamState] = useState({ results: [], rejectedIds: [], phase: '', rejectLabel: '', pendingAccepted: 0, pendingAttempts: 0, pendingRejected: 0 });
	            const [savedLibrary, setSavedLibrary] = useState([]); const [exportingSetId, setExportingSetId] = useState(null); const [exportPhase, setExportPhase] = useState(''); const [exportError, setExportError] = useState('');
	            const [deleteHistory, setDeleteHistory] = useState([]);
	            const eR = useRef(null); const bER = useRef(null);
	            const generationEnginesRef = useRef([]);
	            const hasHydratedMetaRef = useRef(false);
	            const savedLibraryRef = useRef(savedLibrary);
	            const dreamResultsRef = useRef(dreamState.results);
	            const deleteHistoryRef = useRef(deleteHistory);
	            const persistTimerRef = useRef(null);

	            useEffect(() => { eR.current = new TextureEngine(256, 256); bER.current = new TextureEngine(64, 64); }, []);
	            useEffect(() => { if (!eR.current) return; eR.current.renderStack(steps); setPreviewUrls(steps.map((_, i) => eR.current.getTextureUrl(i))); setFinalPreviewUrl(eR.current.getTextureUrl(steps.length - 1)); }, [steps]);
	            useEffect(() => { savedLibraryRef.current = savedLibrary; }, [savedLibrary]);
	            useEffect(() => { dreamResultsRef.current = dreamState.results; }, [dreamState.results]);
	            useEffect(() => { deleteHistoryRef.current = deleteHistory; }, [deleteHistory]);
                const mergeFlipbookConfig = useCallback((incoming) => {
                    const base = createDefaultFlipbookConfig();
                    if (!incoming || typeof incoming !== 'object') return base;
                    const merged = {
                        ...base,
                        ...incoming,
                        global: { ...base.global, ...(incoming.global || {}) },
                        quality: { ...base.quality, ...(incoming.quality || {}) },
                        operations: {}
                    };
                    Object.keys(base.operations).forEach((key) => {
                        const bOp = base.operations[key];
                        const inOp = incoming.operations?.[key] || {};
                        const op = {
                            ...bOp,
                            ...inOp,
                            universal: {
                                mult: { ...bOp.universal.mult, ...(inOp.universal?.mult || {}) },
                                scale: { ...bOp.universal.scale, ...(inOp.universal?.scale || {}) }
                            },
                            params: {}
                        };
                        Object.keys(bOp.params).forEach((paramKey) => {
                            op.params[paramKey] = { ...bOp.params[paramKey], ...(inOp.params?.[paramKey] || {}) };
                        });
                        merged.operations[key] = op;
                    });
                    return merged;
                }, []);
	            useEffect(() => {
	                try {
	                    const rawLibrary = localStorage.getItem(META_KEY_LIBRARY);
	                    if (rawLibrary) {
	                        const parsed = JSON.parse(rawLibrary);
	                        if (Array.isArray(parsed)) setSavedLibrary(parsed);
	                    }
	                    const rawCustomOps = localStorage.getItem(META_KEY_CUSTOM_OPS);
	                    if (rawCustomOps) {
	                        const parsed = JSON.parse(rawCustomOps);
	                        if (Array.isArray(parsed)) setCustomOperations(parsed);
	                    }
	                    const rawFilterModules = localStorage.getItem(META_KEY_FILTER_MODULES);
	                    if (rawFilterModules) {
	                        const parsed = JSON.parse(rawFilterModules);
	                        if (Array.isArray(parsed)) setFilterModules(parsed);
	                    }
                    const rawQuality = localStorage.getItem(META_KEY_QUALITY_FILTERS);
                    if (rawQuality) {
                        const parsed = JSON.parse(rawQuality);
                        if (parsed && typeof parsed === 'object') {
                            setQualityFilters(prev => ({
                                ...prev,
                                ...parsed,
                                alpha: { ...prev.alpha, ...(parsed.alpha || {}) },
                                similarity: { ...prev.similarity, ...(parsed.similarity || {}) },
                                shape: { ...prev.shape, ...(parsed.shape || {}) },
                                temporalChange: { ...prev.temporalChange, ...(parsed.temporalChange || {}) },
                                simplicity: { ...prev.simplicity, ...(parsed.simplicity || {}) }
                            }));
                        }
                    }
                    const rawDreamParams = localStorage.getItem(META_KEY_DREAM_PARAMS);
                    if (rawDreamParams) {
                        const parsed = JSON.parse(rawDreamParams);
                        if (parsed && typeof parsed === 'object') {
                            const nextMinComplexity = Math.max(1, Math.min(20, parseInt(parsed.minComplexity ?? 5)));
                            const nextMaxComplexity = Math.max(nextMinComplexity, Math.min(20, parseInt(parsed.maxComplexity ?? 10)));
                            setDreamParams(prev => ({
                                ...prev,
                                ...parsed,
                                minComplexity: nextMinComplexity,
                                maxComplexity: nextMaxComplexity
                            }));
                        }
                    }
                    const rawUiPrefs = localStorage.getItem(META_KEY_UI_PREFS);
                    if (rawUiPrefs) {
                        const parsed = JSON.parse(rawUiPrefs);
                        if (parsed && typeof parsed === 'object') {
                            if (typeof parsed.autoAnimateFrames === 'boolean') setAutoAnimateFrames(parsed.autoAnimateFrames);
                        }
                    }
                    const rawPackConfig = localStorage.getItem(META_KEY_PACK_CONFIG);
                    if (rawPackConfig) {
                        const parsed = JSON.parse(rawPackConfig);
                        if (parsed && typeof parsed === 'object') setPackConfig(prev => ({ ...prev, ...parsed }));
                    }
                    const rawFlipbookConfig = localStorage.getItem(META_KEY_FLIPBOOK_CONFIG);
                    if (rawFlipbookConfig) {
                        const parsed = JSON.parse(rawFlipbookConfig);
                        setFlipbookConfig(mergeFlipbookConfig(parsed));
                    }
                } catch (_) { }
                hasHydratedMetaRef.current = true;
            }, [mergeFlipbookConfig]);
	            useEffect(() => {
	                if (!hasHydratedMetaRef.current) return;
	                if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
	                persistTimerRef.current = setTimeout(() => {
	                    persistTimerRef.current = null;
	                    try {
	                        localStorage.setItem(META_KEY_LIBRARY, JSON.stringify(savedLibrary));
	                        localStorage.setItem(META_KEY_CUSTOM_OPS, JSON.stringify(customOperations));
                        localStorage.setItem(META_KEY_FILTER_MODULES, JSON.stringify(filterModules));
                        localStorage.setItem(META_KEY_QUALITY_FILTERS, JSON.stringify(qualityFilters));
                        localStorage.setItem(META_KEY_DREAM_PARAMS, JSON.stringify(dreamParams));
                        localStorage.setItem(META_KEY_UI_PREFS, JSON.stringify({ autoAnimateFrames }));
                        localStorage.setItem(META_KEY_PACK_CONFIG, JSON.stringify(packConfig));
                        localStorage.setItem(META_KEY_FLIPBOOK_CONFIG, JSON.stringify(flipbookConfig));
                    } catch (_) { }
                }, 220);
	                return () => {
	                    if (persistTimerRef.current) {
	                        clearTimeout(persistTimerRef.current);
	                        persistTimerRef.current = null;
	                    }
	                };
            }, [savedLibrary, customOperations, filterModules, qualityFilters, dreamParams, autoAnimateFrames, packConfig, flipbookConfig]);

            const sets = useMemo(() => {
                const normalizeName = (item) => String(item?.name || 'Misc');
                const getGroupKey = (item) => {
                    if (packConfig.groupBy === 'volume_fill') return '__all__';
                    const name = normalizeName(item);
                    const parts = name.split('_').filter(Boolean);
                    if (packConfig.groupBy === 'full') return name || 'Misc';
                    if (packConfig.groupBy === 'shape_variant') return parts.slice(0, 2).join('_') || parts[0] || 'Misc';
                    const depth = Math.max(1, Math.min(parseInt(packConfig.groupDepth || 2), Math.max(1, parts.length - 1)));
                    return parts.slice(0, depth).join('_') || 'Misc';
                };
                const cmp = (a, b) => {
                    if (packConfig.sortBy === 'none') return 0;
                    let av = a.name;
                    let bv = b.name;
                    if (packConfig.sortBy === 'density') { av = a.density || 0; bv = b.density || 0; }
                    else if (packConfig.sortBy === 'simplicity') { av = a.sScore || 0; bv = b.sScore || 0; }
                    else if (packConfig.sortBy === 'circularity') { av = a.circularity || 0; bv = b.circularity || 0; }
                    else if (packConfig.sortBy === 'squareness') { av = a.squareness || 0; bv = b.squareness || 0; }
                    let res = 0;
                    if (typeof av === 'number' && typeof bv === 'number') res = av - bv;
                    else res = String(av).localeCompare(String(bv));
                    return packConfig.sortDir === 'desc' ? -res : res;
                };
                const ts = {};
                savedLibrary.forEach(it => {
                    const key = getGroupKey(it);
                    if (!ts[key]) ts[key] = [];
                    ts[key].push(it);
                });
                const final = [];
                const keys = Object.keys(ts).sort((a, b) => a.localeCompare(b));
                const maxItemsPerPack = Math.max(1, parseInt(packConfig.maxItemsPerPack || 50));
                keys.forEach(k => {
                    const its = [...ts[k]].sort(cmp);
                    if (its.length <= maxItemsPerPack) {
                        const singleName = packConfig.groupBy === 'volume_fill' ? 'Volume 1' : k;
                        final.push({ id: k, baseKey: k, name: singleName, items: its });
                    }
                    else {
                        for (let i = 0; i < its.length; i += maxItemsPerPack) {
                            const vol = Math.floor(i / maxItemsPerPack) + 1;
                            const name = packConfig.groupBy === 'volume_fill'
                                ? `Volume ${vol}`
                                : (vol === 1 ? k : `${k} Vol ${vol}`);
                            final.push({ id: `${k}${i}`, baseKey: k, name, items: its.slice(i, i + maxItemsPerPack) });
                        }
                    }
                });
                return final;
            }, [savedLibrary, packConfig]);

            const reorganizePacks = () => {
                setSavedLibrary(prev => {
                    const normalizeName = (item) => String(item?.name || 'Misc');
                    const getGroupKey = (item) => {
                        if (packConfig.groupBy === 'volume_fill') return '__all__';
                        const name = normalizeName(item);
                        const parts = name.split('_').filter(Boolean);
                        if (packConfig.groupBy === 'full') return name || 'Misc';
                        if (packConfig.groupBy === 'shape_variant') return parts.slice(0, 2).join('_') || parts[0] || 'Misc';
                        const depth = Math.max(1, Math.min(parseInt(packConfig.groupDepth || 2), Math.max(1, parts.length - 1)));
                        return parts.slice(0, depth).join('_') || 'Misc';
                    };
                    const cmp = (a, b) => {
                        if (packConfig.sortBy === 'none') return 0;
                        let av = a.name;
                        let bv = b.name;
                        if (packConfig.sortBy === 'density') { av = a.density || 0; bv = b.density || 0; }
                        else if (packConfig.sortBy === 'simplicity') { av = a.sScore || 0; bv = b.sScore || 0; }
                        else if (packConfig.sortBy === 'circularity') { av = a.circularity || 0; bv = b.circularity || 0; }
                        else if (packConfig.sortBy === 'squareness') { av = a.squareness || 0; bv = b.squareness || 0; }
                        let res = 0;
                        if (typeof av === 'number' && typeof bv === 'number') res = av - bv;
                        else res = String(av).localeCompare(String(bv));
                        return packConfig.sortDir === 'desc' ? -res : res;
                    };
                    return [...prev].sort((a, b) => {
                        const ga = getGroupKey(a);
                        const gb = getGroupKey(b);
                        const gcmp = ga.localeCompare(gb);
                        if (gcmp !== 0) return gcmp;
                        return cmp(a, b);
                    });
                });
            };

            const handleRenameSet = (targetSet, newName) => {
                if (packConfig.groupBy === 'volume_fill') return;
                const newNameBase = (newName || '').trim().replace(/\s+/g, '_') || 'Set';
                setSavedLibrary(prev => {
                    const setItemIds = new Set(Array.isArray(targetSet?.items) ? targetSet.items.map(i => i.id) : []);
                    let groupItems = prev.filter(i => setItemIds.has(i.id));
                    if (groupItems.length === 0) {
                        const oldKey = typeof targetSet === 'string' ? targetSet : (targetSet?.baseKey || targetSet?.name || '');
                        const normalizedOldKey = (oldKey || '').replace(/\s+Vol\s+\d+$/i, '').replace(/\s+/g, '_');
                        groupItems = prev.filter(i => i.name.split('_').slice(0, -1).join('_') === normalizedOldKey);
                    }
                    const groupOrder = groupItems.map(i => i.id);
                    return prev.map((item) => {
                        const groupIdx = groupOrder.indexOf(item.id);
                        if (groupIdx < 0) return item;
                        const indexStr = (groupIdx + 1).toString().padStart(2, '0');
                        return { ...item, name: `${newNameBase}_${indexStr}` };
                    });
                });
            };

            const buildEnabledFilterSteps = () => filterModules
                .filter(m => m.enabled)
                .map(m => ({
                    id: `gf-${m.id}`,
                    typeDef: STEP_TYPES[m.key],
                    active: true,
                    blendMode: m.blendMode,
                    params: { ...m.params },
                    universal: { ...m.universal }
                }));

            const passesQualityFilters = (analysis, recentHashes) => {
                const alphaFilter = qualityFilters.alpha;
                if (alphaFilter.enabled && (analysis.density < alphaFilter.min || analysis.density > alphaFilter.max)) return false;

                const simplicityFilter = qualityFilters.simplicity;
                if (simplicityFilter.enabled && (analysis.sScore < simplicityFilter.min || analysis.sScore > simplicityFilter.max)) return false;

                const temporalFilter = qualityFilters.temporalChange;
                if (temporalFilter.enabled) {
                    const changeScore = Number(analysis.changeScore || 0);
                    const jitterScore = Number(analysis.jitterScore || 0);
                    if (changeScore < temporalFilter.minChange || changeScore > temporalFilter.maxChange) return false;
                    if (jitterScore > temporalFilter.maxJitter) return false;
                }

                const shapeFilter = qualityFilters.shape;
                if (shapeFilter.enabled) {
                    if (analysis.circularity < shapeFilter.minCircularity) return false;
                    if (analysis.circularity > shapeFilter.maxCircularity) return false;
                    if (analysis.squareness < shapeFilter.minSquareness) return false;
                    if (analysis.squareness > shapeFilter.maxSquareness) return false;
                }

                const similarityFilter = qualityFilters.similarity;
                if (similarityFilter.enabled && recentHashes.length > 0 && analysis.hash) {
                    const compareList = recentHashes.slice(-Math.max(1, similarityFilter.historySize));
                    let bestSimilarity = 0;
                    for (const hash of compareList) {
                        const distance = hammingDistance(analysis.hash, hash);
                        const similarity = 1.0 - (distance / 64.0);
                        if (similarity > bestSimilarity) bestSimilarity = similarity;
                    }
                    if (bestSimilarity > similarityFilter.maxSimilarity) return false;
                }

                return true;
            };

            const computeTemporalMetricsForConfig = (engine, baseConfig, frameCount, seed, renderOptions) => {
                const total = Math.max(2, frameCount || 16);
                const alphaFrames = [];
                for (let i = 0; i < total; i++) {
                    const cfg = buildAnimatedConfigFrame(baseConfig, i, total, seed, flipbookConfig);
                    engine.renderStack(cfg, renderOptions);
                    alphaFrames.push(extractAlphaFromPixels(engine.readPixels(cfg.length - 1)));
                }
                return computeTemporalChangeMetrics(alphaFrames, { anchorIndex: total - 1 });
            };

	            const storageKeySizesRef = useRef(new Map());
	            const quotaEstimateTimerRef = useRef(null);

	            const refreshStorageUsageFullScan = async () => {
	                try {
	                    const db = await getTextureDb();
	                    const { used, sizes } = await new Promise((resolve, reject) => {
	                        const tx = db.transaction(TEXTURE_DB_STORE, 'readonly');
	                        const store = tx.objectStore(TEXTURE_DB_STORE);
	                        let sum = 0;
	                        const sizesMap = new Map();
	                        const req = store.openCursor();
	                        req.onsuccess = () => {
	                            const cursor = req.result;
	                            if (!cursor) return resolve({ used: sum, sizes: sizesMap });
	                            const blob = cursor.value;
	                            const size = (blob && blob.size) ? blob.size : 0;
	                            sum += size;
	                            sizesMap.set(cursor.key, size);
	                            cursor.continue();
	                        };
	                        req.onerror = () => reject(req.error);
	                    });
	                    storageKeySizesRef.current = sizes;
	                    setStorageUsedBytes(used);
	                } catch (_) { }
	            };

	            const scheduleQuotaEstimate = () => {
	                if (!navigator.storage?.estimate) return;
	                if (quotaEstimateTimerRef.current) return;
	                quotaEstimateTimerRef.current = setTimeout(async () => {
	                    quotaEstimateTimerRef.current = null;
	                    try {
	                        const est = await navigator.storage.estimate();
	                        setStorageQuotaBytes(est.quota || 0);
	                    } catch (_) { }
	                }, 750);
	            };

	            useEffect(() => {
	                refreshStorageUsageFullScan();
	                scheduleQuotaEstimate();
	                return () => {
	                    if (quotaEstimateTimerRef.current) clearTimeout(quotaEstimateTimerRef.current);
	                };
	            }, []);

	            const cleanupStorageIfUnreferenced = async (storageKey, nextLibrary, nextResults) => {
	                if (!storageKey) return;
	                const inLibrary = nextLibrary.some(it => it.storageKey === storageKey);
	                const inResults = nextResults.some(it => it.storageKey === storageKey);
	                if (!inLibrary && !inResults) {
	                    const knownSize = storageKeySizesRef.current.get(storageKey) || 0;
	                    await deleteTextureBlob(storageKey);
	                    if (knownSize) setStorageUsedBytes(prev => Math.max(0, prev - knownSize));
	                    storageKeySizesRef.current.delete(storageKey);
	                    scheduleQuotaEstimate();
	                }
	            };

	            const cleanupDeletedEntryStorage = async (entry, retainedHistory = deleteHistoryRef.current) => {
                if (!entry?.items?.length) return;
                const keys = [...new Set(entry.items.map(it => it.storageKey).filter(Boolean))];
                if (keys.length === 0) return;
                const libraryNow = savedLibraryRef.current;
                const resultsNow = dreamResultsRef.current;

	                let deletedAny = false;
	                for (const key of keys) {
                    const inLibrary = libraryNow.some(it => it.storageKey === key);
                    const inResults = resultsNow.some(it => it.storageKey === key);
	                    const inUndoHistory = retainedHistory.some(hist => hist.items?.some(it => it.storageKey === key));
	                    if (!inLibrary && !inResults && !inUndoHistory) {
	                        const knownSize = storageKeySizesRef.current.get(key) || 0;
	                        await deleteTextureBlob(key);
	                        if (knownSize) setStorageUsedBytes(prev => Math.max(0, prev - knownSize));
	                        storageKeySizesRef.current.delete(key);
	                        deletedAny = true;
	                    }
	                }
	                if (deletedAny) scheduleQuotaEstimate();
	            };

            const pushDeleteHistory = (entry) => {
                setDeleteHistory(prev => {
                    const next = [entry, ...prev];
                    const retained = next.slice(0, MAX_DELETE_HISTORY);
                    const dropped = next.slice(MAX_DELETE_HISTORY);
                    if (dropped.length > 0) {
                        setTimeout(() => {
                            dropped.forEach(item => { cleanupDeletedEntryStorage(item, retained); });
                        }, 0);
                    }
                    return retained;
                });
            };

            const undoDelete = useCallback(() => {
                setDeleteHistory(prev => {
                    if (!prev.length) return prev;
                    const [latest, ...rest] = prev;
                    if (latest?.items?.length) {
                        setSavedLibrary(cur => {
                            const existingIds = new Set(cur.map(it => it.id));
                            const addBack = latest.items.filter(it => !existingIds.has(it.id));
                            return [...addBack, ...cur];
                        });
                    }
                    return rest;
                });
            }, []);

            useEffect(() => {
                const onKeyDown = (e) => {
                    const activeEl = document.activeElement;
                    const isTypingContext = activeEl && (
                        activeEl.tagName === 'INPUT' ||
                        activeEl.tagName === 'TEXTAREA' ||
                        activeEl.isContentEditable
                    );
                    if (isTypingContext) return;
                    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
                        if (deleteHistoryRef.current.length > 0) {
                            e.preventDefault();
                            undoDelete();
                        }
                    }
                };
                window.addEventListener('keydown', onKeyDown);
                return () => window.removeEventListener('keydown', onKeyDown);
            }, [undoDelete]);

            const handleDream = async () => {
                if (!bER.current || isDreaming) return; setIsDreaming(true); let existingNames = new Set(savedLibrary.map(i => i.name));
                setDreamState(p => ({ ...p, pendingAccepted: 0, pendingAttempts: 0, pendingRejected: 0 }));
                const acceptedHashes = savedLibrary.map(i => i.hash).filter(Boolean);
                const hasLibrarySamples = savedLibrary.length > 0;
                const baseOps = ['NOISE_PERLIN', 'NOISE_WORLEY', 'FRACTAL', 'SPIRAL', 'THRESHOLD', 'VIGNETTE', 'SMEAR', 'DOMAIN_WARP', 'RADIAL_WARP', 'KALEIDOSCOPE_PLUS', 'MORPH_DILATE_ERODE', 'MORPH_OPEN_CLOSE', 'EDGE_SOBEL', 'OUTLINE_ALPHA', 'POSTERIZE_ALPHA', 'DISTANCE_BANDS'];
                const libraryOps = hasLibrarySamples ? ['LIBRARY_STAMP_SCATTER', 'LIBRARY_DISPLACE'] : [];
                const ops = [...baseOps, ...libraryOps];
                const enabledFilterTemplates = buildEnabledFilterSteps();
                const libraryRenderCache = [];
                if (hasLibrarySamples) {
                    const cacheEngine = new TextureEngine(64, 64);
                    const maxLibrarySamples = Math.min(savedLibrary.length, 24);
                    for (let i = 0; i < maxLibrarySamples; i++) {
                        const randomLibraryItem = savedLibrary[Math.floor(Math.random() * savedLibrary.length)];
                        if (!randomLibraryItem?.config?.length) continue;
                        cacheEngine.renderStack(randomLibraryItem.config);
                        libraryRenderCache.push(cacheEngine.getTextureCanvas(randomLibraryItem.config.length - 1));
                    }
                }
                const gRS = () => {
                    const count = Math.floor(Math.random() * (dreamParams.maxComplexity - dreamParams.minComplexity + 1)) + dreamParams.minComplexity;
                    const ns = []; const gens = ['BASE_SHAPE', 'BASE_GRAD'];
                    const bK = gens[Math.floor(Math.random() * gens.length)]; const bD = STEP_TYPES[bK]; const bP = { ...bD.params };
                    bD.controls.forEach(c => { if (c.type === 'slider') bP[c.key] = c.min + Math.random() * (c.max - c.min); });
                    ns.push({ id: 'b' + Date.now(), typeDef: bD, active: true, blendMode: 0, params: bP, universal: { power: 1.0, mult: 1.0, scale: 1.0, offsetX: 0.0, offsetY: 0.0 } });
                    for (let i = 0; i < count; i++) {
                        const k = ops[Math.floor(Math.random() * ops.length)]; const d = STEP_TYPES[k]; const p = { ...d.params };
                        d.controls.forEach(c => { if (c.type === 'slider') p[c.key] = c.min + Math.random() * (c.max - c.min); });
                        ns.push({ id: 'o' + Date.now() + i, typeDef: d, active: true, blendMode: d.cat === 'GEN' ? 0 : (d.cat === 'ERODE' ? 1 : 2), params: p, universal: { power: 1.0, mult: 1.0, scale: 1.0, offsetX: 0.0, offsetY: 0.0 } });
                    }
                    enabledFilterTemplates.forEach(s => ns.push({ ...s, id: `${s.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }));
                    const vD = STEP_TYPES.VIGNETTE; ns.push({ id: 'v' + Date.now(), typeDef: vD, active: true, blendMode: 2, params: { ...vD.params, p1: 1, p2: 0.45, p3: 0.2 }, universal: { power: 1.0, mult: 1.0, scale: 1.0, offsetX: 0.0, offsetY: 0.0 } });
                    return ns;
                };
                try {
                    const cycles = Math.max(1, dreamParams.batchCycles);
                    let acceptedTotal = 0;
                    let attemptedTotal = 0;
                    let rejectedTotal = 0;
                    let lastDiagSyncAt = performance.now();
                    const syncDiagnostics = (force = false) => {
                        const now = performance.now();
                        if (!force && now - lastDiagSyncAt < 120) return;
                        lastDiagSyncAt = now;
                        setDreamState(p => ({ ...p, pendingAccepted: acceptedTotal, pendingAttempts: attemptedTotal, pendingRejected: rejectedTotal }));
                    };
                    for (let b = 0; b < cycles; b++) {
                        setDreamState(p => ({ ...p, phase: `Batch ${b + 1}...` })); const batch = [];
                        const pendingResults = [];
                        let lastFlushAt = performance.now();
                        let flushedOnce = false;
                        const flushPendingResults = () => {
                            if (pendingResults.length === 0) return;
                            const toAppend = pendingResults.splice(0, pendingResults.length);
                            setDreamState(p => ({ ...p, results: [...p.results, ...toAppend] }));
                            lastFlushAt = performance.now();
                        };
                        const requestedWorkers = Math.max(1, Math.min(MAX_GENERATION_WORKERS, parseInt(dreamParams.generationWorkers || 1)));
                        const generationWorkerCount = autoDreamRef.current ? requestedWorkers : 1;
                        if (!generationEnginesRef.current) generationEnginesRef.current = [];
		                        while (generationEnginesRef.current.length < generationWorkerCount) {
		                            generationEnginesRef.current.push(new TextureEngine(64, 64));
		                        }
		                        const workerEngines = generationEnginesRef.current.slice(0, generationWorkerCount);

                        await VMUtils.runWorkerPool(dreamParams.batchSize, generationWorkerCount, async (i, slot) => {
                            const workerEngine = workerEngines[slot];
                            let attempts = 0;
                            while (attempts < 10) {
                                attempts++;
                                attemptedTotal++;
                                syncDiagnostics();
                                const cfg = gRS();
                                const needsLibraryTexture = hasLibrarySamples && cfg.some(s => s?.typeDef && (s.typeDef.id === 110 || s.typeDef.id === 111));
                                const librarySource = needsLibraryTexture && libraryRenderCache.length > 0 ? libraryRenderCache[Math.floor(Math.random() * libraryRenderCache.length)] : null;
                                const renderOptions = librarySource ? { librarySource } : undefined;
                                workerEngine.renderStack(cfg, renderOptions);
                                const an = workerEngine.analyzeTexture(cfg.length - 1);
                                const temporalMetrics = computeTemporalMetricsForConfig(workerEngine, cfg, 16, `gen-${b}-${i}-${attempts}`, renderOptions);
                                an.changeScore = temporalMetrics.changeScore;
                                an.jitterScore = temporalMetrics.jitterScore;
                                if (passesQualityFilters(an, acceptedHashes)) {
                                    workerEngine.renderStack(cfg, renderOptions);
                                    const textureBlob = await workerEngine.getTextureBlob(cfg.length - 1);
                                    const storageKey = `tex-${Date.now()}-${Math.random().toString(36).slice(2)}`;
                                    const tempResultUrl = URL.createObjectURL(textureBlob);
                                    await storeTextureBlob(storageKey, textureBlob);
                                    storageKeySizesRef.current.set(storageKey, textureBlob.size || 0);
                                    if (textureBlob.size) setStorageUsedBytes(prev => prev + textureBlob.size);
                                    scheduleQuotaEstimate();
                                    const baseItem = {
                                        config: cfg,
                                        storageKey,
                                        id: `b${b}i${i}${Math.random()}`,
                                        density: an.density,
                                        sScore: an.sScore,
                                        circularity: an.circularity,
                                        squareness: an.squareness,
                                        changeScore: an.changeScore,
                                        jitterScore: an.jitterScore,
                                        hash: an.hash,
                                        name: generateSemanticName({ config: cfg, density: an.density, sScore: an.sScore }, existingNames)
                                    };
                                    const resultItem = { ...baseItem, url: tempResultUrl };
                                    const libraryItem = { ...baseItem, url: null };
                                    if (an.hash) acceptedHashes.push(an.hash);
                                    acceptedTotal++;
                                    syncDiagnostics(true);
                                    existingNames.add(baseItem.name); batch.push(libraryItem); pendingResults.push(resultItem);
                                    if (!flushedOnce) {
                                        flushPendingResults();
                                        flushedOnce = true;
                                    } else if (pendingResults.length >= 5 || performance.now() - lastFlushAt > 200) {
                                        flushPendingResults();
                                    }
                                    break;
                                }
                                rejectedTotal++;
                                syncDiagnostics();
                            }
                            await new Promise(r => setTimeout(r, 5));
                        });
                        flushPendingResults();
                        setSavedLibrary(prev => [...prev, ...batch]);
                        syncDiagnostics(true);
                    }
                } catch (e) { console.error(e); } finally { setIsDreaming(false); setDreamState(p => ({ ...p, phase: '', pendingAccepted: 0, pendingAttempts: 0, pendingRejected: 0 })); if (autoDreamRef.current) setTimeout(handleDream, 1000); }
            };

            const handleExportSet = async (targetSet) => {
                if (exportingSetId) return;
                if (!targetSet?.items?.length) return;
                setExportingSetId(targetSet.id);
                setExportError('');
                setExportPhase('Preparing export...');
	                try {
	                    const zip = new JSZip();
	                    const rs = [256, 512, 1024, 2048];
	                    const setName = targetSet.name.replace(/\s+/g, '_');
	                    const packWorkers = Math.max(1, Math.min(MAX_PACKAGING_WORKERS, parseInt(dreamParams.packagingWorkers || 1)));
	                    for (const r of rs) {
	                        setExportPhase(`Exporting ${r}px textures...`);
	                        const resFolder = zip.folder(`${setName}_${r}`);
	                        const rendered = new Array(targetSet.items.length);
	                        const engines = Array.from({ length: Math.min(packWorkers, targetSet.items.length) }, () => new TextureEngine(r, r));
	                        await VMUtils.runWorkerPool(targetSet.items.length, engines.length || 1, async (idx, slot) => {
	                            const engine = engines[slot] || engines[0];
	                            const item = targetSet.items[idx];
	                            engine.renderStack(item.config);
	                            rendered[idx] = await engine.getTextureBlob(item.config.length - 1);
	                        });
	                        for (let idx = 0; idx < targetSet.items.length; idx++) {
	                            const fileName = `${setName}_${(idx + 1).toString().padStart(2, '0')}`;
	                            resFolder.file(`${fileName}.png`, rendered[idx] || new Blob());
	                        }
	                    }
	                    const flipbooksRoot = zip.folder(`${setName}_Flipbooks`);
	                    for (let itIdx = 0; itIdx < targetSet.items.length; itIdx++) {
	                        const item = targetSet.items[itIdx];
	                        const indexPadded = (itIdx + 1).toString().padStart(2, '0');
	                        const baseFileName = `${setName}_${indexPadded}`;
	                        const fE = new TextureEngine(1024, 1024);
	                        const base = JSON.parse(JSON.stringify(item.config));
                            const indexFolderName = `${setName}_${indexPadded}_Flipbooks`;
                            const indexFolder = flipbooksRoot.folder(indexFolderName);
	                        for (const mult of [4, 8, 16]) {
	                            setExportPhase(`Packing ${baseFileName} x${mult}...`);
                                const flipbookFileName = `${setName}_${indexPadded}_x${mult}_Flipbook`;
	                            const sC = document.createElement('canvas');
	                            sC.width = 1024 * mult;
	                            sC.height = 1024;
	                            const sCtx = sC.getContext('2d');
                                const sequenceSeed = flipbookConfig?.global?.seedMode === 'random'
                                    ? `${baseFileName}|${mult}|${Math.random().toString(36).slice(2)}`
                                    : `${baseFileName}|${mult}`;
                                const frameOutputs = [];
                                const analyses = [];
                                const alphaFrames = [];
	                            for (let i = 0; i < mult; i++) {
	                                const cfg = buildAnimatedConfigFrame(base, i, mult, sequenceSeed, flipbookConfig);
	                                fE.renderStack(cfg);
                                        analyses.push(fE.analyzeTexture(cfg.length - 1));
                                        alphaFrames.push(extractAlphaFromPixels(fE.readPixels(cfg.length - 1)));
	                                frameOutputs.push(await fE.getTextureCanvasAndBlob(cfg.length - 1));
	                            }
                                const evalResult = evaluateFlipbookFrames(analyses, alphaFrames, flipbookConfig?.quality);
                                const shouldFallbackToStatic = !evalResult.pass;
                                if (shouldFallbackToStatic) {
                                    frameOutputs.length = 0;
                                    fE.renderStack(base);
                                    const still = await fE.getTextureCanvasAndBlob(base.length - 1);
                                    for (let i = 0; i < mult; i++) frameOutputs.push(still);
                                }
                                for (let i = 0; i < frameOutputs.length; i++) {
                                    const frame = frameOutputs[i];
                                    sCtx.drawImage(frame.canvas, i * 1024, 0);
                                }
	                            const spriteSheetBlob = await new Promise((resolve) => {
	                                sC.toBlob((blob) => resolve(blob || new Blob()), 'image/png');
	                            });
	                            indexFolder.file(`${flipbookFileName}.png`, spriteSheetBlob);
	                        }
	                    }
	                    setExportPhase('Finalizing ZIP...');
	                    const blob = await zip.generateAsync({ type: "blob", compression: "STORE" });
	                    VMUtils.triggerBlobDownload(blob, `${setName}_Pack.zip`);
	                    setExportPhase('Download started.');
	                } catch (e) {
	                    console.error(e);
	                    setExportError(`Export failed: ${e?.message || 'Unknown error'}`);
	                    setExportPhase('');
	                } finally {
	                    setExportingSetId(null);
	                }
            };

            const handleDeleteSet = async (targetSet) => {
                if (!targetSet?.items?.length) return;
                const currentLibrary = savedLibraryRef.current || savedLibrary;
                const currentResults = dreamResultsRef.current || dreamState.results;
                const removeIds = new Set(targetSet.items.map(it => it.id));
                const removeStorageKeys = new Set(targetSet.items.map(it => it.storageKey).filter(Boolean));

                const removedItems = currentLibrary.filter(it => removeIds.has(it.id) || (it.storageKey && removeStorageKeys.has(it.storageKey)));
                const removedResults = currentResults.filter(it => removeIds.has(it.id) || (it.storageKey && removeStorageKeys.has(it.storageKey)));
                const nextLibrary = currentLibrary.filter(it => !removeIds.has(it.id) && (!it.storageKey || !removeStorageKeys.has(it.storageKey)));
                const nextResults = currentResults.filter(it => !removeIds.has(it.id) && (!it.storageKey || !removeStorageKeys.has(it.storageKey)));

                setSavedLibrary(nextLibrary);
                setDreamState(prev => ({ ...prev, results: nextResults }));

                removedResults.forEach((it) => {
                    if (it?.url && typeof it.url === 'string' && it.url.startsWith('blob:')) {
                        URL.revokeObjectURL(it.url);
                    }
                });

                const keysToCleanup = [...new Set([...removedItems, ...removedResults].map(it => it.storageKey).filter(Boolean))];
                for (const key of keysToCleanup) {
                    await cleanupStorageIfUnreferenced(key, nextLibrary, nextResults);
                }

                pushDeleteHistory({
                    id: `set-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                    type: 'set',
                    label: targetSet.name || 'Set',
                    items: removedItems
                });
            };

            const updateFilterModule = (id, updater) => {
                setFilterModules(prev => prev.map(m => {
                    if (m.id !== id) return m;
                    return typeof updater === 'function' ? updater(m) : { ...m, ...updater };
                }));
            };

            return {
                ui: { activeTab, setActiveTab, showGizmos, setShowGizmos, enableAI, setEnableAI, autoAnimateFrames, setAutoAnimateFrames },
                storage: { usedBytes: storageUsedBytes, quotaBytes: storageQuotaBytes },
                customOps: { items: customOperations, add: (op) => setCustomOperations(prev => [...prev, op]) },
                flipbook: {
                    config: flipbookConfig,
                    setConfig: setFlipbookConfig,
                    resetDefaults: () => setFlipbookConfig(createDefaultFlipbookConfig()),
                    updateGlobal: (key, value) => setFlipbookConfig(prev => ({ ...prev, global: { ...prev.global, [key]: value } })),
                    updateQuality: (key, value) => setFlipbookConfig(prev => ({ ...prev, quality: { ...prev.quality, [key]: value } })),
                    toggleOperationEnabled: (opKey) => setFlipbookConfig(prev => ({
                        ...prev,
                        operations: {
                            ...prev.operations,
                            [opKey]: { ...prev.operations[opKey], enabled: !prev.operations[opKey]?.enabled }
                        }
                    })),
                    toggleOperationExpanded: (opKey) => setFlipbookConfig(prev => ({
                        ...prev,
                        operations: {
                            ...prev.operations,
                            [opKey]: { ...prev.operations[opKey], expanded: !prev.operations[opKey]?.expanded }
                        }
                    })),
                    updateOperation: (opKey, patch) => setFlipbookConfig(prev => ({
                        ...prev,
                        operations: {
                            ...prev.operations,
                            [opKey]: { ...prev.operations[opKey], ...patch }
                        }
                    })),
                    updateParam: (opKey, paramKey, patch) => setFlipbookConfig(prev => ({
                        ...prev,
                        operations: {
                            ...prev.operations,
                            [opKey]: {
                                ...prev.operations[opKey],
                                params: {
                                    ...prev.operations[opKey].params,
                                    [paramKey]: { ...prev.operations[opKey].params[paramKey], ...patch }
                                }
                            }
                        }
                    })),
                    updateUniversal: (opKey, key, patch) => setFlipbookConfig(prev => ({
                        ...prev,
                        operations: {
                            ...prev.operations,
                            [opKey]: {
                                ...prev.operations[opKey],
                                universal: {
                                    ...prev.operations[opKey].universal,
                                    [key]: { ...prev.operations[opKey].universal[key], ...patch }
                                }
                            }
                        }
                    }))
                },
                filters: {
                    modules: filterModules,
                    quality: qualityFilters,
                    toggleEnabled: (id) => updateFilterModule(id, (m) => ({ ...m, enabled: !m.enabled })),
                    toggleExpanded: (id) => updateFilterModule(id, (m) => ({ ...m, expanded: !m.expanded })),
                    move: (id, dir) => setFilterModules(prev => {
                        const idx = prev.findIndex(m => m.id === id);
                        const to = idx + dir;
                        if (idx < 0 || to < 0 || to >= prev.length) return prev;
                        const next = [...prev];
                        [next[idx], next[to]] = [next[to], next[idx]];
                        return next;
                    }),
                    updateBlend: (id, blendMode) => updateFilterModule(id, (m) => ({ ...m, blendMode })),
                    updateParam: (id, key, value) => updateFilterModule(id, (m) => ({ ...m, params: { ...m.params, [key]: value } })),
                    updateUniversal: (id, key, value) => updateFilterModule(id, (m) => ({ ...m, universal: { ...m.universal, [key]: value } })),
                    updateQuality: (section, key, value) => setQualityFilters(prev => ({ ...prev, [section]: { ...prev[section], [key]: value } })),
                    toggleQualityEnabled: (section) => setQualityFilters(prev => ({ ...prev, [section]: { ...prev[section], enabled: !prev[section].enabled } })),
                    toggleQualityExpanded: (section) => setQualityFilters(prev => ({ ...prev, [section]: { ...prev[section], expanded: !prev[section].expanded } }))
                },
                builder: {
                    steps,
                    updateStep: (id, ch) => setSteps(p => p.map(s => s.id === id ? { ...s, ...ch } : s)),
                    toggleStep: (id) => setSteps(p => p.map(s => s.id === id ? { ...s, active: !s.active } : s)),
                    addStep: (keyOrCustomId, idx) => setSteps(p => {
                        let ns = null;
                        if (typeof keyOrCustomId === 'string' && keyOrCustomId.startsWith('CUSTOM_OP::')) {
                            const customId = keyOrCustomId.split('CUSTOM_OP::')[1];
                            const customOp = customOperations.find(op => op.id === customId && op.type === 'shader');
                            if (!customOp) return p;
                            ns = {
                                id: 's' + Date.now(),
                                typeDef: { id: 1000, name: customOp.title || 'Custom Shader', cat: 'MOD', controls: [] },
                                active: true,
                                blendMode: 2,
                                params: { p1: 0, p2: 0, p3: 0, p4: 0, p5: 0, p6: 0, p7: 0 },
                                universal: { power: 1.0, mult: 1.0, scale: 1.0, offsetX: 0.0, offsetY: 0.0 },
                                customOpType: 'shader',
                                customOpId: customOp.id,
                                customCode: customOp.code,
                                note: customOp.description || ''
                            };
                        } else {
                            const td = STEP_TYPES[keyOrCustomId];
                            if (!td) return p;
                            ns = {
                                id: 's' + Date.now(),
                                typeDef: td,
                                active: true,
                                blendMode: td.cat === 'GEN' ? 0 : (td.cat === 'ERODE' ? 1 : 2),
                                params: { ...td.params },
                                universal: { power: 1.0, mult: 1.0, scale: 1.0, offsetX: 0.0, offsetY: 0.0 }
                            };
                            if (td.customOpType === 'shader') {
                                ns.customOpType = 'shader';
                                ns.customCode = td.customCode;
                            }
                        }
                        const next = [...p];
                        if (idx === -1) next.push(ns); else next.splice(idx, 0, ns);
                        return next;
                    }),
                    removeStep: (id) => setSteps(p => p.filter(s => s.id !== id)),
                    moveStep: (idx, dir) => setSteps(p => { const n = [...p]; const t = idx + dir; if (t >= 0 && t < n.length) [n[idx], n[t]] = [n[t], n[idx]]; return n; }),
                    previewUrls,
                    finalPreviewUrl,
                    profileName,
                    setProfileName,
                    erosion,
                    setErosion,
                    resList: [256, 512, 1024, 2048, 4096],
                    selectedRes: selectedRes,
                    toggleRes: (r) => setSelectedRes(p => p.includes(r) ? p.filter(x => x !== r) : [...p, r].sort((a, b) => a - b)),
                    onExport: async () => {
                        const z = new JSZip();
                        for (const r of selectedRes) {
                            const e = new TextureEngine(r, r);
                            e.renderStack(steps);
                            const blob = await e.getTextureBlob(steps.length - 1);
                            z.file(`${profileName}_${r}.png`, blob);
                        }
                        const c = await z.generateAsync({ type: "blob", compression: "STORE" });
                        VMUtils.triggerBlobDownload(c, `${profileName}.zip`);
                    }
                },
                dream: {
                    params: dreamParams,
                    setParams: setDreamParams,
                    onDream: handleDream,
                    isDreaming,
                    state: dreamState,
                    onDeleteResult: async (id) => {
                        const nextResults = dreamState.results.filter(r => r.id !== id);
                        const nextLibrary = savedLibrary;
                        const removed = dreamState.results.find(r => r.id === id);
                        setDreamState(p => ({ ...p, results: p.results.filter(r => r.id !== id) }));
                        if (removed?.url && typeof removed.url === 'string' && removed.url.startsWith('blob:')) {
                            URL.revokeObjectURL(removed.url);
                        }
                        if (removed?.storageKey) await cleanupStorageIfUnreferenced(removed.storageKey, nextLibrary, nextResults);
                    }
                },
                library: {
                    items: savedLibrary,
                    sets,
                    packConfig,
                    setPackConfig,
                    reorganizePacks,
                    onSave: (it) => setSavedLibrary(p => [...p, { ...it, url: null }]),
                    onLoad: (cfg) => { setSteps(cfg); setActiveTab('builder'); },
                    onDelete: async (id) => {
                        const currentLibrary = savedLibraryRef.current || savedLibrary;
                        const currentResults = dreamResultsRef.current || dreamState.results;
                        const removed = currentLibrary.find(it => it.id === id);
                        if (!removed) return;
                        const targetStorageKey = removed.storageKey;
                        const nextLibrary = currentLibrary.filter(it => it.id !== id && (!targetStorageKey || it.storageKey !== targetStorageKey));
                        const nextResults = currentResults.filter(it => it.id !== id && (!targetStorageKey || it.storageKey !== targetStorageKey));
                        setSavedLibrary(nextLibrary);
                        setDreamState(prev => ({ ...prev, results: nextResults }));
                        currentResults.forEach((it) => {
                            const sameRef = it.id === id || (targetStorageKey && it.storageKey === targetStorageKey);
                            if (sameRef && it?.url && typeof it.url === 'string' && it.url.startsWith('blob:')) {
                                URL.revokeObjectURL(it.url);
                            }
                        });
                        if (targetStorageKey) await cleanupStorageIfUnreferenced(targetStorageKey, nextLibrary, nextResults);
                        if (removed) {
                            pushDeleteHistory({
                                id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                                type: 'item',
                                label: removed.name || 'Library Item',
                                items: [removed]
                            });
                        }
                    },
                    renameSet: handleRenameSet,
                    exportSet: handleExportSet,
                    deleteSet: handleDeleteSet,
                    exportingSetId,
                    exportPhase,
                    exportError
                },
                engines: { preview: bER.current }
            };
        }
