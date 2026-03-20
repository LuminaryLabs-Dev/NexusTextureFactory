	        function useAppViewModel() {
            const [activeTab, setActiveTab] = useState('generator'); const [showGizmos, setShowGizmos] = useState(true); const [enableAI, setEnableAI] = useState(true); const [autoAnimateFrames, setAutoAnimateFrames] = useState(false); const [useWorkbenchSeed, setUseWorkbenchSeed] = useState(false); const [maskViewMode, setMaskViewMode] = useState(DEFAULT_MASK_VIEW_MODE); const [gridColumns, setGridColumns] = useState(DEFAULT_SET_GRID_COLUMNS);
            const [erosion, setErosion] = useState(0); const [profileName, setProfileName] = useState("Texture_01");
            const [storageUsedBytes, setStorageUsedBytes] = useState(0); const [storageQuotaBytes, setStorageQuotaBytes] = useState(0);
            const [selectedRes, setSelectedRes] = useState([2048]);
            const [steps, setSteps] = useState([{ id: 's1', typeDef: STEP_TYPES.BASE_SHAPE, active: true, blendMode: 0, params: STEP_TYPES.BASE_SHAPE.params, universal: { power: 1, mult: 1, scale: 1, offsetX: 0, offsetY: 0 }, previewUrl: null }]);
            const [previewUrls, setPreviewUrls] = useState([]); const [finalPreviewUrl, setFinalPreviewUrl] = useState(null);
	            const [customOperations, setCustomOperations] = useState([]);
            const [filterModules, setFilterModules] = useState(createDefaultFilterModules());
            const createDefaultQualityFilters = useCallback(() => ({
                alpha: { enabled: true, min: 0.05, max: 0.75, expanded: true },
                similarity: { enabled: false, maxSimilarity: 0.9, historySize: 200, expanded: false },
                shape: { enabled: false, minCircularity: 0.2, maxCircularity: 1.0, minSquareness: 0.2, maxSquareness: 1.0, expanded: false },
                temporalChange: { enabled: true, minChange: 0.04, maxChange: 0.95, maxJitter: 0.2, expanded: true },
                simplicity: { enabled: false, min: 0.1, max: 0.9, expanded: false }
            }), []);
            const mergeQualityFilters = useCallback((value) => {
                const defaults = createDefaultQualityFilters();
                const parsed = value && typeof value === 'object' ? value : {};
                return {
                    ...defaults,
                    ...parsed,
                    alpha: { ...defaults.alpha, ...(parsed.alpha || {}) },
                    similarity: { ...defaults.similarity, ...(parsed.similarity || {}) },
                    shape: { ...defaults.shape, ...(parsed.shape || {}) },
                    temporalChange: { ...defaults.temporalChange, ...(parsed.temporalChange || {}) },
                    simplicity: { ...defaults.simplicity, ...(parsed.simplicity || {}) }
                };
            }, [createDefaultQualityFilters]);
            const [qualityFilters, setQualityFilters] = useState(() => createDefaultQualityFilters());
            const normalizePackConfig = useCallback((value) => {
                const parsed = value && typeof value === 'object' ? value : {};
                return {
                    groupBy: 'set',
                    groupDepth: 1,
                    maxItemsPerPack: Math.max(1, Math.min(200, parseInt(parsed.maxItemsPerPack || 50, 10) || 50)),
                    sortBy: ['none', 'name', 'density', 'simplicity', 'circularity', 'squareness'].includes(parsed.sortBy) ? parsed.sortBy : 'none',
                    sortDir: parsed.sortDir === 'desc' ? 'desc' : 'asc',
                    setNameOverrides: {}
                };
            }, []);
            const [packConfig, setPackConfig] = useState(() => normalizePackConfig({}));
            const [flipbookConfig, setFlipbookConfig] = useState(createDefaultFlipbookConfig());
	            const [dreamParams, setDreamParams] = useState({ overdrive: 0, generationWorkers: 5, packagingWorkers: 5, refineCycles: 1, minDensity: 0.15, maxDensity: 0.75, minSimplicity: 0.1, maxSimplicity: 0.9, varianceStrictness: 0.1, randStrength: 0.5, flipFrames: 16, prompt: "", minComplexity: 5, maxComplexity: 10, resultFillMode: 'slide' });

		            const [isDreaming, setIsDreaming] = useState(false); const [dreamState, setDreamState] = useState({ results: [], rejectedIds: [], phase: '', rejectLabel: '', pendingAccepted: 0, pendingAttempts: 0, pendingRejected: 0, pendingBackfill: 0, activeGenWorkers: 0, activeBackfillWorkers: 0, stageRejects: { alpha: 0, simplicity: 0, shape: 0, similarity: 0, temporal: 0, other: 0 } });
            const [savedLibrary, setSavedLibrary] = useState([]); const [exportingSetId, setExportingSetId] = useState(null); const [exportPhase, setExportPhase] = useState(''); const [exportError, setExportError] = useState('');
            const [savedSets, setSavedSets] = useState([]);
            const [activeTargetSetId, setActiveTargetSetId] = useState(PRIMARY_SET_ID);
            const [selectedSetId, setSelectedSetId] = useState(PRIMARY_SET_ID);
            const [deleteHistory, setDeleteHistory] = useState([]);
	            const eR = useRef(null); const bER = useRef(null);
	            const generationEnginesRef = useRef([]);
	            const hasHydratedMetaRef = useRef(false);
	            const savedLibraryRef = useRef(savedLibrary);
	            const savedSetsRef = useRef(savedSets);
	            const dreamResultsRef = useRef(dreamState.results);
	            const deleteHistoryRef = useRef(deleteHistory);
	            const persistTimerRef = useRef(null);
            const hydratedLibraryUrlsRef = useRef(new Map());
            const dreamRunIdRef = useRef(0);
            const dreamStopRequestedRef = useRef(false);
            const clampSetGridColumns = (value) => {
                const parsed = Number.parseInt(value, 10);
                if (!Number.isFinite(parsed)) return DEFAULT_SET_GRID_COLUMNS;
                return Math.max(1, Math.min(12, parsed));
            };
            const areSetRecordsEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
            const buildSetRecord = useCallback((name, options = {}) => ({
                id: options.id || `set-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                name: String(name || 'Untitled Set').trim() || 'Untitled Set',
                itemIds: Array.isArray(options.itemIds) ? [...options.itemIds] : [],
                qualityFilters: mergeQualityFilters(options.qualityFilters),
                evaluationStage: options.evaluationStage === 'disabled' ? 'disabled' : DEFAULT_SET_EVALUATION_STAGE,
                failTargetSetId: options.failTargetSetId || null,
                system: !!options.system
            }), [mergeQualityFilters]);
            const normalizeSavedSets = useCallback((records, libraryItems = savedLibraryRef.current || []) => {
                const existingIds = new Set((libraryItems || []).map((item) => item.id));
                const seenSetIds = new Set();
                const claimedItemIds = new Set();
                const next = [];
                const appendSet = (candidate) => {
                    const nextId = candidate?.id || `set-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
                    if (seenSetIds.has(nextId)) return;
                    seenSetIds.add(nextId);
                    const merged = buildSetRecord(candidate?.name || 'Untitled Set', {
                        ...candidate,
                        id: nextId
                    });
                    const nextItemIds = [];
                    (merged.itemIds || []).forEach((itemId) => {
                        if (!existingIds.has(itemId) || claimedItemIds.has(itemId)) return;
                        claimedItemIds.add(itemId);
                        nextItemIds.push(itemId);
                    });
                    next.push({
                        ...merged,
                        itemIds: nextItemIds,
                        system: merged.system || nextId === PRIMARY_SET_ID || nextId === REJECTS_SET_ID
                    });
                };

                if (Array.isArray(records)) records.forEach((record) => appendSet(record));
                if (!seenSetIds.has(PRIMARY_SET_ID)) {
                    appendSet({
                        id: PRIMARY_SET_ID,
                        name: 'Volume 1',
                        qualityFilters,
                        evaluationStage: DEFAULT_SET_EVALUATION_STAGE,
                        failTargetSetId: REJECTS_SET_ID,
                        system: true
                    });
                }
                if (!seenSetIds.has(REJECTS_SET_ID)) {
                    appendSet({
                        id: REJECTS_SET_ID,
                        name: 'Rejects',
                        qualityFilters,
                        evaluationStage: 'disabled',
                        failTargetSetId: null,
                        system: true
                    });
                }

                const unassignedIds = [...existingIds].filter((itemId) => !claimedItemIds.has(itemId));
                if (unassignedIds.length > 0) {
                    const primaryIndex = next.findIndex((set) => set.id === PRIMARY_SET_ID);
                    if (primaryIndex >= 0) {
                        next[primaryIndex] = {
                            ...next[primaryIndex],
                            itemIds: [...next[primaryIndex].itemIds, ...unassignedIds]
                        };
                    }
                }

                const validSetIds = new Set(next.map((set) => set.id));
                return next.map((set) => {
                    const isRejects = set.id === REJECTS_SET_ID;
                    const failTargetValid = !!set.failTargetSetId && set.failTargetSetId !== set.id && validSetIds.has(set.failTargetSetId);
                    return {
                        ...set,
                        qualityFilters: mergeQualityFilters(set.qualityFilters),
                        evaluationStage: isRejects ? 'disabled' : (set.evaluationStage === 'disabled' ? 'disabled' : DEFAULT_SET_EVALUATION_STAGE),
                        failTargetSetId: isRejects ? null : (failTargetValid ? set.failTargetSetId : REJECTS_SET_ID),
                        system: set.system || isRejects || set.id === PRIMARY_SET_ID
                    };
                });
            }, [buildSetRecord, mergeQualityFilters, qualityFilters]);

	            useEffect(() => { eR.current = new TextureEngine(256, 256); bER.current = new TextureEngine(256, 256); }, []);
	            useEffect(() => {
                if (!eR.current) return;
                eR.current.renderStack(steps);
                const nextPreviewUrls = steps.map((_, i) => eR.current.getTextureUrl(i, { mode: maskViewMode }));
                const nextFinalPreviewUrl = nextPreviewUrls[steps.length - 1] || null;
                setPreviewUrls((prev) => {
                    if (prev.length === nextPreviewUrls.length && prev.every((url, idx) => url === nextPreviewUrls[idx])) return prev;
                    return nextPreviewUrls;
                });
                setFinalPreviewUrl((prev) => prev === nextFinalPreviewUrl ? prev : nextFinalPreviewUrl);
                setSteps((prev) => {
                    let changed = prev.length !== nextPreviewUrls.length;
                    const next = prev.map((step, idx) => {
                        const previewUrl = nextPreviewUrls[idx] || null;
                        if (step.previewUrl === previewUrl) return step;
                        changed = true;
                        return { ...step, previewUrl };
                    });
                    return changed ? next : prev;
                });
            }, [steps, maskViewMode]);
	            useEffect(() => { savedLibraryRef.current = savedLibrary; }, [savedLibrary]);
	            useEffect(() => { savedSetsRef.current = savedSets; }, [savedSets]);
	            useEffect(() => { dreamResultsRef.current = dreamState.results; }, [dreamState.results]);
	            useEffect(() => { deleteHistoryRef.current = deleteHistory; }, [deleteHistory]);
            useEffect(() => () => {
                hydratedLibraryUrlsRef.current.forEach((url) => {
                    if (url) URL.revokeObjectURL(url);
                });
                hydratedLibraryUrlsRef.current.clear();
            }, []);
	            useEffect(() => {
	                setDreamState(prev => {
	                    const prevResults = Array.isArray(prev.results) ? prev.results : [];
	                    const prevReal = prevResults.filter(it => it && !it.__slotOpen && it.id);
	                    const prevById = new Map(prevReal.map(it => [it.id, it]));
	                    const nextResults = savedLibrary.map(libItem => {
	                        const prevItem = prevById.get(libItem.id);
	                        const resolvedUrl = libItem.url || prevItem?.url || null;
	                        return { ...libItem, url: resolvedUrl };
	                    });
	                    if (nextResults.length === prevResults.length) {
	                        let sameOrder = true;
	                        for (let i = 0; i < nextResults.length; i++) {
	                            if (nextResults[i]?.id !== prevResults[i]?.id || nextResults[i]?.url !== prevResults[i]?.url) {
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
                function hydrateStepDefaults(step) {
                    if (!step || typeof step !== 'object') return step;
                    const stepKey = resolveStepKey(step);
                    const typeDef = stepKey ? (STEP_TYPES[stepKey] || step.typeDef) : step.typeDef;
                    return {
                        ...step,
                        typeDef,
                        params: { ...(typeDef?.params || {}), ...(step.params || {}) },
                        universal: { power: 1.0, mult: 1.0, scale: 1.0, offsetX: 0.0, offsetY: 0.0, ...(step.universal || {}) }
                    };
                }
                function hydrateConfigDefaults(config) {
                    if (!Array.isArray(config)) return [];
                    return config.map((step) => hydrateStepDefaults(step));
                }
	            useEffect(() => {
	                try {
	                    const rawWorkspace = localStorage.getItem(V3_WORKSPACE_STORAGE_KEY);
	                    if (rawWorkspace) {
	                        const parsed = JSON.parse(rawWorkspace);
	                        if (parsed && typeof parsed === 'object') {
                                const hydratedLibrary = Array.isArray(parsed.library)
                                    ? parsed.library.map((item) => ({ ...item, config: hydrateConfigDefaults(item?.config) }))
                                    : [];
	                            setSavedLibrary(hydratedLibrary);
                                setSavedSets(normalizeSavedSets(parsed.sets, hydratedLibrary));
                                if (Array.isArray(parsed.customOperations)) setCustomOperations(parsed.customOperations);
                                if (Array.isArray(parsed.filterModules)) {
                                    const defaultsById = new Map(createDefaultFilterModules().map((item) => [item.id, item]));
                                    setFilterModules(parsed.filterModules.map((item) => {
                                        const base = defaultsById.get(item.id) || createDefaultFilterModules().find((candidate) => candidate.key === item.key) || item;
                                        return {
                                            ...base,
                                            ...item,
                                            params: { ...(base.params || {}), ...(item.params || {}) },
                                            universal: { ...(base.universal || {}), ...(item.universal || {}) }
                                        };
                                    }));
                                }
                                if (parsed.defaultQualityFilters && typeof parsed.defaultQualityFilters === 'object') {
                                    setQualityFilters(mergeQualityFilters(parsed.defaultQualityFilters));
                                }
                                if (parsed.dreamParams && typeof parsed.dreamParams === 'object') {
                                    const nextMinComplexity = Math.max(1, Math.min(20, parseInt(parsed.dreamParams.minComplexity ?? 5, 10)));
                                    const nextMaxComplexity = Math.max(nextMinComplexity, Math.min(20, parseInt(parsed.dreamParams.maxComplexity ?? 10, 10)));
                                    const nextOverdrive = Math.max(0, Math.min(1, Number(parsed.dreamParams.overdrive ?? 0)));
                                    const nextResultFillMode = parsed.dreamParams.resultFillMode === 'slot' ? 'slot' : 'slide';
                                    setDreamParams(prev => ({
                                        ...prev,
                                        ...parsed.dreamParams,
                                        overdrive: nextOverdrive,
                                        minComplexity: nextMinComplexity,
                                        maxComplexity: nextMaxComplexity,
                                        resultFillMode: nextResultFillMode
                                    }));
                                }
                                if (parsed.uiPrefs && typeof parsed.uiPrefs === 'object') {
                                    if (typeof parsed.uiPrefs.autoAnimateFrames === 'boolean') setAutoAnimateFrames(parsed.uiPrefs.autoAnimateFrames);
                                    if (typeof parsed.uiPrefs.useWorkbenchSeed === 'boolean') setUseWorkbenchSeed(parsed.uiPrefs.useWorkbenchSeed);
                                    if (parsed.uiPrefs.maskViewMode === 'bw' || parsed.uiPrefs.maskViewMode === 'transparent') setMaskViewMode(parsed.uiPrefs.maskViewMode);
                                    setGridColumns(clampSetGridColumns(parsed.uiPrefs.gridColumns ?? DEFAULT_SET_GRID_COLUMNS));
                                    if (typeof parsed.uiPrefs.activeTargetSetId === 'string') setActiveTargetSetId(parsed.uiPrefs.activeTargetSetId);
                                    if (typeof parsed.uiPrefs.selectedSetId === 'string') setSelectedSetId(parsed.uiPrefs.selectedSetId);
                                }
                                if (parsed.packConfig && typeof parsed.packConfig === 'object') {
                                    setPackConfig(normalizePackConfig(parsed.packConfig));
                                }
                                if (parsed.flipbookConfig) {
                                    setFlipbookConfig(mergeFlipbookConfig(parsed.flipbookConfig));
                                }
                            }
	                    } else {
                            setSavedSets(normalizeSavedSets([], []));
                        }
                } catch (_) {
                        setSavedSets(normalizeSavedSets([], []));
                    }
                hasHydratedMetaRef.current = true;
            }, [mergeFlipbookConfig, mergeQualityFilters, normalizePackConfig, normalizeSavedSets]);
            useEffect(() => {
                const activeIds = new Set(savedLibrary.map((item) => item.id));
                hydratedLibraryUrlsRef.current.forEach((url, id) => {
                    if (activeIds.has(id)) return;
                    if (url) URL.revokeObjectURL(url);
                    hydratedLibraryUrlsRef.current.delete(id);
                });
            }, [savedLibrary]);
            useEffect(() => {
                setSavedSets((prev) => {
                    const next = normalizeSavedSets(prev, savedLibrary);
                    return areSetRecordsEqual(prev, next) ? prev : next;
                });
            }, [savedLibrary, normalizeSavedSets]);
            const normalizeExportStem = useCallback((value) => {
                const raw = String(value || '').trim();
                const tokens = raw.match(/[A-Za-z0-9]+/g) || [];
                if (tokens.length === 0) return 'TexturePack';
                const stem = tokens.map((token) => token.charAt(0).toUpperCase() + token.slice(1)).join('');
                return stem || 'TexturePack';
            }, []);
            const OUTPUT_EXPORT_MODES = ['transparent'];
            const getOutputFileSuffix = () => '';
            const buildOutputFileName = (stem, mode) => {
                const suffix = getOutputFileSuffix(mode);
                return suffix ? `${stem}_${suffix}.png` : `${stem}.png`;
            };
            const sortItemsForPack = useCallback((items, config = packConfig) => {
                if (!Array.isArray(items)) return [];
                if ((config?.sortBy || 'none') === 'none') return [...items];
                const next = [...items];
                next.sort((a, b) => {
                    let av = a?.name;
                    let bv = b?.name;
                    if (config.sortBy === 'density') { av = a?.density || 0; bv = b?.density || 0; }
                    else if (config.sortBy === 'simplicity') { av = a?.sScore || 0; bv = b?.sScore || 0; }
                    else if (config.sortBy === 'circularity') { av = a?.circularity || 0; bv = b?.circularity || 0; }
                    else if (config.sortBy === 'squareness') { av = a?.squareness || 0; bv = b?.squareness || 0; }
                    let result = 0;
                    if (typeof av === 'number' && typeof bv === 'number') result = av - bv;
                    else result = String(av || '').localeCompare(String(bv || ''));
                    return config.sortDir === 'desc' ? -result : result;
                });
                return next;
            }, [packConfig]);
            useEffect(() => {
                const targets = savedLibrary.filter((item) => item?.id && item?.storageKey && !item?.url);
                if (targets.length === 0) return;
                let cancelled = false;
                let applied = false;
                const pendingUrls = [];
                (async () => {
                    const resolvedUrls = new Map();
                    for (const item of targets) {
                        try {
                            const blob = await loadTextureBlob(item.storageKey);
                            if (!blob || cancelled) continue;
                            const objectUrl = URL.createObjectURL(blob);
                            pendingUrls.push(objectUrl);
                            resolvedUrls.set(item.id, objectUrl);
                        } catch (_) { }
                    }
                    if (cancelled || resolvedUrls.size === 0) {
                        pendingUrls.forEach((url) => URL.revokeObjectURL(url));
                        return;
                    }
                    setSavedLibrary((prev) => {
                        let changed = false;
                        const next = prev.map((item) => {
                            const hydratedUrl = resolvedUrls.get(item.id);
                            if (!hydratedUrl || item.url) return item;
                            changed = true;
                            const priorHydratedUrl = hydratedLibraryUrlsRef.current.get(item.id);
                            if (priorHydratedUrl && priorHydratedUrl !== hydratedUrl) {
                                URL.revokeObjectURL(priorHydratedUrl);
                            }
                            hydratedLibraryUrlsRef.current.set(item.id, hydratedUrl);
                            return { ...item, url: hydratedUrl };
                        });
                        if (!changed) {
                            resolvedUrls.forEach((url) => URL.revokeObjectURL(url));
                            return prev;
                        }
                        applied = true;
                        return next;
                    });
                })();
                return () => {
                    cancelled = true;
                    if (!applied) {
                        pendingUrls.forEach((url) => URL.revokeObjectURL(url));
                    }
                };
            }, [savedLibrary]);
	            useEffect(() => {
	                if (!hasHydratedMetaRef.current) return;
	                if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
	                persistTimerRef.current = setTimeout(() => {
	                    persistTimerRef.current = null;
	                    try {
                            const normalizedSets = normalizeSavedSets(savedSets, savedLibrary);
	                        localStorage.setItem(V3_WORKSPACE_STORAGE_KEY, JSON.stringify({
                                version: 3,
                                library: savedLibrary.map((item) => ({ ...item, url: null })),
                                sets: normalizedSets,
                                customOperations,
                                filterModules,
                                defaultQualityFilters: qualityFilters,
                                dreamParams,
                                uiPrefs: {
                                    autoAnimateFrames,
                                    useWorkbenchSeed,
                                    maskViewMode,
                                    gridColumns,
                                    activeTargetSetId,
                                    selectedSetId
                                },
                                packConfig,
                                flipbookConfig
                            }));
                    } catch (_) { }
                }, 220);
	                return () => {
	                    if (persistTimerRef.current) {
	                        clearTimeout(persistTimerRef.current);
	                        persistTimerRef.current = null;
	                    }
	                };
            }, [savedLibrary, savedSets, customOperations, filterModules, qualityFilters, dreamParams, autoAnimateFrames, useWorkbenchSeed, maskViewMode, gridColumns, packConfig, flipbookConfig, activeTargetSetId, selectedSetId, normalizeSavedSets]);

            const sets = useMemo(() => {
                const libraryById = new Map(savedLibrary.map((item) => [item.id, item]));
                return normalizeSavedSets(savedSets, savedLibrary).map((setRecord) => ({
                    ...setRecord,
                    items: sortItemsForPack(setRecord.itemIds.map((itemId) => libraryById.get(itemId)).filter(Boolean))
                }));
            }, [savedLibrary, savedSets, normalizeSavedSets, sortItemsForPack]);
            const setMap = useMemo(() => new Map(sets.map((set) => [set.id, set])), [sets]);
            const selectedSet = setMap.get(selectedSetId) || sets[0] || null;
            const activeTargetSet = setMap.get(activeTargetSetId) || setMap.get(PRIMARY_SET_ID) || sets[0] || null;
            const resolveFailTargetSetId = useCallback((setRecord, setRecords) => {
                const fallbackId = setRecords.some((candidate) => candidate.id === REJECTS_SET_ID)
                    ? REJECTS_SET_ID
                    : (setRecords[0]?.id || null);
                if (!setRecord?.failTargetSetId) return fallbackId;
                if (setRecord.failTargetSetId === setRecord.id) return fallbackId;
                return setRecords.some((candidate) => candidate.id === setRecord.failTargetSetId)
                    ? setRecord.failTargetSetId
                    : fallbackId;
            }, []);
            const getSetNameById = useCallback((setId, records = sets) => {
                const match = records.find((record) => record.id === setId);
                return match?.name || 'Unassigned';
            }, [sets]);
            const getItemSetId = useCallback((itemId, records = sets) => {
                const match = records.find((record) => record.itemIds.includes(itemId));
                return match?.id || null;
            }, [sets]);

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

            useEffect(() => {
                const validIds = new Set(sets.map((set) => set.id));
                const fallbackId = validIds.has(PRIMARY_SET_ID) ? PRIMARY_SET_ID : (sets[0]?.id || null);
                if (!fallbackId) return;
                setSelectedSetId((prev) => validIds.has(prev) ? prev : fallbackId);
                setActiveTargetSetId((prev) => validIds.has(prev) ? prev : fallbackId);
            }, [sets]);

            const extractItemAnalysis = (item) => ({
                density: Number(item?.density || 0),
                sScore: Number(item?.sScore || 0),
                circularity: Number(item?.circularity || 0),
                squareness: Number(item?.squareness || 0),
                changeScore: Number(item?.changeScore || 0),
                jitterScore: Number(item?.jitterScore || 0),
                hash: item?.hash || ''
            });

            const runStageAlphaAndSimplicityGate = (analysis, filters) => {
                const alphaFilter = filters.alpha;
                if (alphaFilter.enabled && (analysis.density < alphaFilter.min || analysis.density > alphaFilter.max)) return { pass: false, reason: 'alpha' };
                const simplicityFilter = filters.simplicity;
                if (simplicityFilter.enabled && (analysis.sScore < simplicityFilter.min || analysis.sScore > simplicityFilter.max)) return { pass: false, reason: 'simplicity' };
                return { pass: true, reason: '' };
            };

            const runStageShapeGate = (analysis, filters) => {
                const shapeFilter = filters.shape;
                if (!shapeFilter.enabled) return { pass: true, reason: '' };
                if (analysis.circularity < shapeFilter.minCircularity || analysis.circularity > shapeFilter.maxCircularity) return { pass: false, reason: 'shape' };
                if (analysis.squareness < shapeFilter.minSquareness || analysis.squareness > shapeFilter.maxSquareness) return { pass: false, reason: 'shape' };
                return { pass: true, reason: '' };
            };

            const runStageSimilarityGate = (analysis, recentHashes, filters) => {
                const similarityFilter = filters.similarity;
                if (!similarityFilter.enabled || !analysis.hash) return { pass: true, reason: '', similarity: 0 };
                const bestSimilarity = getBestSimilarity(analysis.hash, recentHashes, similarityFilter.historySize);
                if (bestSimilarity > similarityFilter.maxSimilarity) return { pass: false, reason: 'similarity', similarity: bestSimilarity };
                return { pass: true, reason: '', similarity: bestSimilarity };
            };

            const runStageTemporalGate = (analysis, filters) => {
                const temporalFilter = filters.temporalChange;
                if (!temporalFilter.enabled) return { pass: true, reason: '' };
                const changeScore = Number(analysis.changeScore || 0);
                const jitterScore = Number(analysis.jitterScore || 0);
                if (changeScore < temporalFilter.minChange || changeScore > temporalFilter.maxChange) return { pass: false, reason: 'temporal' };
                if (jitterScore > temporalFilter.maxJitter) return { pass: false, reason: 'temporal' };
                return { pass: true, reason: '' };
            };

            const assignItemsToSetWithRouting = useCallback((setRecords, entries, libraryItems) => {
                const normalized = normalizeSavedSets(setRecords, libraryItems).map((setRecord) => ({
                    ...setRecord,
                    itemIds: [...setRecord.itemIds],
                    qualityFilters: mergeQualityFilters(setRecord.qualityFilters)
                }));
                const stageCounts = createStageRejectCounters();
                const itemAssignments = [];
                const setById = new Map(normalized.map((setRecord) => [setRecord.id, setRecord]));
                const libraryById = new Map((libraryItems || []).map((item) => [item.id, item]));
                const setHashes = new Map(normalized.map((setRecord) => [
                    setRecord.id,
                    setRecord.itemIds.map((itemId) => libraryById.get(itemId)?.hash).filter(Boolean)
                ]));
                const appendToSet = (setId, itemId) => {
                    const targetSet = setById.get(setId);
                    const item = libraryById.get(itemId);
                    if (!targetSet || !item) return;
                    if (!targetSet.itemIds.includes(itemId)) targetSet.itemIds.push(itemId);
                    if (item.hash) {
                        const hashes = setHashes.get(setId) || [];
                        hashes.push(item.hash);
                        setHashes.set(setId, hashes);
                    }
                };
                const removeFromAllSets = (itemId) => {
                    normalized.forEach((setRecord) => {
                        if (!setRecord.itemIds.includes(itemId)) return;
                        setRecord.itemIds = setRecord.itemIds.filter((candidateId) => candidateId !== itemId);
                    });
                };

                (entries || []).forEach((entry) => {
                    const item = entry?.item;
                    if (!item?.id) return;
                    removeFromAllSets(item.id);
                    const requestedTargetId = entry?.targetSetId;
                    const targetSet = setById.get(requestedTargetId) || setById.get(PRIMARY_SET_ID) || normalized[0] || null;
                    if (!targetSet) return;

                    let finalSetId = targetSet.id;
                    let reason = '';
                    if (targetSet.evaluationStage !== 'disabled') {
                        const filters = mergeQualityFilters(targetSet.qualityFilters);
                        const analysis = extractItemAnalysis(item);
                        const stageAlpha = runStageAlphaAndSimplicityGate(analysis, filters);
                        const stageShape = runStageShapeGate(analysis, filters);
                        const stageSimilarity = runStageSimilarityGate(analysis, setHashes.get(targetSet.id) || [], filters);
                        const stageTemporal = runStageTemporalGate(analysis, filters);
                        const firstFailure = [stageAlpha, stageShape, stageSimilarity, stageTemporal].find((stage) => !stage.pass);
                        if (firstFailure) {
                            reason = firstFailure.reason || 'other';
                            countReject(stageCounts, reason);
                            finalSetId = resolveFailTargetSetId(targetSet, normalized);
                        }
                    }

                    appendToSet(finalSetId, item.id);
                    itemAssignments.push({
                        itemId: item.id,
                        requestedSetId: targetSet.id,
                        finalSetId,
                        reason,
                        routed: finalSetId !== targetSet.id
                    });
                });

                return {
                    sets: normalizeSavedSets(normalized, libraryItems),
                    itemAssignments,
                    stageRejects: stageCounts
                };
            }, [mergeQualityFilters, normalizeSavedSets, resolveFailTargetSetId]);

            const reorderByDrag = (sourceId, targetId) => {
                const reorderEnabled = (packConfig?.sortBy || 'none') === 'none';
                const targetSetRecord = selectedSet || activeTargetSet || null;
                if (!reorderEnabled || !targetSetRecord || !sourceId || !targetId || sourceId === targetId) return;
                setSavedSets((prev) => {
                    const normalized = normalizeSavedSets(prev, savedLibraryRef.current);
                    const next = normalized.map((setRecord) => {
                        if (setRecord.id !== targetSetRecord.id) return setRecord;
                        const fromIndex = setRecord.itemIds.findIndex((itemId) => itemId === sourceId);
                        const toIndex = setRecord.itemIds.findIndex((itemId) => itemId === targetId);
                        if (fromIndex < 0 || toIndex < 0) return setRecord;
                        return { ...setRecord, itemIds: moveArrayItem(setRecord.itemIds, fromIndex, toIndex) };
                    });
                    return normalizeSavedSets(next, savedLibraryRef.current);
                });
            };
            const moveSetItemToIndex = (itemId, toIndex) => {
                const reorderEnabled = (packConfig?.sortBy || 'none') === 'none';
                const targetSetRecord = selectedSet || activeTargetSet || null;
                if (!reorderEnabled || !targetSetRecord || !itemId) return;
                setSavedSets((prev) => {
                    const normalized = normalizeSavedSets(prev, savedLibraryRef.current);
                    const next = normalized.map((setRecord) => {
                        if (setRecord.id !== targetSetRecord.id) return setRecord;
                        const fromIndex = setRecord.itemIds.findIndex((candidateId) => candidateId === itemId);
                        if (fromIndex < 0) return setRecord;
                        const boundedTarget = Math.max(0, Math.min(toIndex, setRecord.itemIds.length - 1));
                        return { ...setRecord, itemIds: moveArrayItem(setRecord.itemIds, fromIndex, boundedTarget) };
                    });
                    return normalizeSavedSets(next, savedLibraryRef.current);
                });
            };
            const sendToFront = (itemId) => moveSetItemToIndex(itemId, 0);
            const sendToBack = (itemId) => {
                const total = selectedSet?.itemIds?.length || 0;
                moveSetItemToIndex(itemId, Math.max(0, total - 1));
            };

            const createSet = () => {
                const nextSetName = (() => {
                    const names = new Set((savedSetsRef.current || []).map((setRecord) => setRecord.name));
                    let volumeNumber = 1;
                    while (names.has(`Volume ${volumeNumber}`)) volumeNumber++;
                    return `Volume ${volumeNumber}`;
                })();
                const nextSet = buildSetRecord(nextSetName, {
                    qualityFilters,
                    evaluationStage: DEFAULT_SET_EVALUATION_STAGE,
                    failTargetSetId: REJECTS_SET_ID
                });
                setSavedSets((prev) => normalizeSavedSets([...normalizeSavedSets(prev, savedLibraryRef.current), nextSet], savedLibraryRef.current));
                setSelectedSetId(nextSet.id);
                return nextSet;
            };

            const handleRenameSet = (targetSet, newName) => {
                const trimmedName = String(newName || '').trim();
                if (!targetSet?.id || !trimmedName) return;
                setSavedSets((prev) => prev.map((setRecord) => setRecord.id === targetSet.id ? { ...setRecord, name: trimmedName } : setRecord));
            };
            const updateSetPolicy = (setId, patch) => {
                setSavedSets((prev) => normalizeSavedSets(prev.map((setRecord) => {
                    if (setRecord.id !== setId) return setRecord;
                    const nextFailTarget = patch?.failTargetSetId === setId ? REJECTS_SET_ID : patch?.failTargetSetId;
                    return {
                        ...setRecord,
                        ...patch,
                        failTargetSetId: typeof nextFailTarget === 'undefined' ? setRecord.failTargetSetId : nextFailTarget
                    };
                }), savedLibraryRef.current));
            };
            const updateSetQuality = (setId, section, key, value) => {
                setSavedSets((prev) => normalizeSavedSets(prev.map((setRecord) => {
                    if (setRecord.id !== setId) return setRecord;
                    return {
                        ...setRecord,
                        qualityFilters: {
                            ...mergeQualityFilters(setRecord.qualityFilters),
                            [section]: {
                                ...mergeQualityFilters(setRecord.qualityFilters)[section],
                                [key]: value
                            }
                        }
                    };
                }), savedLibraryRef.current));
            };
            const toggleSetQualityEnabled = (setId, section) => {
                setSavedSets((prev) => normalizeSavedSets(prev.map((setRecord) => {
                    if (setRecord.id !== setId) return setRecord;
                    const merged = mergeQualityFilters(setRecord.qualityFilters);
                    return {
                        ...setRecord,
                        qualityFilters: {
                            ...merged,
                            [section]: {
                                ...merged[section],
                                enabled: !merged[section].enabled
                            }
                        }
                    };
                }), savedLibraryRef.current));
            };
            const toggleSetQualityExpanded = (setId, section) => {
                setSavedSets((prev) => normalizeSavedSets(prev.map((setRecord) => {
                    if (setRecord.id !== setId) return setRecord;
                    const merged = mergeQualityFilters(setRecord.qualityFilters);
                    return {
                        ...setRecord,
                        qualityFilters: {
                            ...merged,
                            [section]: {
                                ...merged[section],
                                expanded: !merged[section].expanded
                            }
                        }
                    };
                }), savedLibraryRef.current));
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
            const UNIVERSAL_VARIATION_RANGES = {
                power: { min: 0, max: 4, step: 0.05 },
                mult: { min: 0, max: 5, step: 0.05 },
                scale: { min: 0, max: 2, step: 0.01 }
            };
            const clampValue = (value, min, max) => Math.min(max, Math.max(min, value));
            const quantizeValue = (value, step) => {
                if (!step || step <= 0) return value;
                return Math.round(value / step) * step;
            };
            const varyBoundedValue = (baseValue, range, strength) => {
                const numericBase = Number(baseValue);
                if (!Number.isFinite(numericBase)) return baseValue;
                const boundedStrength = clampValue(Number(strength) || 0, 0, 1);
                if (boundedStrength <= 0) return clampValue(numericBase, range.min, range.max);
                const span = Number(range.max) - Number(range.min);
                const jitter = (Math.random() * 2 - 1) * span * boundedStrength;
                const nextValue = clampValue(numericBase + jitter, range.min, range.max);
                const quantized = quantizeValue(nextValue, range.step);
                return clampValue(quantized, range.min, range.max);
            };
            const createDreamStepId = (prefix, index) => `${prefix}-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`;
            const cloneSeedStepForDream = (step, index, variationStrength) => {
                const nextParams = { ...(step.params || {}) };
                const controls = Array.isArray(step?.typeDef?.controls) ? step.typeDef.controls : [];
                controls.forEach((control) => {
                    if (control.type !== 'slider') return;
                    if (!Object.prototype.hasOwnProperty.call(nextParams, control.key)) return;
                    nextParams[control.key] = varyBoundedValue(nextParams[control.key], control, variationStrength);
                });
                const nextUniversal = { ...(step.universal || {}) };
                Object.entries(UNIVERSAL_VARIATION_RANGES).forEach(([key, range]) => {
                    if (!Object.prototype.hasOwnProperty.call(nextUniversal, key)) return;
                    nextUniversal[key] = varyBoundedValue(nextUniversal[key], range, variationStrength);
                });
                return {
                    ...step,
                    id: createDreamStepId('seed', index),
                    params: nextParams,
                    universal: nextUniversal,
                    previewUrl: null
                };
            };
            const createRandomBaseStep = () => {
                const gens = ['BASE_SHAPE', 'BASE_GRAD'];
                const baseKey = gens[Math.floor(Math.random() * gens.length)];
                const baseDef = STEP_TYPES[baseKey];
                const baseParams = { ...baseDef.params };
                baseDef.controls.forEach((control) => {
                    if (control.type !== 'slider') return;
                    baseParams[control.key] = control.min + Math.random() * (control.max - control.min);
                });
                return {
                    id: createDreamStepId('base', 0),
                    typeDef: baseDef,
                    active: true,
                    blendMode: 0,
                    params: baseParams,
                    universal: { power: 1.0, mult: 1.0, scale: 1.0, offsetX: 0.0, offsetY: 0.0 },
                    previewUrl: null
                };
            };
            const createRandomOperationStep = (ops, index) => {
                const key = ops[Math.floor(Math.random() * ops.length)];
                const def = STEP_TYPES[key];
                const params = { ...def.params };
                def.controls.forEach((control) => {
                    if (control.type !== 'slider') return;
                    params[control.key] = control.min + Math.random() * (control.max - control.min);
                });
                return {
                    id: createDreamStepId('op', index),
                    typeDef: def,
                    active: true,
                    blendMode: def.cat === 'GEN' ? 0 : (def.cat === 'ERODE' ? 1 : 2),
                    params,
                    universal: { power: 1.0, mult: 1.0, scale: 1.0, offsetX: 0.0, offsetY: 0.0 },
                    previewUrl: null
                };
            };
            const appendDreamTailSteps = (baseSteps, enabledFilterTemplates) => {
                const next = [...baseSteps];
                enabledFilterTemplates.forEach((step, idx) => next.push({ ...step, id: createDreamStepId(`gf-${idx}`, idx), previewUrl: null }));
                const vignetteDef = STEP_TYPES.VIGNETTE;
                next.push({
                    id: createDreamStepId('v', next.length),
                    typeDef: vignetteDef,
                    active: true,
                    blendMode: 2,
                    params: { ...vignetteDef.params, p1: 1, p2: 0.45, p3: 0.2 },
                    universal: { power: 1.0, mult: 1.0, scale: 1.0, offsetX: 0.0, offsetY: 0.0 },
                    previewUrl: null
                });
                return next;
            };
            const buildDreamSeedConfig = (ops, enabledFilterTemplates) => {
                const activeSeedSteps = steps.filter((step) => step?.active);
                const useSeed = useWorkbenchSeed && activeSeedSteps.length > 0;
                if (!useSeed) return null;
                const targetCount = Math.floor(Math.random() * (dreamParams.maxComplexity - dreamParams.minComplexity + 1)) + dreamParams.minComplexity;
                const variedSeed = activeSeedSteps.map((step, index) => cloneSeedStepForDream(step, index, dreamParams.randStrength));
                const extrasNeeded = Math.max(0, targetCount - variedSeed.length);
                for (let i = 0; i < extrasNeeded; i++) {
                    variedSeed.push(createRandomOperationStep(ops, i));
                }
                return appendDreamTailSteps(variedSeed, enabledFilterTemplates);
            };

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
                const dreamTargetSetId = activeTargetSetId || PRIMARY_SET_ID;
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
                const baseOps = ['NOISE_PERLIN', 'NOISE_WORLEY', 'FRACTAL', 'SPIRAL', 'THRESHOLD', 'VIGNETTE', 'SMEAR', 'DOMAIN_WARP', 'RADIAL_WARP', 'KALEIDOSCOPE_PLUS', 'MORPH_DILATE_ERODE', 'MORPH_OPEN_CLOSE', 'EDGE_SOBEL', 'OUTLINE_ALPHA', 'POSTERIZE_ALPHA', 'DISTANCE_BANDS', 'GRUNGE_SCRATCH'];
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
                    let toResults = pendingResultItems.splice(0, pendingResultItems.length);
                    if (toLibrary.length) {
                        const nextLibrary = [...(savedLibraryRef.current || []), ...toLibrary];
                        const routing = assignItemsToSetWithRouting(
                            savedSetsRef.current || [],
                            toLibrary.map((item) => ({ item, targetSetId: dreamTargetSetId })),
                            nextLibrary
                        );
                        acceptedTotal += routing.itemAssignments.filter((entry) => !entry.routed).length;
                        rejectedTotal += routing.itemAssignments.filter((entry) => entry.routed).length;
                        Object.entries(routing.stageRejects).forEach(([key, value]) => {
                            if (Object.prototype.hasOwnProperty.call(stageRejects, key)) stageRejects[key] += value;
                        });
                        const assignedSetByItemId = new Map(routing.itemAssignments.map((entry) => [entry.itemId, entry.finalSetId]));
                        toResults = toResults.map((item) => ({ ...item, setId: assignedSetByItemId.get(item.id) || dreamTargetSetId }));
                        setSavedLibrary(nextLibrary);
                        setSavedSets(routing.sets);
                    }
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
	                    const ns = [createRandomBaseStep()];
	                    for (let i = 0; i < count; i++) {
	                        ns.push(createRandomOperationStep(ops, i));
	                    }
	                    return appendDreamTailSteps(ns, enabledFilterTemplates);
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
	                                const cfg = buildDreamSeedConfig(ops, enabledFilterTemplates) || buildRandomConfig();
                                const needsLibraryTexture = hasLibrarySamples && cfg.some(s => s?.typeDef && (s.typeDef.id === 110 || s.typeDef.id === 111));
                                const librarySource = needsLibraryTexture && libraryRenderCache.length > 0 ? libraryRenderCache[Math.floor(Math.random() * libraryRenderCache.length)] : null;
                                const renderOptions = librarySource ? { librarySource } : undefined;

                                // Stage 1/2/3 gates: one render, then low-cost checks.
                                workerEngine.renderStack(cfg, renderOptions);
                                const analysis = workerEngine.analyzeTexture(cfg.length - 1);

                                // Stage 4 gate: expensive temporal check at lower resolution and fewer frames.
                                const temporalMetrics = computeTemporalMetricsForConfig(workerEngine, cfg, temporalFrameCount, `dream-${loopCounter}-${jobIndex}-${attempt}`, renderOptions);
                                analysis.changeScore = temporalMetrics.changeScore;
                                analysis.jitterScore = temporalMetrics.jitterScore;

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
	                    const exportStem = normalizeExportStem(targetSet.name);
	                    const packWorkers = Math.max(1, Math.min(MAX_PACKAGING_WORKERS, parseInt(dreamParams.packagingWorkers || 1)));
                        const itemsPerPack = Math.max(1, parseInt(packConfig?.maxItemsPerPack || 50, 10) || 50);
                        const targetItems = sortItemsForPack(targetSet.items, packConfig);
	                    for (const r of rs) {
	                        setExportPhase(`Exporting ${r}px textures...`);
	                        const resFolder = zip.folder(`${exportStem}_${r}`);
	                        const rendered = new Array(targetItems.length);
	                        const engines = Array.from({ length: Math.min(packWorkers, targetItems.length) }, () => new TextureEngine(r, r));
	                        await VMUtils.runWorkerPool(targetItems.length, engines.length || 1, async (idx, slot) => {
	                            const engine = engines[slot] || engines[0];
	                            const item = targetItems[idx];
	                            engine.renderStack(item.config);
	                            rendered[idx] = {};
                                for (const mode of OUTPUT_EXPORT_MODES) {
	                                rendered[idx][mode] = await engine.getTextureBlob(item.config.length - 1, 'image/png', undefined, { mode });
                                }
	                        });
	                        for (let idx = 0; idx < targetItems.length; idx++) {
                                const packIndex = Math.floor(idx / itemsPerPack) + 1;
                                const packFolder = resFolder.folder(`Pack_${String(packIndex).padStart(2, '0')}`);
	                            const fileName = `${exportStem}_${(idx + 1).toString().padStart(2, '0')}_x${r}`;
                                for (const mode of OUTPUT_EXPORT_MODES) {
	                                packFolder.file(buildOutputFileName(fileName, mode), rendered[idx]?.[mode] || new Blob());
                                }
	                        }
	                    }
	                    const flipbooksRoot = zip.folder(`${exportStem}_Flipbooks`);
	                    for (let itIdx = 0; itIdx < targetItems.length; itIdx++) {
	                        const item = targetItems[itIdx];
	                        const indexPadded = (itIdx + 1).toString().padStart(2, '0');
	                        const baseFileName = `${exportStem}_${indexPadded}`;
	                        const fE = new TextureEngine(1024, 1024);
	                        const base = JSON.parse(JSON.stringify(item.config));
	                        for (const mult of [4, 8, 16]) {
	                            setExportPhase(`Packing ${baseFileName} x${mult}...`);
                                const flipbookFileName = `${exportStem}_${indexPadded}_x${mult}_Flipbook`;
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
	                                frameOutputs.push({
                                            transparent: await fE.getTextureCanvasAndBlob(cfg.length - 1, 'image/png', undefined, { mode: 'transparent' }),
                                            bw: await fE.getTextureCanvasAndBlob(cfg.length - 1, 'image/png', undefined, { mode: 'bw' })
                                        });
	                            }
                                for (const mode of OUTPUT_EXPORT_MODES) {
                                    sCtx.clearRect(0, 0, sC.width, sC.height);
                                    for (let i = 0; i < frameOutputs.length; i++) {
                                        const frame = frameOutputs[i][mode];
                                        sCtx.drawImage(frame.canvas, i * 1024, 0);
                                    }
	                            const spriteSheetBlob = await new Promise((resolve) => {
	                                sC.toBlob((blob) => resolve(blob || new Blob()), 'image/png');
	                            });
                                    flipbooksRoot.file(buildOutputFileName(flipbookFileName, mode), spriteSheetBlob);
                                }
	                        }
	                    }
	                    setExportPhase('Finalizing ZIP...');
	                    const blob = await zip.generateAsync({ type: "blob", compression: "STORE" });
	                    VMUtils.triggerBlobDownload(blob, `${exportStem}_Pack.zip`);
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
                if (!targetSet?.id || targetSet.system) return;
                setSavedSets((prev) => {
                    const normalized = normalizeSavedSets(prev, savedLibraryRef.current);
                    const target = normalized.find((setRecord) => setRecord.id === targetSet.id);
                    if (!target) return normalized;
                    const rejectsId = normalized.some((setRecord) => setRecord.id === REJECTS_SET_ID) ? REJECTS_SET_ID : resolveFailTargetSetId(target, normalized);
                    const next = normalized
                        .filter((setRecord) => setRecord.id !== target.id)
                        .map((setRecord) => {
                            if (setRecord.id !== rejectsId) return setRecord;
                            return {
                                ...setRecord,
                                itemIds: [...setRecord.itemIds, ...target.itemIds.filter((itemId) => !setRecord.itemIds.includes(itemId))]
                            };
                        });
                    return normalizeSavedSets(next, savedLibraryRef.current);
                });
                setSelectedSetId((prev) => prev === targetSet.id ? PRIMARY_SET_ID : prev);
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
                setSavedSets(normalizeSavedSets([], []));
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
	                ui: { activeTab, setActiveTab, showGizmos, setShowGizmos, enableAI, setEnableAI, autoAnimateFrames, setAutoAnimateFrames, useWorkbenchSeed, setUseWorkbenchSeed, maskViewMode, setMaskViewMode, maskViewModes: MASK_VIEW_MODES, gridColumns, setGridColumns: (value) => setGridColumns(clampSetGridColumns(value)) },
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
                            for (const mode of OUTPUT_EXPORT_MODES) {
                                const blob = await e.getTextureBlob(steps.length - 1, 'image/png', undefined, { mode });
                                z.file(buildOutputFileName(`${profileName}_${r}`, mode), blob);
                            }
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
                    selectedSet,
                    selectedSetId,
                    setSelectedSetId,
                    activeTargetSet,
                    activeTargetSetId,
                    setActiveTargetSetId,
	                    packConfig,
	                    setPackConfig,
	                    reorderByDrag,
                    sendToFront,
                    sendToBack,
                    getItemSetId,
                    getSetNameById,
                    createSet,
	                    onSave: (it) => {
                            if (!it?.id) return;
                            const persistedItem = { ...it, url: null };
                            const currentLibrary = savedLibraryRef.current || [];
                            const existingItem = currentLibrary.find((item) => item.id === persistedItem.id);
                            const nextLibrary = existingItem
                                ? currentLibrary.map((item) => item.id === persistedItem.id ? { ...item, ...persistedItem } : item)
                                : [...currentLibrary, persistedItem];
                            setSavedLibrary(nextLibrary);
                            const routing = assignItemsToSetWithRouting(
                                savedSetsRef.current || [],
                                [{ item: persistedItem, targetSetId: activeTargetSetId || PRIMARY_SET_ID }],
                                nextLibrary
                            );
                            setSavedSets(routing.sets);
                        },
	                    onLoad: (cfg) => { setSteps(hydrateConfigDefaults(cfg)); setActiveTab('builder'); },
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
                        setSavedSets((prev) => normalizeSavedSets(prev.map((setRecord) => ({
                            ...setRecord,
                            itemIds: setRecord.itemIds.filter((itemId) => itemId !== id)
                        })), nextLibrary));
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
                    updateSetPolicy,
                    updateSetQuality,
                    toggleSetQualityEnabled,
                    toggleSetQualityExpanded,
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
