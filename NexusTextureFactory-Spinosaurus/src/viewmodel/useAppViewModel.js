	        function useAppViewModel() {
            const [activeTab, setActiveTab] = useState('generator'); const [showGizmos, setShowGizmos] = useState(true); const [enableAI, setEnableAI] = useState(true); const [autoAnimateFrames, setAutoAnimateFrames] = useState(false); const [useWorkbenchSeed, setUseWorkbenchSeed] = useState(false); const [maskViewMode, setMaskViewMode] = useState(DEFAULT_MASK_VIEW_MODE); const [gridColumns, setGridColumns] = useState(DEFAULT_SET_GRID_COLUMNS);
            const [erosion, setErosion] = useState(0); const [profileName, setProfileName] = useState("Texture_01");
            const [storageUsedBytes, setStorageUsedBytes] = useState(0); const [storageQuotaBytes, setStorageQuotaBytes] = useState(0);
            const [selectedRes, setSelectedRes] = useState([2048]);
            const [steps, setSteps] = useState([{ id: 's1', typeDef: STEP_TYPES.BASE_SHAPE, active: true, blendMode: 0, params: STEP_TYPES.BASE_SHAPE.params, universal: { power: 1, mult: 1, scale: 1, offsetX: 0, offsetY: 0 }, previewUrl: null }]);
            const [previewUrls, setPreviewUrls] = useState([]); const [finalPreviewUrl, setFinalPreviewUrl] = useState(null);
	            const [customOperations, setCustomOperations] = useState([]);
            const [filterModules, setFilterModules] = useState(createDefaultFilterModules());
            const [qualityFilters, setQualityFilters] = useState({
                alpha: { enabled: true, min: 0.05, max: 0.75, expanded: true },
                similarity: { enabled: false, maxSimilarity: 0.9, historySize: 200, expanded: false },
                shape: { enabled: false, minCircularity: 0.2, maxCircularity: 1.0, minSquareness: 0.2, maxSquareness: 1.0, expanded: false },
                temporalChange: { enabled: true, minChange: 0.04, maxChange: 0.95, maxJitter: 0.2, expanded: true },
                simplicity: { enabled: false, min: 0.1, max: 0.9, expanded: false }
            });
            const [packConfig, setPackConfig] = useState({
                groupBy: 'volume_fill',
                groupDepth: 2,
                maxItemsPerPack: 50,
                sortBy: 'none',
                sortDir: 'asc',
                setNameOverrides: {}
            });
            const [flipbookConfig, setFlipbookConfig] = useState(createDefaultFlipbookConfig());
	            const [dreamParams, setDreamParams] = useState({ overdrive: 0, generationWorkers: 5, packagingWorkers: 5, refineCycles: 1, minDensity: 0.15, maxDensity: 0.75, minSimplicity: 0.1, maxSimplicity: 0.9, varianceStrictness: 0.1, randStrength: 0.5, flipFrames: 16, prompt: "", minComplexity: 5, maxComplexity: 10, resultFillMode: 'slide' });

            const [isDreaming, setIsDreaming] = useState(false); const [dreamState, setDreamState] = useState({ results: [], rejectedIds: [], phase: '', rejectLabel: '', pendingAccepted: 0, pendingAttempts: 0, pendingRejected: 0, pendingBackfill: 0, activeGenWorkers: 0, activeBackfillWorkers: 0, stageRejects: { alpha: 0, simplicity: 0, shape: 0, similarity: 0, temporal: 0, other: 0 } });
            const [savedLibrary, setSavedLibrary] = useState([]); const [exportingSetId, setExportingSetId] = useState(null); const [exportPhase, setExportPhase] = useState(''); const [exportError, setExportError] = useState('');
            const [deleteHistory, setDeleteHistory] = useState([]);
            const [previewActiveSourceId, setPreviewActiveSourceId] = useState(null);
            const [previewActivePresetId, setPreviewActivePresetId] = useState(PREVIEW_DEFAULT_PRESET_ID);
            const [previewPresets, setPreviewPresets] = useState([createDefaultPreviewPreset()]);
            const [previewIsPlaying, setPreviewIsPlaying] = useState(true);
            const [previewTimeScale, setPreviewTimeScale] = useState(1);
            const [previewRuntimeStatus, setPreviewRuntimeStatus] = useState(isPreviewWebGL2Supported() ? 'idle' : 'unsupported');
            const [previewJsonDraft, setPreviewJsonDraft] = useState(JSON.stringify(createDefaultPreviewPreset(), null, 2));
            const [previewJsonError, setPreviewJsonError] = useState('');
            const [previewSelectedLayerId, setPreviewSelectedLayerId] = useState('layer-1');
            const [previewExpandedModules, setPreviewExpandedModules] = useState({});
            const [previewAdvancedPanels, setPreviewAdvancedPanels] = useState({});
            const [previewVideoExportState, setPreviewVideoExportState] = useState({
                exporting: false,
                status: 'idle',
                jobId: '',
                currentFrame: 0,
                totalFrames: 0,
                progress: 0,
                outputPath: '',
                error: '',
                message: ''
            });
            const [previewCanvasHost, setPreviewCanvasHost] = useState(null);
            const [captureActiveSetId, setCaptureActiveSetId] = useState('');
            const [captureConfig, setCaptureConfig] = useState(createDefaultCaptureLineupConfig());
            const [captureRuntimeStatus, setCaptureRuntimeStatus] = useState(isPreviewWebGL2Supported() ? 'idle' : 'unsupported');
            const [captureFocusState, setCaptureFocusState] = useState({
                index: -1,
                stackId: '',
                stackName: '',
                stackX: 0,
                cameraX: 0,
                segmentProgress: 0,
                secondsPerStack: 2
            });
            const [captureVideoExportState, setCaptureVideoExportState] = useState({
                exporting: false,
                status: 'idle',
                jobId: '',
                currentFrame: 0,
                totalFrames: 0,
                progress: 0,
                outputPath: '',
                error: '',
                message: ''
            });
            const [captureReviewState, setCaptureReviewState] = useState({
                status: 'idle',
                outputPath: '',
                frameDir: '',
                summary: '',
                issues: [],
                frames: [],
                error: ''
            });
            const [captureCanvasHost, setCaptureCanvasHost] = useState(null);
            const [toolkitBaseUrl, setToolkitBaseUrl] = useState(TOOLKIT_DEFAULT_URL);
            const [toolkitHealth, setToolkitHealth] = useState({ status: 'idle', server_ready: false, toolkit_ready: false, last_error: '' });
            const [toolkitCatalog, setToolkitCatalog] = useState([]);
            const [toolkitLastRun, setToolkitLastRun] = useState(null);
            const [toolkitLogs, setToolkitLogs] = useState([]);
            const [toolkitLastError, setToolkitLastError] = useState('');
	            const eR = useRef(null); const bER = useRef(null);
	            const generationEnginesRef = useRef([]);
	            const hasHydratedMetaRef = useRef(false);
	            const savedLibraryRef = useRef(savedLibrary);
	            const dreamResultsRef = useRef(dreamState.results);
	            const deleteHistoryRef = useRef(deleteHistory);
            const persistTimerRef = useRef(null);
            const hydratedLibraryUrlsRef = useRef(new Map());
            const dreamRunIdRef = useRef(0);
            const dreamStopRequestedRef = useRef(false);
            const activeTabRef = useRef(activeTab);
            const previewRuntimeRef = useRef(null);
            const previewAnimationFrameRef = useRef(null);
            const previewSourceLoadIdRef = useRef(0);
            const previewVideoCancelRef = useRef(false);
            const captureRuntimeRef = useRef(null);
            const captureAnimationFrameRef = useRef(null);
            const captureSceneLoadIdRef = useRef(0);
            const captureVideoCancelRef = useRef(false);
            const toolkitBridgeRef = useRef(new ToolkitToolBridge(TOOLKIT_DEFAULT_URL));
            const CAPTURE_STORAGE_KEY_UI = 'spinosaurus-capture-ui-v1';
            const getPreviewLayerUiKey = useCallback((presetId, layerId) => `${String(presetId || 'preset')}::${String(layerId || 'layer')}`, []);
            const clampSetGridColumns = (value) => {
                const parsed = Number.parseInt(value, 10);
                if (!Number.isFinite(parsed)) return DEFAULT_SET_GRID_COLUMNS;
                return Math.max(1, Math.min(12, parsed));
            };
            const disposeTextureEngine = (engine) => {
                if (engine?.dispose) engine.dispose();
            };
            const disposeTextureEngineList = (list) => {
                (Array.isArray(list) ? list : []).forEach((engine) => disposeTextureEngine(engine));
            };
            const syncCaptureFocusState = useCallback((runtime) => {
                const next = runtime?.getCaptureLineupFocus?.() || {
                    index: -1,
                    stackId: '',
                    stackName: '',
                    stackX: 0,
                    cameraX: 0,
                    segmentProgress: 0,
                    secondsPerStack: 2
                };
                setCaptureFocusState((prev) => (
                    prev.index === next.index &&
                    prev.stackId === next.stackId &&
                    prev.stackName === next.stackName &&
                    prev.secondsPerStack === next.secondsPerStack
                ) ? prev : next);
            }, []);

	            useEffect(() => {
                    eR.current = new TextureEngine(256, 256);
                    bER.current = new TextureEngine(256, 256);
                    return () => {
                        disposeTextureEngine(eR.current);
                        disposeTextureEngine(bER.current);
                        disposeTextureEngineList(generationEnginesRef.current);
                        eR.current = null;
                        bER.current = null;
                        generationEnginesRef.current = [];
                    };
                }, []);
            useEffect(() => {
                activeTabRef.current = activeTab;
            }, [activeTab]);
	            useEffect(() => {
                if (!eR.current) return;
                try {
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
                } catch (error) {
                    console.error(error);
                    setPreviewUrls((prev) => prev.length ? [] : prev);
                    setFinalPreviewUrl((prev) => prev === null ? prev : null);
                    setSteps((prev) => {
                        let changed = false;
                        const next = prev.map((step) => {
                            if (!step.previewUrl) return step;
                            changed = true;
                            return { ...step, previewUrl: null };
                        });
                        return changed ? next : prev;
                    });
                }
            }, [steps, maskViewMode]);
	            useEffect(() => { savedLibraryRef.current = savedLibrary; }, [savedLibrary]);
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
	                    const rawLibrary = localStorage.getItem(META_KEY_LIBRARY);
	                    if (rawLibrary) {
	                        const parsed = JSON.parse(rawLibrary);
	                        if (Array.isArray(parsed)) setSavedLibrary(parsed.map((item) => ({ ...item, config: hydrateConfigDefaults(item?.config) })));
	                    }
	                    const rawCustomOps = localStorage.getItem(META_KEY_CUSTOM_OPS);
	                    if (rawCustomOps) {
	                        const parsed = JSON.parse(rawCustomOps);
	                        if (Array.isArray(parsed)) setCustomOperations(parsed);
	                    }
	                    const rawFilterModules = localStorage.getItem(META_KEY_FILTER_MODULES);
	                    if (rawFilterModules) {
	                        const parsed = JSON.parse(rawFilterModules);
	                        if (Array.isArray(parsed)) {
                                const defaultsById = new Map(createDefaultFilterModules().map((item) => [item.id, item]));
                                setFilterModules(parsed.map((item) => {
                                    const base = defaultsById.get(item.id) || createDefaultFilterModules().find((candidate) => candidate.key === item.key) || item;
                                    return {
                                        ...base,
                                        ...item,
                                        params: { ...(base.params || {}), ...(item.params || {}) },
                                        universal: { ...(base.universal || {}), ...(item.universal || {}) }
                                    };
                                }));
                            }
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
                            if (typeof parsed.useWorkbenchSeed === 'boolean') setUseWorkbenchSeed(parsed.useWorkbenchSeed);
                            if (parsed.maskViewMode === 'bw' || parsed.maskViewMode === 'transparent') setMaskViewMode(parsed.maskViewMode);
                            setGridColumns(clampSetGridColumns(parsed.gridColumns ?? DEFAULT_SET_GRID_COLUMNS));
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
                    const rawPreviewPresets = localStorage.getItem(PREVIEW_STORAGE_KEY_PRESETS);
                    if (rawPreviewPresets) {
                        const parsed = JSON.parse(rawPreviewPresets);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            const nextPresets = parsed.map((preset, index) => {
                                const validated = validatePreviewPreset(preset);
                                const sanitized = validated.sanitizedPreset || sanitizePreviewPreset(preset);
                                if (!sanitized.id) sanitized.id = index === 0 ? PREVIEW_DEFAULT_PRESET_ID : createPreviewPresetId();
                                return sanitized;
                            });
                            setPreviewPresets(nextPresets);
                            setPreviewActivePresetId(nextPresets[0].id);
                            setPreviewSelectedLayerId(nextPresets[0].layers?.[0]?.id || null);
                            setPreviewJsonDraft(JSON.stringify(nextPresets[0], null, 2));
                        }
                    }
                    const rawPreviewUi = localStorage.getItem(PREVIEW_STORAGE_KEY_UI);
                    if (rawPreviewUi) {
                        const parsed = JSON.parse(rawPreviewUi);
                        if (parsed && typeof parsed === 'object') {
                            if (typeof parsed.activeSourceId === 'string') setPreviewActiveSourceId(parsed.activeSourceId);
                            if (typeof parsed.activePresetId === 'string') setPreviewActivePresetId(parsed.activePresetId);
                            if (typeof parsed.selectedLayerId === 'string') setPreviewSelectedLayerId(parsed.selectedLayerId);
                            if (typeof parsed.isPlaying === 'boolean') setPreviewIsPlaying(parsed.isPlaying);
                            if (Number.isFinite(parsed.timeScale)) setPreviewTimeScale(clampPreviewValue(parsed.timeScale, 0, 3));
                            if (parsed.expandedModules && typeof parsed.expandedModules === 'object') setPreviewExpandedModules(parsed.expandedModules);
                            if (parsed.advancedPanels && typeof parsed.advancedPanels === 'object') setPreviewAdvancedPanels(parsed.advancedPanels);
                        }
                    }
                    const rawCaptureUi = localStorage.getItem(CAPTURE_STORAGE_KEY_UI);
                    if (rawCaptureUi) {
                        const parsed = JSON.parse(rawCaptureUi);
                        if (parsed && typeof parsed === 'object') {
                            if (typeof parsed.activeSetId === 'string') setCaptureActiveSetId(parsed.activeSetId);
                            if (parsed.captureConfig && typeof parsed.captureConfig === 'object') {
                                setCaptureConfig(normalizeCaptureLineupConfig(parsed.captureConfig));
                            }
                        }
                    }
                    const rawToolkitUi = localStorage.getItem(TOOLKIT_UI_STORAGE_KEY);
                    if (rawToolkitUi) {
                        const parsed = JSON.parse(rawToolkitUi);
                        if (parsed && typeof parsed === 'object' && typeof parsed.baseUrl === 'string') {
                            setToolkitBaseUrl(parsed.baseUrl);
                            toolkitBridgeRef.current.setBaseUrl(parsed.baseUrl);
                        }
                    }
                } catch (_) { }
                hasHydratedMetaRef.current = true;
            }, [mergeFlipbookConfig]);
            useEffect(() => {
                const activeIds = new Set(savedLibrary.map((item) => item.id));
                hydratedLibraryUrlsRef.current.forEach((url, id) => {
                    if (activeIds.has(id)) return;
                    if (url) URL.revokeObjectURL(url);
                    hydratedLibraryUrlsRef.current.delete(id);
                });
            }, [savedLibrary]);
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
	                        localStorage.setItem(META_KEY_LIBRARY, JSON.stringify(savedLibrary.map((item) => ({ ...item, url: null }))));
	                        localStorage.setItem(META_KEY_CUSTOM_OPS, JSON.stringify(customOperations));
                        localStorage.setItem(META_KEY_FILTER_MODULES, JSON.stringify(filterModules));
                        localStorage.setItem(META_KEY_QUALITY_FILTERS, JSON.stringify(qualityFilters));
                        localStorage.setItem(META_KEY_DREAM_PARAMS, JSON.stringify(dreamParams));
                        localStorage.setItem(META_KEY_UI_PREFS, JSON.stringify({ autoAnimateFrames, useWorkbenchSeed, maskViewMode, gridColumns }));
                        localStorage.setItem(META_KEY_PACK_CONFIG, JSON.stringify(packConfig));
                        localStorage.setItem(META_KEY_FLIPBOOK_CONFIG, JSON.stringify(flipbookConfig));
                        localStorage.setItem(PREVIEW_STORAGE_KEY_PRESETS, JSON.stringify(previewPresets));
                        localStorage.setItem(PREVIEW_STORAGE_KEY_UI, JSON.stringify({
                            activeSourceId: previewActiveSourceId,
                            activePresetId: previewActivePresetId,
                            selectedLayerId: previewSelectedLayerId,
                            isPlaying: previewIsPlaying,
                            timeScale: previewTimeScale,
                            expandedModules: previewExpandedModules,
                            advancedPanels: previewAdvancedPanels
                        }));
                        localStorage.setItem(CAPTURE_STORAGE_KEY_UI, JSON.stringify({
                            activeSetId: captureActiveSetId,
                            captureConfig
                        }));
                        localStorage.setItem(TOOLKIT_UI_STORAGE_KEY, JSON.stringify({
                            baseUrl: toolkitBaseUrl
                        }));
                    } catch (_) { }
                }, 220);
	                return () => {
	                    if (persistTimerRef.current) {
	                        clearTimeout(persistTimerRef.current);
	                        persistTimerRef.current = null;
	                    }
	                };
            }, [savedLibrary, customOperations, filterModules, qualityFilters, dreamParams, autoAnimateFrames, useWorkbenchSeed, maskViewMode, gridColumns, packConfig, flipbookConfig, previewPresets, previewActiveSourceId, previewActivePresetId, previewSelectedLayerId, previewIsPlaying, previewTimeScale, previewExpandedModules, previewAdvancedPanels, captureActiveSetId, captureConfig, toolkitBaseUrl]);

            const previewSupported = useMemo(() => isPreviewWebGL2Supported(), []);
            const activePreviewSourceItem = useMemo(() => savedLibrary.find((it) => it.id === previewActiveSourceId) || null, [savedLibrary, previewActiveSourceId]);
            const activePreviewPreset = useMemo(() => previewPresets.find((preset) => preset.id === previewActivePresetId) || previewPresets[0] || null, [previewPresets, previewActivePresetId]);
            const activePreviewLayer = useMemo(() => activePreviewPreset?.layers?.find((layer) => layer.id === previewSelectedLayerId) || activePreviewPreset?.layers?.[0] || null, [activePreviewPreset, previewSelectedLayerId]);
            const activePreviewLayerUiKey = useMemo(() => getPreviewLayerUiKey(activePreviewPreset?.id, activePreviewLayer?.id), [activePreviewPreset?.id, activePreviewLayer?.id, getPreviewLayerUiKey]);
            const activePreviewExpandedModule = useMemo(() => {
                if (!activePreviewLayer) return 'main';
                const stored = previewExpandedModules?.[activePreviewLayerUiKey];
                if (stored) return stored;
                const firstExpanded = PREVIEW_MODULE_KEYS.find((key) => activePreviewLayer.modules?.[key]?.expanded);
                return firstExpanded || 'main';
            }, [activePreviewLayer, activePreviewLayerUiKey, previewExpandedModules]);
            const activePreviewAdvancedOpen = !!previewAdvancedPanels?.[activePreviewLayerUiKey];

            useEffect(() => {
                if (!activePreviewPreset) return;
                setPreviewJsonDraft((prev) => {
                    const next = JSON.stringify(activePreviewPreset, null, 2);
                    return prev === next ? prev : next;
                });
                if (!activePreviewPreset.layers.some((layer) => layer.id === previewSelectedLayerId)) {
                    setPreviewSelectedLayerId(activePreviewPreset.layers[0]?.id || null);
                }
            }, [activePreviewPreset, previewSelectedLayerId]);

            useEffect(() => {
                if (!previewSupported) {
                    setPreviewRuntimeStatus('unsupported');
                    return;
                }
                if (!savedLibrary.some((item) => item.id === previewActiveSourceId)) {
                    setPreviewActiveSourceId((prev) => (prev && !savedLibrary.some((item) => item.id === prev) ? null : prev));
                }
            }, [savedLibrary, previewActiveSourceId, previewSupported]);

            const loadPreviewSourceImage = useCallback(async (item) => {
                if (!item) return null;
                let sourceUrl = item.url || null;
                if (!sourceUrl && item.storageKey) {
                    const blob = await loadTextureBlob(item.storageKey);
                    if (blob) sourceUrl = URL.createObjectURL(blob);
                }
                if (!sourceUrl) return null;
                return await new Promise((resolve, reject) => {
                    const image = new Image();
                    image.onload = () => resolve({ image, revokeUrl: item.url ? null : sourceUrl });
                    image.onerror = () => {
                        if (!item.url) URL.revokeObjectURL(sourceUrl);
                        reject(new Error('Failed to load preview source image.'));
                    };
                    image.src = sourceUrl;
                });
            }, []);

            const loadCaptureSetImages = useCallback(async (items) => {
                const entries = [];
                const revokeUrls = [];
                for (const item of (Array.isArray(items) ? items : [])) {
                    try {
                        const result = await loadPreviewSourceImage(item);
                        entries.push({
                            id: item.id,
                            name: item.name,
                            item,
                            image: result?.image || null
                        });
                        if (result?.revokeUrl) revokeUrls.push(result.revokeUrl);
                    } catch (_) {
                        entries.push({
                            id: item.id,
                            name: item.name,
                            item,
                            image: null
                        });
                    }
                }
                return { entries, revokeUrls };
            }, [loadPreviewSourceImage]);

            useEffect(() => {
                if (activeTab !== 'preview') {
                    if (previewAnimationFrameRef.current) {
                        cancelAnimationFrame(previewAnimationFrameRef.current);
                        previewAnimationFrameRef.current = null;
                    }
                    if (previewRuntimeRef.current) {
                        previewRuntimeRef.current.dispose();
                        previewRuntimeRef.current = null;
                    }
                    if (previewSupported) setPreviewRuntimeStatus('idle');
                    return;
                }
                if (!previewSupported) {
                    setPreviewRuntimeStatus('unsupported');
                    return;
                }
                if (!previewCanvasHost) return;
                if (!previewRuntimeRef.current) {
                    try {
                        setPreviewRuntimeStatus('mounting');
                        const runtime = new PreviewParticleRuntime({ canvas: previewCanvasHost });
                        runtime.mount();
                        previewRuntimeRef.current = runtime;
                    } catch (error) {
                        console.error(error);
                        setPreviewRuntimeStatus('error');
                        return;
                    }
                }
                const runtime = previewRuntimeRef.current;
                const host = previewCanvasHost;
                const updateSize = () => {
                    if (!host || !runtime) return;
                    runtime.resize(host.clientWidth || host.width || 1, host.clientHeight || host.height || 1);
                };
                updateSize();
                let running = true;
                const frame = (now) => {
                    if (!running || !previewRuntimeRef.current) return;
                    try {
                        previewRuntimeRef.current.tick(now);
                    } catch (error) {
                        console.error(error);
                        setPreviewRuntimeStatus('error');
                        running = false;
                        return;
                    }
                    previewAnimationFrameRef.current = requestAnimationFrame(frame);
                };
                previewAnimationFrameRef.current = requestAnimationFrame(frame);
                window.addEventListener('resize', updateSize);
                return () => {
                    running = false;
                    window.removeEventListener('resize', updateSize);
                    if (previewAnimationFrameRef.current) {
                        cancelAnimationFrame(previewAnimationFrameRef.current);
                        previewAnimationFrameRef.current = null;
                    }
                    if (previewRuntimeRef.current) {
                        previewRuntimeRef.current.dispose();
                        previewRuntimeRef.current = null;
                    }
                };
            }, [activeTab, previewSupported, previewCanvasHost]);

            useEffect(() => {
                if (!previewCanvasHost || !previewRuntimeRef.current || !activePreviewPreset || activeTab !== 'preview') return;
                const validation = validatePreviewPreset(activePreviewPreset);
                if (!validation.valid) {
                    setPreviewRuntimeStatus('invalid_preset');
                    setPreviewJsonError(validation.errors.join('\n'));
                    return;
                }
                try {
                    previewRuntimeRef.current.setPreset(validation.sanitizedPreset);
                    setPreviewRuntimeStatus(activePreviewSourceItem ? 'running' : 'running_fallback_sprite');
                } catch (error) {
                    console.error(error);
                    setPreviewRuntimeStatus('error');
                }
            }, [activePreviewPreset, activeTab, activePreviewSourceItem, previewCanvasHost]);

            useEffect(() => {
                if (!previewCanvasHost || !previewRuntimeRef.current || activeTab !== 'preview') return;
                previewRuntimeRef.current.setPlaying(previewIsPlaying);
            }, [previewIsPlaying, activeTab, previewCanvasHost]);

            useEffect(() => {
                if (!previewCanvasHost || !previewRuntimeRef.current || activeTab !== 'preview') return;
                previewRuntimeRef.current.setTimeScale(previewTimeScale);
            }, [previewTimeScale, activeTab, previewCanvasHost]);

            useEffect(() => {
                if (!previewCanvasHost || !previewRuntimeRef.current || activeTab !== 'preview') return;
                if (!activePreviewSourceItem) {
                    previewRuntimeRef.current.setSourceImage(null);
                    setPreviewRuntimeStatus(activePreviewPreset ? 'running_fallback_sprite' : 'idle');
                    return;
                }
                const loadId = ++previewSourceLoadIdRef.current;
                let cancelled = false;
                setPreviewRuntimeStatus('mounting');
                loadPreviewSourceImage(activePreviewSourceItem).then((result) => {
                    if (cancelled || loadId !== previewSourceLoadIdRef.current || !previewRuntimeRef.current) {
                        if (result?.revokeUrl) URL.revokeObjectURL(result.revokeUrl);
                        return;
                    }
                    previewRuntimeRef.current.setSourceImage(result.image);
                    setPreviewRuntimeStatus('running');
                    if (result?.revokeUrl) URL.revokeObjectURL(result.revokeUrl);
                }).catch((error) => {
                    console.error(error);
                    if (!cancelled) setPreviewRuntimeStatus('error');
                });
                return () => {
                    cancelled = true;
                };
            }, [activePreviewSourceItem, activeTab, activePreviewPreset, loadPreviewSourceImage, previewCanvasHost]);

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
                        const setId = k;
                        const singleName = packConfig.groupBy === 'volume_fill'
                            ? (packConfig.setNameOverrides?.[setId] || 'Volume 1')
                            : k;
                        final.push({ id: setId, baseKey: k, name: singleName, items: its });
                    }
                    else {
                        for (let i = 0; i < its.length; i += maxItemsPerPack) {
                            const vol = Math.floor(i / maxItemsPerPack) + 1;
                            const setId = `${k}${i}`;
                            const name = packConfig.groupBy === 'volume_fill'
                                ? (packConfig.setNameOverrides?.[setId] || `Volume ${vol}`)
                                : (vol === 1 ? k : `${k} Vol ${vol}`);
                            final.push({ id: setId, baseKey: k, name, items: its.slice(i, i + maxItemsPerPack) });
                        }
                    }
                });
                return final;
            }, [savedLibrary, packConfig]);
            const activeCaptureSet = useMemo(() => sets.find((set) => set.id === captureActiveSetId) || sets[0] || null, [sets, captureActiveSetId]);
            const activeCaptureConfig = useMemo(() => {
                const normalized = normalizeCaptureLineupConfig(captureConfig, activeCaptureSet?.name || 'Texture Set', activePreviewPreset?.name || 'Turbulence Demo');
                const itemCount = activeCaptureSet?.items?.length || 0;
                const autoDuration = resolveCaptureLineupDurationSeconds(normalized, itemCount || 1);
                const lineupTravel = Math.max(normalized.travelDistance, Math.max(1, itemCount) * normalized.stackSpacing);
                return {
                    ...normalized,
                    durationSeconds: autoDuration,
                    travelDistance: lineupTravel,
                    stageScrollTravel: Math.max(normalized.stageScrollTravel, lineupTravel)
                };
            }, [captureConfig, activeCaptureSet?.items?.length, activeCaptureSet?.name, activePreviewPreset?.name]);

            useEffect(() => {
                if (!sets.length) {
                    if (captureActiveSetId) setCaptureActiveSetId('');
                    return;
                }
                if (!sets.some((set) => set.id === captureActiveSetId)) {
                    setCaptureActiveSetId(sets[0].id);
                }
            }, [sets, captureActiveSetId]);

            useEffect(() => {
                if (activeTab !== 'capture') {
                    if (captureAnimationFrameRef.current) {
                        cancelAnimationFrame(captureAnimationFrameRef.current);
                        captureAnimationFrameRef.current = null;
                    }
                    if (captureRuntimeRef.current) {
                        captureRuntimeRef.current.dispose();
                        captureRuntimeRef.current = null;
                    }
                    setCaptureFocusState({
                        index: -1,
                        stackId: '',
                        stackName: '',
                        stackX: 0,
                        cameraX: 0,
                        segmentProgress: 0,
                        secondsPerStack: activeCaptureConfig?.secondsPerStack || 2
                    });
                    if (previewSupported) setCaptureRuntimeStatus('idle');
                    return;
                }
                if (!previewSupported) {
                    setCaptureRuntimeStatus('unsupported');
                    return;
                }
                if (!captureCanvasHost) return;
                if (!captureRuntimeRef.current) {
                    try {
                        setCaptureRuntimeStatus('mounting');
                        const runtime = new PreviewParticleRuntime({ canvas: captureCanvasHost });
                        runtime.mount();
                        captureRuntimeRef.current = runtime;
                    } catch (error) {
                        console.error(error);
                        setCaptureRuntimeStatus('error');
                        return;
                    }
                }
                const runtime = captureRuntimeRef.current;
                const host = captureCanvasHost;
                const updateSize = () => {
                    if (!host || !runtime) return;
                    runtime.resize(host.clientWidth || host.width || 1, host.clientHeight || host.height || 1);
                };
                updateSize();
                let running = true;
                const frame = (now) => {
                    if (!running || !captureRuntimeRef.current) return;
                    try {
                        captureRuntimeRef.current.tick(now);
                        syncCaptureFocusState(captureRuntimeRef.current);
                    } catch (error) {
                        console.error(error);
                        setCaptureRuntimeStatus('error');
                        running = false;
                        return;
                    }
                    captureAnimationFrameRef.current = requestAnimationFrame(frame);
                };
                captureAnimationFrameRef.current = requestAnimationFrame(frame);
                window.addEventListener('resize', updateSize);
                return () => {
                    running = false;
                    window.removeEventListener('resize', updateSize);
                    if (captureAnimationFrameRef.current) {
                        cancelAnimationFrame(captureAnimationFrameRef.current);
                        captureAnimationFrameRef.current = null;
                    }
                    if (captureRuntimeRef.current) {
                        captureRuntimeRef.current.dispose();
                        captureRuntimeRef.current = null;
                    }
                };
            }, [activeTab, previewSupported, captureCanvasHost]);

            useEffect(() => {
                if (!captureCanvasHost || !captureRuntimeRef.current || activeTab !== 'capture' || !activePreviewPreset) return;
                if (!activeCaptureSet || !activeCaptureSet.items?.length) {
                    captureRuntimeRef.current.setCaptureLineupScene(activePreviewPreset, [], {
                        ...activeCaptureConfig,
                        setId: activeCaptureSet?.id || '',
                        setName: activeCaptureSet?.name || 'Texture Set'
                    });
                    syncCaptureFocusState(captureRuntimeRef.current);
                    setCaptureRuntimeStatus('empty_set');
                    return;
                }
                const loadId = ++captureSceneLoadIdRef.current;
                let cancelled = false;
                setCaptureRuntimeStatus('loading_set');
                loadCaptureSetImages(activeCaptureSet.items || []).then(({ entries, revokeUrls }) => {
                    if (cancelled || loadId !== captureSceneLoadIdRef.current || !captureRuntimeRef.current) {
                        revokeUrls.forEach((url) => URL.revokeObjectURL(url));
                        return;
                    }
                    captureRuntimeRef.current.setCaptureLineupScene(activePreviewPreset, entries, {
                        ...activeCaptureConfig,
                        setId: activeCaptureSet.id,
                        setName: activeCaptureSet.name
                    });
                    syncCaptureFocusState(captureRuntimeRef.current);
                    if (!entries.length) setCaptureRuntimeStatus('empty_set');
                    else setCaptureRuntimeStatus(entries.some((entry) => entry.image) ? 'running' : 'running_fallback_sprite');
                    revokeUrls.forEach((url) => URL.revokeObjectURL(url));
                }).catch((error) => {
                    console.error(error);
                    if (!cancelled) setCaptureRuntimeStatus('error');
                });
                return () => {
                    cancelled = true;
                };
            }, [activeTab, activePreviewPreset, activeCaptureSet, activeCaptureConfig, loadCaptureSetImages, syncCaptureFocusState, captureCanvasHost]);

            useEffect(() => {
                if (!captureCanvasHost || !captureRuntimeRef.current || activeTab !== 'capture') return;
                captureRuntimeRef.current.setPlaying(previewIsPlaying);
            }, [previewIsPlaying, activeTab, captureCanvasHost]);

            useEffect(() => {
                if (!captureCanvasHost || !captureRuntimeRef.current || activeTab !== 'capture') return;
                captureRuntimeRef.current.setTimeScale(previewTimeScale);
            }, [previewTimeScale, activeTab, captureCanvasHost]);

            useEffect(() => {
                if (activeTab !== 'preview' && activeTab !== 'generator') {
                    disposeTextureEngineList(generationEnginesRef.current);
                    generationEnginesRef.current = [];
                }
            }, [activeTab]);

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
            const moveLibraryItemToIndex = (itemId, toIndex) => {
                const cfg = packConfig || {};
                const reorderEnabled = cfg.groupBy === 'volume_fill' && (cfg.sortBy || 'none') === 'none';
                if (!reorderEnabled || !itemId) return;
                setSavedLibrary((prev) => {
                    const fromIndex = prev.findIndex((it) => it.id === itemId);
                    if (fromIndex < 0) return prev;
                    const boundedTarget = Math.max(0, Math.min(toIndex, prev.length - 1));
                    return moveArrayItem(prev, fromIndex, boundedTarget);
                });
                setDreamState((prev) => {
                    const fromIndex = prev.results.findIndex((it) => it.id === itemId);
                    if (fromIndex < 0) return prev;
                    const boundedTarget = Math.max(0, Math.min(toIndex, prev.results.length - 1));
                    return { ...prev, results: moveArrayItem(prev.results, fromIndex, boundedTarget) };
                });
            };
            const sendToFront = (itemId) => moveLibraryItemToIndex(itemId, 0);
            const sendToBack = (itemId) => {
                const total = savedLibraryRef.current?.length || savedLibrary.length || 0;
                moveLibraryItemToIndex(itemId, Math.max(0, total - 1));
            };

            const handleRenameSet = (targetSet, newName) => {
                const trimmedName = (newName || '').trim();
                if (!trimmedName) return;
                if (packConfig.groupBy === 'volume_fill') {
                    setPackConfig(prev => ({
                        ...prev,
                        setNameOverrides: {
                            ...(prev?.setNameOverrides || {}),
                            [targetSet?.id || '__all__']: trimmedName
                        }
                    }));
                    return;
                }
                const newNameBase = trimmedName.replace(/\s+/g, '_') || 'Set';
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
	                    const exportStem = normalizeExportStem(targetSet.name);
	                    const packWorkers = Math.max(1, Math.min(MAX_PACKAGING_WORKERS, parseInt(dreamParams.packagingWorkers || 1)));
	                    for (const r of rs) {
	                        setExportPhase(`Exporting ${r}px textures...`);
	                        const resFolder = zip.folder(`${exportStem}_${r}`);
	                        const rendered = new Array(targetSet.items.length);
	                        const engines = Array.from({ length: Math.min(packWorkers, targetSet.items.length) }, () => new TextureEngine(r, r));
	                        try {
	                            await VMUtils.runWorkerPool(targetSet.items.length, engines.length || 1, async (idx, slot) => {
	                                const engine = engines[slot] || engines[0];
	                                const item = targetSet.items[idx];
	                                engine.renderStack(item.config);
	                                rendered[idx] = {};
                                for (const mode of OUTPUT_EXPORT_MODES) {
	                                    rendered[idx][mode] = await engine.getTextureBlob(item.config.length - 1, 'image/png', undefined, { mode });
                                }
	                            });
	                        } finally {
	                            disposeTextureEngineList(engines);
	                        }
	                        for (let idx = 0; idx < targetSet.items.length; idx++) {
	                            const fileName = `${exportStem}_${(idx + 1).toString().padStart(2, '0')}_x${r}`;
                                for (const mode of OUTPUT_EXPORT_MODES) {
	                                resFolder.file(buildOutputFileName(fileName, mode), rendered[idx]?.[mode] || new Blob());
                                }
	                        }
	                    }
	                    const flipbooksRoot = zip.folder(`${exportStem}_Flipbooks`);
	                    for (let itIdx = 0; itIdx < targetSet.items.length; itIdx++) {
	                        const item = targetSet.items[itIdx];
	                        const indexPadded = (itIdx + 1).toString().padStart(2, '0');
	                        const baseFileName = `${exportStem}_${indexPadded}`;
	                        const fE = new TextureEngine(1024, 1024);
	                        try {
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
	                        } finally {
	                            disposeTextureEngine(fE);
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

            const syncPreviewPresetUpdate = (updater) => {
                setPreviewPresets((prev) => {
                    const basePresets = Array.isArray(prev) && prev.length ? prev : [createDefaultPreviewPreset()];
                    const next = typeof updater === 'function' ? updater(basePresets) : basePresets;
                    return Array.isArray(next) && next.length ? next : [createDefaultPreviewPreset()];
                });
            };

            const updateActivePreviewPreset = (updater) => {
                syncPreviewPresetUpdate((prev) => prev.map((preset) => {
                    if (preset.id !== previewActivePresetId) return preset;
                    const nextPreset = typeof updater === 'function' ? updater(clonePreviewPreset(preset)) : preset;
                    const validated = validatePreviewPreset(nextPreset);
                    return validated.sanitizedPreset || sanitizePreviewPreset(nextPreset);
                }));
            };

            const createPreviewPresetFromDefault = () => {
                const preset = createDefaultPreviewPreset();
                preset.id = createPreviewPresetId();
                preset.name = `Preset ${previewPresets.length + 1}`;
                preset.layers = [createDefaultPreviewLayer(0)];
                preset.layers[0].id = createPreviewLayerId(0);
                return preset;
            };

            const withToolkit = useCallback(async (action) => {
                try {
                    toolkitBridgeRef.current.setBaseUrl(toolkitBaseUrl);
                    setToolkitLastError('');
                    return await action(toolkitBridgeRef.current);
                } catch (error) {
                    setToolkitLastError(error?.message || 'Toolkit request failed.');
                    throw error;
                }
            }, [toolkitBaseUrl]);

            const refreshToolkitHealth = useCallback(async () => {
                const payload = await withToolkit((bridge) => bridge.health());
                setToolkitHealth(payload);
                return payload;
            }, [withToolkit]);

            const refreshToolkitCatalog = useCallback(async () => {
                const payload = await withToolkit((bridge) => bridge.catalog());
                setToolkitCatalog(payload.categories || []);
                return payload;
            }, [withToolkit]);

            const refreshToolkitLogs = useCallback(async () => {
                const payload = await withToolkit((bridge) => bridge.logs());
                setToolkitLogs(payload.entries || []);
                return payload;
            }, [withToolkit]);

            const refreshToolkitLatestRun = useCallback(async () => {
                const payload = await withToolkit((bridge) => bridge.latestRun());
                setToolkitLastRun(payload);
                return payload;
            }, [withToolkit]);

            const updateActivePreviewCapture = (updater) => {
                updateActivePreviewPreset((preset) => {
                    const nextCapture = typeof updater === 'function'
                        ? updater({ ...(preset.scene?.capture || createDefaultPreviewPreset().scene.capture) })
                        : updater;
                    return {
                        ...preset,
                        scene: {
                            ...preset.scene,
                            capture: normalizePreviewCaptureConfig(nextCapture, preset.name)
                        }
                    };
                });
            };

            const pollPreviewVideoStatus = useCallback(async (jobId) => {
                if (!jobId) return null;
                while (!previewVideoCancelRef.current) {
                    const payload = await withToolkit((bridge) => bridge.previewVideoStatus(jobId));
                    const job = payload?.job || null;
                    if (job) {
                        setPreviewVideoExportState((prev) => ({
                            ...prev,
                            status: payload.status || job.status || prev.status,
                            outputPath: job.outputPath || prev.outputPath,
                            progress: job.expectedFrames > 0 ? Math.min(1, (job.encodedFrames || job.receivedFrames || 0) / job.expectedFrames) : prev.progress,
                            message: payload.status === 'encoding'
                                ? `Encoding ${job.outputName || 'video'}...`
                                : (job.status === 'completed' ? `Saved ${job.outputName || 'video'}` : prev.message),
                            error: job.error || prev.error
                        }));
                    }
                    if (!payload || ['completed', 'error', 'canceled'].includes(payload.status)) {
                        return payload;
                    }
                    await new Promise((resolve) => setTimeout(resolve, 700));
                }
                return null;
            }, [withToolkit]);

            const startPreviewVideoExport = useCallback(async () => {
                if (!previewRuntimeRef.current || activeTab !== 'preview' || !activePreviewPreset) {
                    throw new Error('Preview runtime is not ready.');
                }
                const validation = validatePreviewPreset(activePreviewPreset);
                if (!validation.valid) {
                    setPreviewJsonError(validation.errors.join('\n'));
                    throw new Error(validation.errors[0] || 'Preview preset is invalid.');
                }
                const health = await refreshToolkitHealth();
                if (health?.status !== 'ok' || health?.ffmpeg_available !== true) {
                    throw new Error(health?.ffmpeg_error || health?.last_error || 'Toolkit or ffmpeg is not ready.');
                }
                const captureConfig = normalizePreviewCaptureConfig(validation.sanitizedPreset.scene.capture, validation.sanitizedPreset.name);
                const expectedFrames = Math.max(1, Math.round(captureConfig.durationSeconds * captureConfig.fps));
                previewVideoCancelRef.current = false;
                setPreviewVideoExportState({
                    exporting: true,
                    status: 'preparing',
                    jobId: '',
                    currentFrame: 0,
                    totalFrames: expectedFrames,
                    progress: 0,
                    outputPath: '',
                    error: '',
                    message: 'Preparing deterministic render...'
                });
                let session = null;
                let jobId = '';
                try {
                    const startPayload = await withToolkit((bridge) => bridge.previewVideoStart({
                        outputName: captureConfig.outputName,
                        durationSeconds: captureConfig.durationSeconds,
                        fps: captureConfig.fps,
                        width: captureConfig.width,
                        height: captureConfig.height,
                        expectedFrames
                    }));
                    jobId = startPayload?.job?.jobId || '';
                    if (!jobId) throw new Error('Toolkit did not return a preview video job id.');
                    session = previewRuntimeRef.current.beginDeterministicCapture(captureConfig);
                    setPreviewVideoExportState((prev) => ({
                        ...prev,
                        jobId,
                        status: 'rendering_frames',
                        message: 'Rendering frames...'
                    }));
                    for (let frameIndex = 0; frameIndex < session.totalFrames; frameIndex++) {
                        if (previewVideoCancelRef.current) throw new Error('Preview video export canceled.');
                        if (activeTabRef.current !== 'preview' || !previewRuntimeRef.current) {
                            throw new Error('Preview video export stopped because PREVIEW is no longer the active tab.');
                        }
                        const frame = await previewRuntimeRef.current.captureDeterministicFrame(session, frameIndex);
                        await withToolkit((bridge) => bridge.previewVideoFrame(jobId, frameIndex, frame.blob));
                        setPreviewVideoExportState((prev) => ({
                            ...prev,
                            currentFrame: frameIndex + 1,
                            progress: (frameIndex + 1) / session.totalFrames,
                            message: `Uploading frame ${frameIndex + 1}/${session.totalFrames}...`
                        }));
                        if ((frameIndex + 1) % 6 === 0) {
                            await new Promise((resolve) => setTimeout(resolve, 0));
                        }
                    }
                    await withToolkit((bridge) => bridge.previewVideoFinalize(jobId));
                    setPreviewVideoExportState((prev) => ({
                        ...prev,
                        status: 'encoding',
                        message: 'Encoding MP4 with ffmpeg...'
                    }));
                    const finalPayload = await pollPreviewVideoStatus(jobId);
                    const finalJob = finalPayload?.job || null;
                    setPreviewVideoExportState((prev) => ({
                        ...prev,
                        exporting: false,
                        status: finalPayload?.status || 'completed',
                        outputPath: finalJob?.outputPath || prev.outputPath,
                        progress: finalPayload?.status === 'completed' ? 1 : prev.progress,
                        error: finalJob?.error || '',
                        message: finalPayload?.status === 'completed'
                            ? `Saved MP4 to ${finalJob?.outputPath || prev.outputPath}`
                            : (finalJob?.error || prev.message)
                    }));
                } catch (error) {
                    if (jobId) {
                        try {
                            await withToolkit((bridge) => bridge.previewVideoCancel(jobId));
                        } catch (_) {}
                    }
                    setPreviewVideoExportState((prev) => ({
                        ...prev,
                        exporting: false,
                        status: previewVideoCancelRef.current ? 'canceled' : 'error',
                        error: error?.message || 'Preview video export failed.',
                        message: previewVideoCancelRef.current ? 'Preview video export canceled.' : 'Preview video export failed.'
                    }));
                    throw error;
                } finally {
                    if (session && previewRuntimeRef.current) {
                        await previewRuntimeRef.current.finishDeterministicCapture(session, { restore: true });
                    }
                }
            }, [activePreviewPreset, activeTab, pollPreviewVideoStatus, refreshToolkitHealth, withToolkit]);

            const cancelPreviewVideoExport = useCallback(async () => {
                previewVideoCancelRef.current = true;
                if (previewVideoExportState.jobId) {
                    try {
                        await withToolkit((bridge) => bridge.previewVideoCancel(previewVideoExportState.jobId));
                    } catch (_) {}
                }
                setPreviewVideoExportState((prev) => ({
                    ...prev,
                    exporting: false,
                    status: 'canceled',
                    message: 'Preview video export canceled.'
                }));
            }, [previewVideoExportState.jobId, withToolkit]);

            const pollCaptureVideoStatus = useCallback(async (jobId) => {
                if (!jobId) return null;
                while (!captureVideoCancelRef.current) {
                    const payload = await withToolkit((bridge) => bridge.captureVideoStatus(jobId));
                    const job = payload?.job || null;
                    if (job) {
                        setCaptureVideoExportState((prev) => ({
                            ...prev,
                            status: payload.status || job.status || prev.status,
                            outputPath: job.outputPath || prev.outputPath,
                            progress: job.expectedFrames > 0 ? Math.min(1, (job.encodedFrames || job.receivedFrames || 0) / job.expectedFrames) : prev.progress,
                            message: payload.status === 'encoding'
                                ? `Encoding ${job.outputName || 'video'}...`
                                : (job.status === 'completed' ? `Saved ${job.outputName || 'video'}` : prev.message),
                            error: job.error || prev.error
                        }));
                    }
                    if (!payload || ['completed', 'error', 'canceled'].includes(payload.status)) {
                        return payload;
                    }
                    await new Promise((resolve) => setTimeout(resolve, 700));
                }
                return null;
            }, [withToolkit]);

            const reviewSavedCaptureVideo = useCallback(async (outputPath, metadata = {}) => {
                if (!outputPath) {
                    setCaptureReviewState({
                        status: 'error',
                        outputPath: '',
                        frameDir: '',
                        summary: '',
                        issues: [],
                        frames: [],
                        error: 'Capture review requires an output path.'
                    });
                    return null;
                }
                setCaptureReviewState((prev) => ({
                    ...prev,
                    status: 'reviewing',
                    outputPath,
                    error: '',
                    summary: ''
                }));
                try {
                    const payload = await withToolkit((bridge) => bridge.captureVideoReview({
                        outputPath,
                        frameCount: 5,
                        metadata
                    }));
                    setCaptureReviewState({
                        status: payload?.status || 'completed',
                        outputPath: payload?.outputPath || outputPath,
                        frameDir: payload?.frameDir || '',
                        summary: payload?.reviewSummary || '',
                        issues: Array.isArray(payload?.issues) ? payload.issues : [],
                        frames: Array.isArray(payload?.reviewFrames) ? payload.reviewFrames : [],
                        error: ''
                    });
                    return payload;
                } catch (error) {
                    setCaptureReviewState({
                        status: 'error',
                        outputPath,
                        frameDir: '',
                        summary: '',
                        issues: [],
                        frames: [],
                        error: error?.message || 'Capture review failed.'
                    });
                    throw error;
                }
            }, [withToolkit]);

            const startCaptureVideoExport = useCallback(async () => {
                if (!captureRuntimeRef.current || activeTab !== 'capture' || !activePreviewPreset || !activeCaptureSet) {
                    throw new Error('Capture runtime is not ready.');
                }
                const validation = validatePreviewPreset(activePreviewPreset);
                if (!validation.valid) {
                    setPreviewJsonError(validation.errors.join('\n'));
                    throw new Error(validation.errors[0] || 'Preview preset is invalid.');
                }
                const health = await refreshToolkitHealth();
                if (health?.status !== 'ok' || health?.ffmpeg_available !== true) {
                    throw new Error(health?.ffmpeg_error || health?.last_error || 'Toolkit or ffmpeg is not ready.');
                }
                const normalizedConfig = normalizeCaptureLineupConfig(activeCaptureConfig, activeCaptureSet.name, validation.sanitizedPreset.name);
                const expectedFrames = Math.max(1, Math.round(normalizedConfig.durationSeconds * normalizedConfig.fps));
                const metadata = {
                    setId: activeCaptureSet.id,
                    setName: activeCaptureSet.name,
                    presetName: validation.sanitizedPreset.name,
                    itemCount: activeCaptureSet.items?.length || 0
                };
                captureVideoCancelRef.current = false;
                setCaptureReviewState((prev) => ({
                    ...prev,
                    status: 'idle',
                    outputPath: '',
                    frameDir: '',
                    summary: '',
                    issues: [],
                    frames: [],
                    error: ''
                }));
                setCaptureVideoExportState({
                    exporting: true,
                    status: 'preparing',
                    jobId: '',
                    currentFrame: 0,
                    totalFrames: expectedFrames,
                    progress: 0,
                    outputPath: '',
                    error: '',
                    message: 'Preparing lineup render...'
                });
                let session = null;
                let jobId = '';
                try {
                    const startPayload = await withToolkit((bridge) => bridge.captureVideoStart({
                        outputName: normalizedConfig.outputName,
                        durationSeconds: normalizedConfig.durationSeconds,
                        fps: normalizedConfig.fps,
                        width: normalizedConfig.width,
                        height: normalizedConfig.height,
                        expectedFrames,
                        metadata
                    }));
                    jobId = startPayload?.job?.jobId || '';
                    if (!jobId) throw new Error('Toolkit did not return a capture video job id.');
                    session = captureRuntimeRef.current.beginDeterministicCapture({
                        ...normalizedConfig,
                        setId: activeCaptureSet.id,
                        setName: activeCaptureSet.name
                    });
                    setCaptureVideoExportState((prev) => ({
                        ...prev,
                        jobId,
                        status: 'rendering_frames',
                        message: 'Rendering lineup frames...'
                    }));
                    for (let frameIndex = 0; frameIndex < session.totalFrames; frameIndex++) {
                        if (captureVideoCancelRef.current) throw new Error('Capture video export canceled.');
                        if (activeTabRef.current !== 'capture' || !captureRuntimeRef.current) {
                            throw new Error('Capture video export stopped because CAPTURE is no longer the active tab.');
                        }
                        const frame = await captureRuntimeRef.current.captureDeterministicFrame(session, frameIndex);
                        await withToolkit((bridge) => bridge.captureVideoFrame(jobId, frameIndex, frame.blob));
                        setCaptureVideoExportState((prev) => ({
                            ...prev,
                            currentFrame: frameIndex + 1,
                            progress: (frameIndex + 1) / session.totalFrames,
                            message: `Uploading frame ${frameIndex + 1}/${session.totalFrames}...`
                        }));
                        if ((frameIndex + 1) % 6 === 0) {
                            await new Promise((resolve) => setTimeout(resolve, 0));
                        }
                    }
                    await withToolkit((bridge) => bridge.captureVideoFinalize(jobId));
                    setCaptureVideoExportState((prev) => ({
                        ...prev,
                        status: 'encoding',
                        message: 'Encoding MP4 with ffmpeg...'
                    }));
                    const finalPayload = await pollCaptureVideoStatus(jobId);
                    const finalJob = finalPayload?.job || null;
                    const finalOutputPath = finalJob?.outputPath || '';
                    setCaptureVideoExportState((prev) => ({
                        ...prev,
                        exporting: false,
                        status: finalPayload?.status || 'completed',
                        outputPath: finalOutputPath || prev.outputPath,
                        progress: finalPayload?.status === 'completed' ? 1 : prev.progress,
                        error: finalJob?.error || '',
                        message: finalPayload?.status === 'completed'
                            ? `Saved MP4 to ${finalOutputPath || prev.outputPath}`
                            : (finalJob?.error || prev.message)
                    }));
                    if (finalPayload?.status === 'completed' && finalOutputPath) {
                        await reviewSavedCaptureVideo(finalOutputPath, metadata);
                    }
                } catch (error) {
                    if (jobId) {
                        try {
                            await withToolkit((bridge) => bridge.captureVideoCancel(jobId));
                        } catch (_) {}
                    }
                    setCaptureVideoExportState((prev) => ({
                        ...prev,
                        exporting: false,
                        status: captureVideoCancelRef.current ? 'canceled' : 'error',
                        error: error?.message || 'Capture video export failed.',
                        message: captureVideoCancelRef.current ? 'Capture video export canceled.' : 'Capture video export failed.'
                    }));
                    throw error;
                } finally {
                    if (session && captureRuntimeRef.current) {
                        await captureRuntimeRef.current.finishDeterministicCapture(session, { restore: true });
                    }
                }
            }, [activeCaptureConfig, activeCaptureSet, activePreviewPreset, activeTab, pollCaptureVideoStatus, refreshToolkitHealth, reviewSavedCaptureVideo, withToolkit]);

            const cancelCaptureVideoExport = useCallback(async () => {
                captureVideoCancelRef.current = true;
                if (captureVideoExportState.jobId) {
                    try {
                        await withToolkit((bridge) => bridge.captureVideoCancel(captureVideoExportState.jobId));
                    } catch (_) {}
                }
                setCaptureVideoExportState((prev) => ({
                    ...prev,
                    exporting: false,
                    status: 'canceled',
                    message: 'Capture video export canceled.'
                }));
            }, [captureVideoExportState.jobId, withToolkit]);

            useEffect(() => {
                if (activeTab !== 'preview' && previewVideoExportState.exporting) {
                    cancelPreviewVideoExport().catch(() => {});
                }
            }, [activeTab, previewVideoExportState.exporting, cancelPreviewVideoExport]);

            useEffect(() => {
                if (activeTab !== 'capture' && captureVideoExportState.exporting) {
                    cancelCaptureVideoExport().catch(() => {});
                }
            }, [activeTab, captureVideoExportState.exporting, cancelCaptureVideoExport]);

            const updatePreviewLayerById = (layerId, updater) => {
                updateActivePreviewPreset((preset) => ({
                    ...preset,
                    layers: preset.layers.map((layer) => layer.id === layerId ? updater(clonePreviewPreset({ layers: [layer] }).layers[0]) : layer)
                }));
            };

            const applyPreviewJsonDraft = (text) => {
                try {
                    const parsed = JSON.parse(text);
                    const validation = validatePreviewPreset(parsed);
                    if (!validation.valid) {
                        setPreviewJsonError(validation.errors.join('\n'));
                        setPreviewRuntimeStatus('invalid_preset');
                        return false;
                    }
                    const sanitized = validation.sanitizedPreset;
                    sanitized.id = previewActivePresetId || sanitized.id || createPreviewPresetId();
                    syncPreviewPresetUpdate((prev) => prev.map((preset) => preset.id === sanitized.id ? sanitized : preset));
                    setPreviewSelectedLayerId(sanitized.layers[0]?.id || null);
                    setPreviewJsonError('');
                    return true;
                } catch (error) {
                    setPreviewJsonError(error?.message || 'Invalid JSON.');
                    setPreviewRuntimeStatus('invalid_preset');
                    return false;
                }
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
                            try {
                                e.renderStack(steps);
                                for (const mode of OUTPUT_EXPORT_MODES) {
                                    const blob = await e.getTextureBlob(steps.length - 1, 'image/png', undefined, { mode });
                                    z.file(buildOutputFileName(`${profileName}_${r}`, mode), blob);
                                }
                            } finally {
                                disposeTextureEngine(e);
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
                preview: {
                    supported: previewSupported,
                    status: previewRuntimeStatus,
                    activeSourceId: previewActiveSourceId,
                    activeSourceItem: activePreviewSourceItem,
                    sourceItems: savedLibrary,
                    activePresetId: activePreviewPreset?.id || null,
                    activePreset: activePreviewPreset,
                    presets: previewPresets,
                    selectedLayerId: activePreviewLayer?.id || null,
                    selectedLayer: activePreviewLayer,
                    expandedModuleKey: activePreviewExpandedModule,
                    advancedOpen: activePreviewAdvancedOpen,
                    isPlaying: previewIsPlaying,
                    timeScale: previewTimeScale,
                    capture: activePreviewPreset?.scene?.capture || createDefaultPreviewPreset().scene.capture,
                    exportState: previewVideoExportState,
                    toolkitHealth,
                    jsonDraft: previewJsonDraft,
                    jsonError: previewJsonError,
                    setCanvasHost: (node) => setPreviewCanvasHost(node || null),
                    selectSource: (id) => setPreviewActiveSourceId(id || null),
                    selectPreset: (id) => {
                        const next = previewPresets.find((preset) => preset.id === id);
                        if (!next) return;
                        setPreviewActivePresetId(next.id);
                        setPreviewSelectedLayerId(next.layers?.[0]?.id || null);
                        setPreviewJsonError('');
                    },
                    createPreset: () => {
                        const preset = createPreviewPresetFromDefault();
                        syncPreviewPresetUpdate((prev) => [...prev, preset]);
                        setPreviewActivePresetId(preset.id);
                        setPreviewSelectedLayerId(preset.layers[0]?.id || null);
                        setPreviewJsonDraft(JSON.stringify(preset, null, 2));
                    },
                    duplicatePreset: (id) => {
                        const source = previewPresets.find((preset) => preset.id === (id || previewActivePresetId));
                        if (!source) return;
                        const next = clonePreviewPreset(source);
                        next.id = createPreviewPresetId();
                        next.name = `${source.name} Copy`;
                        next.layers = next.layers.map((layer, index) => ({ ...layer, id: createPreviewLayerId(index) }));
                        syncPreviewPresetUpdate((prev) => [...prev, next]);
                        setPreviewActivePresetId(next.id);
                        setPreviewSelectedLayerId(next.layers[0]?.id || null);
                    },
                    renamePreset: (id, name) => {
                        syncPreviewPresetUpdate((prev) => prev.map((preset) => preset.id === (id || previewActivePresetId) ? { ...preset, name: String(name || '').trim() || preset.name } : preset));
                    },
                    deletePreset: (id) => {
                        const targetId = id || previewActivePresetId;
                        if (!targetId) return;
                        syncPreviewPresetUpdate((prev) => {
                            if (prev.length <= 1) {
                                const fallback = createDefaultPreviewPreset();
                                setPreviewActivePresetId(fallback.id);
                                setPreviewSelectedLayerId(fallback.layers[0]?.id || null);
                                return [fallback];
                            }
                            const next = prev.filter((preset) => preset.id !== targetId);
                            const fallback = next[0];
                            setPreviewActivePresetId(fallback.id);
                            setPreviewSelectedLayerId(fallback.layers[0]?.id || null);
                            return next;
                        });
                    },
                    replaceWithDefault: () => {
                        const replacement = createDefaultPreviewPreset();
                        replacement.id = previewActivePresetId || replacement.id;
                        updateActivePreviewPreset(() => replacement);
                        setPreviewSelectedLayerId(replacement.layers[0]?.id || null);
                        setPreviewJsonError('');
                    },
                    resetSceneCamera: () => {
                        const defaults = createDefaultPreviewPreset().scene;
                        updateActivePreviewPreset((preset) => ({
                            ...preset,
                            scene: {
                                ...preset.scene,
                                cameraFov: defaults.cameraFov,
                                cameraDistance: defaults.cameraDistance,
                                cameraPitch: defaults.cameraPitch,
                                cameraYaw: defaults.cameraYaw
                            }
                        }));
                    },
                    updateSceneField: (key, value) => updateActivePreviewPreset((preset) => ({ ...preset, scene: { ...preset.scene, [key]: value } })),
                    updateSceneFields: (patch) => updateActivePreviewPreset((preset) => ({ ...preset, scene: { ...preset.scene, ...(patch || {}) } })),
                    updateCaptureField: (key, value) => updateActivePreviewCapture((capture) => ({ ...capture, [key]: value })),
                    updateCaptureFields: (patch) => updateActivePreviewCapture((capture) => ({ ...capture, ...(patch || {}) })),
                    addLayer: () => updateActivePreviewPreset((preset) => {
                        const layer = createDefaultPreviewLayer(preset.layers.length);
                        layer.id = createPreviewLayerId(preset.layers.length);
                        setPreviewSelectedLayerId(layer.id);
                        return { ...preset, layers: [...preset.layers, layer] };
                    }),
                    duplicateLayer: (id) => updateActivePreviewPreset((preset) => {
                        const source = preset.layers.find((layer) => layer.id === (id || previewSelectedLayerId));
                        if (!source) return preset;
                        const duplicate = clonePreviewPreset({ layers: [source] }).layers[0];
                        duplicate.id = createPreviewLayerId(preset.layers.length);
                        duplicate.name = `${source.name} Copy`;
                        setPreviewSelectedLayerId(duplicate.id);
                        return { ...preset, layers: [...preset.layers, duplicate] };
                    }),
                    deleteLayer: (id) => updateActivePreviewPreset((preset) => {
                        if (preset.layers.length <= 1) return preset;
                        const targetId = id || previewSelectedLayerId;
                        const nextLayers = preset.layers.filter((layer) => layer.id !== targetId);
                        setPreviewSelectedLayerId(nextLayers[0]?.id || null);
                        return { ...preset, layers: nextLayers };
                    }),
                    reorderLayer: (id, direction) => updateActivePreviewPreset((preset) => {
                        const index = preset.layers.findIndex((layer) => layer.id === id);
                        const target = index + direction;
                        if (index < 0 || target < 0 || target >= preset.layers.length) return preset;
                        const nextLayers = [...preset.layers];
                        [nextLayers[index], nextLayers[target]] = [nextLayers[target], nextLayers[index]];
                        return { ...preset, layers: nextLayers };
                    }),
                    selectLayer: (id) => setPreviewSelectedLayerId(id || null),
                    setExpandedModule: (layerId, moduleKey) => {
                        const key = getPreviewLayerUiKey(previewActivePresetId, layerId || previewSelectedLayerId);
                        setPreviewExpandedModules((prev) => {
                            const next = { ...(prev || {}) };
                            if (!moduleKey) delete next[key];
                            else next[key] = moduleKey;
                            return next;
                        });
                    },
                    toggleAdvancedPanel: (layerId) => {
                        const key = getPreviewLayerUiKey(previewActivePresetId, layerId || previewSelectedLayerId);
                        setPreviewAdvancedPanels((prev) => ({ ...(prev || {}), [key]: !prev?.[key] }));
                    },
                    updateLayerSection: (layerId, sectionKey, patch) => updatePreviewLayerById(layerId, (layer) => {
                        if (sectionKey === 'root') return { ...layer, ...patch };
                        return { ...layer, [sectionKey]: { ...layer[sectionKey], ...patch } };
                    }),
                    setJsonDraft: (text) => setPreviewJsonDraft(text),
                    applyJsonDraft: (text) => applyPreviewJsonDraft(text),
                    resetJsonDraft: () => {
                        if (!activePreviewPreset) return;
                        setPreviewJsonDraft(JSON.stringify(activePreviewPreset, null, 2));
                        setPreviewJsonError('');
                    },
                    resetSimulation: () => {
                        if (previewRuntimeRef.current) previewRuntimeRef.current.resetSimulation();
                    },
                    setPlaying: (value) => setPreviewIsPlaying(!!value),
                    setTimeScale: (value) => setPreviewTimeScale(clampPreviewValue(Number(value) || 0, 0, 3)),
                    checkToolkitHealth: async () => await refreshToolkitHealth(),
                    startVideoExport: async () => {
                        try {
                            await startPreviewVideoExport();
                        } catch (error) {
                            console.error(error);
                        }
                    },
                    cancelVideoExport: async () => await cancelPreviewVideoExport()
                },
                capture: {
                    supported: previewSupported,
                    status: captureRuntimeStatus,
                    activeSetId: activeCaptureSet?.id || '',
                    activeSet: activeCaptureSet,
                    sets,
                    captureConfig: activeCaptureConfig,
                    focusState: captureFocusState,
                    exportState: captureVideoExportState,
                    reviewState: captureReviewState,
                    toolkitHealth,
                    presetName: activePreviewPreset?.name || '',
                    setCanvasHost: (node) => setCaptureCanvasHost(node || null),
                    selectSet: (id) => setCaptureActiveSetId(id || ''),
                    updateCaptureConfig: (patch) => setCaptureConfig((prev) => normalizeCaptureLineupConfig(typeof patch === 'function' ? patch(prev) : { ...prev, ...(patch || {}) }, activeCaptureSet?.name || 'Texture Set', activePreviewPreset?.name || 'Turbulence Demo')),
                    updateCaptureField: (key, value) => setCaptureConfig((prev) => normalizeCaptureLineupConfig({ ...prev, [key]: value }, activeCaptureSet?.name || 'Texture Set', activePreviewPreset?.name || 'Turbulence Demo')),
                    resetSimulation: () => {
                        if (captureRuntimeRef.current) {
                            captureRuntimeRef.current.resetSimulation();
                            syncCaptureFocusState(captureRuntimeRef.current);
                        }
                    },
                    checkToolkitHealth: async () => await refreshToolkitHealth(),
                    startCaptureVideoExport: async () => {
                        try {
                            await startCaptureVideoExport();
                        } catch (error) {
                            console.error(error);
                        }
                    },
                    cancelCaptureVideoExport: async () => await cancelCaptureVideoExport(),
                    reviewSavedCaptureVideo: async () => {
                        try {
                            return await reviewSavedCaptureVideo(captureVideoExportState.outputPath || captureReviewState.outputPath, {
                                setId: activeCaptureSet?.id || '',
                                setName: activeCaptureSet?.name || '',
                                presetName: activePreviewPreset?.name || '',
                                itemCount: activeCaptureSet?.items?.length || 0
                            });
                        } catch (error) {
                            console.error(error);
                            return null;
                        }
                    }
                },
                toolkit: {
                    baseUrl: toolkitBaseUrl,
                    setBaseUrl: (value) => {
                        const nextValue = String(value || TOOLKIT_DEFAULT_URL).trim() || TOOLKIT_DEFAULT_URL;
                        setToolkitBaseUrl(nextValue);
                        toolkitBridgeRef.current.setBaseUrl(nextValue);
                    },
                    health: toolkitHealth,
                    catalog: toolkitCatalog,
                    lastRun: toolkitLastRun,
                    logs: toolkitLogs,
                    lastError: toolkitLastError,
                    checkHealth: async () => await refreshToolkitHealth(),
                    loadCatalog: async () => await refreshToolkitCatalog(),
                    loadLatestRun: async () => await refreshToolkitLatestRun(),
                    loadLogs: async () => await refreshToolkitLogs(),
                    runTool: async (category, tool, args = {}) => {
                        const payload = await withToolkit((bridge) => bridge.run(category, tool, args));
                        setToolkitLastRun(payload);
                        await refreshToolkitLogs();
                        return payload;
                    }
                },
                library: {
	                    items: savedLibrary,
	                    sets,
	                    packConfig,
	                    setPackConfig,
	                    reorganizePacks,
	                    reorderByDrag,
                    sendToFront,
                    sendToBack,
	                    onSave: (it) => setSavedLibrary(p => [...p, { ...it, url: null }]),
                    replaceItems: (items, options = {}) => {
                        const nextLibrary = (Array.isArray(items) ? items : []).map((item, index) => ({
                            ...item,
                            id: String(item?.id || `validation-${index + 1}`),
                            name: String(item?.name || `Validation_${String(index + 1).padStart(2, '0')}`),
                            config: hydrateConfigDefaults(Array.isArray(item?.config) ? item.config : []),
                            storageKey: item?.storageKey || null,
                            url: typeof item?.url === 'string' ? item.url : null
                        }));
                        setSavedLibrary(nextLibrary);
                        setDreamState((prev) => ({ ...prev, results: nextLibrary.map((item) => ({ ...item })) }));
                        setPreviewActiveSourceId((currentId) => (
                            nextLibrary.some((item) => item.id === currentId)
                                ? currentId
                                : (options.selectFirstSource === false ? null : (nextLibrary[0]?.id || null))
                        ));
                        setCaptureActiveSetId('');
                    },
	                    onLoad: (cfg) => { setSteps(hydrateConfigDefaults(cfg)); setActiveTab('builder'); },
                    openInPreview: (id) => {
                        if (!id) return;
                        setPreviewActiveSourceId(id);
                        setActiveTab('preview');
                    },
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
