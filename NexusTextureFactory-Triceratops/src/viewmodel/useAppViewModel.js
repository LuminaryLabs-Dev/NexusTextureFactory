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
	            const [dreamParams, setDreamParams] = useState({ overdrive: 0, generationWorkers: 5, packagingWorkers: 5, refineCycles: 1, minDensity: 0.15, maxDensity: 0.75, minSimplicity: 0.1, maxSimplicity: 0.9, varianceStrictness: 0.1, randStrength: 0.5, flipFrames: 16, prompt: "", minComplexity: 5, maxComplexity: 10, resultFillMode: 'slide' });

		            const [isDreaming, setIsDreaming] = useState(false); const [dreamState, setDreamState] = useState({ results: [], rejectedIds: [], phase: '', rejectLabel: '', pendingAccepted: 0, pendingAttempts: 0, pendingRejected: 0, pendingBackfill: 0, activeGenWorkers: 0, activeBackfillWorkers: 0, stageRejects: { alpha: 0, simplicity: 0, shape: 0, similarity: 0, temporal: 0, other: 0 } });
	            const [savedLibrary, setSavedLibrary] = useState([]); const [exportingSetId, setExportingSetId] = useState(null); const [exportPhase, setExportPhase] = useState(''); const [exportError, setExportError] = useState('');
	            const [deleteHistory, setDeleteHistory] = useState([]);
	            const eR = useRef(null); const bER = useRef(null);
	            const generationEnginesRef = useRef([]);
	            const hasHydratedMetaRef = useRef(false);
	            const savedLibraryRef = useRef(savedLibrary);
	            const dreamResultsRef = useRef(dreamState.results);
	            const deleteHistoryRef = useRef(deleteHistory);
	            const persistTimerRef = useRef(null);
            const dreamRunIdRef = useRef(0);
            const dreamStopRequestedRef = useRef(false);

	            useEffect(() => { eR.current = new TextureEngine(256, 256); bER.current = new TextureEngine(64, 64); }, []);
	            useEffect(() => { if (!eR.current) return; eR.current.renderStack(steps); setPreviewUrls(steps.map((_, i) => eR.current.getTextureUrl(i))); setFinalPreviewUrl(eR.current.getTextureUrl(steps.length - 1)); }, [steps]);
	            useEffect(() => { savedLibraryRef.current = savedLibrary; }, [savedLibrary]);
	            useEffect(() => { dreamResultsRef.current = dreamState.results; }, [dreamState.results]);
	            useEffect(() => { deleteHistoryRef.current = deleteHistory; }, [deleteHistory]);
            useEffect(() => {
                setDreamState(prev => {
                    const prevResults = Array.isArray(prev.results) ? prev.results : [];
                    const prevReal = prevResults.filter(it => it && !it.__slotOpen && it.id);
                    const prevById = new Map(prevReal.map(it => [it.id, it]));
                    const nextResults = savedLibrary.map(libItem => {
                        const prevItem = prevById.get(libItem.id);
                        if (prevItem && prevItem.url) return { ...libItem, url: prevItem.url };
                        return { ...libItem, url: null };
                    });
                    if (nextResults.length === prevResults.length) {
                        let sameOrder = true;
                        for (let i = 0; i < nextResults.length; i++) {
                            if (nextResults[i]?.id !== prevResults[i]?.id) {
                                sameOrder = false;
                                break;
                            }
                        }
                        if (sameOrder) return prev;
                    }
                    return { ...prev, results: nextResults };
                });
            }, [savedLibrary]);
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
                            const nextOverdrive = Math.max(0, Math.min(1, Number(parsed.overdrive ?? 0)));
                            const nextResultFillMode = parsed.resultFillMode === 'slot' ? 'slot' : 'slide';
                            setDreamParams(prev => ({
                                ...prev,
                                ...parsed,
                                overdrive: nextOverdrive,
                                minComplexity: nextMinComplexity,
                                maxComplexity: nextMaxComplexity,
                                resultFillMode: nextResultFillMode
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
                    const its = packConfig.sortBy === 'none' ? [...ts[k]] : [...ts[k]].sort(cmp);
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
                    if ((packConfig.sortBy || 'none') === 'none') return prev;
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

            const moveArrayItem = (arr, fromIndex, toIndex) => {
                if (!Array.isArray(arr)) return arr;
                if (fromIndex === toIndex) return arr;
                if (fromIndex < 0 || fromIndex >= arr.length) return arr;
                if (toIndex < 0 || toIndex >= arr.length) return arr;
                const next = [...arr];
                const [item] = next.splice(fromIndex, 1);
                next.splice(toIndex, 0, item);
                return next;
            };

            const isSlotFillMode = (mode) => mode === 'slot';
            const compactResultsByBottomFill = (results, shouldRemove) => {
                if (!Array.isArray(results)) return results;
                const next = results.filter(Boolean).slice();
                const target = (item) => !!item?.__slotOpen || !!shouldRemove(item);
                let index = 0;
                while (index < next.length) {
                    if (!target(next[index])) {
                        index++;
                        continue;
                    }
                    let tail = next.length - 1;
                    while (tail > index && target(next[tail])) {
                        next.pop();
                        tail--;
                    }
                    if (tail > index) {
                        next[index] = next[tail];
                        next.pop();
                        index++;
                    } else {
                        next.pop();
                    }
                }
                return next;
            };
            const mergeResultsByFillMode = (existingResults, incomingResults, fillMode) => {
                if (!Array.isArray(existingResults) || !Array.isArray(incomingResults) || incomingResults.length === 0) return existingResults;
                if (!isSlotFillMode(fillMode)) return [...existingResults, ...incomingResults];
                const compacted = compactResultsByBottomFill(existingResults, () => false);
                return [...compacted, ...incomingResults];
            };
            const removeResultsByFillMode = (results, shouldRemove, fillMode) => {
                if (!Array.isArray(results)) return results;
                if (!isSlotFillMode(fillMode)) return results.filter(it => !shouldRemove(it));
                return compactResultsByBottomFill(results, shouldRemove);
            };

            const reorderByDrag = (sourceId, targetId) => {
                const cfg = packConfig || {};
                const reorderEnabled = cfg.groupBy === 'volume_fill' && (cfg.sortBy || 'none') === 'none';
                if (!reorderEnabled) return;
                if (!sourceId || !targetId || sourceId === targetId) return;

                setSavedLibrary(prev => {
                    const fromIndex = prev.findIndex(it => it.id === sourceId);
                    const toIndex = prev.findIndex(it => it.id === targetId);
                    if (fromIndex < 0 || toIndex < 0) return prev;
                    return moveArrayItem(prev, fromIndex, toIndex);
                });

                setDreamState(prev => {
                    const fromIndex = prev.results.findIndex(it => it.id === sourceId);
                    const toIndex = prev.results.findIndex(it => it.id === targetId);
                    if (fromIndex < 0 || toIndex < 0) return prev;
                    return { ...prev, results: moveArrayItem(prev.results, fromIndex, toIndex) };
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

            const getBestSimilarity = (analysisHash, recentHashes, historySize) => {
                if (!analysisHash || !recentHashes.length) return 0;
                const compareList = recentHashes.slice(-Math.max(1, historySize));
                let bestSimilarity = 0;
                for (const hash of compareList) {
                    const distance = hammingDistance(analysisHash, hash);
                    const similarity = 1.0 - (distance / 64.0);
                    if (similarity > bestSimilarity) bestSimilarity = similarity;
                }
                return bestSimilarity;
            };

            const runStageAlphaAndSimplicityGate = (analysis) => {
                const alphaFilter = qualityFilters.alpha;
                if (alphaFilter.enabled && (analysis.density < alphaFilter.min || analysis.density > alphaFilter.max)) return { pass: false, reason: 'alpha' };
                const simplicityFilter = qualityFilters.simplicity;
                if (simplicityFilter.enabled && (analysis.sScore < simplicityFilter.min || analysis.sScore > simplicityFilter.max)) return { pass: false, reason: 'simplicity' };
                return { pass: true, reason: '' };
            };

            const runStageShapeGate = (analysis) => {
                const shapeFilter = qualityFilters.shape;
                if (!shapeFilter.enabled) return { pass: true, reason: '' };
                if (analysis.circularity < shapeFilter.minCircularity || analysis.circularity > shapeFilter.maxCircularity) return { pass: false, reason: 'shape' };
                if (analysis.squareness < shapeFilter.minSquareness || analysis.squareness > shapeFilter.maxSquareness) return { pass: false, reason: 'shape' };
                return { pass: true, reason: '' };
            };

            const runStageSimilarityGate = (analysis, recentHashes) => {
                const similarityFilter = qualityFilters.similarity;
                if (!similarityFilter.enabled || !analysis.hash) return { pass: true, reason: '', similarity: 0 };
                const bestSimilarity = getBestSimilarity(analysis.hash, recentHashes, similarityFilter.historySize);
                if (bestSimilarity > similarityFilter.maxSimilarity) return { pass: false, reason: 'similarity', similarity: bestSimilarity };
                return { pass: true, reason: '', similarity: bestSimilarity };
            };

            const runStageTemporalGate = (analysis) => {
                const temporalFilter = qualityFilters.temporalChange;
                if (!temporalFilter.enabled) return { pass: true, reason: '' };
                const changeScore = Number(analysis.changeScore || 0);
                const jitterScore = Number(analysis.jitterScore || 0);
                if (changeScore < temporalFilter.minChange || changeScore > temporalFilter.maxChange) return { pass: false, reason: 'temporal' };
                if (jitterScore > temporalFilter.maxJitter) return { pass: false, reason: 'temporal' };
                return { pass: true, reason: '' };
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

            const clampOverdrive = (value) => Math.max(0, Math.min(1, Number(value || 0)));
            const createStageRejectCounters = () => ({ alpha: 0, simplicity: 0, shape: 0, similarity: 0, temporal: 0, other: 0 });
            const countReject = (counters, reason) => {
                if (reason && Object.prototype.hasOwnProperty.call(counters, reason)) counters[reason]++;
                else counters.other++;
            };
            const getOverdriveWorkerTarget = (maxWorkers, overdrive) => {
                const safeMax = Math.max(1, maxWorkers);
                const standardWorkers = Math.min(2, safeMax);
                const v = clampOverdrive(overdrive);
                return Math.max(1, Math.min(safeMax, Math.round(standardWorkers + (safeMax - standardWorkers) * v)));
            };

            const handleStopDream = () => {
                if (!isDreaming) return;
                dreamStopRequestedRef.current = true;
                setDreamState(p => ({ ...p, phase: 'Stopping...' }));
            };

            const handleDream = async () => {
                if (!bER.current || isDreaming) return;
                const runId = Date.now();
                dreamRunIdRef.current = runId;
                dreamStopRequestedRef.current = false;
                setIsDreaming(true);

                const initialOverdrive = clampOverdrive(dreamParams.overdrive);
                const maxGenerationWorkers = Math.max(1, Math.min(MAX_GENERATION_WORKERS, parseInt(dreamParams.generationWorkers || 1)));
                const maxBackfillWorkers = Math.max(1, Math.min(MAX_PACKAGING_WORKERS, parseInt(dreamParams.packagingWorkers || 1)));
                let adaptiveGenWorkers = getOverdriveWorkerTarget(maxGenerationWorkers, initialOverdrive);
                let adaptiveBackfillWorkers = getOverdriveWorkerTarget(maxBackfillWorkers, initialOverdrive);
                const temporalFrameCount = Math.max(4, Math.min(8, Math.round((dreamParams.flipFrames || 16) * 0.5)));
                const commitChunkSize = Math.max(6, Math.round(6 + initialOverdrive * 24));
                const maxAttemptsPerJob = 6;
                const isEngineContextLost = (engine) => {
                    const gl = engine?.gl;
                    if (!gl) return true;
                    try { return typeof gl.isContextLost === 'function' ? gl.isContextLost() : false; }
                    catch (_) { return true; }
                };
                const ensureGenerationEngine = (slot) => {
                    const list = generationEnginesRef.current;
                    const engine = list[slot];
                    if (!engine || isEngineContextLost(engine)) {
                        list[slot] = new TextureEngine(64, 64);
                    }
                    return list[slot];
                };

                const snapshotLibrary = savedLibraryRef.current || [];
                let existingNames = new Set(snapshotLibrary.map(i => i.name));
                const acceptedHashes = snapshotLibrary.map(i => i.hash).filter(Boolean);
                const stageRejects = createStageRejectCounters();
                let acceptedTotal = 0;
                let attemptedTotal = 0;
                let rejectedTotal = 0;
                let loopCounter = 0;
                let lastDiagnosticsAt = 0;
                let lastCommitAt = performance.now();
                const pendingLibraryItems = [];
                const pendingResultItems = [];
                const backfillQueue = [];

                const hasLibrarySamples = snapshotLibrary.length > 0;
                const baseOps = ['NOISE_PERLIN', 'NOISE_WORLEY', 'FRACTAL', 'SPIRAL', 'THRESHOLD', 'VIGNETTE', 'SMEAR', 'DOMAIN_WARP', 'RADIAL_WARP', 'KALEIDOSCOPE_PLUS', 'MORPH_DILATE_ERODE', 'MORPH_OPEN_CLOSE', 'EDGE_SOBEL', 'OUTLINE_ALPHA', 'POSTERIZE_ALPHA', 'DISTANCE_BANDS'];
                const libraryOps = hasLibrarySamples ? ['LIBRARY_STAMP_SCATTER', 'LIBRARY_DISPLACE'] : [];
                const ops = [...baseOps, ...libraryOps];
                const enabledFilterTemplates = buildEnabledFilterSteps();
                const libraryRenderCache = [];

                const updateDiagnostics = (phase, force = false) => {
                    const now = performance.now();
                    if (!force && now - lastDiagnosticsAt < 120) return;
                    lastDiagnosticsAt = now;
                    setDreamState(p => ({
                        ...p,
                        phase,
                        pendingAccepted: acceptedTotal,
                        pendingAttempts: attemptedTotal,
                        pendingRejected: rejectedTotal,
                        pendingBackfill: backfillQueue.length,
                        activeGenWorkers: adaptiveGenWorkers,
                        activeBackfillWorkers: adaptiveBackfillWorkers,
                        stageRejects: { ...stageRejects }
                    }));
                };

                const flushPendingItems = (force = false) => {
                    if (!force && pendingResultItems.length < commitChunkSize && performance.now() - lastCommitAt < 250) return;
                    if (!pendingResultItems.length && !pendingLibraryItems.length) return;
                    const toLibrary = pendingLibraryItems.splice(0, pendingLibraryItems.length);
                    const toResults = pendingResultItems.splice(0, pendingResultItems.length);
                    if (toLibrary.length) setSavedLibrary(prev => [...prev, ...toLibrary]);
                    if (toResults.length) {
                        setDreamState(p => ({
                            ...p,
                            results: mergeResultsByFillMode(p.results, toResults, dreamParams.resultFillMode),
                            phase: p.phase,
                            pendingAccepted: acceptedTotal,
                            pendingAttempts: attemptedTotal,
                            pendingRejected: rejectedTotal,
                            pendingBackfill: backfillQueue.length,
                            activeGenWorkers: adaptiveGenWorkers,
                            activeBackfillWorkers: adaptiveBackfillWorkers,
                            stageRejects: { ...stageRejects }
                        }));
                    }
                    lastCommitAt = performance.now();
                };

                const buildRandomConfig = () => {
                    const count = Math.floor(Math.random() * (dreamParams.maxComplexity - dreamParams.minComplexity + 1)) + dreamParams.minComplexity;
                    const ns = [];
                    const gens = ['BASE_SHAPE', 'BASE_GRAD'];
                    const baseKey = gens[Math.floor(Math.random() * gens.length)];
                    const baseDef = STEP_TYPES[baseKey];
                    const baseParams = { ...baseDef.params };
                    baseDef.controls.forEach(c => { if (c.type === 'slider') baseParams[c.key] = c.min + Math.random() * (c.max - c.min); });
                    ns.push({ id: 'b' + Date.now(), typeDef: baseDef, active: true, blendMode: 0, params: baseParams, universal: { power: 1.0, mult: 1.0, scale: 1.0, offsetX: 0.0, offsetY: 0.0 } });
                    for (let i = 0; i < count; i++) {
                        const key = ops[Math.floor(Math.random() * ops.length)];
                        const def = STEP_TYPES[key];
                        const params = { ...def.params };
                        def.controls.forEach(c => { if (c.type === 'slider') params[c.key] = c.min + Math.random() * (c.max - c.min); });
                        ns.push({ id: 'o' + Date.now() + i, typeDef: def, active: true, blendMode: def.cat === 'GEN' ? 0 : (def.cat === 'ERODE' ? 1 : 2), params, universal: { power: 1.0, mult: 1.0, scale: 1.0, offsetX: 0.0, offsetY: 0.0 } });
                    }
                    enabledFilterTemplates.forEach(s => ns.push({ ...s, id: `${s.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }));
                    const vignetteDef = STEP_TYPES.VIGNETTE;
                    ns.push({ id: 'v' + Date.now(), typeDef: vignetteDef, active: true, blendMode: 2, params: { ...vignetteDef.params, p1: 1, p2: 0.45, p3: 0.2 }, universal: { power: 1.0, mult: 1.0, scale: 1.0, offsetX: 0.0, offsetY: 0.0 } });
                    return ns;
                };

                if (hasLibrarySamples) {
                    // Avoid creating extra WebGL contexts; reuse slot 0 engine to build cache.
                    if (generationEnginesRef.current.length < 1) generationEnginesRef.current.push(new TextureEngine(64, 64));
                    const cacheEngine = ensureGenerationEngine(0);
                    const maxLibrarySamples = Math.min(snapshotLibrary.length, 24);
                    for (let i = 0; i < maxLibrarySamples; i++) {
                        const randomLibraryItem = snapshotLibrary[Math.floor(Math.random() * snapshotLibrary.length)];
                        if (!randomLibraryItem?.config?.length) continue;
                        cacheEngine.renderStack(randomLibraryItem.config);
                        libraryRenderCache.push(cacheEngine.getTextureCanvas(randomLibraryItem.config.length - 1));
                    }
                }

                try {
                    while (dreamRunIdRef.current === runId && !dreamStopRequestedRef.current) {
                        loopCounter++;
                        const loopStart = performance.now();
                        const phase = `Dreaming... loop ${loopCounter}`;

                        const targetGenWorkers = getOverdriveWorkerTarget(maxGenerationWorkers, clampOverdrive(dreamParams.overdrive));
                        const targetBackfillWorkers = getOverdriveWorkerTarget(maxBackfillWorkers, clampOverdrive(dreamParams.overdrive));
                        if (adaptiveGenWorkers < targetGenWorkers) adaptiveGenWorkers++;
                        if (adaptiveGenWorkers > targetGenWorkers) adaptiveGenWorkers--;
                        if (adaptiveBackfillWorkers < targetBackfillWorkers) adaptiveBackfillWorkers++;
                        if (adaptiveBackfillWorkers > targetBackfillWorkers) adaptiveBackfillWorkers--;

                        while (generationEnginesRef.current.length < adaptiveGenWorkers) generationEnginesRef.current.push(new TextureEngine(64, 64));
                        // Reuse generation engines for temporal + backfill to avoid WebGL context loss.
                        adaptiveBackfillWorkers = Math.min(adaptiveBackfillWorkers, adaptiveGenWorkers);

                        const generationBatchSize = Math.max(adaptiveGenWorkers, Math.round(8 + clampOverdrive(dreamParams.overdrive) * 16));
                        updateDiagnostics(phase);

                        await VMUtils.runWorkerPool(generationBatchSize, adaptiveGenWorkers, async (jobIndex, slot) => {
                            if (dreamRunIdRef.current !== runId || dreamStopRequestedRef.current) return;
                            const workerEngine = ensureGenerationEngine(slot);
                            for (let attempt = 0; attempt < maxAttemptsPerJob; attempt++) {
                                if (dreamRunIdRef.current !== runId || dreamStopRequestedRef.current) return;
                                attemptedTotal++;
                                const cfg = buildRandomConfig();
                                const needsLibraryTexture = hasLibrarySamples && cfg.some(s => s?.typeDef && (s.typeDef.id === 110 || s.typeDef.id === 111));
                                const librarySource = needsLibraryTexture && libraryRenderCache.length > 0 ? libraryRenderCache[Math.floor(Math.random() * libraryRenderCache.length)] : null;
                                const renderOptions = librarySource ? { librarySource } : undefined;

                                // Stage 1/2/3 gates: one render, then low-cost checks.
                                workerEngine.renderStack(cfg, renderOptions);
                                const analysis = workerEngine.analyzeTexture(cfg.length - 1);

                                const stageAlpha = runStageAlphaAndSimplicityGate(analysis);
                                if (!stageAlpha.pass) {
                                    rejectedTotal++;
                                    countReject(stageRejects, stageAlpha.reason);
                                    continue;
                                }
                                const stageShape = runStageShapeGate(analysis);
                                if (!stageShape.pass) {
                                    rejectedTotal++;
                                    countReject(stageRejects, stageShape.reason);
                                    continue;
                                }
                                const stageSimilarity = runStageSimilarityGate(analysis, acceptedHashes);
                                if (!stageSimilarity.pass) {
                                    rejectedTotal++;
                                    countReject(stageRejects, stageSimilarity.reason);
                                    continue;
                                }

                                // Stage 4 gate: expensive temporal check at lower resolution and fewer frames.
                                const temporalMetrics = computeTemporalMetricsForConfig(workerEngine, cfg, temporalFrameCount, `dream-${loopCounter}-${jobIndex}-${attempt}`, renderOptions);
                                analysis.changeScore = temporalMetrics.changeScore;
                                analysis.jitterScore = temporalMetrics.jitterScore;
                                const stageTemporal = runStageTemporalGate(analysis);
                                if (!stageTemporal.pass) {
                                    rejectedTotal++;
                                    countReject(stageRejects, stageTemporal.reason);
                                    continue;
                                }

                                const baseItem = {
                                    config: cfg,
                                    id: `d${Date.now()}-${jobIndex}-${Math.random().toString(36).slice(2, 8)}`,
                                    density: analysis.density,
                                    sScore: analysis.sScore,
                                    circularity: analysis.circularity,
                                    squareness: analysis.squareness,
                                    changeScore: analysis.changeScore,
                                    jitterScore: analysis.jitterScore,
                                    hash: analysis.hash,
                                    name: generateSemanticName({ config: cfg, density: analysis.density, sScore: analysis.sScore }, existingNames),
                                    renderOptions
                                };
                                existingNames.add(baseItem.name);
                                if (analysis.hash) acceptedHashes.push(analysis.hash);
                                acceptedTotal++;
                                backfillQueue.push(baseItem);
                                break;
                            }
                        });

                        const backfillBatchSize = Math.min(backfillQueue.length, Math.max(adaptiveBackfillWorkers, Math.round(4 + clampOverdrive(dreamParams.overdrive) * 12)));
                        if (backfillBatchSize > 0) {
                            const backfillJobs = backfillQueue.splice(0, backfillBatchSize);
                            await VMUtils.runWorkerPool(backfillJobs.length, adaptiveBackfillWorkers, async (idx, slot) => {
                                const job = backfillJobs[idx];
                                if (!job) return;
                                const engine = ensureGenerationEngine(slot);
                                const renderOptions = job.renderOptions;
                                engine.renderStack(job.config, renderOptions);
                                const textureBlob = await engine.getTextureBlob(job.config.length - 1);
                                const storageKey = `tex-${Date.now()}-${Math.random().toString(36).slice(2)}`;
                                await storeTextureBlob(storageKey, textureBlob);
                                storageKeySizesRef.current.set(storageKey, textureBlob.size || 0);
                                if (textureBlob.size) setStorageUsedBytes(prev => prev + textureBlob.size);
                                scheduleQuotaEstimate();
                                const tempResultUrl = URL.createObjectURL(textureBlob);
                                const persistedItem = { ...job, storageKey, url: null };
                                const previewItem = { ...job, storageKey, url: tempResultUrl };
                                delete persistedItem.renderOptions;
                                delete previewItem.renderOptions;
                                pendingLibraryItems.push(persistedItem);
                                pendingResultItems.push(previewItem);
                            });
                        }

                        flushPendingItems();
                        updateDiagnostics(phase);

                        const loopDuration = performance.now() - loopStart;
                        if (clampOverdrive(dreamParams.overdrive) > 0.8) {
                            if (loopDuration < 220 && adaptiveGenWorkers < maxGenerationWorkers && backfillQueue.length < commitChunkSize * 2) adaptiveGenWorkers++;
                            if (loopDuration > 650 && adaptiveGenWorkers > 1) adaptiveGenWorkers--;
                        }
                        if (backfillQueue.length > commitChunkSize * 3 && adaptiveBackfillWorkers < maxBackfillWorkers) adaptiveBackfillWorkers++;
                        if (backfillQueue.length === 0 && loopDuration > 450 && adaptiveBackfillWorkers > 1) adaptiveBackfillWorkers--;

                        if (dreamRunIdRef.current !== runId || dreamStopRequestedRef.current) break;
                        await new Promise(r => setTimeout(r, 0));
                    }
                } catch (e) {
                    console.error(e);
                } finally {
                    flushPendingItems(true);
                    setIsDreaming(false);
                    const stopping = dreamStopRequestedRef.current || dreamRunIdRef.current !== runId;
                    setDreamState(p => ({
                        ...p,
                        phase: stopping ? 'Stopped' : '',
                        pendingAccepted: acceptedTotal,
                        pendingAttempts: attemptedTotal,
                        pendingRejected: rejectedTotal,
                        pendingBackfill: 0,
                        activeGenWorkers: 0,
                        activeBackfillWorkers: 0,
                        stageRejects: { ...stageRejects }
                    }));
                    dreamStopRequestedRef.current = false;
                }
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
                const nextResults = removeResultsByFillMode(
                    currentResults,
                    (it) => removeIds.has(it.id) || (it.storageKey && removeStorageKeys.has(it.storageKey)),
                    dreamParams.resultFillMode
                );

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

            const handleDeleteAllGlobal = async () => {
                const currentLibrary = savedLibraryRef.current || savedLibrary;
                const currentResults = dreamResultsRef.current || dreamState.results;
                if (!currentLibrary.length && !currentResults.length) return;

                currentResults.forEach((it) => {
                    if (it?.url && typeof it.url === 'string' && it.url.startsWith('blob:')) {
                        URL.revokeObjectURL(it.url);
                    }
                });

                setSavedLibrary([]);
                setDreamState(prev => ({ ...prev, results: [] }));

                const keysToCleanup = [...new Set(
                    [...currentLibrary, ...currentResults].map(it => it?.storageKey).filter(Boolean)
                )];
                for (const key of keysToCleanup) {
                    await cleanupStorageIfUnreferenced(key, [], []);
                }

                if (currentLibrary.length) {
                    pushDeleteHistory({
                        id: `all-sets-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                        type: 'set',
                        label: 'All Sets',
                        items: currentLibrary
                    });
                }
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
                    onStop: handleStopDream,
                    onClearAll: handleDeleteAllGlobal,
                    isDreaming,
                    state: dreamState,
                    onDeleteResult: async (id) => {
                        const nextResults = removeResultsByFillMode(dreamState.results, (r) => r.id === id, dreamParams.resultFillMode);
                        const nextLibrary = savedLibrary;
                        const removed = dreamState.results.find(r => r.id === id);
                        setDreamState(p => ({ ...p, results: removeResultsByFillMode(p.results, (r) => r.id === id, dreamParams.resultFillMode) }));
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
                    reorderByDrag,
                    onSave: (it) => setSavedLibrary(p => [...p, { ...it, url: null }]),
                    onLoad: (cfg) => { setSteps(cfg); setActiveTab('builder'); },
                    onDelete: async (id) => {
                        const currentLibrary = savedLibraryRef.current || savedLibrary;
                        const currentResults = dreamResultsRef.current || dreamState.results;
                        const removed = currentLibrary.find(it => it.id === id);
                        if (!removed) return;
                        const targetStorageKey = removed.storageKey;
                        const nextLibrary = currentLibrary.filter(it => it.id !== id && (!targetStorageKey || it.storageKey !== targetStorageKey));
                        const nextResults = removeResultsByFillMode(
                            currentResults,
                            (it) => it.id === id || (targetStorageKey && it.storageKey === targetStorageKey),
                            dreamParams.resultFillMode
                        );
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
                    deleteAllSets: handleDeleteAllGlobal,
                    exportingSetId,
                    exportPhase,
                    exportError
                },
                engines: { preview: bER.current }
            };
        }
