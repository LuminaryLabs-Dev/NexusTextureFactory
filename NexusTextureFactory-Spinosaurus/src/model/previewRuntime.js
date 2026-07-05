        const PREVIEW_STORAGE_KEY_PRESETS = 'spinosaurus-preview-presets-v1';
        const PREVIEW_STORAGE_KEY_UI = 'spinosaurus-preview-ui-v1';
        const PREVIEW_DEFAULT_PRESET_ID = 'preset-emitter-sandbox';
        const PREVIEW_PRESET_VERSION = 3;
        const PREVIEW_MAX_PARTICLES_PER_LAYER = 8192;
        const PREVIEW_MAX_PARTICLES_TOTAL = 16384;
        const PREVIEW_DEFAULT_PARTICLES_PER_LAYER = 2048;
        const PREVIEW_EMITTER_SHAPES = ['point', 'sphere', 'box', 'cone', 'ring'];
        const PREVIEW_BLEND_MODES = ['alpha', 'additive'];
        const PREVIEW_BILLBOARD_MODES = ['spherical'];
        const PREVIEW_PRESET_SOURCE_MODES = ['fallback_square_50', 'selected_or_fallback'];
        const PREVIEW_CAPTURE_FORMATS = ['mp4'];
        const PREVIEW_CAPTURE_CODECS = ['h264'];
        const PREVIEW_CAPTURE_CAMERA_MODES = ['hold_current', 'hold_preset', 'orbit_yaw', 'orbit_drift', 'dolly_x', 'dolly_z', 'pedestal_y', 'stage_scroll_x', 'figure8', 'keyframed'];
        const PREVIEW_CAPTURE_ACTIVITY_MODES = ['all_together', 'focused_only', 'hybrid_fade'];
        const PREVIEW_CAPTURE_STAGE_MODES = ['none', 'grid_floor', 'cube_lane_5u', 'distance_ticks_5u', 'bounds_box'];
        const PREVIEW_CAPTURE_START_MODES = ['continue_live', 'reset_no_warmup', 'reset_and_warmup', 'loop_locked'];
        const PREVIEW_CAPTURE_REVIEW_FRAME_COUNT = 5;
        const PREVIEW_MODULE_KEYS = ['main', 'emission', 'shape', 'velocityOverLifetime', 'forceOverLifetime', 'limitVelocityOverLifetime', 'noise', 'colorOverLifetime', 'colorBySpeed', 'sizeOverLifetime', 'sizeBySpeed', 'rotationOverLifetime', 'rotationBySpeed', 'collision', 'subEmitters', 'textureSheetAnimation', 'inheritVelocity', 'lifetimeByEmitterSpeed', 'trails', 'customData', 'renderer'];
        const PREVIEW_SCALAR_PARAMETER_MODES = ['constant', 'two_constants', 'curve', 'two_curves'];
        const PREVIEW_COLOR_PARAMETER_MODES = ['color', 'two_colors', 'gradient', 'two_gradients'];
        const PREVIEW_VECTOR_PARAMETER_MODES = ['constant', 'two_constants'];
        const PREVIEW_CURVE_TANGENT_MODES = ['linear', 'smooth', 'flat'];
        const PREVIEW_FIXED_TIMESTEP = 1 / 60;
        const PREVIEW_MAX_CATCHUP_STEPS = 6;
        const PREVIEW_WARMUP_SECONDS = 0.65;
        const PREVIEW_DEFAULT_SOURCE_MODE = 'fallback_square_50';
        const PREVIEW_FALLBACK_ALPHA = 0.5;
        const PREVIEW_CAMERA_TARGET = new THREE.Vector3(0, 0.6, 0);
        const PREVIEW_GRID_Y = 0;
        const PREVIEW_GRID_SIZE = 160;
        const PREVIEW_GRID_MAJOR_STEP = 5;
        const PREVIEW_GRID_MINOR_STEP = 1;
        const PREVIEW_GRID_FADE_INNER_MULTIPLIER = 4;
        const PREVIEW_GRID_FADE_OUTER_MULTIPLIER = 10;

        const createPreviewLayerId = (index = 0) => `layer-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`;
        const createPreviewPresetId = () => `preset-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const clampPreviewValue = (value, min, max) => Math.max(min, Math.min(max, value));
        const isFiniteNumber = (value) => typeof value === 'number' && Number.isFinite(value);
        const clonePreviewPreset = (preset) => JSON.parse(JSON.stringify(preset || createDefaultPreviewPreset()));

        const PREVIEW_TMP_VEC3 = new THREE.Vector3();
        const PREVIEW_TMP_VEC3_B = new THREE.Vector3();
        const PREVIEW_TMP_VEC3_C = new THREE.Vector3();
        const PREVIEW_TMP_EULER = new THREE.Euler();
        const PREVIEW_TMP_COLOR = new THREE.Color();
        const PREVIEW_TMP_COLOR_B = new THREE.Color();
        const PREVIEW_UP = new THREE.Vector3(0, 1, 0);

        function createDefaultPreviewModules() {
            return {
                main: {
                    enabled: true,
                    expanded: true,
                    mode: 'main',
                    settings: {
                        duration: 1.6,
                        loop: true,
                        lifetimeParam: createPreviewScalarParameter('two_constants', { constants: [1.1, 1.85] }),
                        lifetime: [1.1, 1.85],
                        startSpeedParam: createPreviewScalarParameter('two_constants', { constants: [1.6, 3.1] }),
                        startSpeed: [1.6, 3.1],
                        startSizeParam: createPreviewScalarParameter('two_constants', { constants: [0.12, 0.26] }),
                        startSize: [0.12, 0.26],
                        startRotationParam: createPreviewScalarParameter('two_constants', { constants: [-0.35, 0.35] }),
                        startRotation: [-0.35, 0.35],
                        startColorParam: createPreviewColorParameter('two_colors', { colors: ['#eef8ff', '#9dd9ff'] }),
                        startColorStart: '#eef8ff',
                        startColorEnd: '#9dd9ff',
                        simulationSpeed: 1
                    }
                },
                emission: {
                    enabled: true,
                    expanded: false,
                    mode: 'schedule',
                    settings: {
                        rate: 120,
                        burst: 18,
                        bursts: [{ time: 0, count: 18, cycles: 1, interval: 0 }],
                        burstTime: 0,
                        loop: true,
                        duration: 1.6
                    }
                },
                shape: {
                    enabled: true,
                    expanded: false,
                    mode: 'cone',
                    settings: {
                        shape: 'cone',
                        position: [0, 0, 0],
                        rotation: [0, 0, 0],
                        size: [0.28, 0.55, 0.28],
                        direction: [0.45, 1, 0.05],
                        spread: 0.62
                    }
                },
                velocityOverLifetime: {
                    enabled: true,
                    expanded: false,
                    mode: 'vector',
                    settings: {
                        linear: [0, 0.15, 0],
                        gravity: [0, -0.34, 0],
                        drag: 0.08
                    }
                },
                forceOverLifetime: {
                    enabled: false,
                    expanded: false,
                    mode: 'force',
                    settings: {
                        force: [0, 0, 0],
                        vortexStrength: 0,
                        radialAttraction: 0
                    }
                },
                limitVelocityOverLifetime: {
                    enabled: true,
                    expanded: false,
                    mode: 'limit',
                    settings: {
                        speedLimit: 4.5,
                        dampen: 0.1
                    }
                },
                noise: {
                    enabled: true,
                    expanded: false,
                    mode: 'perlin',
                    settings: {
                        noiseStrength: 1.15,
                        noiseScale: 1.45,
                        scrollSpeed: 0.7
                    }
                },
                colorOverLifetime: {
                    enabled: true,
                    expanded: false,
                    mode: 'gradient',
                    settings: {
                        colorParam: createPreviewColorParameter('gradient', {
                            gradient: createPreviewGradientDefinition(['#dff5ff', '#4fc3ff'])
                        }),
                        colorStart: '#dff5ff',
                        colorEnd: '#4fc3ff'
                    }
                },
                colorBySpeed: {
                    enabled: false,
                    expanded: false,
                    mode: 'blend',
                    settings: {
                        minSpeed: 0,
                        maxSpeed: 5,
                        lowSpeedColor: '#ffffff',
                        highSpeedColor: '#82cfff'
                    }
                },
                sizeOverLifetime: {
                    enabled: true,
                    expanded: false,
                    mode: 'curve',
                    settings: {
                        curveParam: createPreviewScalarParameter('curve', {
                            curve: createPreviewCurveDefinition([0.4, 1.3, 0.06])
                        }),
                        curve: [0.4, 1.3, 0.06],
                        size: [0.4, 0.06]
                    }
                },
                sizeBySpeed: {
                    enabled: false,
                    expanded: false,
                    mode: 'curve',
                    settings: {
                        minSpeed: 0,
                        maxSpeed: 5,
                        scale: [0.75, 1.25]
                    }
                },
                rotationOverLifetime: {
                    enabled: true,
                    expanded: false,
                    mode: 'spin',
                    settings: {
                        spinParam: createPreviewScalarParameter('two_constants', { constants: [-3.2, 3.2] }),
                        spin: [-3.2, 3.2]
                    }
                },
                rotationBySpeed: {
                    enabled: false,
                    expanded: false,
                    mode: 'spin',
                    settings: {
                        minSpeed: 0,
                        maxSpeed: 5,
                        spin: [-1.5, 1.5]
                    }
                },
                collision: {
                    enabled: false,
                    expanded: false,
                    mode: 'world',
                    settings: {
                        planeY: -1.15,
                        bounce: 0.35,
                        dampen: 0.18,
                        lifetimeLoss: 0.12
                    }
                },
                subEmitters: {
                    enabled: false,
                    expanded: false,
                    mode: 'events',
                    settings: {
                        targetLayerId: null,
                        birthCount: 0,
                        deathCount: 0,
                        collisionCount: 0
                    }
                },
                textureSheetAnimation: {
                    enabled: false,
                    expanded: false,
                    mode: 'single',
                    settings: {
                        columns: 1,
                        rows: 1,
                        cycles: 1,
                        startFrame: 0,
                        randomRow: false,
                        frameOverLife: [0, 1]
                    }
                },
                inheritVelocity: {
                    enabled: false,
                    expanded: false,
                    mode: 'none',
                    settings: {
                        factor: 0
                    }
                },
                lifetimeByEmitterSpeed: {
                    enabled: false,
                    expanded: false,
                    mode: 'range',
                    settings: {
                        minSpeed: 0,
                        maxSpeed: 4,
                        lifetimeScale: [1, 1]
                    }
                },
                trails: {
                    enabled: false,
                    expanded: false,
                    mode: 'ribbon',
                    settings: {
                        length: 6,
                        widthOverTrail: [0.7, 0.35, 0],
                        alphaOverTrail: [0.55, 0.18, 0]
                    }
                },
                customData: {
                    enabled: false,
                    expanded: false,
                    mode: 'channels',
                    settings: {
                        data1: [0, 1],
                        data2: [0, 1]
                    }
                },
                renderer: {
                    enabled: true,
                    expanded: false,
                    mode: 'billboard',
                    settings: {
                        blend: 'additive',
                        billboard: 'spherical',
                        alphaClip: 0.001,
                        alphaOverLifeParam: createPreviewScalarParameter('curve', {
                            curve: createPreviewCurveDefinition([0.35, 1, 0])
                        }),
                        alphaOverLife: [0.35, 1, 0],
                        sizeOverLifeParam: createPreviewScalarParameter('curve', {
                            curve: createPreviewCurveDefinition([0.4, 1.3, 0.06])
                        }),
                        sizeOverLife: [0.4, 1.3, 0.06],
                        materialSource: 'selected_or_fallback'
                    }
                }
            };
        }

        function normalizePreviewArray(value, length, fallback) {
            const source = Array.isArray(value) ? value : fallback;
            const next = [];
            for (let i = 0; i < length; i++) {
                const candidate = source[i];
                next.push(isFiniteNumber(candidate) ? candidate : fallback[i]);
            }
            return next;
        }

        function normalizePreviewRange(value, fallback) {
            return normalizePreviewArray(value, 2, fallback).sort((a, b) => a - b);
        }

        function normalizePreviewCurve(value, fallback) {
            if (Array.isArray(value)) return normalizePreviewArray(value, 3, fallback);
            if (isFiniteNumber(value)) return [value, value, value];
            if (value && typeof value === 'object') {
                if (Array.isArray(value.points)) return normalizePreviewArray(value.points, 3, fallback);
                if (isFiniteNumber(value.constant)) return [value.constant, value.constant, value.constant];
                if (Array.isArray(value.range)) {
                    const range = normalizePreviewRange(value.range, [fallback[0], fallback[2]]);
                    return [range[0], (range[0] + range[1]) * 0.5, range[1]];
                }
            }
            return fallback.slice();
        }

        function normalizePreviewColor(value, fallback) {
            const str = String(value || fallback || '').trim();
            return /^#[0-9a-fA-F]{6}$/.test(str) ? str : fallback;
        }

        function normalizePreviewBursts(value, fallback) {
            if (Array.isArray(value) && value.length > 0) {
                return value.map((entry) => ({
                    time: Math.max(0, isFiniteNumber(entry?.time) ? entry.time : 0),
                    count: Math.max(0, Math.round(isFiniteNumber(entry?.count) ? entry.count : 0)),
                    cycles: Math.max(1, Math.round(isFiniteNumber(entry?.cycles) ? entry.cycles : 1)),
                    interval: Math.max(0, isFiniteNumber(entry?.interval) ? entry.interval : 0)
                })).filter((entry) => entry.count > 0);
            }
            if (isFiniteNumber(value) && value > 0) {
                return [{ time: 0, count: Math.round(value), cycles: 1, interval: 0 }];
            }
            return fallback.map((entry) => ({ ...entry }));
        }

        function createPreviewCurveDefinition(points = [0, 1, 0]) {
            const normalized = normalizePreviewArray(points, 3, [0, 1, 0]);
            return {
                keys: [
                    { time: 0, value: normalized[0], tangent: 'linear' },
                    { time: 0.5, value: normalized[1], tangent: 'smooth' },
                    { time: 1, value: normalized[2], tangent: 'linear' }
                ]
            };
        }

        function clonePreviewCurveDefinition(curve) {
            const normalized = curve && typeof curve === 'object' ? curve : createPreviewCurveDefinition();
            return {
                keys: (normalized.keys || []).map((key, index) => ({
                    time: clampPreviewValue(isFiniteNumber(key?.time) ? key.time : (index / Math.max(1, (normalized.keys?.length || 2) - 1)), 0, 1),
                    value: isFiniteNumber(key?.value) ? key.value : 0,
                    tangent: PREVIEW_CURVE_TANGENT_MODES.includes(key?.tangent) ? key.tangent : 'smooth'
                }))
            };
        }

        function normalizePreviewCurveDefinition(value, fallback) {
            const fallbackCurve = clonePreviewCurveDefinition(
                fallback && typeof fallback === 'object' && Array.isArray(fallback.keys)
                    ? fallback
                    : createPreviewCurveDefinition(Array.isArray(fallback) ? fallback : [0, 1, 0])
            );
            if (Array.isArray(value)) return createPreviewCurveDefinition(normalizePreviewArray(value, 3, curveDefinitionToPoints(fallbackCurve)));
            if (isFiniteNumber(value)) return createPreviewCurveDefinition([value, value, value]);
            if (value && typeof value === 'object') {
                if (Array.isArray(value.points)) return createPreviewCurveDefinition(normalizePreviewArray(value.points, 3, curveDefinitionToPoints(fallbackCurve)));
                if (Array.isArray(value.keys)) {
                    const sorted = value.keys
                        .map((key, index) => ({
                            time: clampPreviewValue(isFiniteNumber(key?.time) ? key.time : (index / Math.max(1, value.keys.length - 1)), 0, 1),
                            value: isFiniteNumber(key?.value) ? key.value : fallbackCurve.keys[Math.min(index, fallbackCurve.keys.length - 1)]?.value || 0,
                            tangent: PREVIEW_CURVE_TANGENT_MODES.includes(key?.tangent) ? key.tangent : 'smooth'
                        }))
                        .sort((a, b) => a.time - b.time);
                    if (sorted.length >= 2) {
                        if (sorted[0].time > 0) sorted.unshift({ ...sorted[0], time: 0 });
                        if (sorted[sorted.length - 1].time < 1) sorted.push({ ...sorted[sorted.length - 1], time: 1 });
                        return { keys: sorted };
                    }
                }
                if (isFiniteNumber(value.constant)) return createPreviewCurveDefinition([value.constant, value.constant, value.constant]);
                if (Array.isArray(value.range)) {
                    const range = normalizePreviewRange(value.range, [curveDefinitionToPoints(fallbackCurve)[0], curveDefinitionToPoints(fallbackCurve)[2]]);
                    return createPreviewCurveDefinition([range[0], (range[0] + range[1]) * 0.5, range[1]]);
                }
            }
            return fallbackCurve;
        }

        function evaluatePreviewCurveDefinition(curve, t) {
            const normalized = normalizePreviewCurveDefinition(curve, [0, 1, 0]);
            const safeT = clampPreviewValue(t, 0, 1);
            const keys = normalized.keys;
            if (safeT <= keys[0].time) return keys[0].value;
            if (safeT >= keys[keys.length - 1].time) return keys[keys.length - 1].value;
            for (let index = 0; index < keys.length - 1; index++) {
                const start = keys[index];
                const end = keys[index + 1];
                if (safeT < start.time || safeT > end.time) continue;
                const localT = end.time <= start.time ? 0 : (safeT - start.time) / (end.time - start.time);
                return THREE.MathUtils.lerp(start.value, end.value, localT);
            }
            return keys[keys.length - 1].value;
        }

        function curveDefinitionToPoints(curve) {
            return [
                evaluatePreviewCurveDefinition(curve, 0),
                evaluatePreviewCurveDefinition(curve, 0.5),
                evaluatePreviewCurveDefinition(curve, 1)
            ];
        }

        function curveDefinitionToRange(curve) {
            const normalized = normalizePreviewCurveDefinition(curve, [0, 1, 0]);
            const values = normalized.keys.map((key) => key.value);
            return [Math.min(...values), Math.max(...values)];
        }

        function createPreviewGradientDefinition(colors = ['#ffffff', '#ffffff']) {
            const fallback = Array.isArray(colors) && colors.length >= 2 ? colors : ['#ffffff', '#ffffff'];
            return {
                stops: [
                    { time: 0, color: normalizePreviewColor(fallback[0], '#ffffff') },
                    { time: 1, color: normalizePreviewColor(fallback[1], '#ffffff') }
                ]
            };
        }

        function clonePreviewGradientDefinition(gradient) {
            const normalized = gradient && typeof gradient === 'object' ? gradient : createPreviewGradientDefinition();
            return {
                stops: (normalized.stops || []).map((stop, index) => ({
                    time: clampPreviewValue(isFiniteNumber(stop?.time) ? stop.time : (index / Math.max(1, (normalized.stops?.length || 2) - 1)), 0, 1),
                    color: normalizePreviewColor(stop?.color, '#ffffff')
                }))
            };
        }

        function normalizePreviewGradientDefinition(value, fallback) {
            const fallbackGradient = clonePreviewGradientDefinition(
                fallback && typeof fallback === 'object' && Array.isArray(fallback.stops)
                    ? fallback
                    : createPreviewGradientDefinition(Array.isArray(fallback) ? fallback : ['#ffffff', '#ffffff'])
            );
            if (Array.isArray(value) && value.length >= 2) return createPreviewGradientDefinition([value[0], value[value.length - 1]]);
            if (typeof value === 'string') return createPreviewGradientDefinition([value, value]);
            if (value && typeof value === 'object' && Array.isArray(value.stops)) {
                const sorted = value.stops
                    .map((stop, index) => ({
                        time: clampPreviewValue(isFiniteNumber(stop?.time) ? stop.time : (index / Math.max(1, value.stops.length - 1)), 0, 1),
                        color: normalizePreviewColor(stop?.color, fallbackGradient.stops[Math.min(index, fallbackGradient.stops.length - 1)]?.color || '#ffffff')
                    }))
                    .sort((a, b) => a.time - b.time);
                if (sorted.length >= 2) {
                    if (sorted[0].time > 0) sorted.unshift({ ...sorted[0], time: 0 });
                    if (sorted[sorted.length - 1].time < 1) sorted.push({ ...sorted[sorted.length - 1], time: 1 });
                    return { stops: sorted };
                }
            }
            return fallbackGradient;
        }

        function samplePreviewGradient(out, gradient, t) {
            const normalized = normalizePreviewGradientDefinition(gradient, ['#ffffff', '#ffffff']);
            const safeT = clampPreviewValue(t, 0, 1);
            const stops = normalized.stops;
            if (safeT <= stops[0].time) return out.copy(colorFromHex(stops[0].color));
            if (safeT >= stops[stops.length - 1].time) return out.copy(colorFromHex(stops[stops.length - 1].color));
            for (let index = 0; index < stops.length - 1; index++) {
                const start = stops[index];
                const end = stops[index + 1];
                if (safeT < start.time || safeT > end.time) continue;
                const localT = end.time <= start.time ? 0 : (safeT - start.time) / (end.time - start.time);
                return lerpPreviewColor(out, colorFromHex(start.color), colorFromHex(end.color), localT);
            }
            return out.copy(colorFromHex(stops[stops.length - 1].color));
        }

        function gradientDefinitionToColors(gradient) {
            const normalized = normalizePreviewGradientDefinition(gradient, ['#ffffff', '#ffffff']);
            return [
                normalized.stops[0]?.color || '#ffffff',
                normalized.stops[normalized.stops.length - 1]?.color || '#ffffff'
            ];
        }

        function createPreviewScalarParameter(mode = 'constant', options = {}) {
            const resolvedMode = PREVIEW_SCALAR_PARAMETER_MODES.includes(mode) ? mode : 'constant';
            if (resolvedMode === 'two_constants') {
                return { type: 'scalar', mode: resolvedMode, constants: normalizePreviewRange(options.constants, [0, 1]) };
            }
            if (resolvedMode === 'curve') {
                return { type: 'scalar', mode: resolvedMode, curve: normalizePreviewCurveDefinition(options.curve, [0, 1, 0]) };
            }
            if (resolvedMode === 'two_curves') {
                const curves = Array.isArray(options.curves) ? options.curves : [options.curveA, options.curveB];
                const fallbackA = curves?.[0] || createPreviewCurveDefinition([0, 1, 0]);
                const fallbackB = curves?.[1] || createPreviewCurveDefinition([0, 1, 0]);
                return {
                    type: 'scalar',
                    mode: resolvedMode,
                    curves: [
                        normalizePreviewCurveDefinition(fallbackA, [0, 1, 0]),
                        normalizePreviewCurveDefinition(fallbackB, [0, 1, 0])
                    ]
                };
            }
            return { type: 'scalar', mode: 'constant', constant: isFiniteNumber(options.constant) ? options.constant : 0 };
        }

        function normalizePreviewScalarParameter(value, fallback) {
            const fallbackParam = fallback && typeof fallback === 'object' ? fallback : createPreviewScalarParameter('constant', { constant: 0 });
            if (isFiniteNumber(value)) return createPreviewScalarParameter('constant', { constant: value });
            if (Array.isArray(value) && value.length === 2) return createPreviewScalarParameter('two_constants', { constants: value });
            if (Array.isArray(value) && value.length === 3) return createPreviewScalarParameter('curve', { curve: createPreviewCurveDefinition(value) });
            if (value && typeof value === 'object') {
                const mode = PREVIEW_SCALAR_PARAMETER_MODES.includes(value.mode)
                    ? value.mode
                    : (Array.isArray(value.curves) ? 'two_curves' : (value.curve || Array.isArray(value.keys) || Array.isArray(value.points) ? 'curve' : (Array.isArray(value.constants) || Array.isArray(value.range) ? 'two_constants' : 'constant')));
                if (mode === 'two_constants') return createPreviewScalarParameter(mode, { constants: value.constants || value.range || scalarParameterToRange(fallbackParam, [0, 1]) });
                if (mode === 'curve') return createPreviewScalarParameter(mode, { curve: value.curve || value });
                if (mode === 'two_curves') return createPreviewScalarParameter(mode, { curves: value.curves || [value.curveA, value.curveB] });
                return createPreviewScalarParameter('constant', { constant: isFiniteNumber(value.constant) ? value.constant : scalarParameterToRange(fallbackParam, [0, 0])[0] });
            }
            return createPreviewScalarParameter(fallbackParam.mode, fallbackParam);
        }

        function scalarParameterToRange(parameter, fallback) {
            const normalized = normalizePreviewScalarParameter(parameter, createPreviewScalarParameter('two_constants', { constants: fallback || [0, 1] }));
            if (normalized.mode === 'constant') return [normalized.constant, normalized.constant];
            if (normalized.mode === 'two_constants') return normalizePreviewRange(normalized.constants, fallback || [0, 1]);
            if (normalized.mode === 'curve') return curveDefinitionToRange(normalized.curve);
            if (normalized.mode === 'two_curves') {
                const first = curveDefinitionToRange(normalized.curves[0]);
                const second = curveDefinitionToRange(normalized.curves[1]);
                return [Math.min(first[0], second[0]), Math.max(first[1], second[1])];
            }
            return normalizePreviewRange(fallback || [0, 1], [0, 1]);
        }

        function scalarParameterToCurvePoints(parameter, fallback) {
            const normalized = normalizePreviewScalarParameter(parameter, createPreviewScalarParameter('curve', { curve: createPreviewCurveDefinition(fallback || [0, 1, 0]) }));
            if (normalized.mode === 'constant') return [normalized.constant, normalized.constant, normalized.constant];
            if (normalized.mode === 'two_constants') {
                const range = normalizePreviewRange(normalized.constants, fallback ? [fallback[0], fallback[2]] : [0, 1]);
                return [range[0], (range[0] + range[1]) * 0.5, range[1]];
            }
            if (normalized.mode === 'curve') return curveDefinitionToPoints(normalized.curve);
            if (normalized.mode === 'two_curves') {
                const first = curveDefinitionToPoints(normalized.curves[0]);
                const second = curveDefinitionToPoints(normalized.curves[1]);
                return [
                    (first[0] + second[0]) * 0.5,
                    (first[1] + second[1]) * 0.5,
                    (first[2] + second[2]) * 0.5
                ];
            }
            return normalizePreviewCurve(fallback || [0, 1, 0], [0, 1, 0]);
        }

        function samplePreviewScalarParameter(parameter, t, seed = 0.5) {
            const normalized = normalizePreviewScalarParameter(parameter, createPreviewScalarParameter('constant', { constant: 0 }));
            if (normalized.mode === 'constant') return normalized.constant;
            if (normalized.mode === 'two_constants') return THREE.MathUtils.lerp(normalized.constants[0], normalized.constants[1], clampPreviewValue(seed, 0, 1));
            if (normalized.mode === 'curve') return evaluatePreviewCurveDefinition(normalized.curve, t);
            if (normalized.mode === 'two_curves') {
                const first = evaluatePreviewCurveDefinition(normalized.curves[0], t);
                const second = evaluatePreviewCurveDefinition(normalized.curves[1], t);
                return THREE.MathUtils.lerp(first, second, clampPreviewValue(seed, 0, 1));
            }
            return 0;
        }

        function createPreviewColorParameter(mode = 'color', options = {}) {
            const resolvedMode = PREVIEW_COLOR_PARAMETER_MODES.includes(mode) ? mode : 'color';
            if (resolvedMode === 'two_colors') {
                const colors = Array.isArray(options.colors) ? options.colors : [options.colorA, options.colorB];
                return {
                    type: 'color',
                    mode: resolvedMode,
                    colors: [
                        normalizePreviewColor(colors?.[0], '#ffffff'),
                        normalizePreviewColor(colors?.[1], '#ffffff')
                    ]
                };
            }
            if (resolvedMode === 'gradient') {
                return { type: 'color', mode: resolvedMode, gradient: normalizePreviewGradientDefinition(options.gradient, ['#ffffff', '#ffffff']) };
            }
            if (resolvedMode === 'two_gradients') {
                const gradients = Array.isArray(options.gradients) ? options.gradients : [options.gradientA, options.gradientB];
                return {
                    type: 'color',
                    mode: resolvedMode,
                    gradients: [
                        normalizePreviewGradientDefinition(gradients?.[0], ['#ffffff', '#ffffff']),
                        normalizePreviewGradientDefinition(gradients?.[1], ['#ffffff', '#ffffff'])
                    ]
                };
            }
            return { type: 'color', mode: 'color', color: normalizePreviewColor(options.color, '#ffffff') };
        }

        function normalizePreviewColorParameter(value, fallback) {
            const fallbackParam = fallback && typeof fallback === 'object' ? fallback : createPreviewColorParameter('color', { color: '#ffffff' });
            if (typeof value === 'string') return createPreviewColorParameter('color', { color: value });
            if (Array.isArray(value) && value.length >= 2) {
                const preferredGradient = fallbackParam.mode === 'gradient' || fallbackParam.mode === 'two_gradients';
                if (preferredGradient) return createPreviewColorParameter('gradient', { gradient: createPreviewGradientDefinition([value[0], value[value.length - 1]]) });
                return createPreviewColorParameter('two_colors', { colors: [value[0], value[value.length - 1]] });
            }
            if (value && typeof value === 'object') {
                const mode = PREVIEW_COLOR_PARAMETER_MODES.includes(value.mode)
                    ? value.mode
                    : (Array.isArray(value.gradients) ? 'two_gradients' : (value.gradient || Array.isArray(value.stops) ? 'gradient' : (Array.isArray(value.colors) ? 'two_colors' : 'color')));
                if (mode === 'two_colors') return createPreviewColorParameter(mode, { colors: value.colors || [value.colorA, value.colorB] });
                if (mode === 'gradient') return createPreviewColorParameter(mode, { gradient: value.gradient || value });
                if (mode === 'two_gradients') return createPreviewColorParameter(mode, { gradients: value.gradients || [value.gradientA, value.gradientB] });
                return createPreviewColorParameter('color', { color: value.color || '#ffffff' });
            }
            return createPreviewColorParameter(fallbackParam.mode, fallbackParam);
        }

        function colorParameterToEndpointColors(parameter, fallbackStart, fallbackEnd) {
            const normalized = normalizePreviewColorParameter(parameter, createPreviewColorParameter('two_colors', { colors: [fallbackStart || '#ffffff', fallbackEnd || '#ffffff'] }));
            if (normalized.mode === 'color') return [normalized.color, normalized.color];
            if (normalized.mode === 'two_colors') return [normalized.colors[0], normalized.colors[1]];
            if (normalized.mode === 'gradient') return gradientDefinitionToColors(normalized.gradient);
            if (normalized.mode === 'two_gradients') {
                const first = gradientDefinitionToColors(normalized.gradients[0]);
                const second = gradientDefinitionToColors(normalized.gradients[1]);
                return [first[0], second[1]];
            }
            return [fallbackStart || '#ffffff', fallbackEnd || '#ffffff'];
        }

        function samplePreviewColorParameter(out, parameter, t, seed = 0.5) {
            const normalized = normalizePreviewColorParameter(parameter, createPreviewColorParameter('color', { color: '#ffffff' }));
            if (normalized.mode === 'color') return out.copy(colorFromHex(normalized.color));
            if (normalized.mode === 'two_colors') return lerpPreviewColor(out, colorFromHex(normalized.colors[0]), colorFromHex(normalized.colors[1]), clampPreviewValue(seed, 0, 1));
            if (normalized.mode === 'gradient') return samplePreviewGradient(out, normalized.gradient, t);
            if (normalized.mode === 'two_gradients') {
                samplePreviewGradient(PREVIEW_TMP_COLOR, normalized.gradients[0], t);
                samplePreviewGradient(PREVIEW_TMP_COLOR_B, normalized.gradients[1], t);
                return lerpPreviewColor(out, PREVIEW_TMP_COLOR, PREVIEW_TMP_COLOR_B, clampPreviewValue(seed, 0, 1));
            }
            return out.copy(colorFromHex('#ffffff'));
        }

        function createPreviewVectorParameter(mode = 'constant', options = {}) {
            const resolvedMode = PREVIEW_VECTOR_PARAMETER_MODES.includes(mode) ? mode : 'constant';
            if (resolvedMode === 'two_constants') {
                const vectors = Array.isArray(options.constants) ? options.constants : [options.vectorA, options.vectorB];
                return {
                    type: 'vector',
                    mode: resolvedMode,
                    constants: [
                        normalizePreviewArray(vectors?.[0], 3, [0, 0, 0]),
                        normalizePreviewArray(vectors?.[1], 3, [0, 0, 0])
                    ]
                };
            }
            return { type: 'vector', mode: 'constant', constant: normalizePreviewArray(options.constant, 3, [0, 0, 0]) };
        }

        function normalizePreviewVectorParameter(value, fallback) {
            const fallbackParam = fallback && typeof fallback === 'object' ? fallback : createPreviewVectorParameter('constant', { constant: [0, 0, 0] });
            if (Array.isArray(value) && value.length === 3) return createPreviewVectorParameter('constant', { constant: value });
            if (Array.isArray(value) && value.length === 2 && Array.isArray(value[0])) return createPreviewVectorParameter('two_constants', { constants: value });
            if (value && typeof value === 'object') {
                const mode = PREVIEW_VECTOR_PARAMETER_MODES.includes(value.mode) ? value.mode : (Array.isArray(value.constants) ? 'two_constants' : 'constant');
                if (mode === 'two_constants') return createPreviewVectorParameter(mode, { constants: value.constants || [value.vectorA, value.vectorB] });
                return createPreviewVectorParameter('constant', { constant: value.constant || [0, 0, 0] });
            }
            return createPreviewVectorParameter(fallbackParam.mode, fallbackParam);
        }

        function createPreviewRootSectionsFromModules(modules) {
            const mainSettings = modules.main?.settings || {};
            const emissionSettings = modules.emission?.settings || {};
            const shapeSettings = modules.shape?.settings || {};
            const velocitySettings = modules.velocityOverLifetime?.settings || {};
            const forceSettings = modules.forceOverLifetime?.settings || {};
            const limitSettings = modules.limitVelocityOverLifetime?.settings || {};
            const noiseSettings = modules.noise?.settings || {};
            const colorSettings = modules.colorOverLifetime?.settings || {};
            const rotationSettings = modules.rotationOverLifetime?.settings || {};
            const rendererSettings = modules.renderer?.settings || {};
            const sizeSettings = modules.sizeOverLifetime?.settings || {};
            const bursts = normalizePreviewBursts(emissionSettings.bursts ?? emissionSettings.burst, []);
            const mainStartColor = colorParameterToEndpointColors(mainSettings.startColorParam, mainSettings.startColorStart, mainSettings.startColorEnd);
            return {
                emitter: {
                    shape: PREVIEW_EMITTER_SHAPES.includes(shapeSettings.shape) ? shapeSettings.shape : 'cone',
                    position: normalizePreviewArray(shapeSettings.position, 3, [0, 0, 0]),
                    rotation: normalizePreviewArray(shapeSettings.rotation, 3, [0, 0, 0]),
                    size: normalizePreviewArray(shapeSettings.size, 3, [0.25, 0.5, 0.25]),
                    rate: isFiniteNumber(emissionSettings.rate) ? emissionSettings.rate : 120,
                    burst: bursts[0]?.count || Math.max(0, Math.round(isFiniteNumber(emissionSettings.burst) ? emissionSettings.burst : 0)),
                    loop: typeof emissionSettings.loop === 'boolean' ? emissionSettings.loop : true,
                    duration: isFiniteNumber(mainSettings.duration) ? mainSettings.duration : (isFiniteNumber(emissionSettings.duration) ? emissionSettings.duration : 1.6),
                    direction: normalizePreviewArray(shapeSettings.direction, 3, [0.45, 1, 0]),
                    spread: isFiniteNumber(shapeSettings.spread) ? shapeSettings.spread : 0.62,
                    speed: scalarParameterToRange(mainSettings.startSpeedParam ?? mainSettings.startSpeed, [1.6, 3.1])
                },
                particle: {
                    lifetime: scalarParameterToRange(mainSettings.lifetimeParam ?? mainSettings.lifetime, [1.1, 1.85]),
                    size: scalarParameterToRange(mainSettings.startSizeParam ?? mainSettings.startSize, [0.12, 0.26]),
                    spin: scalarParameterToRange(rotationSettings.spinParam ?? rotationSettings.spin ?? mainSettings.startRotationParam ?? mainSettings.startRotation, [-3.2, 3.2]),
                    colorStart: normalizePreviewColor(mainStartColor[0] ?? colorSettings.colorStart, '#eef8ff'),
                    colorEnd: normalizePreviewColor(mainStartColor[1] ?? colorSettings.colorEnd, '#9dd9ff')
                },
                simulation: {
                    gravity: normalizePreviewArray(velocitySettings.gravity, 3, [0, -0.34, 0]),
                    drag: isFiniteNumber(velocitySettings.drag) ? velocitySettings.drag : 0.08,
                    noiseStrength: isFiniteNumber(noiseSettings.noiseStrength) ? noiseSettings.noiseStrength : 1.15,
                    noiseScale: isFiniteNumber(noiseSettings.noiseScale) ? noiseSettings.noiseScale : 1.45,
                    vortexStrength: isFiniteNumber(forceSettings.vortexStrength) ? forceSettings.vortexStrength : 0,
                    radialAttraction: isFiniteNumber(forceSettings.radialAttraction) ? forceSettings.radialAttraction : 0,
                    speedLimit: isFiniteNumber(limitSettings.speedLimit) ? limitSettings.speedLimit : 4.5
                },
                render: {
                    blend: PREVIEW_BLEND_MODES.includes(rendererSettings.blend) ? rendererSettings.blend : 'additive',
                    billboard: PREVIEW_BILLBOARD_MODES.includes(rendererSettings.billboard) ? rendererSettings.billboard : 'spherical',
                    alphaClip: isFiniteNumber(rendererSettings.alphaClip) ? rendererSettings.alphaClip : 0.001,
                    alphaOverLife: scalarParameterToCurvePoints(rendererSettings.alphaOverLifeParam ?? rendererSettings.alphaOverLife, [0.35, 1, 0]),
                    sizeOverLife: scalarParameterToCurvePoints(sizeSettings.curveParam ?? rendererSettings.sizeOverLifeParam ?? sizeSettings.curve ?? rendererSettings.sizeOverLife, [0.4, 1.3, 0.06])
                }
            };
        }

        function clonePreviewModules(modules) {
            const defaults = createDefaultPreviewModules();
            const input = modules && typeof modules === 'object' ? modules : {};
            return PREVIEW_MODULE_KEYS.reduce((acc, key) => {
                const base = defaults[key];
                const source = input[key] && typeof input[key] === 'object' ? input[key] : {};
                acc[key] = {
                    ...base,
                    ...source,
                    settings: { ...base.settings, ...(source.settings || {}) }
                };
                return acc;
            }, {});
        }

        function createDefaultPreviewLayer(index = 0) {
            const modules = createDefaultPreviewModules();
            const root = createPreviewRootSectionsFromModules(modules);
            return {
                id: index === 0 ? 'layer-1' : createPreviewLayerId(index),
                name: index === 0 ? 'Primary' : `Layer ${index + 1}`,
                enabled: true,
                maxParticles: PREVIEW_DEFAULT_PARTICLES_PER_LAYER,
                ...root,
                modules
            };
        }

        function sanitizePreviewOutputName(value, presetName = 'preview') {
            const baseName = String(value || `${presetName}-preview.mp4`).trim() || `${presetName}-preview.mp4`;
            const safe = baseName.replace(/[<>:"/\\|?*\u0000-\u001F]+/g, '-').replace(/\s+/g, '-');
            return safe.toLowerCase().endsWith('.mp4') ? safe : `${safe}.mp4`;
        }

        function createDefaultPreviewCaptureConfig(presetName = 'Turbulence Demo') {
            return {
                durationSeconds: 120,
                fps: 30,
                width: 1280,
                height: 720,
                format: 'mp4',
                codec: 'h264',
                cameraMode: 'stage_scroll_x',
                stageMode: 'cube_lane_5u',
                stageSpacing: 5,
                stageLength: 60,
                stageCount: 13,
                simulationStartMode: 'reset_and_warmup',
                warmupSeconds: PREVIEW_WARMUP_SECONDS,
                outputName: sanitizePreviewOutputName(`${presetName}-preview.mp4`, presetName),
                orbitRadius: 7.2,
                orbitSpeed: 0.08,
                orbitPitch: 24,
                orbitDriftAmount: 8,
                dollyDistance: 12,
                pedestalHeight: 4,
                stageScrollTravel: 40,
                targetOffset: [0, 0.6, 0],
                keyframes: [
                    { time: 0, position: [-8, 3.2, 8], target: [0, 0.6, 0] },
                    { time: 0.5, position: [0, 4.4, 6.6], target: [0, 0.7, 0] },
                    { time: 1, position: [8, 3.2, 8], target: [0, 0.6, 0] }
                ]
            };
        }

        function normalizePreviewCaptureKeyframes(value, fallback) {
            const source = Array.isArray(value) && value.length ? value : fallback;
            return source.map((entry, index) => ({
                time: clampPreviewValue(isFiniteNumber(entry?.time) ? entry.time : (index / Math.max(1, source.length - 1)), 0, 1),
                position: normalizePreviewArray(entry?.position, 3, fallback[Math.min(index, fallback.length - 1)]?.position || [0, 3, 6]),
                target: normalizePreviewArray(entry?.target, 3, fallback[Math.min(index, fallback.length - 1)]?.target || [0, 0.6, 0])
            })).sort((a, b) => a.time - b.time);
        }

        function normalizePreviewCaptureConfig(value, presetName = 'Turbulence Demo') {
            const fallback = createDefaultPreviewCaptureConfig(presetName);
            const input = value && typeof value === 'object' ? value : {};
            return {
                durationSeconds: clampPreviewValue(isFiniteNumber(input.durationSeconds) ? input.durationSeconds : fallback.durationSeconds, 1, 600),
                fps: Math.max(1, Math.min(60, Math.round(isFiniteNumber(input.fps) ? input.fps : fallback.fps))),
                width: Math.max(64, Math.min(4096, Math.round(isFiniteNumber(input.width) ? input.width : fallback.width))),
                height: Math.max(64, Math.min(4096, Math.round(isFiniteNumber(input.height) ? input.height : fallback.height))),
                format: PREVIEW_CAPTURE_FORMATS.includes(input.format) ? input.format : fallback.format,
                codec: PREVIEW_CAPTURE_CODECS.includes(input.codec) ? input.codec : fallback.codec,
                cameraMode: PREVIEW_CAPTURE_CAMERA_MODES.includes(input.cameraMode) ? input.cameraMode : fallback.cameraMode,
                stageMode: PREVIEW_CAPTURE_STAGE_MODES.includes(input.stageMode) ? input.stageMode : fallback.stageMode,
                stageSpacing: Math.max(1, isFiniteNumber(input.stageSpacing) ? input.stageSpacing : fallback.stageSpacing),
                stageLength: Math.max(5, isFiniteNumber(input.stageLength) ? input.stageLength : fallback.stageLength),
                stageCount: Math.max(3, Math.round(isFiniteNumber(input.stageCount) ? input.stageCount : fallback.stageCount)),
                simulationStartMode: PREVIEW_CAPTURE_START_MODES.includes(input.simulationStartMode) ? input.simulationStartMode : fallback.simulationStartMode,
                warmupSeconds: clampPreviewValue(isFiniteNumber(input.warmupSeconds) ? input.warmupSeconds : fallback.warmupSeconds, 0, 10),
                outputName: sanitizePreviewOutputName(input.outputName, presetName),
                orbitRadius: Math.max(0.5, isFiniteNumber(input.orbitRadius) ? input.orbitRadius : fallback.orbitRadius),
                orbitSpeed: Math.max(0.001, isFiniteNumber(input.orbitSpeed) ? input.orbitSpeed : fallback.orbitSpeed),
                orbitPitch: clampPreviewValue(isFiniteNumber(input.orbitPitch) ? input.orbitPitch : fallback.orbitPitch, -89, 89),
                orbitDriftAmount: clampPreviewValue(isFiniteNumber(input.orbitDriftAmount) ? input.orbitDriftAmount : fallback.orbitDriftAmount, 0, 45),
                dollyDistance: Math.max(0.5, isFiniteNumber(input.dollyDistance) ? input.dollyDistance : fallback.dollyDistance),
                pedestalHeight: Math.max(0, isFiniteNumber(input.pedestalHeight) ? input.pedestalHeight : fallback.pedestalHeight),
                stageScrollTravel: Math.max(1, isFiniteNumber(input.stageScrollTravel) ? input.stageScrollTravel : fallback.stageScrollTravel),
                targetOffset: normalizePreviewArray(input.targetOffset, 3, fallback.targetOffset),
                keyframes: normalizePreviewCaptureKeyframes(input.keyframes, fallback.keyframes)
            };
        }

        function createDefaultCaptureLineupConfig(setName = 'Texture Set', presetName = 'Turbulence Demo') {
            return {
                setId: '',
                stackSpacing: 5,
                sequentialReveal: false,
                activityMode: 'all_together',
                secondsPerStack: 2,
                revealLeadSeconds: 0,
                holdSeconds: 1.65,
                fadeSeconds: 0.35,
                cameraMode: 'stage_scroll_x',
                travelDistance: 40,
                width: 1920,
                height: 1080,
                fps: 30,
                durationSeconds: 2,
                outputName: sanitizePreviewOutputName(`${setName}__${presetName}__capture.mp4`, `${setName}-${presetName}`),
                stageMode: 'cube_lane_5u',
                stageSpacing: 5,
                simulationStartMode: 'reset_and_warmup',
                warmupSeconds: PREVIEW_WARMUP_SECONDS,
                targetOffset: [0, 0.7, 0],
                orbitRadius: 8.4,
                orbitSpeed: 0.08,
                orbitPitch: 22,
                orbitDriftAmount: 8,
                dollyDistance: 14,
                pedestalHeight: 4.5,
                stageScrollTravel: 40,
                keyframes: createDefaultPreviewCaptureConfig(presetName).keyframes
            };
        }

        function resolveCaptureLineupDurationSeconds(config, entryCount = 1) {
            const count = Math.max(1, Math.round(isFiniteNumber(entryCount) ? entryCount : 1));
            const secondsPerStack = Math.max(0.25, isFiniteNumber(config?.secondsPerStack) ? config.secondsPerStack : 2);
            return Number((count * secondsPerStack).toFixed(3));
        }

        function normalizeCaptureLineupConfig(value, setName = 'Texture Set', presetName = 'Turbulence Demo') {
            const fallback = createDefaultCaptureLineupConfig(setName, presetName);
            const input = value && typeof value === 'object' ? value : {};
            const activityMode = PREVIEW_CAPTURE_ACTIVITY_MODES.includes(input.activityMode) ? input.activityMode : fallback.activityMode;
            const isLegacyConfig = !PREVIEW_CAPTURE_ACTIVITY_MODES.includes(input.activityMode);
            const baseCapture = normalizePreviewCaptureConfig({
                ...fallback,
                ...input,
                outputName: input.outputName || fallback.outputName,
                stageMode: input.stageMode || fallback.stageMode,
                stageSpacing: input.stageSpacing || fallback.stageSpacing,
                simulationStartMode: input.simulationStartMode || fallback.simulationStartMode,
                warmupSeconds: input.warmupSeconds ?? fallback.warmupSeconds,
                targetOffset: input.targetOffset || fallback.targetOffset
            }, `${setName}-${presetName}`);
            return {
                ...baseCapture,
                setId: typeof input.setId === 'string' ? input.setId : fallback.setId,
                stackSpacing: Math.max(1, isFiniteNumber(input.stackSpacing) ? input.stackSpacing : fallback.stackSpacing),
                sequentialReveal: isLegacyConfig
                    ? false
                    : (typeof input.sequentialReveal === 'boolean' ? input.sequentialReveal : activityMode === 'focused_only'),
                activityMode,
                secondsPerStack: clampPreviewValue(isFiniteNumber(input.secondsPerStack) ? input.secondsPerStack : fallback.secondsPerStack, 0.25, 30),
                revealLeadSeconds: clampPreviewValue(isFiniteNumber(input.revealLeadSeconds) ? input.revealLeadSeconds : fallback.revealLeadSeconds, 0, 30),
                holdSeconds: clampPreviewValue(isFiniteNumber(input.holdSeconds) ? input.holdSeconds : fallback.holdSeconds, 0.1, 30),
                fadeSeconds: clampPreviewValue(isFiniteNumber(input.fadeSeconds) ? input.fadeSeconds : fallback.fadeSeconds, 0, 30),
                cameraMode: isLegacyConfig
                    ? fallback.cameraMode
                    : (PREVIEW_CAPTURE_CAMERA_MODES.includes(input.cameraMode) ? input.cameraMode : fallback.cameraMode),
                travelDistance: Math.max(1, isFiniteNumber(input.travelDistance) ? input.travelDistance : fallback.travelDistance),
                width: baseCapture.width,
                height: baseCapture.height,
                fps: baseCapture.fps,
                durationSeconds: baseCapture.durationSeconds,
                outputName: sanitizePreviewOutputName(input.outputName || fallback.outputName, `${setName}-${presetName}`),
                stageMode: baseCapture.stageMode,
                stageSpacing: baseCapture.stageSpacing,
                simulationStartMode: baseCapture.simulationStartMode,
                warmupSeconds: baseCapture.warmupSeconds,
                targetOffset: baseCapture.targetOffset,
                orbitRadius: baseCapture.orbitRadius,
                orbitSpeed: baseCapture.orbitSpeed,
                orbitPitch: baseCapture.orbitPitch,
                orbitDriftAmount: baseCapture.orbitDriftAmount,
                dollyDistance: baseCapture.dollyDistance,
                pedestalHeight: baseCapture.pedestalHeight,
                stageScrollTravel: Math.max(1, isFiniteNumber(input.stageScrollTravel) ? input.stageScrollTravel : Math.max(fallback.stageScrollTravel, isFiniteNumber(input.travelDistance) ? input.travelDistance : fallback.travelDistance)),
                keyframes: baseCapture.keyframes
            };
        }

        function createDefaultPreviewPreset() {
            return {
                version: PREVIEW_PRESET_VERSION,
                id: PREVIEW_DEFAULT_PRESET_ID,
                name: 'Turbulence Demo',
                source: {
                    mode: PREVIEW_DEFAULT_SOURCE_MODE
                },
                scene: {
                    background: '#05070b',
                    cameraFov: 44,
                    cameraDistance: 6.8,
                    cameraPitch: 24,
                    cameraYaw: 32,
                    invertMouseX: true,
                    invertMouseY: true,
                    grid: true,
                    timeScale: 1,
                    loop: true,
                    capture: createDefaultPreviewCaptureConfig('Turbulence Demo')
                },
                layers: [createDefaultPreviewLayer(0)]
            };
        }

        function moduleIsExpanded(layer, moduleKey) {
            return !!layer?.modules?.[moduleKey]?.expanded;
        }

        function isPreviewWebGL2Supported() {
            try {
                const canvas = document.createElement('canvas');
                return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
            } catch (_) {
                return false;
            }
        }

        function buildPreviewModulesFromSource(source, index, version) {
            const base = createDefaultPreviewLayer(index);
            const rawModules = source?.modules && typeof source.modules === 'object' ? source.modules : {};
            const emitter = source?.emitter && typeof source.emitter === 'object' ? source.emitter : {};
            const particle = source?.particle && typeof source.particle === 'object' ? source.particle : {};
            const simulation = source?.simulation && typeof source.simulation === 'object' ? source.simulation : {};
            const render = source?.render && typeof source.render === 'object' ? source.render : {};
            const modules = clonePreviewModules(rawModules);
            const fromModule = (moduleKey, key) => rawModules?.[moduleKey]?.settings?.[key];
            const hasModuleEnabled = (moduleKey) => typeof rawModules?.[moduleKey]?.enabled === 'boolean';
            const moduleEnabled = (moduleKey, fallback) => hasModuleEnabled(moduleKey) ? rawModules[moduleKey].enabled : fallback;
            const nonZero = (value) => {
                if (Array.isArray(value)) return value.some((entry) => Math.abs(entry || 0) > 0.0001);
                return Math.abs(value || 0) > 0.0001;
            };

            modules.main.enabled = true;
            modules.main.mode = 'main';
            modules.main.settings.lifetimeParam = normalizePreviewScalarParameter(
                fromModule('main', 'lifetimeParam') ?? fromModule('main', 'lifetime') ?? particle.lifetime,
                base.modules.main.settings.lifetimeParam
            );
            modules.main.settings.startSpeedParam = normalizePreviewScalarParameter(
                fromModule('main', 'startSpeedParam') ?? fromModule('main', 'startSpeed') ?? emitter.speed,
                base.modules.main.settings.startSpeedParam
            );
            modules.main.settings.startSizeParam = normalizePreviewScalarParameter(
                fromModule('main', 'startSizeParam') ?? fromModule('main', 'startSize') ?? particle.size,
                base.modules.main.settings.startSizeParam
            );
            modules.main.settings.startRotationParam = normalizePreviewScalarParameter(
                fromModule('main', 'startRotationParam') ?? fromModule('main', 'startRotation') ?? particle.spin,
                base.modules.main.settings.startRotationParam
            );
            modules.main.settings.startColorParam = normalizePreviewColorParameter(
                fromModule('main', 'startColorParam') ?? [
                    fromModule('main', 'startColorStart') ?? particle.colorStart ?? base.modules.main.settings.startColorStart,
                    fromModule('main', 'startColorEnd') ?? particle.colorEnd ?? base.modules.main.settings.startColorEnd
                ],
                base.modules.main.settings.startColorParam
            );
            const mainStartColors = colorParameterToEndpointColors(
                modules.main.settings.startColorParam,
                base.modules.main.settings.startColorStart,
                base.modules.main.settings.startColorEnd
            );
            modules.main.settings = {
                ...modules.main.settings,
                duration: Math.max(0, isFiniteNumber(fromModule('main', 'duration')) ? fromModule('main', 'duration') : (isFiniteNumber(emitter.duration) ? emitter.duration : base.modules.main.settings.duration)),
                loop: typeof fromModule('main', 'loop') === 'boolean' ? fromModule('main', 'loop') : (typeof emitter.loop === 'boolean' ? emitter.loop : base.modules.main.settings.loop),
                lifetime: scalarParameterToRange(modules.main.settings.lifetimeParam, base.modules.main.settings.lifetime),
                startSpeed: scalarParameterToRange(modules.main.settings.startSpeedParam, base.modules.main.settings.startSpeed),
                startSize: scalarParameterToRange(modules.main.settings.startSizeParam, base.modules.main.settings.startSize),
                startRotation: scalarParameterToRange(modules.main.settings.startRotationParam, base.modules.main.settings.startRotation),
                startColorStart: normalizePreviewColor(mainStartColors[0], base.modules.main.settings.startColorStart),
                startColorEnd: normalizePreviewColor(mainStartColors[1], base.modules.main.settings.startColorEnd),
                simulationSpeed: clampPreviewValue(isFiniteNumber(fromModule('main', 'simulationSpeed')) ? fromModule('main', 'simulationSpeed') : base.modules.main.settings.simulationSpeed, 0, 4)
            };

            modules.emission.enabled = moduleEnabled('emission', true);
            modules.emission.mode = 'schedule';
            modules.emission.settings = {
                ...modules.emission.settings,
                rate: Math.max(0, isFiniteNumber(fromModule('emission', 'rate')) ? fromModule('emission', 'rate') : (isFiniteNumber(emitter.rate) ? emitter.rate : base.modules.emission.settings.rate)),
                burst: Math.max(0, isFiniteNumber(fromModule('emission', 'burst')) ? fromModule('emission', 'burst') : (isFiniteNumber(emitter.burst) ? emitter.burst : base.modules.emission.settings.burst)),
                bursts: normalizePreviewBursts(fromModule('emission', 'bursts') ?? fromModule('emission', 'burst') ?? emitter.burst, base.modules.emission.settings.bursts),
                burstTime: Math.max(0, isFiniteNumber(fromModule('emission', 'burstTime')) ? fromModule('emission', 'burstTime') : 0),
                loop: typeof fromModule('emission', 'loop') === 'boolean' ? fromModule('emission', 'loop') : (typeof emitter.loop === 'boolean' ? emitter.loop : base.modules.emission.settings.loop),
                duration: Math.max(0, isFiniteNumber(fromModule('emission', 'duration')) ? fromModule('emission', 'duration') : (isFiniteNumber(emitter.duration) ? emitter.duration : base.modules.emission.settings.duration))
            };

            modules.shape.enabled = moduleEnabled('shape', true);
            modules.shape.mode = PREVIEW_EMITTER_SHAPES.includes(rawModules?.shape?.mode) ? rawModules.shape.mode : modules.shape.mode;
            modules.shape.settings = {
                ...modules.shape.settings,
                shape: PREVIEW_EMITTER_SHAPES.includes(fromModule('shape', 'shape') ?? emitter.shape) ? (fromModule('shape', 'shape') ?? emitter.shape) : base.modules.shape.settings.shape,
                position: normalizePreviewArray(fromModule('shape', 'position') ?? emitter.position, 3, base.modules.shape.settings.position),
                rotation: normalizePreviewArray(fromModule('shape', 'rotation') ?? emitter.rotation, 3, base.modules.shape.settings.rotation),
                size: normalizePreviewArray(fromModule('shape', 'size') ?? emitter.size, 3, base.modules.shape.settings.size),
                direction: normalizePreviewArray(fromModule('shape', 'direction') ?? emitter.direction, 3, base.modules.shape.settings.direction),
                spread: Math.max(0, isFiniteNumber(fromModule('shape', 'spread')) ? fromModule('shape', 'spread') : (isFiniteNumber(emitter.spread) ? emitter.spread : base.modules.shape.settings.spread))
            };

            modules.velocityOverLifetime.enabled = moduleEnabled('velocityOverLifetime', version >= PREVIEW_PRESET_VERSION ? modules.velocityOverLifetime.enabled : true);
            modules.velocityOverLifetime.settings = {
                ...modules.velocityOverLifetime.settings,
                linear: normalizePreviewArray(fromModule('velocityOverLifetime', 'linear'), 3, base.modules.velocityOverLifetime.settings.linear),
                gravity: normalizePreviewArray(fromModule('velocityOverLifetime', 'gravity') ?? simulation.gravity, 3, base.modules.velocityOverLifetime.settings.gravity),
                drag: Math.max(0, isFiniteNumber(fromModule('velocityOverLifetime', 'drag')) ? fromModule('velocityOverLifetime', 'drag') : (isFiniteNumber(simulation.drag) ? simulation.drag : base.modules.velocityOverLifetime.settings.drag))
            };

            modules.forceOverLifetime.enabled = moduleEnabled('forceOverLifetime', version >= PREVIEW_PRESET_VERSION ? modules.forceOverLifetime.enabled : (nonZero(simulation.vortexStrength) || nonZero(simulation.radialAttraction) || nonZero(fromModule('forceOverLifetime', 'force'))));
            modules.forceOverLifetime.settings = {
                ...modules.forceOverLifetime.settings,
                force: normalizePreviewArray(fromModule('forceOverLifetime', 'force'), 3, base.modules.forceOverLifetime.settings.force),
                vortexStrength: isFiniteNumber(fromModule('forceOverLifetime', 'vortexStrength')) ? fromModule('forceOverLifetime', 'vortexStrength') : (isFiniteNumber(simulation.vortexStrength) ? simulation.vortexStrength : base.modules.forceOverLifetime.settings.vortexStrength),
                radialAttraction: isFiniteNumber(fromModule('forceOverLifetime', 'radialAttraction')) ? fromModule('forceOverLifetime', 'radialAttraction') : (isFiniteNumber(simulation.radialAttraction) ? simulation.radialAttraction : base.modules.forceOverLifetime.settings.radialAttraction)
            };

            modules.limitVelocityOverLifetime.enabled = moduleEnabled('limitVelocityOverLifetime', version >= PREVIEW_PRESET_VERSION ? modules.limitVelocityOverLifetime.enabled : true);
            modules.limitVelocityOverLifetime.settings = {
                ...modules.limitVelocityOverLifetime.settings,
                speedLimit: Math.max(0, isFiniteNumber(fromModule('limitVelocityOverLifetime', 'speedLimit')) ? fromModule('limitVelocityOverLifetime', 'speedLimit') : (isFiniteNumber(simulation.speedLimit) ? simulation.speedLimit : base.modules.limitVelocityOverLifetime.settings.speedLimit)),
                dampen: Math.max(0, isFiniteNumber(fromModule('limitVelocityOverLifetime', 'dampen')) ? fromModule('limitVelocityOverLifetime', 'dampen') : base.modules.limitVelocityOverLifetime.settings.dampen)
            };

            modules.noise.enabled = moduleEnabled('noise', version >= PREVIEW_PRESET_VERSION ? modules.noise.enabled : nonZero(simulation.noiseStrength));
            modules.noise.settings = {
                ...modules.noise.settings,
                noiseStrength: Math.max(0, isFiniteNumber(fromModule('noise', 'noiseStrength')) ? fromModule('noise', 'noiseStrength') : (isFiniteNumber(simulation.noiseStrength) ? simulation.noiseStrength : base.modules.noise.settings.noiseStrength)),
                noiseScale: Math.max(0.01, isFiniteNumber(fromModule('noise', 'noiseScale')) ? fromModule('noise', 'noiseScale') : (isFiniteNumber(simulation.noiseScale) ? simulation.noiseScale : base.modules.noise.settings.noiseScale)),
                scrollSpeed: isFiniteNumber(fromModule('noise', 'scrollSpeed')) ? fromModule('noise', 'scrollSpeed') : base.modules.noise.settings.scrollSpeed
            };

            modules.colorOverLifetime.enabled = moduleEnabled('colorOverLifetime', version >= PREVIEW_PRESET_VERSION ? modules.colorOverLifetime.enabled : true);
            modules.colorOverLifetime.settings.colorParam = normalizePreviewColorParameter(
                fromModule('colorOverLifetime', 'colorParam') ?? [
                    fromModule('colorOverLifetime', 'colorStart') ?? particle.colorStart ?? base.modules.colorOverLifetime.settings.colorStart,
                    fromModule('colorOverLifetime', 'colorEnd') ?? particle.colorEnd ?? base.modules.colorOverLifetime.settings.colorEnd
                ],
                base.modules.colorOverLifetime.settings.colorParam
            );
            const colorOverLifetimeEndpoints = colorParameterToEndpointColors(
                modules.colorOverLifetime.settings.colorParam,
                base.modules.colorOverLifetime.settings.colorStart,
                base.modules.colorOverLifetime.settings.colorEnd
            );
            modules.colorOverLifetime.settings = {
                ...modules.colorOverLifetime.settings,
                colorStart: normalizePreviewColor(colorOverLifetimeEndpoints[0], base.modules.colorOverLifetime.settings.colorStart),
                colorEnd: normalizePreviewColor(colorOverLifetimeEndpoints[1], base.modules.colorOverLifetime.settings.colorEnd)
            };

            modules.colorBySpeed.enabled = moduleEnabled('colorBySpeed', version >= PREVIEW_PRESET_VERSION ? modules.colorBySpeed.enabled : false);
            modules.colorBySpeed.settings = {
                ...modules.colorBySpeed.settings,
                minSpeed: Math.max(0, isFiniteNumber(fromModule('colorBySpeed', 'minSpeed')) ? fromModule('colorBySpeed', 'minSpeed') : base.modules.colorBySpeed.settings.minSpeed),
                maxSpeed: Math.max(0.01, isFiniteNumber(fromModule('colorBySpeed', 'maxSpeed')) ? fromModule('colorBySpeed', 'maxSpeed') : base.modules.colorBySpeed.settings.maxSpeed),
                lowSpeedColor: normalizePreviewColor(fromModule('colorBySpeed', 'lowSpeedColor'), base.modules.colorBySpeed.settings.lowSpeedColor),
                highSpeedColor: normalizePreviewColor(fromModule('colorBySpeed', 'highSpeedColor'), base.modules.colorBySpeed.settings.highSpeedColor)
            };

            modules.sizeOverLifetime.enabled = moduleEnabled('sizeOverLifetime', version >= PREVIEW_PRESET_VERSION ? modules.sizeOverLifetime.enabled : true);
            modules.sizeOverLifetime.settings.curveParam = normalizePreviewScalarParameter(
                fromModule('sizeOverLifetime', 'curveParam') ?? fromModule('sizeOverLifetime', 'curve') ?? render.sizeOverLife ?? fromModule('sizeOverLifetime', 'size'),
                base.modules.sizeOverLifetime.settings.curveParam
            );
            modules.sizeOverLifetime.settings = {
                ...modules.sizeOverLifetime.settings,
                curve: scalarParameterToCurvePoints(modules.sizeOverLifetime.settings.curveParam, base.modules.sizeOverLifetime.settings.curve),
                size: normalizePreviewRange(fromModule('sizeOverLifetime', 'size'), base.modules.sizeOverLifetime.settings.size)
            };

            modules.sizeBySpeed.enabled = moduleEnabled('sizeBySpeed', version >= PREVIEW_PRESET_VERSION ? modules.sizeBySpeed.enabled : false);
            modules.sizeBySpeed.settings = {
                ...modules.sizeBySpeed.settings,
                minSpeed: Math.max(0, isFiniteNumber(fromModule('sizeBySpeed', 'minSpeed')) ? fromModule('sizeBySpeed', 'minSpeed') : base.modules.sizeBySpeed.settings.minSpeed),
                maxSpeed: Math.max(0.01, isFiniteNumber(fromModule('sizeBySpeed', 'maxSpeed')) ? fromModule('sizeBySpeed', 'maxSpeed') : base.modules.sizeBySpeed.settings.maxSpeed),
                scale: normalizePreviewRange(fromModule('sizeBySpeed', 'scale'), base.modules.sizeBySpeed.settings.scale)
            };

            modules.rotationOverLifetime.enabled = moduleEnabled('rotationOverLifetime', version >= PREVIEW_PRESET_VERSION ? modules.rotationOverLifetime.enabled : nonZero(particle.spin));
            modules.rotationOverLifetime.settings.spinParam = normalizePreviewScalarParameter(
                fromModule('rotationOverLifetime', 'spinParam') ?? fromModule('rotationOverLifetime', 'spin') ?? particle.spin,
                base.modules.rotationOverLifetime.settings.spinParam
            );
            modules.rotationOverLifetime.settings = {
                ...modules.rotationOverLifetime.settings,
                spin: scalarParameterToRange(modules.rotationOverLifetime.settings.spinParam, base.modules.rotationOverLifetime.settings.spin)
            };

            modules.rotationBySpeed.enabled = moduleEnabled('rotationBySpeed', version >= PREVIEW_PRESET_VERSION ? modules.rotationBySpeed.enabled : false);
            modules.rotationBySpeed.settings = {
                ...modules.rotationBySpeed.settings,
                minSpeed: Math.max(0, isFiniteNumber(fromModule('rotationBySpeed', 'minSpeed')) ? fromModule('rotationBySpeed', 'minSpeed') : base.modules.rotationBySpeed.settings.minSpeed),
                maxSpeed: Math.max(0.01, isFiniteNumber(fromModule('rotationBySpeed', 'maxSpeed')) ? fromModule('rotationBySpeed', 'maxSpeed') : base.modules.rotationBySpeed.settings.maxSpeed),
                spin: normalizePreviewRange(fromModule('rotationBySpeed', 'spin'), base.modules.rotationBySpeed.settings.spin)
            };

            modules.collision.enabled = moduleEnabled('collision', version >= PREVIEW_PRESET_VERSION ? modules.collision.enabled : false);
            modules.collision.settings = {
                ...modules.collision.settings,
                planeY: isFiniteNumber(fromModule('collision', 'planeY')) ? fromModule('collision', 'planeY') : base.modules.collision.settings.planeY,
                bounce: Math.max(0, isFiniteNumber(fromModule('collision', 'bounce')) ? fromModule('collision', 'bounce') : base.modules.collision.settings.bounce),
                dampen: Math.max(0, isFiniteNumber(fromModule('collision', 'dampen')) ? fromModule('collision', 'dampen') : base.modules.collision.settings.dampen),
                lifetimeLoss: Math.max(0, isFiniteNumber(fromModule('collision', 'lifetimeLoss')) ? fromModule('collision', 'lifetimeLoss') : base.modules.collision.settings.lifetimeLoss)
            };

            modules.subEmitters.enabled = moduleEnabled('subEmitters', version >= PREVIEW_PRESET_VERSION ? modules.subEmitters.enabled : false);
            modules.subEmitters.settings = {
                ...modules.subEmitters.settings,
                targetLayerId: typeof fromModule('subEmitters', 'targetLayerId') === 'string' ? fromModule('subEmitters', 'targetLayerId') : null,
                birthCount: Math.max(0, Math.round(isFiniteNumber(fromModule('subEmitters', 'birthCount')) ? fromModule('subEmitters', 'birthCount') : base.modules.subEmitters.settings.birthCount)),
                deathCount: Math.max(0, Math.round(isFiniteNumber(fromModule('subEmitters', 'deathCount')) ? fromModule('subEmitters', 'deathCount') : base.modules.subEmitters.settings.deathCount)),
                collisionCount: Math.max(0, Math.round(isFiniteNumber(fromModule('subEmitters', 'collisionCount')) ? fromModule('subEmitters', 'collisionCount') : base.modules.subEmitters.settings.collisionCount))
            };

            modules.textureSheetAnimation.enabled = moduleEnabled('textureSheetAnimation', version >= PREVIEW_PRESET_VERSION ? modules.textureSheetAnimation.enabled : false);
            modules.textureSheetAnimation.settings = {
                ...modules.textureSheetAnimation.settings,
                columns: Math.max(1, Math.round(isFiniteNumber(fromModule('textureSheetAnimation', 'columns')) ? fromModule('textureSheetAnimation', 'columns') : base.modules.textureSheetAnimation.settings.columns)),
                rows: Math.max(1, Math.round(isFiniteNumber(fromModule('textureSheetAnimation', 'rows')) ? fromModule('textureSheetAnimation', 'rows') : base.modules.textureSheetAnimation.settings.rows)),
                cycles: Math.max(1, Math.round(isFiniteNumber(fromModule('textureSheetAnimation', 'cycles')) ? fromModule('textureSheetAnimation', 'cycles') : base.modules.textureSheetAnimation.settings.cycles)),
                startFrame: Math.max(0, Math.round(isFiniteNumber(fromModule('textureSheetAnimation', 'startFrame')) ? fromModule('textureSheetAnimation', 'startFrame') : base.modules.textureSheetAnimation.settings.startFrame)),
                randomRow: typeof fromModule('textureSheetAnimation', 'randomRow') === 'boolean' ? fromModule('textureSheetAnimation', 'randomRow') : base.modules.textureSheetAnimation.settings.randomRow,
                frameOverLife: normalizePreviewRange(fromModule('textureSheetAnimation', 'frameOverLife'), base.modules.textureSheetAnimation.settings.frameOverLife)
            };

            modules.inheritVelocity.enabled = moduleEnabled('inheritVelocity', version >= PREVIEW_PRESET_VERSION ? modules.inheritVelocity.enabled : false);
            modules.inheritVelocity.settings = {
                ...modules.inheritVelocity.settings,
                factor: clampPreviewValue(isFiniteNumber(fromModule('inheritVelocity', 'factor')) ? fromModule('inheritVelocity', 'factor') : base.modules.inheritVelocity.settings.factor, 0, 4)
            };

            modules.lifetimeByEmitterSpeed.enabled = moduleEnabled('lifetimeByEmitterSpeed', version >= PREVIEW_PRESET_VERSION ? modules.lifetimeByEmitterSpeed.enabled : false);
            modules.lifetimeByEmitterSpeed.settings = {
                ...modules.lifetimeByEmitterSpeed.settings,
                minSpeed: Math.max(0, isFiniteNumber(fromModule('lifetimeByEmitterSpeed', 'minSpeed')) ? fromModule('lifetimeByEmitterSpeed', 'minSpeed') : base.modules.lifetimeByEmitterSpeed.settings.minSpeed),
                maxSpeed: Math.max(0.01, isFiniteNumber(fromModule('lifetimeByEmitterSpeed', 'maxSpeed')) ? fromModule('lifetimeByEmitterSpeed', 'maxSpeed') : base.modules.lifetimeByEmitterSpeed.settings.maxSpeed),
                lifetimeScale: normalizePreviewRange(fromModule('lifetimeByEmitterSpeed', 'lifetimeScale'), base.modules.lifetimeByEmitterSpeed.settings.lifetimeScale)
            };

            modules.trails.enabled = moduleEnabled('trails', version >= PREVIEW_PRESET_VERSION ? modules.trails.enabled : false);
            modules.trails.settings = {
                ...modules.trails.settings,
                length: Math.max(2, Math.round(isFiniteNumber(fromModule('trails', 'length')) ? fromModule('trails', 'length') : base.modules.trails.settings.length)),
                widthOverTrail: normalizePreviewCurve(fromModule('trails', 'widthOverTrail'), base.modules.trails.settings.widthOverTrail),
                alphaOverTrail: normalizePreviewCurve(fromModule('trails', 'alphaOverTrail'), base.modules.trails.settings.alphaOverTrail)
            };

            modules.customData.enabled = moduleEnabled('customData', version >= PREVIEW_PRESET_VERSION ? modules.customData.enabled : false);
            modules.customData.settings = {
                ...modules.customData.settings,
                data1: normalizePreviewRange(fromModule('customData', 'data1'), base.modules.customData.settings.data1),
                data2: normalizePreviewRange(fromModule('customData', 'data2'), base.modules.customData.settings.data2)
            };

            modules.renderer.enabled = moduleEnabled('renderer', true);
            modules.renderer.settings.alphaOverLifeParam = normalizePreviewScalarParameter(
                fromModule('renderer', 'alphaOverLifeParam') ?? fromModule('renderer', 'alphaOverLife') ?? render.alphaOverLife,
                base.modules.renderer.settings.alphaOverLifeParam
            );
            modules.renderer.settings.sizeOverLifeParam = normalizePreviewScalarParameter(
                fromModule('renderer', 'sizeOverLifeParam') ?? fromModule('renderer', 'sizeOverLife') ?? render.sizeOverLife ?? modules.sizeOverLifetime.settings.curveParam,
                base.modules.renderer.settings.sizeOverLifeParam
            );
            modules.renderer.settings = {
                ...modules.renderer.settings,
                blend: PREVIEW_BLEND_MODES.includes(fromModule('renderer', 'blend') ?? render.blend) ? (fromModule('renderer', 'blend') ?? render.blend) : base.modules.renderer.settings.blend,
                billboard: PREVIEW_BILLBOARD_MODES.includes(fromModule('renderer', 'billboard') ?? render.billboard) ? (fromModule('renderer', 'billboard') ?? render.billboard) : base.modules.renderer.settings.billboard,
                alphaClip: Math.max(0, isFiniteNumber(fromModule('renderer', 'alphaClip')) ? fromModule('renderer', 'alphaClip') : (isFiniteNumber(render.alphaClip) ? render.alphaClip : base.modules.renderer.settings.alphaClip)),
                alphaOverLife: scalarParameterToCurvePoints(modules.renderer.settings.alphaOverLifeParam, base.modules.renderer.settings.alphaOverLife),
                sizeOverLife: scalarParameterToCurvePoints(modules.renderer.settings.sizeOverLifeParam, base.modules.renderer.settings.sizeOverLife),
                materialSource: PREVIEW_PRESET_SOURCE_MODES.includes(fromModule('renderer', 'materialSource')) ? fromModule('renderer', 'materialSource') : base.modules.renderer.settings.materialSource
            };

            return modules;
        }

        function sanitizePreviewPreset(raw) {
            const base = createDefaultPreviewPreset();
            const input = raw && typeof raw === 'object' ? raw : {};
            const sourceVersion = Math.round(isFiniteNumber(input.version) ? input.version : 1);
            const scene = input.scene && typeof input.scene === 'object' ? input.scene : {};
            const sourceConfig = input.source && typeof input.source === 'object' ? input.source : {};
            const rawLayers = Array.isArray(input.layers) && input.layers.length ? input.layers : base.layers;
            const layers = rawLayers.map((layer, index) => {
                const layerBase = createDefaultPreviewLayer(index);
                const source = layer && typeof layer === 'object' ? layer : {};
                const modules = buildPreviewModulesFromSource(source, index, sourceVersion);
                const root = createPreviewRootSectionsFromModules(modules);
                return {
                    id: String(source.id || layerBase.id),
                    name: String(source.name || layerBase.name).trim() || layerBase.name,
                    enabled: typeof source.enabled === 'boolean' ? source.enabled : layerBase.enabled,
                    maxParticles: clampPreviewValue(parseInt(source.maxParticles, 10) || layerBase.maxParticles, 1, PREVIEW_MAX_PARTICLES_PER_LAYER),
                    ...root,
                    modules
                };
            });
            return {
                version: PREVIEW_PRESET_VERSION,
                id: String(input.id || base.id || createPreviewPresetId()),
                name: String(input.name || base.name).trim() || base.name,
                source: {
                    mode: PREVIEW_PRESET_SOURCE_MODES.includes(sourceConfig.mode) ? sourceConfig.mode : base.source.mode
                },
                scene: {
                    background: normalizePreviewColor(scene.background, base.scene.background),
                    cameraFov: clampPreviewValue(isFiniteNumber(scene.cameraFov) ? scene.cameraFov : base.scene.cameraFov, 20, 90),
                    cameraDistance: clampPreviewValue(isFiniteNumber(scene.cameraDistance) ? scene.cameraDistance : base.scene.cameraDistance, 2, 24),
                    cameraPitch: clampPreviewValue(isFiniteNumber(scene.cameraPitch) ? scene.cameraPitch : base.scene.cameraPitch, 0, 89),
                    cameraYaw: isFiniteNumber(scene.cameraYaw) ? scene.cameraYaw : base.scene.cameraYaw,
                    invertMouseX: typeof scene.invertMouseX === 'boolean' ? scene.invertMouseX : base.scene.invertMouseX,
                    invertMouseY: typeof scene.invertMouseY === 'boolean' ? scene.invertMouseY : base.scene.invertMouseY,
                    grid: typeof scene.grid === 'boolean' ? scene.grid : base.scene.grid,
                    timeScale: clampPreviewValue(isFiniteNumber(scene.timeScale) ? scene.timeScale : base.scene.timeScale, 0, 3),
                    loop: typeof scene.loop === 'boolean' ? scene.loop : base.scene.loop,
                    capture: normalizePreviewCaptureConfig(scene.capture, input.name || base.name)
                },
                layers
            };
        }

        function validatePreviewPreset(raw) {
            const errors = [];
            const preset = sanitizePreviewPreset(raw);
            if (preset.version !== PREVIEW_PRESET_VERSION) errors.push(`Preset version must be ${PREVIEW_PRESET_VERSION}.`);
            if (!String(preset.name || '').trim()) errors.push('Preset name is required.');
            if (!Array.isArray(preset.layers) || preset.layers.length < 1) errors.push('At least one layer is required.');
            if (!PREVIEW_CAPTURE_CAMERA_MODES.includes(preset.scene.capture.cameraMode)) errors.push('Scene capture cameraMode is invalid.');
            if (!PREVIEW_CAPTURE_STAGE_MODES.includes(preset.scene.capture.stageMode)) errors.push('Scene capture stageMode is invalid.');
            if (!PREVIEW_CAPTURE_START_MODES.includes(preset.scene.capture.simulationStartMode)) errors.push('Scene capture simulationStartMode is invalid.');
            if (preset.scene.capture.width < 64 || preset.scene.capture.height < 64) errors.push('Scene capture resolution is invalid.');
            const seenLayerIds = new Set();
            let totalParticles = 0;
            preset.layers.forEach((layer, index) => {
                if (!layer.id || seenLayerIds.has(layer.id)) errors.push(`Layer ${index + 1} must have a unique id.`);
                seenLayerIds.add(layer.id);
                if (layer.maxParticles < 1 || layer.maxParticles > PREVIEW_MAX_PARTICLES_PER_LAYER) errors.push(`Layer ${layer.name || index + 1} maxParticles must be within 1-${PREVIEW_MAX_PARTICLES_PER_LAYER}.`);
                totalParticles += layer.maxParticles;
                [['position', layer.emitter.position, 3], ['rotation', layer.emitter.rotation, 3], ['size', layer.emitter.size, 3], ['direction', layer.emitter.direction, 3], ['speed', layer.emitter.speed, 2], ['lifetime', layer.particle.lifetime, 2], ['size', layer.particle.size, 2], ['spin', layer.particle.spin, 2], ['gravity', layer.simulation.gravity, 3], ['alphaOverLife', layer.render.alphaOverLife, 3], ['sizeOverLife', layer.render.sizeOverLife, 3]].forEach(([name, value, len]) => {
                    if (!Array.isArray(value) || value.length !== len || value.some((entry) => !isFiniteNumber(entry))) {
                        errors.push(`Layer ${layer.name || index + 1} ${name} must contain ${len} finite numbers.`);
                    }
                });
                if (!PREVIEW_EMITTER_SHAPES.includes(layer.emitter.shape)) errors.push(`Layer ${layer.name || index + 1} has an invalid emitter shape.`);
                if (!PREVIEW_BLEND_MODES.includes(layer.render.blend)) errors.push(`Layer ${layer.name || index + 1} has an invalid blend mode.`);
                if (!PREVIEW_BILLBOARD_MODES.includes(layer.render.billboard)) errors.push(`Layer ${layer.name || index + 1} has an invalid billboard mode.`);
                PREVIEW_MODULE_KEYS.forEach((key) => {
                    if (!layer.modules?.[key] || typeof layer.modules[key] !== 'object') {
                        errors.push(`Layer ${layer.name || index + 1} is missing module ${key}.`);
                    }
                });
                const compiled = compilePreviewLayer(layer, preset.scene);
                if (compiled.main.lifetime[1] < compiled.main.lifetime[0]) errors.push(`Layer ${layer.name || index + 1} lifetime range is invalid.`);
                if (compiled.main.startSize[1] < compiled.main.startSize[0]) errors.push(`Layer ${layer.name || index + 1} start size range is invalid.`);
                if (compiled.main.startSpeed[1] < compiled.main.startSpeed[0]) errors.push(`Layer ${layer.name || index + 1} start speed range is invalid.`);
                if (compiled.textureSheet.columns * compiled.textureSheet.rows < 1) errors.push(`Layer ${layer.name || index + 1} texture sheet dimensions are invalid.`);
                if (compiled.subEmitters.targetLayerId && !preset.layers.some((entry) => entry.id === compiled.subEmitters.targetLayerId)) {
                    errors.push(`Layer ${layer.name || index + 1} sub emitter targetLayerId does not exist.`);
                }
            });
            if (totalParticles > PREVIEW_MAX_PARTICLES_TOTAL) errors.push(`Total particles cannot exceed ${PREVIEW_MAX_PARTICLES_TOTAL}.`);
            return { valid: errors.length === 0, errors, sanitizedPreset: preset };
        }

        function evaluatePreviewCurve(curve, t) {
            if (curve && typeof curve === 'object' && curve.type === 'scalar') {
                return samplePreviewScalarParameter(curve, t, 0.5);
            }
            if (curve && typeof curve === 'object' && Array.isArray(curve.keys)) {
                return evaluatePreviewCurveDefinition(curve, t);
            }
            const safeT = clampPreviewValue(t, 0, 1);
            if (safeT < 0.5) return THREE.MathUtils.lerp(curve[0], curve[1], safeT * 2);
            return THREE.MathUtils.lerp(curve[1], curve[2], (safeT - 0.5) * 2);
        }

        function remapPreviewValue(value, min, max) {
            if (max <= min) return 0;
            return clampPreviewValue((value - min) / (max - min), 0, 1);
        }

        function colorFromHex(value) {
            return new THREE.Color(normalizePreviewColor(value, '#ffffff'));
        }

        function lerpPreviewColor(out, a, b, t) {
            out.r = THREE.MathUtils.lerp(a.r, b.r, t);
            out.g = THREE.MathUtils.lerp(a.g, b.g, t);
            out.b = THREE.MathUtils.lerp(a.b, b.b, t);
            return out;
        }

        function samplePreviewRange(range, seed) {
            return THREE.MathUtils.lerp(range[0], range[1], seed);
        }

        function samplePreviewVectorNoise(position, seed, time, scale) {
            const s = Math.max(0.01, scale);
            const x = Math.sin((position.x + seed.x * 3.1 + time * 0.91) * s) + Math.cos((position.y + seed.z * 1.7 - time * 0.57) * s * 1.31);
            const y = Math.sin((position.y - seed.y * 2.3 + time * 0.73) * s * 0.87) + Math.cos((position.z + seed.x * 4.7 + time * 0.39) * s * 1.13);
            const z = Math.sin((position.z + seed.z * 5.1 - time * 0.63) * s * 1.17) + Math.cos((position.x - seed.y * 3.9 + time * 0.28) * s * 0.93);
            PREVIEW_TMP_VEC3.set(x, y, z);
            if (PREVIEW_TMP_VEC3.lengthSq() < 1e-6) return PREVIEW_TMP_VEC3.set(0, 0, 0);
            return PREVIEW_TMP_VEC3.normalize();
        }

        function rotationArrayToQuaternion(rotation) {
            PREVIEW_TMP_EULER.set(
                THREE.MathUtils.degToRad(rotation[0]),
                THREE.MathUtils.degToRad(rotation[1]),
                THREE.MathUtils.degToRad(rotation[2]),
                'XYZ'
            );
            return new THREE.Quaternion().setFromEuler(PREVIEW_TMP_EULER);
        }

        function compilePreviewLayer(layer, scene) {
            const modules = clonePreviewModules(layer?.modules);
            const root = createPreviewRootSectionsFromModules(modules);
            const mainSettings = modules.main.settings;
            const emissionSettings = modules.emission.settings;
            const shapeSettings = modules.shape.settings;
            const velocitySettings = modules.velocityOverLifetime.settings;
            const forceSettings = modules.forceOverLifetime.settings;
            const limitSettings = modules.limitVelocityOverLifetime.settings;
            const noiseSettings = modules.noise.settings;
            const colorSettings = modules.colorOverLifetime.settings;
            const colorBySpeedSettings = modules.colorBySpeed.settings;
            const sizeSettings = modules.sizeOverLifetime.settings;
            const sizeBySpeedSettings = modules.sizeBySpeed.settings;
            const rotationSettings = modules.rotationOverLifetime.settings;
            const rotationBySpeedSettings = modules.rotationBySpeed.settings;
            const collisionSettings = modules.collision.settings;
            const subEmitterSettings = modules.subEmitters.settings;
            const textureSettings = modules.textureSheetAnimation.settings;
            const inheritSettings = modules.inheritVelocity.settings;
            const lifetimeBySpeedSettings = modules.lifetimeByEmitterSpeed.settings;
            const trailSettings = modules.trails.settings;
            const customDataSettings = modules.customData.settings;
            const rendererSettings = modules.renderer.settings;
            const mainLifetimeParam = normalizePreviewScalarParameter(mainSettings.lifetimeParam ?? mainSettings.lifetime, createPreviewScalarParameter('two_constants', { constants: root.particle.lifetime }));
            const mainStartSpeedParam = normalizePreviewScalarParameter(mainSettings.startSpeedParam ?? mainSettings.startSpeed, createPreviewScalarParameter('two_constants', { constants: root.emitter.speed }));
            const mainStartSizeParam = normalizePreviewScalarParameter(mainSettings.startSizeParam ?? mainSettings.startSize, createPreviewScalarParameter('two_constants', { constants: root.particle.size }));
            const mainStartRotationParam = normalizePreviewScalarParameter(mainSettings.startRotationParam ?? mainSettings.startRotation, createPreviewScalarParameter('two_constants', { constants: root.particle.spin }));
            const mainStartColorParam = normalizePreviewColorParameter(mainSettings.startColorParam ?? [mainSettings.startColorStart, mainSettings.startColorEnd], createPreviewColorParameter('two_colors', { colors: [root.particle.colorStart, root.particle.colorEnd] }));
            const mainStartColorEndpoints = colorParameterToEndpointColors(mainStartColorParam, root.particle.colorStart, root.particle.colorEnd);
            const colorOverLifetimeParam = normalizePreviewColorParameter(colorSettings.colorParam ?? [colorSettings.colorStart, colorSettings.colorEnd], createPreviewColorParameter('gradient', { gradient: createPreviewGradientDefinition([root.particle.colorStart, root.particle.colorEnd]) }));
            const colorOverLifetimeEndpoints = colorParameterToEndpointColors(colorOverLifetimeParam, root.particle.colorStart, root.particle.colorEnd);
            const sizeOverLifetimeParam = normalizePreviewScalarParameter(sizeSettings.curveParam ?? sizeSettings.curve ?? rendererSettings.sizeOverLifeParam ?? rendererSettings.sizeOverLife, createPreviewScalarParameter('curve', { curve: createPreviewCurveDefinition(root.render.sizeOverLife) }));
            const rotationOverLifetimeParam = normalizePreviewScalarParameter(rotationSettings.spinParam ?? rotationSettings.spin, createPreviewScalarParameter('two_constants', { constants: root.particle.spin }));
            const rendererAlphaParam = normalizePreviewScalarParameter(rendererSettings.alphaOverLifeParam ?? rendererSettings.alphaOverLife, createPreviewScalarParameter('curve', { curve: createPreviewCurveDefinition(root.render.alphaOverLife) }));
            const rendererSizeParam = normalizePreviewScalarParameter(rendererSettings.sizeOverLifeParam ?? rendererSettings.sizeOverLife ?? sizeSettings.curveParam, createPreviewScalarParameter('curve', { curve: createPreviewCurveDefinition(root.render.sizeOverLife) }));
            const rotationQuaternion = rotationArrayToQuaternion(root.emitter.rotation);
            const shapeDirection = new THREE.Vector3(...normalizePreviewArray(shapeSettings.direction, 3, root.emitter.direction));
            if (shapeDirection.lengthSq() < 1e-6) shapeDirection.copy(PREVIEW_UP);
            shapeDirection.normalize();
            return {
                id: layer.id,
                name: layer.name,
                enabled: layer.enabled !== false,
                maxParticles: clampPreviewValue(parseInt(layer.maxParticles, 10) || PREVIEW_DEFAULT_PARTICLES_PER_LAYER, 1, PREVIEW_MAX_PARTICLES_PER_LAYER),
                main: {
                    duration: Math.max(0, mainSettings.duration),
                    loop: mainSettings.loop !== false && scene.loop !== false,
                    lifetimeParam: mainLifetimeParam,
                    lifetime: scalarParameterToRange(mainLifetimeParam, root.particle.lifetime),
                    startSpeedParam: mainStartSpeedParam,
                    startSpeed: scalarParameterToRange(mainStartSpeedParam, root.emitter.speed),
                    startSizeParam: mainStartSizeParam,
                    startSize: scalarParameterToRange(mainStartSizeParam, root.particle.size),
                    startRotationParam: mainStartRotationParam,
                    startRotation: scalarParameterToRange(mainStartRotationParam, root.particle.spin),
                    startColorParam: mainStartColorParam,
                    startColorStart: colorFromHex(mainStartColorEndpoints[0]),
                    startColorEnd: colorFromHex(mainStartColorEndpoints[1]),
                    simulationSpeed: clampPreviewValue(mainSettings.simulationSpeed, 0, 4)
                },
                emission: {
                    enabled: modules.emission.enabled !== false,
                    mode: modules.emission.mode || 'continuous',
                    rate: Math.max(0, emissionSettings.rate),
                    bursts: normalizePreviewBursts(emissionSettings.bursts?.length ? emissionSettings.bursts : emissionSettings.burst, []),
                    burstTime: Math.max(0, emissionSettings.burstTime || 0),
                    loop: emissionSettings.loop !== false && scene.loop !== false,
                    duration: Math.max(0, emissionSettings.duration)
                },
                shape: {
                    enabled: modules.shape.enabled !== false,
                    shape: PREVIEW_EMITTER_SHAPES.includes(shapeSettings.shape) ? shapeSettings.shape : root.emitter.shape,
                    position: new THREE.Vector3(...normalizePreviewArray(shapeSettings.position, 3, root.emitter.position)),
                    rotation: normalizePreviewArray(shapeSettings.rotation, 3, root.emitter.rotation),
                    rotationQuaternion,
                    size: new THREE.Vector3(...normalizePreviewArray(shapeSettings.size, 3, root.emitter.size)),
                    direction: shapeDirection,
                    spread: Math.max(0, shapeSettings.spread)
                },
                velocityOverLifetime: {
                    enabled: modules.velocityOverLifetime.enabled !== false,
                    linear: new THREE.Vector3(...normalizePreviewArray(velocitySettings.linear, 3, [0, 0, 0])),
                    gravity: new THREE.Vector3(...normalizePreviewArray(velocitySettings.gravity, 3, root.simulation.gravity)),
                    drag: Math.max(0, velocitySettings.drag)
                },
                forceOverLifetime: {
                    enabled: modules.forceOverLifetime.enabled === true,
                    force: new THREE.Vector3(...normalizePreviewArray(forceSettings.force, 3, [0, 0, 0])),
                    vortexStrength: forceSettings.vortexStrength,
                    radialAttraction: forceSettings.radialAttraction
                },
                limitVelocityOverLifetime: {
                    enabled: modules.limitVelocityOverLifetime.enabled !== false,
                    speedLimit: Math.max(0, limitSettings.speedLimit),
                    dampen: clampPreviewValue(limitSettings.dampen, 0, 1)
                },
                noise: {
                    enabled: modules.noise.enabled === true,
                    strength: Math.max(0, noiseSettings.noiseStrength),
                    scale: Math.max(0.01, noiseSettings.noiseScale),
                    scrollSpeed: noiseSettings.scrollSpeed
                },
                colorOverLifetime: {
                    enabled: modules.colorOverLifetime.enabled === true,
                    parameter: colorOverLifetimeParam,
                    start: colorFromHex(colorOverLifetimeEndpoints[0]),
                    end: colorFromHex(colorOverLifetimeEndpoints[1])
                },
                colorBySpeed: {
                    enabled: modules.colorBySpeed.enabled === true,
                    minSpeed: Math.max(0, colorBySpeedSettings.minSpeed),
                    maxSpeed: Math.max(0.01, colorBySpeedSettings.maxSpeed),
                    lowSpeedColor: colorFromHex(colorBySpeedSettings.lowSpeedColor),
                    highSpeedColor: colorFromHex(colorBySpeedSettings.highSpeedColor)
                },
                sizeOverLifetime: {
                    enabled: modules.sizeOverLifetime.enabled === true,
                    parameter: sizeOverLifetimeParam,
                    curve: scalarParameterToCurvePoints(sizeOverLifetimeParam, root.render.sizeOverLife)
                },
                sizeBySpeed: {
                    enabled: modules.sizeBySpeed.enabled === true,
                    minSpeed: Math.max(0, sizeBySpeedSettings.minSpeed),
                    maxSpeed: Math.max(0.01, sizeBySpeedSettings.maxSpeed),
                    scale: normalizePreviewRange(sizeBySpeedSettings.scale, [1, 1])
                },
                rotationOverLifetime: {
                    enabled: modules.rotationOverLifetime.enabled === true,
                    parameter: rotationOverLifetimeParam,
                    spin: scalarParameterToRange(rotationOverLifetimeParam, root.particle.spin)
                },
                rotationBySpeed: {
                    enabled: modules.rotationBySpeed.enabled === true,
                    minSpeed: Math.max(0, rotationBySpeedSettings.minSpeed),
                    maxSpeed: Math.max(0.01, rotationBySpeedSettings.maxSpeed),
                    spin: normalizePreviewRange(rotationBySpeedSettings.spin, [0, 0])
                },
                collision: {
                    enabled: modules.collision.enabled === true,
                    planeY: collisionSettings.planeY,
                    bounce: Math.max(0, collisionSettings.bounce),
                    dampen: clampPreviewValue(collisionSettings.dampen, 0, 1),
                    lifetimeLoss: clampPreviewValue(collisionSettings.lifetimeLoss, 0, 1)
                },
                subEmitters: {
                    enabled: modules.subEmitters.enabled === true,
                    targetLayerId: typeof subEmitterSettings.targetLayerId === 'string' && subEmitterSettings.targetLayerId.trim() ? subEmitterSettings.targetLayerId : null,
                    birthCount: Math.max(0, Math.round(subEmitterSettings.birthCount)),
                    deathCount: Math.max(0, Math.round(subEmitterSettings.deathCount)),
                    collisionCount: Math.max(0, Math.round(subEmitterSettings.collisionCount))
                },
                textureSheet: {
                    enabled: modules.textureSheetAnimation.enabled === true,
                    columns: Math.max(1, Math.round(textureSettings.columns)),
                    rows: Math.max(1, Math.round(textureSettings.rows)),
                    cycles: Math.max(1, Math.round(textureSettings.cycles)),
                    startFrame: Math.max(0, Math.round(textureSettings.startFrame)),
                    randomRow: textureSettings.randomRow === true,
                    frameOverLife: normalizePreviewRange(textureSettings.frameOverLife, [0, 1])
                },
                inheritVelocity: {
                    enabled: modules.inheritVelocity.enabled === true,
                    factor: clampPreviewValue(inheritSettings.factor, 0, 4)
                },
                lifetimeByEmitterSpeed: {
                    enabled: modules.lifetimeByEmitterSpeed.enabled === true,
                    minSpeed: Math.max(0, lifetimeBySpeedSettings.minSpeed),
                    maxSpeed: Math.max(0.01, lifetimeBySpeedSettings.maxSpeed),
                    lifetimeScale: normalizePreviewRange(lifetimeBySpeedSettings.lifetimeScale, [1, 1])
                },
                trails: {
                    enabled: modules.trails.enabled === true,
                    length: Math.max(2, Math.round(trailSettings.length)),
                    widthOverTrail: normalizePreviewCurve(trailSettings.widthOverTrail, [0.7, 0.35, 0]),
                    alphaOverTrail: normalizePreviewCurve(trailSettings.alphaOverTrail, [0.55, 0.18, 0])
                },
                customData: {
                    enabled: modules.customData.enabled === true,
                    data1: normalizePreviewRange(customDataSettings.data1, [0, 1]),
                    data2: normalizePreviewRange(customDataSettings.data2, [0, 1])
                },
                renderer: {
                    enabled: modules.renderer.enabled !== false,
                    blend: PREVIEW_BLEND_MODES.includes(rendererSettings.blend) ? rendererSettings.blend : root.render.blend,
                    billboard: PREVIEW_BILLBOARD_MODES.includes(rendererSettings.billboard) ? rendererSettings.billboard : root.render.billboard,
                    alphaClip: Math.max(0, rendererSettings.alphaClip),
                    alphaOverLifeParam: rendererAlphaParam,
                    alphaOverLife: scalarParameterToCurvePoints(rendererAlphaParam, root.render.alphaOverLife),
                    sizeOverLifeParam: rendererSizeParam,
                    sizeOverLife: scalarParameterToCurvePoints(rendererSizeParam, root.render.sizeOverLife),
                    materialSource: PREVIEW_PRESET_SOURCE_MODES.includes(rendererSettings.materialSource) ? rendererSettings.materialSource : PREVIEW_DEFAULT_SOURCE_MODE
                }
            };
        }

        function createPreviewParticleState() {
            return {
                alive: false,
                age: 0,
                lifetime: 1,
                rotation: 0,
                angularVelocity: 0,
                size: 0,
                baseSize: 0,
                alpha: 0,
                speed: 0,
                uvTransform: [1, 1, 0, 0],
                customData1: 0,
                customData2: 0,
                spawnDepth: 0,
                emitterSpeedAtSpawn: 0,
                seed: new THREE.Vector3(Math.random(), Math.random(), Math.random()),
                baseColor: new THREE.Color(),
                color: new THREE.Color(),
                position: new THREE.Vector3(),
                velocity: new THREE.Vector3(),
                trailHistory: []
            };
        }

        function clonePreviewParticleSnapshot(particle) {
            return {
                alive: particle.alive === true,
                age: particle.age,
                lifetime: particle.lifetime,
                rotation: particle.rotation,
                angularVelocity: particle.angularVelocity,
                size: particle.size,
                baseSize: particle.baseSize,
                alpha: particle.alpha,
                speed: particle.speed,
                uvTransform: Array.isArray(particle.uvTransform) ? [...particle.uvTransform] : [1, 1, 0, 0],
                customData1: particle.customData1,
                customData2: particle.customData2,
                spawnDepth: particle.spawnDepth,
                emitterSpeedAtSpawn: particle.emitterSpeedAtSpawn,
                seed: particle.seed.clone(),
                baseColor: particle.baseColor.clone(),
                color: particle.color.clone(),
                position: particle.position.clone(),
                velocity: particle.velocity.clone(),
                trailHistory: Array.isArray(particle.trailHistory) ? particle.trailHistory.map((entry) => entry.clone()) : []
            };
        }

        class PreviewParticleLayer {
            constructor(runtime, authoringLayer, sceneConfig) {
                this.runtime = runtime;
                this.authoringLayer = sanitizePreviewPreset({ version: PREVIEW_PRESET_VERSION, layers: [authoringLayer] }).layers[0];
                this.sceneConfig = sceneConfig;
                this.compiled = compilePreviewLayer(this.authoringLayer, sceneConfig);
                this.particles = Array.from({ length: this.compiled.maxParticles }, () => createPreviewParticleState());
                this.nextSpawnIndex = 0;
                this.absoluteTime = 0;
                this.prevAbsoluteTime = 0;
                this.emitterLoops = 0;
                this.rateAccumulator = 0;
                this.pendingExternalSpawns = [];
                this.previousEmitterPosition = this.compiled.shape.position.clone();
                this.emitterVelocity = new THREE.Vector3();
                this.renderState = this.createRenderState();
                this.renderMesh = this.renderState.mesh;
                this.trailState = this.createTrailState();
                this.trailMesh = this.trailState.mesh;
                this.alphaMultiplier = 1;
                this.reset();
            }

            createRenderState() {
                const geometry = new THREE.InstancedBufferGeometry();
                const basePositions = new Float32Array([
                    -0.5, -0.5, 0,
                    0.5, -0.5, 0,
                    -0.5, 0.5, 0,
                    0.5, 0.5, 0
                ]);
                const baseUvs = new Float32Array([
                    0, 0,
                    1, 0,
                    0, 1,
                    1, 1
                ]);
                geometry.setIndex([0, 1, 2, 2, 1, 3]);
                geometry.setAttribute('position', new THREE.Float32BufferAttribute(basePositions, 3));
                geometry.setAttribute('quadUv', new THREE.Float32BufferAttribute(baseUvs, 2));
                const positionAttr = new THREE.InstancedBufferAttribute(new Float32Array(this.compiled.maxParticles * 3), 3);
                const sizeAttr = new THREE.InstancedBufferAttribute(new Float32Array(this.compiled.maxParticles), 1);
                const rotationAttr = new THREE.InstancedBufferAttribute(new Float32Array(this.compiled.maxParticles), 1);
                const colorAttr = new THREE.InstancedBufferAttribute(new Float32Array(this.compiled.maxParticles * 4), 4);
                const uvAttr = new THREE.InstancedBufferAttribute(new Float32Array(this.compiled.maxParticles * 4), 4);
                positionAttr.setUsage(THREE.DynamicDrawUsage);
                sizeAttr.setUsage(THREE.DynamicDrawUsage);
                rotationAttr.setUsage(THREE.DynamicDrawUsage);
                colorAttr.setUsage(THREE.DynamicDrawUsage);
                uvAttr.setUsage(THREE.DynamicDrawUsage);
                geometry.setAttribute('instancePosition', positionAttr);
                geometry.setAttribute('instanceSize', sizeAttr);
                geometry.setAttribute('instanceRotation', rotationAttr);
                geometry.setAttribute('instanceColor', colorAttr);
                geometry.setAttribute('instanceUvTransform', uvAttr);
                geometry.instanceCount = this.compiled.maxParticles;

                const material = new THREE.ShaderMaterial({
                    transparent: true,
                    depthWrite: false,
                    blending: this.compiled.renderer.blend === 'additive' ? THREE.AdditiveBlending : THREE.NormalBlending,
                    uniforms: {
                        uSprite: { value: this.runtime.createFallbackSourceTexture() },
                        uCameraRight: { value: new THREE.Vector3(1, 0, 0) },
                        uCameraUp: { value: new THREE.Vector3(0, 1, 0) },
                        uAlphaClip: { value: this.compiled.renderer.alphaClip }
                    },
                    vertexShader: `
                        precision highp float;
                        attribute vec2 quadUv;
                        attribute vec3 instancePosition;
                        attribute float instanceSize;
                        attribute float instanceRotation;
                        attribute vec4 instanceColor;
                        attribute vec4 instanceUvTransform;
                        uniform vec3 uCameraRight;
                        uniform vec3 uCameraUp;
                        varying vec2 vUv;
                        varying vec4 vColor;
                        void main() {
                            vec2 centered = quadUv - 0.5;
                            float c = cos(instanceRotation);
                            float s = sin(instanceRotation);
                            vec2 rotated = vec2(centered.x * c - centered.y * s, centered.x * s + centered.y * c);
                            vec3 billboardOffset = (uCameraRight * rotated.x + uCameraUp * rotated.y) * instanceSize;
                            vec4 mvPosition = modelViewMatrix * vec4(instancePosition + billboardOffset, 1.0);
                            gl_Position = projectionMatrix * mvPosition;
                            vUv = quadUv * instanceUvTransform.xy + instanceUvTransform.zw;
                            vColor = instanceColor;
                        }
                    `,
                    fragmentShader: `
                        precision highp float;
                        uniform sampler2D uSprite;
                        uniform float uAlphaClip;
                        varying vec2 vUv;
                        varying vec4 vColor;
                        void main() {
                            vec4 tex = texture2D(uSprite, vUv);
                            vec4 color = vec4(vColor.rgb, vColor.a * tex.a);
                            if (color.a <= uAlphaClip) discard;
                            gl_FragColor = vec4(color.rgb * tex.rgb, color.a);
                        }
                    `
                });
                return {
                    geometry,
                    positionAttr,
                    sizeAttr,
                    rotationAttr,
                    colorAttr,
                    uvAttr,
                    material,
                    mesh: new THREE.Mesh(geometry, material)
                };
            }

            createTrailState() {
                const maxSegments = this.compiled.maxParticles * Math.max(1, this.compiled.trails.length - 1);
                const geometry = new THREE.InstancedBufferGeometry();
                const base = new Float32Array([
                    0, -1, 0,
                    1, -1, 0,
                    0, 1, 0,
                    1, 1, 0
                ]);
                geometry.setIndex([0, 1, 2, 2, 1, 3]);
                geometry.setAttribute('position', new THREE.Float32BufferAttribute(base, 3));
                const startAttr = new THREE.InstancedBufferAttribute(new Float32Array(maxSegments * 3), 3);
                const endAttr = new THREE.InstancedBufferAttribute(new Float32Array(maxSegments * 3), 3);
                const colorAttr = new THREE.InstancedBufferAttribute(new Float32Array(maxSegments * 4), 4);
                const widthAttr = new THREE.InstancedBufferAttribute(new Float32Array(maxSegments), 1);
                startAttr.setUsage(THREE.DynamicDrawUsage);
                endAttr.setUsage(THREE.DynamicDrawUsage);
                colorAttr.setUsage(THREE.DynamicDrawUsage);
                widthAttr.setUsage(THREE.DynamicDrawUsage);
                geometry.setAttribute('segmentStart', startAttr);
                geometry.setAttribute('segmentEnd', endAttr);
                geometry.setAttribute('segmentColor', colorAttr);
                geometry.setAttribute('segmentWidth', widthAttr);
                geometry.instanceCount = 0;
                const material = new THREE.ShaderMaterial({
                    transparent: true,
                    depthWrite: false,
                    blending: THREE.AdditiveBlending,
                    uniforms: {
                        uCameraForward: { value: new THREE.Vector3(0, 0, -1) }
                    },
                    vertexShader: `
                        precision highp float;
                        attribute vec3 segmentStart;
                        attribute vec3 segmentEnd;
                        attribute vec4 segmentColor;
                        attribute float segmentWidth;
                        uniform vec3 uCameraForward;
                        varying vec4 vColor;
                        void main() {
                            vec3 segmentDir = normalize(segmentEnd - segmentStart + vec3(0.00001));
                            vec3 side = normalize(cross(uCameraForward, segmentDir));
                            float along = position.x;
                            float across = position.y * segmentWidth * 0.5;
                            vec3 segmentPoint = mix(segmentStart, segmentEnd, along) + side * across;
                            vec4 mvPosition = modelViewMatrix * vec4(segmentPoint, 1.0);
                            gl_Position = projectionMatrix * mvPosition;
                            vColor = segmentColor;
                        }
                    `,
                    fragmentShader: `
                        precision highp float;
                        varying vec4 vColor;
                        void main() {
                            if (vColor.a <= 0.001) discard;
                            gl_FragColor = vColor;
                        }
                    `
                });
                const mesh = new THREE.Mesh(geometry, material);
                mesh.renderOrder = 1;
                return {
                    maxSegments,
                    geometry,
                    startAttr,
                    endAttr,
                    colorAttr,
                    widthAttr,
                    material,
                    mesh
                };
            }

            setSourceTexture(texture) {
                const nextTexture = this.compiled.renderer.materialSource === 'fallback_square_50' ? null : texture;
                this.renderState.material.uniforms.uSprite.value = nextTexture || this.runtime.createFallbackSourceTexture();
            }

            applyPreset(layer) {
                this.authoringLayer = sanitizePreviewPreset({ version: PREVIEW_PRESET_VERSION, layers: [layer] }).layers[0];
                const nextCompiled = compilePreviewLayer(this.authoringLayer, this.sceneConfig);
                const rebuildNeeded = nextCompiled.maxParticles !== this.compiled.maxParticles || nextCompiled.trails.length !== this.compiled.trails.length;
                this.compiled = nextCompiled;
                if (rebuildNeeded) {
                    const sourceTexture = this.renderState.material.uniforms.uSprite.value;
                    this.disposeRenderState();
                    this.particles = Array.from({ length: this.compiled.maxParticles }, () => createPreviewParticleState());
                    this.renderState = this.createRenderState();
                    this.renderMesh = this.renderState.mesh;
                    this.trailState = this.createTrailState();
                    this.trailMesh = this.trailState.mesh;
                    this.setSourceTexture(sourceTexture);
                } else {
                    this.renderState.material.blending = this.compiled.renderer.blend === 'additive' ? THREE.AdditiveBlending : THREE.NormalBlending;
                    this.renderState.material.uniforms.uAlphaClip.value = this.compiled.renderer.alphaClip;
                }
                this.reset();
            }

            disposeRenderState() {
                this.renderState.geometry.dispose();
                this.renderState.material.dispose();
                this.trailState.geometry.dispose();
                this.trailState.material.dispose();
            }

            reset() {
                this.absoluteTime = 0;
                this.prevAbsoluteTime = 0;
                this.emitterLoops = 0;
                this.rateAccumulator = 0;
                this.pendingExternalSpawns = [];
                this.previousEmitterPosition.copy(this.compiled.shape.position);
                this.emitterVelocity.set(0, 0, 0);
                this.nextSpawnIndex = 0;
                this.alphaMultiplier = 1;
                this.particles.forEach((particle) => {
                    particle.alive = false;
                    particle.age = 0;
                    particle.alpha = 0;
                    particle.trailHistory = [];
                });
                this.updateRenderBuffers();
            }

            createSimulationSnapshot() {
                return {
                    nextSpawnIndex: this.nextSpawnIndex,
                    absoluteTime: this.absoluteTime,
                    prevAbsoluteTime: this.prevAbsoluteTime,
                    emitterLoops: this.emitterLoops,
                    rateAccumulator: this.rateAccumulator,
                    pendingExternalSpawns: this.pendingExternalSpawns.map((entry) => ({
                        count: entry.count,
                        position: entry.position ? entry.position.clone() : null,
                        velocity: entry.velocity ? entry.velocity.clone() : null,
                        color: entry.color ? entry.color.clone() : null,
                        sizeScale: entry.sizeScale,
                        triggerDepth: entry.triggerDepth
                    })),
                    previousEmitterPosition: this.previousEmitterPosition.clone(),
                    emitterVelocity: this.emitterVelocity.clone(),
                    particles: this.particles.map((particle) => clonePreviewParticleSnapshot(particle))
                };
            }

            restoreSimulationSnapshot(snapshot) {
                if (!snapshot) {
                    this.reset();
                    return;
                }
                this.nextSpawnIndex = snapshot.nextSpawnIndex || 0;
                this.absoluteTime = snapshot.absoluteTime || 0;
                this.prevAbsoluteTime = snapshot.prevAbsoluteTime || 0;
                this.emitterLoops = snapshot.emitterLoops || 0;
                this.rateAccumulator = snapshot.rateAccumulator || 0;
                this.pendingExternalSpawns = Array.isArray(snapshot.pendingExternalSpawns) ? snapshot.pendingExternalSpawns.map((entry) => ({
                    count: entry.count,
                    position: entry.position ? entry.position.clone() : null,
                    velocity: entry.velocity ? entry.velocity.clone() : null,
                    color: entry.color ? entry.color.clone() : null,
                    sizeScale: entry.sizeScale,
                    triggerDepth: entry.triggerDepth
                })) : [];
                this.previousEmitterPosition.copy(snapshot.previousEmitterPosition || this.compiled.shape.position);
                this.emitterVelocity.copy(snapshot.emitterVelocity || PREVIEW_TMP_VEC3.set(0, 0, 0));
                this.particles.forEach((particle, index) => {
                    const source = snapshot.particles?.[index];
                    if (!source) {
                        particle.alive = false;
                        particle.alpha = 0;
                        particle.trailHistory = [];
                        return;
                    }
                    particle.alive = source.alive === true;
                    particle.age = source.age || 0;
                    particle.lifetime = source.lifetime || 1;
                    particle.rotation = source.rotation || 0;
                    particle.angularVelocity = source.angularVelocity || 0;
                    particle.size = source.size || 0;
                    particle.baseSize = source.baseSize || 0;
                    particle.alpha = source.alpha || 0;
                    particle.speed = source.speed || 0;
                    particle.uvTransform = Array.isArray(source.uvTransform) ? [...source.uvTransform] : [1, 1, 0, 0];
                    particle.customData1 = source.customData1 || 0;
                    particle.customData2 = source.customData2 || 0;
                    particle.spawnDepth = source.spawnDepth || 0;
                    particle.emitterSpeedAtSpawn = source.emitterSpeedAtSpawn || 0;
                    particle.seed.copy(source.seed || PREVIEW_TMP_VEC3.set(0.5, 0.5, 0.5));
                    particle.baseColor.copy(source.baseColor || PREVIEW_TMP_COLOR.set('#ffffff'));
                    particle.color.copy(source.color || PREVIEW_TMP_COLOR_B.set('#ffffff'));
                    particle.position.copy(source.position || PREVIEW_TMP_VEC3.set(0, 0, 0));
                    particle.velocity.copy(source.velocity || PREVIEW_TMP_VEC3_B.set(0, 0, 0));
                    particle.trailHistory = Array.isArray(source.trailHistory) ? source.trailHistory.map((entry) => entry.clone()) : [];
                });
                this.updateRenderBuffers();
            }

            dispose() {
                this.disposeRenderState();
            }

            queueExternalSpawn(event) {
                if (!event || !isFiniteNumber(event.count) || event.count <= 0) return;
                this.pendingExternalSpawns.push({
                    count: Math.max(0, Math.round(event.count)),
                    position: event.position ? event.position.clone() : null,
                    velocity: event.velocity ? event.velocity.clone() : null,
                    color: event.color ? event.color.clone() : null,
                    sizeScale: isFiniteNumber(event.sizeScale) ? event.sizeScale : 1,
                    triggerDepth: Math.max(0, Math.round(event.triggerDepth || 0))
                });
            }

            updateEmitterVelocity(delta) {
                PREVIEW_TMP_VEC3.copy(this.compiled.shape.position).sub(this.previousEmitterPosition);
                if (delta > 0) PREVIEW_TMP_VEC3.divideScalar(delta);
                this.emitterVelocity.copy(PREVIEW_TMP_VEC3);
                this.previousEmitterPosition.copy(this.compiled.shape.position);
            }

            canEmitAt(time) {
                const duration = this.compiled.emission.duration > 0 ? this.compiled.emission.duration : this.compiled.main.duration;
                if (duration <= 0) return true;
                if (this.compiled.emission.loop) return true;
                return time <= duration + 1e-6;
            }

            getEmitterCycleT(time = this.absoluteTime) {
                const duration = this.compiled.emission.duration > 0 ? this.compiled.emission.duration : this.compiled.main.duration;
                if (duration <= 0) return 0;
                if (this.compiled.emission.loop) {
                    const wrapped = ((time % duration) + duration) % duration;
                    return clampPreviewValue(wrapped / duration, 0, 1);
                }
                return clampPreviewValue(time / duration, 0, 1);
            }

            getBurstSpawnCount(startTime, endTime) {
                if (!this.compiled.emission.enabled || this.compiled.emission.bursts.length === 0) return 0;
                const duration = this.compiled.emission.duration > 0 ? this.compiled.emission.duration : this.compiled.main.duration;
                const looped = this.compiled.emission.loop && duration > 0;
                let count = 0;
                const loopStart = looped ? Math.max(0, Math.floor(startTime / duration) - 1) : 0;
                const loopEnd = looped ? Math.floor(endTime / duration) : 0;
                this.compiled.emission.bursts.forEach((burst) => {
                    const loopMin = looped ? loopStart : 0;
                    const loopMax = looped ? loopEnd : 0;
                    for (let loopIndex = loopMin; loopIndex <= loopMax; loopIndex++) {
                        const baseTime = looped ? loopIndex * duration : 0;
                        for (let cycle = 0; cycle < burst.cycles; cycle++) {
                            const eventTime = baseTime + burst.time + burst.interval * cycle;
                            if (!looped && duration > 0 && eventTime > duration + 1e-6) break;
                            if (eventTime > startTime && eventTime <= endTime + 1e-6) count += burst.count;
                        }
                    }
                });
                return count;
            }

            getScheduledSpawnCount(delta) {
                if (!this.compiled.enabled || !this.compiled.emission.enabled) return 0;
                const startTime = this.prevAbsoluteTime;
                const endTime = this.absoluteTime;
                let spawnCount = this.getBurstSpawnCount(startTime, endTime);
                if (this.compiled.emission.rate > 0 && this.canEmitAt(this.absoluteTime)) {
                    this.rateAccumulator += delta * this.compiled.emission.rate;
                    const whole = Math.floor(this.rateAccumulator);
                    this.rateAccumulator -= whole;
                    spawnCount += whole;
                }
                return spawnCount;
            }

            getNextAvailableParticle() {
                const count = this.particles.length;
                for (let offset = 0; offset < count; offset++) {
                    const index = (this.nextSpawnIndex + offset) % count;
                    if (!this.particles[index].alive) {
                        this.nextSpawnIndex = (index + 1) % count;
                        return this.particles[index];
                    }
                }
                return null;
            }

            getSubEmitterTargetLayerId() {
                return this.compiled.subEmitters.targetLayerId || this.compiled.id;
            }

            emitSubParticles(triggerKey, particle) {
                if (!this.compiled.subEmitters.enabled || particle.spawnDepth >= 1) return;
                const count = this.compiled.subEmitters[triggerKey];
                if (!count) return;
                this.runtime.queueLayerSpawn(this.getSubEmitterTargetLayerId(), {
                    count,
                    position: particle.position,
                    velocity: particle.velocity,
                    color: particle.color,
                    sizeScale: 0.6,
                    triggerDepth: particle.spawnDepth + 1
                });
            }

            sampleShapePosition(seed) {
                const shape = this.compiled.shape.shape;
                const size = this.compiled.shape.size;
                PREVIEW_TMP_VEC3.set(0, 0, 0);
                if (shape === 'sphere') {
                    const theta = seed.x * Math.PI * 2;
                    const phi = Math.acos(seed.y * 2 - 1);
                    const radius = Math.pow(seed.z, 1 / 3);
                    PREVIEW_TMP_VEC3.set(
                        Math.sin(phi) * Math.cos(theta),
                        Math.cos(phi),
                        Math.sin(phi) * Math.sin(theta)
                    ).multiply(size).multiplyScalar(radius);
                } else if (shape === 'box') {
                    PREVIEW_TMP_VEC3.set(seed.x * 2 - 1, seed.y * 2 - 1, seed.z * 2 - 1).multiply(size);
                } else if (shape === 'cone') {
                    const angle = seed.x * Math.PI * 2;
                    const radius = Math.sqrt(seed.y) * size.x;
                    PREVIEW_TMP_VEC3.set(Math.cos(angle) * radius, seed.z * size.y, Math.sin(angle) * radius);
                } else if (shape === 'ring') {
                    const angle = seed.x * Math.PI * 2;
                    const radius = THREE.MathUtils.lerp(Math.max(0.001, size.x * 0.55), size.x, seed.y);
                    PREVIEW_TMP_VEC3.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
                }
                PREVIEW_TMP_VEC3.applyQuaternion(this.compiled.shape.rotationQuaternion);
                PREVIEW_TMP_VEC3.add(this.compiled.shape.position);
                return PREVIEW_TMP_VEC3.clone();
            }

            sampleShapeDirection(seed) {
                PREVIEW_TMP_VEC3.copy(this.compiled.shape.direction);
                const random = PREVIEW_TMP_VEC3_B.set(seed.x * 2 - 1, seed.y * 2 - 1, seed.z * 2 - 1).normalize();
                PREVIEW_TMP_VEC3.lerp(random, clampPreviewValue(this.compiled.shape.spread, 0, 1));
                if (PREVIEW_TMP_VEC3.lengthSq() < 1e-6) PREVIEW_TMP_VEC3.copy(PREVIEW_UP);
                PREVIEW_TMP_VEC3.normalize();
                PREVIEW_TMP_VEC3.applyQuaternion(this.compiled.shape.rotationQuaternion).normalize();
                return PREVIEW_TMP_VEC3.clone();
            }

            sampleTextureSheet(particle) {
                if (!this.compiled.textureSheet.enabled) return [1, 1, 0, 0];
                const totalFrames = this.compiled.textureSheet.columns * this.compiled.textureSheet.rows;
                const frameT = THREE.MathUtils.lerp(this.compiled.textureSheet.frameOverLife[0], this.compiled.textureSheet.frameOverLife[1], clampPreviewValue(particle.age / particle.lifetime, 0, 1));
                const frameIndex = (this.compiled.textureSheet.startFrame + Math.floor(frameT * this.compiled.textureSheet.cycles * totalFrames)) % totalFrames;
                const rowIndex = this.compiled.textureSheet.randomRow ? Math.floor(particle.seed.y * this.compiled.textureSheet.rows) : Math.floor(frameIndex / this.compiled.textureSheet.columns);
                const columnIndex = frameIndex % this.compiled.textureSheet.columns;
                const scaleX = 1 / this.compiled.textureSheet.columns;
                const scaleY = 1 / this.compiled.textureSheet.rows;
                return [scaleX, scaleY, columnIndex * scaleX, 1 - scaleY - rowIndex * scaleY];
            }

            spawnParticle(spawnEvent = null) {
                const particle = this.getNextAvailableParticle();
                if (!particle) return false;
                const compiled = this.compiled;
                const emitterT = this.getEmitterCycleT(this.absoluteTime);
                particle.alive = true;
                particle.age = 0;
                particle.spawnDepth = Math.max(0, Math.round(spawnEvent?.triggerDepth || 0));
                particle.seed.set(Math.random(), Math.random(), Math.random());
                let lifetime = samplePreviewScalarParameter(compiled.main.lifetimeParam, emitterT, particle.seed.x);
                const emitterSpeed = this.emitterVelocity.length();
                if (compiled.lifetimeByEmitterSpeed.enabled) {
                    const speedT = remapPreviewValue(emitterSpeed, compiled.lifetimeByEmitterSpeed.minSpeed, compiled.lifetimeByEmitterSpeed.maxSpeed);
                    const scale = THREE.MathUtils.lerp(compiled.lifetimeByEmitterSpeed.lifetimeScale[0], compiled.lifetimeByEmitterSpeed.lifetimeScale[1], speedT);
                    lifetime *= scale;
                }
                particle.lifetime = Math.max(0.05, lifetime);
                particle.baseSize = samplePreviewScalarParameter(compiled.main.startSizeParam, emitterT, particle.seed.y) * (spawnEvent?.sizeScale || 1);
                particle.size = particle.baseSize;
                particle.rotation = samplePreviewScalarParameter(compiled.main.startRotationParam, emitterT, particle.seed.z);
                particle.angularVelocity = 0;
                particle.position.copy(spawnEvent?.position || this.sampleShapePosition(particle.seed));
                const direction = spawnEvent?.velocity ? spawnEvent.velocity.clone() : this.sampleShapeDirection(particle.seed);
                if (direction.lengthSq() < 1e-6) direction.copy(this.compiled.shape.direction);
                direction.normalize();
                particle.velocity.copy(direction.multiplyScalar(samplePreviewScalarParameter(compiled.main.startSpeedParam, emitterT, particle.seed.y)));
                if (compiled.inheritVelocity.enabled) particle.velocity.addScaledVector(this.emitterVelocity, compiled.inheritVelocity.factor);
                if (spawnEvent?.velocity) particle.velocity.addScaledVector(spawnEvent.velocity, 0.35);
                if (compiled.velocityOverLifetime.enabled) particle.velocity.add(compiled.velocityOverLifetime.linear);
                const startColor = samplePreviewColorParameter(new THREE.Color(), compiled.main.startColorParam, emitterT, particle.seed.z);
                particle.baseColor.copy(spawnEvent?.color || startColor);
                particle.color.copy(particle.baseColor);
                particle.alpha = 1;
                particle.speed = particle.velocity.length();
                particle.customData1 = samplePreviewRange(compiled.customData.data1, particle.seed.x);
                particle.customData2 = samplePreviewRange(compiled.customData.data2, particle.seed.y);
                particle.uvTransform = this.sampleTextureSheet(particle);
                particle.emitterSpeedAtSpawn = emitterSpeed;
                particle.trailHistory = compiled.trails.enabled ? Array.from({ length: compiled.trails.length }, () => particle.position.clone()) : [];
                this.emitSubParticles('birthCount', particle);
                return true;
            }

            drainExternalSpawns() {
                if (this.pendingExternalSpawns.length === 0) return;
                const queued = this.pendingExternalSpawns.splice(0, this.pendingExternalSpawns.length);
                queued.forEach((entry) => {
                    for (let index = 0; index < entry.count; index++) this.spawnParticle(entry);
                });
            }

            updateParticle(particle, delta) {
                const compiled = this.compiled;
                particle.age += delta;
                if (particle.age >= particle.lifetime) {
                    this.emitSubParticles('deathCount', particle);
                    particle.alive = false;
                    particle.alpha = 0;
                    return;
                }
                const lifeT = clampPreviewValue(particle.age / particle.lifetime, 0, 1);
                if (compiled.forceOverLifetime.enabled) {
                    particle.velocity.addScaledVector(compiled.forceOverLifetime.force, delta);
                    if (compiled.forceOverLifetime.vortexStrength !== 0) {
                        PREVIEW_TMP_VEC3.copy(particle.position).cross(PREVIEW_UP).multiplyScalar(compiled.forceOverLifetime.vortexStrength * delta);
                        particle.velocity.add(PREVIEW_TMP_VEC3);
                    }
                    if (compiled.forceOverLifetime.radialAttraction !== 0) {
                        PREVIEW_TMP_VEC3.copy(compiled.shape.position).sub(particle.position);
                        if (PREVIEW_TMP_VEC3.lengthSq() > 1e-6) particle.velocity.add(PREVIEW_TMP_VEC3.normalize().multiplyScalar(compiled.forceOverLifetime.radialAttraction * delta));
                    }
                }
                if (compiled.velocityOverLifetime.enabled) {
                    particle.velocity.addScaledVector(compiled.velocityOverLifetime.gravity, delta);
                    particle.velocity.addScaledVector(compiled.velocityOverLifetime.linear, delta * 0.35);
                    particle.velocity.multiplyScalar(Math.max(0, 1 - compiled.velocityOverLifetime.drag * delta));
                }
                if (compiled.noise.enabled) {
                    const noise = samplePreviewVectorNoise(particle.position, particle.seed, this.absoluteTime * compiled.noise.scrollSpeed, compiled.noise.scale);
                    particle.velocity.addScaledVector(noise, compiled.noise.strength * delta);
                }
                if (compiled.limitVelocityOverLifetime.enabled) {
                    const limit = compiled.limitVelocityOverLifetime.speedLimit;
                    const speed = particle.velocity.length();
                    if (limit > 0 && speed > limit) {
                        particle.velocity.multiplyScalar(limit / speed);
                        particle.velocity.multiplyScalar(1 - compiled.limitVelocityOverLifetime.dampen * 0.5);
                    }
                }
                particle.position.addScaledVector(particle.velocity, delta);
                if (compiled.collision.enabled && particle.position.y <= compiled.collision.planeY) {
                    particle.position.y = compiled.collision.planeY;
                    if (particle.velocity.y < 0) particle.velocity.y *= -compiled.collision.bounce;
                    particle.velocity.x *= 1 - compiled.collision.dampen;
                    particle.velocity.z *= 1 - compiled.collision.dampen;
                    particle.age += compiled.collision.lifetimeLoss * particle.lifetime;
                    this.emitSubParticles('collisionCount', particle);
                }
                particle.speed = particle.velocity.length();
                PREVIEW_TMP_COLOR_B.copy(particle.baseColor);
                if (compiled.colorOverLifetime.enabled) samplePreviewColorParameter(PREVIEW_TMP_COLOR_B, compiled.colorOverLifetime.parameter, lifeT, particle.seed.y);
                if (compiled.colorBySpeed.enabled) {
                    const speedT = remapPreviewValue(particle.speed, compiled.colorBySpeed.minSpeed, compiled.colorBySpeed.maxSpeed);
                    const speedColor = lerpPreviewColor(PREVIEW_TMP_COLOR, compiled.colorBySpeed.lowSpeedColor, compiled.colorBySpeed.highSpeedColor, speedT);
                    lerpPreviewColor(PREVIEW_TMP_COLOR_B, PREVIEW_TMP_COLOR_B, speedColor, 0.65);
                }
                particle.color.copy(PREVIEW_TMP_COLOR_B);
                let nextSize = particle.baseSize;
                if (compiled.sizeOverLifetime.enabled) nextSize *= samplePreviewScalarParameter(compiled.sizeOverLifetime.parameter, lifeT, particle.seed.x);
                if (compiled.sizeBySpeed.enabled) {
                    const sizeT = remapPreviewValue(particle.speed, compiled.sizeBySpeed.minSpeed, compiled.sizeBySpeed.maxSpeed);
                    nextSize *= THREE.MathUtils.lerp(compiled.sizeBySpeed.scale[0], compiled.sizeBySpeed.scale[1], sizeT);
                }
                particle.size = nextSize;
                if (compiled.rotationOverLifetime.enabled) {
                    particle.rotation += samplePreviewScalarParameter(compiled.rotationOverLifetime.parameter, lifeT, particle.seed.x) * delta;
                }
                if (compiled.rotationBySpeed.enabled) {
                    const spinT = remapPreviewValue(particle.speed, compiled.rotationBySpeed.minSpeed, compiled.rotationBySpeed.maxSpeed);
                    particle.rotation += THREE.MathUtils.lerp(compiled.rotationBySpeed.spin[0], compiled.rotationBySpeed.spin[1], spinT) * delta;
                }
                particle.alpha = clampPreviewValue(samplePreviewScalarParameter(compiled.renderer.alphaOverLifeParam, lifeT, particle.seed.z), 0, 1);
                particle.uvTransform = this.sampleTextureSheet(particle);
                if (compiled.trails.enabled) {
                    particle.trailHistory.unshift(particle.position.clone());
                    while (particle.trailHistory.length > compiled.trails.length) particle.trailHistory.pop();
                }
            }

            updateRenderBuffers(cameraForward = PREVIEW_TMP_VEC3_C.set(0, 0, -1)) {
                const maxCount = this.compiled.maxParticles;
                const positionArray = this.renderState.positionAttr.array;
                const sizeArray = this.renderState.sizeAttr.array;
                const rotationArray = this.renderState.rotationAttr.array;
                const colorArray = this.renderState.colorAttr.array;
                const uvArray = this.renderState.uvAttr.array;
                const trailsEnabled = this.compiled.trails.enabled;
                const trailStartArray = this.trailState.startAttr.array;
                const trailEndArray = this.trailState.endAttr.array;
                const trailColorArray = this.trailState.colorAttr.array;
                const trailWidthArray = this.trailState.widthAttr.array;
                let trailSegmentCount = 0;

                for (let index = 0; index < maxCount; index++) {
                    const particle = this.particles[index];
                    const baseOffset = index * 3;
                    const colorOffset = index * 4;
                    if (!particle.alive) {
                        positionArray[baseOffset] = 0;
                        positionArray[baseOffset + 1] = -9999;
                        positionArray[baseOffset + 2] = 0;
                        sizeArray[index] = 0;
                        rotationArray[index] = 0;
                        colorArray[colorOffset] = 0;
                        colorArray[colorOffset + 1] = 0;
                        colorArray[colorOffset + 2] = 0;
                        colorArray[colorOffset + 3] = 0;
                        uvArray[colorOffset] = 1;
                        uvArray[colorOffset + 1] = 1;
                        uvArray[colorOffset + 2] = 0;
                        uvArray[colorOffset + 3] = 0;
                        continue;
                    }
                    positionArray[baseOffset] = particle.position.x;
                    positionArray[baseOffset + 1] = particle.position.y;
                    positionArray[baseOffset + 2] = particle.position.z;
                    sizeArray[index] = particle.size;
                    rotationArray[index] = particle.rotation;
                    colorArray[colorOffset] = particle.color.r;
                    colorArray[colorOffset + 1] = particle.color.g;
                    colorArray[colorOffset + 2] = particle.color.b;
                    colorArray[colorOffset + 3] = particle.alpha * this.alphaMultiplier;
                    uvArray[colorOffset] = particle.uvTransform[0];
                    uvArray[colorOffset + 1] = particle.uvTransform[1];
                    uvArray[colorOffset + 2] = particle.uvTransform[2];
                    uvArray[colorOffset + 3] = particle.uvTransform[3];

                    if (trailsEnabled && particle.trailHistory.length > 1) {
                        for (let segmentIndex = 0; segmentIndex < particle.trailHistory.length - 1; segmentIndex++) {
                            const start = particle.trailHistory[segmentIndex];
                            const end = particle.trailHistory[segmentIndex + 1];
                            if (!start || !end) continue;
                            const trailT = segmentIndex / Math.max(1, particle.trailHistory.length - 2);
                            const width = particle.baseSize * evaluatePreviewCurve(this.compiled.trails.widthOverTrail, trailT);
                            const alpha = particle.alpha * this.alphaMultiplier * evaluatePreviewCurve(this.compiled.trails.alphaOverTrail, trailT);
                            if (alpha <= 0.001 || width <= 0.0001) continue;
                            const trailOffset = trailSegmentCount * 3;
                            const trailColorOffset = trailSegmentCount * 4;
                            trailStartArray[trailOffset] = start.x;
                            trailStartArray[trailOffset + 1] = start.y;
                            trailStartArray[trailOffset + 2] = start.z;
                            trailEndArray[trailOffset] = end.x;
                            trailEndArray[trailOffset + 1] = end.y;
                            trailEndArray[trailOffset + 2] = end.z;
                            trailColorArray[trailColorOffset] = particle.color.r;
                            trailColorArray[trailColorOffset + 1] = particle.color.g;
                            trailColorArray[trailColorOffset + 2] = particle.color.b;
                            trailColorArray[trailColorOffset + 3] = alpha;
                            trailWidthArray[trailSegmentCount] = width;
                            trailSegmentCount++;
                            if (trailSegmentCount >= this.trailState.maxSegments) break;
                        }
                    }
                }

                this.renderState.positionAttr.needsUpdate = true;
                this.renderState.sizeAttr.needsUpdate = true;
                this.renderState.rotationAttr.needsUpdate = true;
                this.renderState.colorAttr.needsUpdate = true;
                this.renderState.uvAttr.needsUpdate = true;

                this.trailState.geometry.instanceCount = trailSegmentCount;
                if (trailSegmentCount > 0) {
                    this.trailState.startAttr.needsUpdate = true;
                    this.trailState.endAttr.needsUpdate = true;
                    this.trailState.colorAttr.needsUpdate = true;
                    this.trailState.widthAttr.needsUpdate = true;
                }
                this.trailState.material.uniforms.uCameraForward.value.copy(cameraForward);
                this.trailMesh.visible = trailsEnabled && trailSegmentCount > 0;
                this.renderMesh.visible = this.compiled.enabled && this.compiled.renderer.enabled;
            }

            step(delta, absoluteTime, cameraForward, options = {}) {
                this.prevAbsoluteTime = this.absoluteTime;
                this.absoluteTime = absoluteTime;
                this.alphaMultiplier = clampPreviewValue(isFiniteNumber(options.alphaMultiplier) ? options.alphaMultiplier : 1, 0, 1);
                this.updateEmitterVelocity(delta);
                this.drainExternalSpawns();
                const spawnCount = options.emitEnabled === false ? 0 : this.getScheduledSpawnCount(delta);
                for (let spawnIndex = 0; spawnIndex < spawnCount; spawnIndex++) this.spawnParticle();
                const localDelta = delta * this.compiled.main.simulationSpeed;
                this.particles.forEach((particle) => {
                    if (!particle.alive) return;
                    this.updateParticle(particle, localDelta);
                });
                this.updateRenderBuffers(cameraForward);
            }
        }

        class PreviewParticleRuntime {
            constructor({ canvas }) {
                this.canvas = canvas;
                this.renderer = null;
                this.scene = null;
                this.camera = null;
                this.clock = 0;
                this.accumulator = 0;
                this.layers = [];
                this.layerMap = new Map();
                this.currentPreset = null;
                this.currentSceneConfig = null;
                this.sourceTexture = null;
                this.captureLineup = null;
                this.captureLineupControllers = [];
                this.captureLineupCycle = 0;
                this.captureLineupTextures = [];
                this.captureLineupFocus = {
                    index: -1,
                    stackId: '',
                    stackName: '',
                    stackX: 0,
                    cameraX: 0,
                    segmentProgress: 0,
                    secondsPerStack: 0
                };
                this.fallbackTexture = null;
                this.previewGridMesh = null;
                this.captureFloorMesh = null;
                this.captureRenderer = null;
                this.captureCanvas = null;
                this.captureStageGroup = null;
                this.captureSnapshot = null;
                this.captureInProgress = false;
                this.mounted = false;
                this.isPlaying = true;
                this.timeScale = 1;
                this.baseTimeScale = 1;
                this.needsWarmup = false;
                this.cameraDistance = 6.8;
                this.cameraPitch = 24;
                this.cameraYaw = 32;
                this.draggingCamera = false;
                this.lastPointerX = 0;
                this.lastPointerY = 0;
                this.boundPointerDown = null;
                this.boundPointerMove = null;
                this.boundPointerUp = null;
                this.boundWheel = null;
            }

            getCaptureLineupFocus() {
                return this.captureLineupFocus ? { ...this.captureLineupFocus } : null;
            }

            mount() {
                if (this.mounted || !this.canvas) return;
                this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
                this.renderer.setPixelRatio(window.devicePixelRatio || 1);
                this.renderer.setSize(this.canvas.clientWidth || 1, this.canvas.clientHeight || 1, false);
                this.scene = new THREE.Scene();
                this.camera = new THREE.PerspectiveCamera(44, 1, 0.01, 100);

                this.previewGridMesh = this.createPreviewGridMesh();
                this.scene.add(this.previewGridMesh);

                this.captureStageGroup = new THREE.Group();
                this.captureStageGroup.visible = false;
                this.scene.add(this.captureStageGroup);

                const ambient = new THREE.AmbientLight(0xffffff, 1.15);
                const directional = new THREE.DirectionalLight(0xffffff, 1.25);
                directional.position.set(4, 6, 5);
                const fill = new THREE.HemisphereLight(0xaee3ff, 0x111827, 0.95);
                this.scene.add(ambient);
                this.scene.add(directional);
                this.scene.add(fill);
                this.bindCameraControls();
                this.mounted = true;
                this.applyCameraState();
            }

            createPreviewGridMesh() {
                const geometry = new THREE.PlaneGeometry(PREVIEW_GRID_SIZE, PREVIEW_GRID_SIZE, 1, 1);
                const material = new THREE.ShaderMaterial({
                    transparent: true,
                    depthWrite: false,
                    side: THREE.DoubleSide,
                    uniforms: {
                        uCenter: { value: new THREE.Vector2(0, 0) },
                        uInnerRadius: { value: 16 },
                        uOuterRadius: { value: 48 },
                        uMajorStep: { value: PREVIEW_GRID_MAJOR_STEP },
                        uMinorStep: { value: PREVIEW_GRID_MINOR_STEP },
                        uMajorColor: { value: new THREE.Color(0x2c5371) },
                        uMinorColor: { value: new THREE.Color(0x193148) }
                    },
                    vertexShader: `
                        varying vec3 vWorldPosition;
                        void main() {
                            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                            vWorldPosition = worldPosition.xyz;
                            gl_Position = projectionMatrix * viewMatrix * worldPosition;
                        }
                    `,
                    fragmentShader: `
                        precision highp float;
                        uniform vec2 uCenter;
                        uniform float uInnerRadius;
                        uniform float uOuterRadius;
                        uniform float uMajorStep;
                        uniform float uMinorStep;
                        uniform vec3 uMajorColor;
                        uniform vec3 uMinorColor;
                        varying vec3 vWorldPosition;

                        float gridLine(vec2 coord, float stepSize) {
                            vec2 scaled = coord / stepSize;
                            vec2 cell = abs(fract(scaled - 0.5) - 0.5) / max(fwidth(scaled), vec2(0.0001));
                            float line = min(cell.x, cell.y);
                            return 1.0 - clamp(line, 0.0, 1.0);
                        }

                        void main() {
                            vec2 coord = vWorldPosition.xz;
                            float minor = gridLine(coord, uMinorStep);
                            float major = gridLine(coord, uMajorStep);
                            float dist = distance(coord, uCenter);
                            float fade = 1.0 - smoothstep(uInnerRadius, uOuterRadius, dist);
                            float alpha = max(minor * 0.18, major * 0.55) * fade;
                            if (alpha <= 0.001) discard;
                            vec3 color = mix(uMinorColor, uMajorColor, clamp(major, 0.0, 1.0));
                            gl_FragColor = vec4(color, alpha);
                        }
                    `
                });
                const mesh = new THREE.Mesh(geometry, material);
                mesh.rotation.x = -Math.PI * 0.5;
                mesh.position.y = PREVIEW_GRID_Y;
                mesh.renderOrder = -10;
                return mesh;
            }

            updatePreviewGrid() {
                if (!this.previewGridMesh || !this.camera) return;
                const fadeDistance = clampPreviewValue(this.cameraDistance || this.currentSceneConfig?.cameraDistance || 6.8, 2.5, 40);
                const centerX = this.camera.position.x;
                const centerZ = this.camera.position.z;
                this.previewGridMesh.position.set(centerX, PREVIEW_GRID_Y, centerZ);
                this.previewGridMesh.material.uniforms.uCenter.value.set(centerX, centerZ);
                this.previewGridMesh.material.uniforms.uInnerRadius.value = Math.max(8, fadeDistance * PREVIEW_GRID_FADE_INNER_MULTIPLIER);
                this.previewGridMesh.material.uniforms.uOuterRadius.value = Math.max(18, fadeDistance * PREVIEW_GRID_FADE_OUTER_MULTIPLIER);
            }

            updateGroundMode() {
                const inCaptureMode = !!this.captureLineup?.config || this.captureInProgress;
                if (this.previewGridMesh) {
                    this.previewGridMesh.visible = !inCaptureMode && this.currentSceneConfig?.grid !== false;
                }
                if (this.captureFloorMesh) {
                    this.captureFloorMesh.visible = !!this.captureStageGroup?.visible;
                }
            }

            bindCameraControls() {
                if (!this.canvas || this.boundPointerDown) return;
                this.boundPointerDown = (event) => {
                    if (event.button !== 0) return;
                    if (this.captureLineup?.config) return;
                    this.draggingCamera = true;
                    this.lastPointerX = event.clientX;
                    this.lastPointerY = event.clientY;
                    if (this.canvas.setPointerCapture) {
                        try { this.canvas.setPointerCapture(event.pointerId); } catch (_) {}
                    }
                    event.preventDefault();
                };
                this.boundPointerMove = (event) => {
                    if (!this.draggingCamera) return;
                    const deltaX = event.clientX - this.lastPointerX;
                    const deltaY = event.clientY - this.lastPointerY;
                    this.lastPointerX = event.clientX;
                    this.lastPointerY = event.clientY;
                    const invertMouseX = this.currentSceneConfig?.invertMouseX !== false;
                    const invertMouseY = this.currentSceneConfig?.invertMouseY !== false;
                    this.setCameraYaw(this.cameraYaw + deltaX * 0.28 * (invertMouseX ? -1 : 1));
                    this.setCameraPitch(this.cameraPitch + deltaY * 0.22 * (invertMouseY ? 1 : -1));
                    event.preventDefault();
                };
                this.boundPointerUp = (event) => {
                    this.draggingCamera = false;
                    if (this.canvas.releasePointerCapture) {
                        try { this.canvas.releasePointerCapture(event.pointerId); } catch (_) {}
                    }
                    event.preventDefault();
                };
                this.boundWheel = (event) => {
                    const zoomDelta = clampPreviewValue(event.deltaY * 0.01, -2.5, 2.5);
                    this.cameraDistance = clampPreviewValue(this.cameraDistance + zoomDelta, 2.5, 40);
                    if (this.captureLineup?.config) {
                        this.applyCaptureLineupCamera(this.captureLineup.config, this.clock, this.captureLineup.config.durationSeconds);
                    } else {
                        this.applyCameraState();
                    }
                    this.renderScene(this.renderer, this.camera);
                    event.preventDefault();
                };
                this.canvas.addEventListener('pointerdown', this.boundPointerDown);
                this.canvas.addEventListener('pointermove', this.boundPointerMove);
                this.canvas.addEventListener('pointerup', this.boundPointerUp);
                this.canvas.addEventListener('pointercancel', this.boundPointerUp);
                this.canvas.addEventListener('wheel', this.boundWheel, { passive: false });
                this.updateCanvasInteractionMode();
            }

            unbindCameraControls() {
                if (!this.canvas || !this.boundPointerDown) return;
                this.canvas.removeEventListener('pointerdown', this.boundPointerDown);
                this.canvas.removeEventListener('pointermove', this.boundPointerMove);
                this.canvas.removeEventListener('pointerup', this.boundPointerUp);
                this.canvas.removeEventListener('pointercancel', this.boundPointerUp);
                this.canvas.removeEventListener('wheel', this.boundWheel);
                this.boundPointerDown = null;
                this.boundPointerMove = null;
                this.boundPointerUp = null;
                this.boundWheel = null;
                this.draggingCamera = false;
                this.canvas.style.cursor = '';
            }

            updateCanvasInteractionMode() {
                if (!this.canvas) return;
                this.canvas.style.cursor = this.captureLineup?.config ? 'default' : 'grab';
            }

            createFallbackSourceTexture() {
                if (this.fallbackTexture) return this.fallbackTexture;
                const canvas = document.createElement('canvas');
                canvas.width = 64;
                canvas.height = 64;
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = `rgba(255,255,255,${PREVIEW_FALLBACK_ALPHA})`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                this.fallbackTexture = new THREE.CanvasTexture(canvas);
                this.fallbackTexture.needsUpdate = true;
                this.fallbackTexture.minFilter = THREE.LinearFilter;
                this.fallbackTexture.magFilter = THREE.LinearFilter;
                return this.fallbackTexture;
            }

            createSourceTexture(imageLike) {
                if (!imageLike) return null;
                const texture = new THREE.Texture(imageLike);
                texture.needsUpdate = true;
                texture.minFilter = THREE.LinearFilter;
                texture.magFilter = THREE.LinearFilter;
                return texture;
            }

            disposeCaptureLineupTextures() {
                this.captureLineupTextures.forEach((texture) => texture?.dispose?.());
                this.captureLineupTextures = [];
            }

            setSourceImage(imageLike) {
                if (this.sourceTexture) this.sourceTexture.dispose();
                this.sourceTexture = this.createSourceTexture(imageLike);
                this.layers.forEach((layer) => layer.setSourceTexture(this.sourceTexture));
            }

            createSimulationSnapshot() {
                return {
                    clock: this.clock,
                    accumulator: this.accumulator,
                    lastTickTime: this.lastTickTime || null,
                    needsWarmup: this.needsWarmup === true,
                    isPlaying: this.isPlaying === true,
                    timeScale: this.timeScale,
                    baseTimeScale: this.baseTimeScale,
                    cameraDistance: this.cameraDistance,
                    cameraPitch: this.cameraPitch,
                    cameraYaw: this.cameraYaw,
                    sceneMode: this.captureLineup ? 'capture_lineup' : 'preview',
                    gridVisible: this.previewGridMesh ? this.previewGridMesh.visible : false,
                    stageVisible: this.captureStageGroup ? this.captureStageGroup.visible : false,
                    captureLineupCycle: this.captureLineupCycle,
                    captureLineupControllers: this.captureLineupControllers.map((controller) => ({
                        layerId: controller.layer?.compiled?.id || '',
                        started: controller.started === true,
                        localTime: controller.localTime || 0,
                        revealAt: controller.revealAt || 0,
                        holdSeconds: controller.holdSeconds || 0,
                        fadeSeconds: controller.fadeSeconds || 0
                    })),
                    layers: this.layers.map((layer) => ({
                        id: layer.compiled.id,
                        snapshot: layer.createSimulationSnapshot()
                    }))
                };
            }

            restoreSimulationSnapshot(snapshot) {
                if (!snapshot) return;
                this.clock = snapshot.clock || 0;
                this.accumulator = snapshot.accumulator || 0;
                this.lastTickTime = snapshot.lastTickTime || null;
                this.needsWarmup = snapshot.needsWarmup === true;
                this.isPlaying = snapshot.isPlaying !== false;
                this.timeScale = isFiniteNumber(snapshot.timeScale) ? snapshot.timeScale : this.timeScale;
                this.baseTimeScale = isFiniteNumber(snapshot.baseTimeScale) ? snapshot.baseTimeScale : this.baseTimeScale;
                this.cameraDistance = isFiniteNumber(snapshot.cameraDistance) ? snapshot.cameraDistance : this.cameraDistance;
                this.cameraPitch = isFiniteNumber(snapshot.cameraPitch) ? snapshot.cameraPitch : this.cameraPitch;
                this.cameraYaw = isFiniteNumber(snapshot.cameraYaw) ? snapshot.cameraYaw : this.cameraYaw;
                if (this.previewGridMesh) this.previewGridMesh.visible = snapshot.gridVisible !== false;
                if (this.captureStageGroup) this.captureStageGroup.visible = snapshot.stageVisible === true;
                this.captureLineupCycle = Math.max(0, Math.round(snapshot.captureLineupCycle || 0));
                const controllerState = new Map((snapshot.captureLineupControllers || []).map((entry) => [entry.layerId, entry]));
                this.captureLineupControllers.forEach((controller) => {
                    const entry = controllerState.get(controller.layer?.compiled?.id);
                    controller.started = entry?.started === true;
                    controller.localTime = entry?.localTime || 0;
                    controller.revealAt = isFiniteNumber(entry?.revealAt) ? entry.revealAt : controller.revealAt;
                    controller.holdSeconds = isFiniteNumber(entry?.holdSeconds) ? entry.holdSeconds : controller.holdSeconds;
                    controller.fadeSeconds = isFiniteNumber(entry?.fadeSeconds) ? entry.fadeSeconds : controller.fadeSeconds;
                });
                const byId = new Map((snapshot.layers || []).map((entry) => [entry.id, entry.snapshot]));
                this.layers.forEach((layer) => layer.restoreSimulationSnapshot(byId.get(layer.compiled.id)));
                this.captureLineupFocus = this.computeCaptureLineupFocusState(this.captureLineup?.config || {}, this.clock, this.captureLineup?.config?.durationSeconds || 0);
                this.applyCameraState();
                this.updateGroundMode();
            }

            setPreset(preset) {
                this.captureLineup = null;
                this.captureLineupControllers = [];
                this.captureLineupCycle = 0;
                this.captureLineupFocus = {
                    index: -1,
                    stackId: '',
                    stackName: '',
                    stackX: 0,
                    cameraX: 0,
                    segmentProgress: 0,
                    secondsPerStack: 0
                };
                this.disposeCaptureLineupTextures();
                this.currentPreset = sanitizePreviewPreset(preset);
                this.currentSceneConfig = this.currentPreset.scene;
                this.baseTimeScale = this.currentSceneConfig.timeScale;
                this.clearLayers();
                this.scene.background = new THREE.Color(this.currentSceneConfig.background);
                this.cameraDistance = this.currentSceneConfig.cameraDistance;
                this.cameraPitch = this.currentSceneConfig.cameraPitch;
                this.cameraYaw = this.currentSceneConfig.cameraYaw;
                this.camera.fov = this.currentSceneConfig.cameraFov;
                this.camera.updateProjectionMatrix();
                this.applyCameraState();
                this.updateCanvasInteractionMode();
                this.updateGroundMode();
                this.layers = this.currentPreset.layers.map((layer) => new PreviewParticleLayer(this, layer, this.currentSceneConfig));
                this.layerMap = new Map(this.layers.map((layer) => [layer.compiled.id, layer]));
                this.layers.forEach((layer) => {
                    layer.setSourceTexture(this.sourceTexture);
                    this.scene.add(layer.renderMesh);
                    this.scene.add(layer.trailMesh);
                });
                this.needsWarmup = true;
            }

            createCaptureLineupLayer(sourceLayer, stackX, stackId, layerIndex) {
                const layer = clonePreviewPreset({ layers: [sourceLayer] }).layers[0];
                layer.id = `${stackId}-${layerIndex}-${Math.random().toString(36).slice(2, 7)}`;
                const rootPosition = normalizePreviewArray(layer.shape?.position, 3, [0, 0, 0]);
                const shapePosition = normalizePreviewArray(layer.modules?.shape?.settings?.position, 3, rootPosition);
                const nextPosition = [shapePosition[0] + stackX, shapePosition[1], shapePosition[2]];
                layer.shape = { ...(layer.shape || {}), position: nextPosition };
                layer.modules = {
                    ...(layer.modules || {}),
                    shape: {
                        ...(layer.modules?.shape || {}),
                        settings: {
                            ...(layer.modules?.shape?.settings || {}),
                            position: nextPosition
                        }
                    }
                };
                return layer;
            }

            buildCaptureLineupSchedule(config, entryCount) {
                const count = Math.max(1, entryCount || 1);
                const secondsPerStack = Math.max(0.25, config.secondsPerStack || 2);
                if (count === 1) {
                    return [{
                        revealAt: 0,
                        holdSeconds: Math.min(config.holdSeconds, secondsPerStack),
                        fadeSeconds: Math.min(config.fadeSeconds, Math.max(0, secondsPerStack - Math.min(config.holdSeconds, secondsPerStack)))
                    }];
                }
                return Array.from({ length: count }, (_, index) => {
                    const revealAt = config.sequentialReveal ? index * secondsPerStack : 0;
                    const holdSeconds = Math.min(config.holdSeconds, secondsPerStack);
                    const fadeSeconds = Math.min(config.fadeSeconds, Math.max(0, secondsPerStack - holdSeconds));
                    return {
                        revealAt,
                        holdSeconds,
                        fadeSeconds
                    };
                });
            }

            setCaptureLineupScene(preset, entries = [], captureConfig = {}) {
                if (!this.renderer || !this.scene || !this.camera) {
                    throw new Error('Preview runtime is not ready for capture lineup.');
                }
                const sanitizedPreset = sanitizePreviewPreset(preset);
                const safeEntries = Array.isArray(entries) ? entries.filter((entry) => entry && typeof entry === 'object') : [];
                const setName = String(captureConfig?.setName || 'Texture Set');
                const normalizedConfig = {
                    ...normalizeCaptureLineupConfig(captureConfig, setName, sanitizedPreset.name),
                    durationSeconds: resolveCaptureLineupDurationSeconds(captureConfig, safeEntries.length)
                };
                const centerOffset = Math.max(0, safeEntries.length - 1) * 0.5;
                const schedule = this.buildCaptureLineupSchedule(normalizedConfig, safeEntries.length);

                this.currentPreset = sanitizedPreset;
                this.currentSceneConfig = sanitizedPreset.scene;
                this.baseTimeScale = this.currentSceneConfig.timeScale;
                this.captureLineup = {
                    config: normalizedConfig,
                    entries: safeEntries.map((entry, index) => ({
                        id: String(entry.id || `stack-${index + 1}`),
                        name: String(entry.name || `Stack ${index + 1}`),
                        stackX: (index - centerOffset) * normalizedConfig.stackSpacing,
                        revealAt: schedule[index]?.revealAt || 0
                    }))
                };
                this.captureLineupControllers = [];
                this.captureLineupCycle = 0;
                this.captureLineupFocus = {
                    index: safeEntries.length ? 0 : -1,
                    stackId: safeEntries[0]?.id || '',
                    stackName: safeEntries[0]?.name || '',
                    stackX: safeEntries.length ? (0 - centerOffset) * normalizedConfig.stackSpacing : 0,
                    cameraX: safeEntries.length ? (0 - centerOffset) * normalizedConfig.stackSpacing : 0,
                    segmentProgress: 0,
                    secondsPerStack: normalizedConfig.secondsPerStack
                };
                this.disposeCaptureLineupTextures();
                this.clearLayers();
                this.scene.background = new THREE.Color(this.currentSceneConfig.background);
                this.camera.fov = this.currentSceneConfig.cameraFov;
                this.camera.updateProjectionMatrix();
                this.cameraDistance = this.currentSceneConfig.cameraDistance;
                this.cameraPitch = this.currentSceneConfig.cameraPitch;
                this.cameraYaw = this.currentSceneConfig.cameraYaw;
                const stageCount = Math.max(3, Math.ceil((Math.max(normalizedConfig.travelDistance, normalizedConfig.stackSpacing * Math.max(1, safeEntries.length)) / Math.max(1, normalizedConfig.stageSpacing))) + 4);
                this.buildCaptureStage({ ...normalizedConfig, stageCount, stageLength: normalizedConfig.travelDistance });
                this.updateGroundMode();
                this.captureLineup.entries.forEach((entry, entryIndex) => {
                    const texture = this.createSourceTexture(safeEntries[entryIndex]?.image);
                    if (texture) this.captureLineupTextures.push(texture);
                    sanitizedPreset.layers.forEach((sourceLayer, layerIndex) => {
                        const nextLayer = this.createCaptureLineupLayer(sourceLayer, entry.stackX, entry.id, layerIndex);
                        const runtimeLayer = new PreviewParticleLayer(this, nextLayer, this.currentSceneConfig);
                        runtimeLayer.setSourceTexture(texture || null);
                        this.layers.push(runtimeLayer);
                        this.scene.add(runtimeLayer.renderMesh);
                        this.scene.add(runtimeLayer.trailMesh);
                        this.captureLineupControllers.push({
                            layer: runtimeLayer,
                            stackId: entry.id,
                            stackName: entry.name,
                            stackX: entry.stackX,
                            started: false,
                            localTime: 0,
                            revealAt: schedule[entryIndex]?.revealAt || 0,
                            holdSeconds: schedule[entryIndex]?.holdSeconds || normalizedConfig.holdSeconds,
                            fadeSeconds: schedule[entryIndex]?.fadeSeconds || normalizedConfig.fadeSeconds
                        });
                    });
                });
                this.layerMap = new Map(this.layers.map((layer) => [layer.compiled.id, layer]));
                this.clock = 0;
                this.accumulator = 0;
                this.lastTickTime = null;
                this.needsWarmup = false;
                this.updateCanvasInteractionMode();
                this.updateGroundMode();
                this.applyCaptureLineupCamera(normalizedConfig, 0, normalizedConfig.durationSeconds);
                this.renderScene(this.renderer, this.camera);
            }

            queueLayerSpawn(layerId, event) {
                const layer = this.layerMap.get(layerId);
                if (!layer) return;
                layer.queueExternalSpawn(event);
            }

            clearLayers() {
                this.layers.forEach((layer) => {
                    this.scene?.remove(layer.renderMesh);
                    this.scene?.remove(layer.trailMesh);
                    layer.dispose();
                });
                this.layers = [];
                this.layerMap.clear();
            }

            setPlaying(isPlaying) {
                this.isPlaying = !!isPlaying;
            }

            setTimeScale(value) {
                const numeric = Number(value);
                const snapped = Number.isFinite(numeric) ? Math.round(numeric * 10) / 10 : 1;
                this.timeScale = clampPreviewValue(snapped, 0, 2);
            }

            setCameraPitch(value) {
                const nextPitch = clampPreviewValue(Number(value) || 0, 0, 89);
                if (nextPitch === this.cameraPitch) return;
                this.cameraPitch = nextPitch;
                this.applyCameraState();
            }

            setCameraYaw(value) {
                this.cameraYaw = Number.isFinite(value) ? value : this.cameraYaw;
                this.applyCameraState();
            }

            resetSimulation() {
                this.clock = 0;
                this.accumulator = 0;
                this.lastTickTime = null;
                this.layers.forEach((layer) => layer.reset());
                this.captureLineupControllers.forEach((controller) => {
                    controller.started = false;
                    controller.localTime = 0;
                });
                this.captureLineupCycle = 0;
                this.captureLineupFocus = this.computeCaptureLineupFocusState(this.captureLineup?.config || {}, 0, this.captureLineup?.config?.durationSeconds || 0);
                this.needsWarmup = true;
            }

            setCameraFromPositionAndTarget(position, target) {
                if (!this.camera) return;
                this.camera.position.copy(position);
                this.camera.lookAt(target);
            }

            resize(width, height, dpr = window.devicePixelRatio || 1) {
                if (!this.renderer || !this.camera) return;
                const safeWidth = Math.max(1, Math.floor(width || this.canvas.clientWidth || 1));
                const safeHeight = Math.max(1, Math.floor(height || this.canvas.clientHeight || 1));
                this.renderer.setPixelRatio(dpr);
                this.renderer.setSize(safeWidth, safeHeight, false);
                this.camera.aspect = safeWidth / safeHeight;
                this.camera.updateProjectionMatrix();
            }

            warmup() {
                const steps = Math.max(1, Math.round(PREVIEW_WARMUP_SECONDS / PREVIEW_FIXED_TIMESTEP));
                for (let index = 0; index < steps; index++) {
                    this.clock += PREVIEW_FIXED_TIMESTEP;
                    this.stepSimulation(PREVIEW_FIXED_TIMESTEP, this.clock);
                }
                this.needsWarmup = false;
            }

            warmupForSeconds(seconds) {
                const safeSeconds = Math.max(0, Number(seconds) || 0);
                if (safeSeconds <= 0) {
                    this.needsWarmup = false;
                    return;
                }
                const steps = Math.max(1, Math.round(safeSeconds / PREVIEW_FIXED_TIMESTEP));
                for (let index = 0; index < steps; index++) {
                    this.clock += PREVIEW_FIXED_TIMESTEP;
                    this.stepSimulation(PREVIEW_FIXED_TIMESTEP, this.clock);
                }
                this.needsWarmup = false;
            }

            stepSimulation(delta, absoluteTime) {
                const cameraMatrix = this.camera.matrixWorld;
                const forward = new THREE.Vector3().setFromMatrixColumn(cameraMatrix, 2).negate();
                if (this.captureLineup?.config) {
                    this.stepCaptureLineup(delta, absoluteTime, forward);
                    return;
                }
                this.layers.forEach((layer) => layer.step(delta, absoluteTime, forward));
            }

            tick(nowMs) {
                if (!this.renderer || !this.scene || !this.camera) return;
                if (this.captureInProgress) return;
                const nextTime = nowMs * 0.001;
                if (!this.lastTickTime) this.lastTickTime = nextTime;
                const dt = Math.min(0.25, Math.max(0, nextTime - this.lastTickTime));
                this.lastTickTime = nextTime;
                if (this.needsWarmup) this.warmup();
                if (this.isPlaying) {
                    this.accumulator += dt * this.timeScale * this.baseTimeScale;
                    let steps = 0;
                    while (this.accumulator >= PREVIEW_FIXED_TIMESTEP && steps < PREVIEW_MAX_CATCHUP_STEPS) {
                        this.clock += PREVIEW_FIXED_TIMESTEP;
                        this.stepSimulation(PREVIEW_FIXED_TIMESTEP, this.clock);
                        this.accumulator -= PREVIEW_FIXED_TIMESTEP;
                        steps++;
                    }
                }
                this.renderScene(this.renderer, this.camera);
            }

            renderScene(renderer = this.renderer, camera = this.camera) {
                if (!renderer || !camera) return;
                camera.updateMatrixWorld();
                const cameraMatrix = camera.matrixWorld;
                const right = new THREE.Vector3().setFromMatrixColumn(cameraMatrix, 0);
                const up = new THREE.Vector3().setFromMatrixColumn(cameraMatrix, 1);
                const forward = new THREE.Vector3().setFromMatrixColumn(cameraMatrix, 2).negate();
                this.layers.forEach((layer) => {
                    layer.renderState.material.uniforms.uCameraRight.value.copy(right);
                    layer.renderState.material.uniforms.uCameraUp.value.copy(up);
                    layer.trailState.material.uniforms.uCameraForward.value.copy(forward);
                    layer.renderMesh.visible = layer.compiled.enabled && layer.compiled.renderer.enabled;
                });
                renderer.render(this.scene, camera);
            }

            ensureCaptureRenderer(width, height) {
                this.captureCanvas = this.canvas;
                this.captureRenderer = this.renderer;
                this.captureRenderer.setPixelRatio(1);
                this.captureRenderer.setSize(width, height, false);
                this.camera.aspect = width / Math.max(1, height);
                this.camera.updateProjectionMatrix();
                return this.captureRenderer;
            }

            clearCaptureStage() {
                if (!this.captureStageGroup) return;
                while (this.captureStageGroup.children.length > 0) {
                    const child = this.captureStageGroup.children[0];
                    this.captureStageGroup.remove(child);
                    if (child?.geometry?.dispose) child.geometry.dispose();
                    if (Array.isArray(child?.material)) child.material.forEach((entry) => entry?.dispose?.());
                    else child?.material?.dispose?.();
                }
                this.captureFloorMesh = null;
            }

            computeCaptureLineupFocusState(config, elapsedSeconds, totalDuration) {
                const entries = this.captureLineup?.entries || [];
                const secondsPerStack = Math.max(0.25, config?.secondsPerStack || 2);
                const spacing = Math.max(1, config?.stackSpacing || 5);
                if (!entries.length) {
                    return {
                        index: -1,
                        stackId: '',
                        stackName: '',
                        stackX: 0,
                        cameraX: 0,
                        segmentProgress: 0,
                        secondsPerStack
                    };
                }
                const safeDuration = Math.max(0.001, totalDuration || resolveCaptureLineupDurationSeconds(config, entries.length));
                const clampedElapsed = clampPreviewValue(elapsedSeconds, 0, safeDuration);
                const maxIndex = entries.length - 1;
                const firstEntry = entries[0];
                const lastEntry = entries[maxIndex];
                const halfSpacing = spacing * 0.5;
                const cameraX = entries.length === 1
                    ? firstEntry.stackX
                    : THREE.MathUtils.lerp(firstEntry.stackX - halfSpacing, lastEntry.stackX + halfSpacing, clampedElapsed / safeDuration);
                let focusIndex = 0;
                let smallestDistance = Number.POSITIVE_INFINITY;
                entries.forEach((entry, index) => {
                    const distance = Math.abs(cameraX - entry.stackX);
                    if (distance < smallestDistance) {
                        smallestDistance = distance;
                        focusIndex = index;
                    }
                });
                const focusEntry = entries[focusIndex] || firstEntry;
                const segmentStart = focusIndex * secondsPerStack;
                const segmentElapsed = clampPreviewValue(clampedElapsed - segmentStart, 0, secondsPerStack);
                const segmentProgress = clampPreviewValue(segmentElapsed / secondsPerStack, 0, 1);
                return {
                    index: focusIndex,
                    stackId: focusEntry.id,
                    stackName: focusEntry.name,
                    stackX: focusEntry.stackX,
                    cameraX,
                    segmentProgress,
                    secondsPerStack
                };
            }

            buildCaptureStage(config) {
                if (!this.captureStageGroup) return;
                this.clearCaptureStage();
                this.captureStageGroup.visible = config.stageMode !== 'none';
                this.captureFloorMesh = null;
                if (config.stageMode === 'none') return;
                const floorGeometry = new THREE.PlaneGeometry(Math.max(24, (config.stageLength || config.travelDistance || 60) + 20), Math.max(24, config.stageSpacing * Math.max(4, config.stageCount || 8)));
                const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x0b1020, metalness: 0.02, roughness: 0.95, transparent: true, opacity: 0.55 });
                this.captureFloorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
                this.captureFloorMesh.rotation.x = -Math.PI * 0.5;
                this.captureFloorMesh.position.set(0, PREVIEW_GRID_Y, 0);
                this.captureFloorMesh.renderOrder = -10;
                this.captureStageGroup.add(this.captureFloorMesh);
                const spacing = Math.max(1, config.stageSpacing);
                const count = Math.max(3, config.stageCount);
                const halfCount = Math.floor(count * 0.5);
                if (config.stageMode === 'cube_lane_5u' || config.stageMode === 'distance_ticks_5u') {
                    const material = new THREE.MeshStandardMaterial({ color: config.stageMode === 'cube_lane_5u' ? 0x60a5fa : 0x22d3ee, metalness: 0.05, roughness: 0.8, transparent: true, opacity: 0.7 });
                    const cubeSize = spacing;
                    const tickWidth = Math.max(0.18, spacing * 0.036);
                    const tickHeight = Math.max(1.4, spacing * 0.28);
                    const geometry = new THREE.BoxGeometry(
                        config.stageMode === 'cube_lane_5u' ? cubeSize : tickWidth,
                        config.stageMode === 'cube_lane_5u' ? cubeSize : tickHeight,
                        config.stageMode === 'cube_lane_5u' ? cubeSize : tickWidth
                    );
                    for (let index = -halfCount; index <= halfCount; index++) {
                        const marker = new THREE.Mesh(geometry.clone(), material.clone());
                        marker.position.set(
                            index * spacing,
                            config.stageMode === 'cube_lane_5u' ? (-(cubeSize * 0.5) - 0.35) : -0.35,
                            0
                        );
                        this.captureStageGroup.add(marker);
                    }
                } else if (config.stageMode === 'bounds_box') {
                    const box = new THREE.BoxGeometry(4, 4, 4);
                    const wire = new THREE.WireframeGeometry(box);
                    const lines = new THREE.LineSegments(wire, new THREE.LineBasicMaterial({ color: 0xf8fafc, transparent: true, opacity: 0.55 }));
                    lines.position.set(0, 0.8, 0);
                    this.captureStageGroup.add(lines);
                }
            }

            applyCaptureLineupCamera(config, elapsedSeconds, totalDuration) {
                const safeDuration = Math.max(0.001, totalDuration || config.durationSeconds || 1);
                if (config.cameraMode === 'stage_scroll_x') {
                    const focusState = this.computeCaptureLineupFocusState(config, elapsedSeconds, safeDuration);
                    this.captureLineupFocus = focusState;
                    const targetX = focusState.cameraX + (config.targetOffset?.[0] ?? 0);
                    const targetY = config.targetOffset?.[1] ?? 0.7;
                    const targetZ = config.targetOffset?.[2] ?? 0;
                    const cameraDistance = clampPreviewValue(this.cameraDistance || this.currentSceneConfig?.cameraDistance || 6.8, 2.5, 40);
                    const cameraHeight = Math.max(1.65, targetY + 1.35);
                    const position = new THREE.Vector3(focusState.cameraX, cameraHeight, cameraDistance);
                    const target = new THREE.Vector3(targetX, targetY, targetZ);
                    this.setCameraFromPositionAndTarget(position, target);
                    return;
                }
                const nextConfig = {
                    ...config,
                    stageScrollTravel: Math.max(1, config.travelDistance || config.stageScrollTravel || 1)
                };
                this.captureLineupFocus = this.computeCaptureLineupFocusState(nextConfig, elapsedSeconds, safeDuration);
                this.applyCaptureCamera(nextConfig, elapsedSeconds, safeDuration, this.captureSnapshot);
            }

            stepCaptureLineup(delta, absoluteTime, cameraForward) {
                const lineup = this.captureLineup;
                if (!lineup?.config) return;
                const duration = Math.max(0.001, resolveCaptureLineupDurationSeconds(lineup.config, lineup.entries?.length || 1));
                const loop = this.currentSceneConfig?.loop !== false;
                const activityMode = PREVIEW_CAPTURE_ACTIVITY_MODES.includes(lineup.config.activityMode) ? lineup.config.activityMode : 'all_together';
                const cycle = loop ? Math.floor(Math.max(0, absoluteTime) / duration) : 0;
                const localTime = loop ? ((absoluteTime % duration) + duration) % duration : clampPreviewValue(absoluteTime, 0, duration);
                if (cycle !== this.captureLineupCycle) {
                    this.captureLineupCycle = cycle;
                    this.captureLineupControllers.forEach((controller) => {
                        controller.started = false;
                        controller.localTime = 0;
                        controller.layer.reset();
                    });
                }
                this.applyCaptureLineupCamera(lineup.config, localTime, duration);
                this.captureLineupControllers.forEach((controller) => {
                    const isFocused = controller.stackId === this.captureLineupFocus?.stackId;
                    if (activityMode === 'all_together' || activityMode === 'hybrid_fade') {
                        if (!controller.started) {
                            controller.started = true;
                            controller.localTime = 0;
                            controller.layer.reset();
                        }
                        controller.localTime = localTime;
                        controller.layer.step(delta, controller.localTime, cameraForward, {
                            emitEnabled: true,
                            alphaMultiplier: activityMode === 'hybrid_fade' ? (isFocused ? 1 : 0.32) : 1
                        });
                        return;
                    }
                    if (localTime + 1e-6 < controller.revealAt) return;
                    if (!controller.started) {
                        controller.started = true;
                        controller.localTime = 0;
                        controller.layer.reset();
                    }
                    controller.localTime += delta;
                    const emitEnabled = controller.localTime <= controller.holdSeconds;
                    const fadeT = controller.fadeSeconds > 0
                        ? clampPreviewValue((controller.localTime - controller.holdSeconds) / controller.fadeSeconds, 0, 1)
                        : (emitEnabled ? 0 : 1);
                    controller.layer.step(delta, controller.localTime, cameraForward, {
                        emitEnabled: emitEnabled && isFocused,
                        alphaMultiplier: isFocused ? (emitEnabled ? 1 : (1 - fadeT)) : 0.12
                    });
                });
            }

            applyCaptureCamera(config, elapsedSeconds, totalDuration, snapshot) {
                const safeDuration = Math.max(0.001, totalDuration || config.durationSeconds || 1);
                const progress = clampPreviewValue(elapsedSeconds / safeDuration, 0, 1);
                const target = new THREE.Vector3(...normalizePreviewArray(config.targetOffset, 3, [0, 0.6, 0]));
                if (config.cameraMode === 'hold_current' && snapshot) {
                    this.cameraDistance = snapshot.cameraDistance;
                    this.cameraPitch = snapshot.cameraPitch;
                    this.cameraYaw = snapshot.cameraYaw;
                    this.applyCameraState();
                    return;
                }
                if (config.cameraMode === 'hold_preset') {
                    this.cameraDistance = this.currentSceneConfig.cameraDistance;
                    this.cameraPitch = this.currentSceneConfig.cameraPitch;
                    this.cameraYaw = this.currentSceneConfig.cameraYaw;
                    this.applyCameraState();
                    return;
                }
                if (config.cameraMode === 'orbit_yaw' || config.cameraMode === 'orbit_drift') {
                    const angle = progress * Math.PI * 2 * config.orbitSpeed * safeDuration;
                    const pitch = config.cameraMode === 'orbit_drift'
                        ? config.orbitPitch + Math.sin(progress * Math.PI * 2) * config.orbitDriftAmount
                        : config.orbitPitch;
                    const pitchRad = THREE.MathUtils.degToRad(pitch);
                    const position = new THREE.Vector3(
                        Math.sin(angle) * Math.cos(pitchRad) * config.orbitRadius,
                        Math.sin(pitchRad) * config.orbitRadius + 0.2,
                        Math.cos(angle) * Math.cos(pitchRad) * config.orbitRadius
                    );
                    this.setCameraFromPositionAndTarget(position, target);
                    return;
                }
                if (config.cameraMode === 'dolly_x' || config.cameraMode === 'stage_scroll_x') {
                    const travel = config.cameraMode === 'stage_scroll_x' ? config.stageScrollTravel : config.dollyDistance;
                    const x = THREE.MathUtils.lerp(-travel * 0.5, travel * 0.5, progress);
                    const z = clampPreviewValue(this.cameraDistance || this.currentSceneConfig.cameraDistance || 6.8, 2.5, 40);
                    const position = new THREE.Vector3(x, 2.8, z);
                    const travelTarget = config.cameraMode === 'stage_scroll_x'
                        ? new THREE.Vector3(
                            x + (config.targetOffset?.[0] ?? 0),
                            config.targetOffset?.[1] ?? target.y,
                            config.targetOffset?.[2] ?? target.z
                        )
                        : target;
                    this.setCameraFromPositionAndTarget(position, travelTarget);
                    return;
                }
                if (config.cameraMode === 'dolly_z') {
                    const z = THREE.MathUtils.lerp(this.currentSceneConfig.cameraDistance + config.dollyDistance * 0.5, Math.max(2.5, this.currentSceneConfig.cameraDistance - config.dollyDistance * 0.5), progress);
                    this.setCameraFromPositionAndTarget(new THREE.Vector3(0, 2.4, z), target);
                    return;
                }
                if (config.cameraMode === 'pedestal_y') {
                    const y = THREE.MathUtils.lerp(1.4, 1.4 + config.pedestalHeight, progress);
                    this.setCameraFromPositionAndTarget(new THREE.Vector3(0, y, this.currentSceneConfig.cameraDistance), target);
                    return;
                }
                if (config.cameraMode === 'figure8') {
                    const angle = progress * Math.PI * 2;
                    const x = Math.sin(angle) * config.orbitRadius;
                    const z = Math.sin(angle * 2) * config.orbitRadius * 0.45 + this.currentSceneConfig.cameraDistance;
                    const y = 2.1 + Math.cos(angle) * 0.6;
                    this.setCameraFromPositionAndTarget(new THREE.Vector3(x, y, z), target);
                    return;
                }
                if (config.cameraMode === 'keyframed') {
                    const keys = Array.isArray(config.keyframes) && config.keyframes.length ? config.keyframes : createDefaultPreviewCaptureConfig().keyframes;
                    const nextKeys = normalizePreviewCaptureKeyframes(keys, createDefaultPreviewCaptureConfig().keyframes);
                    let start = nextKeys[0];
                    let end = nextKeys[nextKeys.length - 1];
                    for (let index = 0; index < nextKeys.length - 1; index++) {
                        if (progress >= nextKeys[index].time && progress <= nextKeys[index + 1].time) {
                            start = nextKeys[index];
                            end = nextKeys[index + 1];
                            break;
                        }
                    }
                    const localT = end.time <= start.time ? 0 : (progress - start.time) / (end.time - start.time);
                    const position = new THREE.Vector3(
                        THREE.MathUtils.lerp(start.position[0], end.position[0], localT),
                        THREE.MathUtils.lerp(start.position[1], end.position[1], localT),
                        THREE.MathUtils.lerp(start.position[2], end.position[2], localT)
                    );
                    const nextTarget = new THREE.Vector3(
                        THREE.MathUtils.lerp(start.target[0], end.target[0], localT),
                        THREE.MathUtils.lerp(start.target[1], end.target[1], localT),
                        THREE.MathUtils.lerp(start.target[2], end.target[2], localT)
                    );
                    this.setCameraFromPositionAndTarget(position, nextTarget);
                    return;
                }
                this.applyCameraState();
            }

            beginDeterministicCapture(captureConfig = {}) {
                if (!this.renderer || !this.scene || !this.camera || !this.currentPreset) {
                    throw new Error('Preview runtime is not ready for capture.');
                }
                const isLineup = !!this.captureLineup?.config;
                const config = isLineup
                    ? {
                        ...normalizeCaptureLineupConfig(captureConfig, this.captureLineup?.config?.setName || 'Texture Set', this.currentPreset.name),
                        durationSeconds: resolveCaptureLineupDurationSeconds(captureConfig, this.captureLineup?.entries?.length || 1)
                    }
                    : normalizePreviewCaptureConfig(captureConfig, this.currentPreset.name);
                const snapshot = this.createSimulationSnapshot();
                this.captureSnapshot = snapshot;
                this.captureInProgress = true;
                this.ensureCaptureRenderer(config.width, config.height);
                const stageCount = isLineup
                    ? Math.max(3, Math.ceil((Math.max(config.travelDistance || config.stageScrollTravel, config.stageSpacing * Math.max(1, this.captureLineup?.entries?.length || 1)) / Math.max(1, config.stageSpacing))) + 4)
                    : config.stageCount;
                this.buildCaptureStage({ ...config, stageCount });
                this.updateGroundMode();
                if (config.simulationStartMode === 'continue_live') {
                    this.needsWarmup = false;
                } else if (config.simulationStartMode === 'reset_no_warmup') {
                    this.resetSimulation();
                    this.needsWarmup = false;
                } else {
                    this.resetSimulation();
                    this.needsWarmup = false;
                    this.warmupForSeconds(config.warmupSeconds);
                }
                return {
                    totalFrames: Math.max(1, Math.round(config.durationSeconds * config.fps)),
                    frameDelta: 1 / Math.max(1, config.fps),
                    config,
                    snapshot,
                    mode: isLineup ? 'capture_lineup' : 'preview'
                };
            }

            async captureDeterministicFrame(session, frameIndex) {
                if (!session?.config) throw new Error('Capture session is invalid.');
                if (frameIndex > 0) {
                    this.clock += session.frameDelta;
                    this.stepSimulation(session.frameDelta, this.clock);
                }
                const elapsedSeconds = frameIndex / Math.max(1, session.config.fps);
                if (session.mode === 'capture_lineup') {
                    this.applyCaptureLineupCamera(session.config, elapsedSeconds, session.config.durationSeconds);
                } else {
                    this.applyCaptureCamera(session.config, elapsedSeconds, session.config.durationSeconds, session.snapshot);
                }
                this.renderScene(this.captureRenderer, this.camera);
                const blob = await new Promise((resolve, reject) => {
                    this.captureCanvas.toBlob((result) => {
                        if (!result) reject(new Error('Failed to encode preview frame.'));
                        else resolve(result);
                    }, 'image/jpeg', 0.92);
                });
                return {
                    blob,
                    frameIndex,
                    totalFrames: session.totalFrames,
                    elapsedSeconds
                };
            }

            async finishDeterministicCapture(session, { restore = true } = {}) {
                if (this.captureStageGroup) {
                    this.captureStageGroup.visible = false;
                    this.clearCaptureStage();
                }
                if (restore && this.captureSnapshot) {
                    this.restoreSimulationSnapshot(this.captureSnapshot);
                }
                this.captureInProgress = false;
                this.updateGroundMode();
                if (this.canvas) {
                    this.resize(this.canvas.clientWidth || this.canvas.width || 1, this.canvas.clientHeight || this.canvas.height || 1);
                }
                this.captureSnapshot = null;
                this.applyCameraState();
                this.renderScene(this.renderer, this.camera);
            }

            applyCameraState() {
                if (!this.camera) return;
                const pitch = THREE.MathUtils.degToRad(this.cameraPitch);
                const yaw = THREE.MathUtils.degToRad(this.cameraYaw);
                const distance = this.cameraDistance;
                this.camera.position.set(
                    Math.sin(yaw) * Math.cos(pitch) * distance,
                    Math.sin(pitch) * distance + 0.2,
                    Math.cos(yaw) * Math.cos(pitch) * distance
                );
                this.camera.lookAt(PREVIEW_CAMERA_TARGET);
                this.updatePreviewGrid();
            }

            dispose() {
                this.unbindCameraControls();
                this.clearLayers();
                if (this.previewGridMesh) {
                    this.scene?.remove(this.previewGridMesh);
                    this.previewGridMesh.geometry.dispose();
                    this.previewGridMesh.material.dispose();
                    this.previewGridMesh = null;
                }
                this.clearCaptureStage();
                if (this.captureStageGroup) {
                    this.scene?.remove(this.captureStageGroup);
                    this.captureStageGroup = null;
                }
                this.disposeCaptureLineupTextures();
                if (this.sourceTexture) this.sourceTexture.dispose();
                if (this.fallbackTexture) this.fallbackTexture.dispose();
                if (this.renderer?.forceContextLoss) this.renderer.forceContextLoss();
                if (this.renderer) this.renderer.dispose();
                this.captureRenderer = null;
                this.captureCanvas = null;
                this.renderer = null;
                this.scene = null;
                this.camera = null;
                this.layerMap.clear();
                this.mounted = false;
            }
        }
