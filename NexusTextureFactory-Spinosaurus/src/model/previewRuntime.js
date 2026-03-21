        const PREVIEW_STORAGE_KEY_PRESETS = 'spinosaurus-preview-presets-v1';
        const PREVIEW_STORAGE_KEY_UI = 'spinosaurus-preview-ui-v1';
        const PREVIEW_DEFAULT_PRESET_ID = 'preset-emitter-sandbox';
        const PREVIEW_MAX_PARTICLES_PER_LAYER = 8192;
        const PREVIEW_MAX_PARTICLES_TOTAL = 16384;
        const PREVIEW_DEFAULT_PARTICLES_PER_LAYER = 2048;
        const PREVIEW_EMITTER_SHAPES = ['point', 'sphere', 'box', 'cone', 'ring'];
        const PREVIEW_BLEND_MODES = ['alpha', 'additive'];
        const PREVIEW_BILLBOARD_MODES = ['spherical'];
        const PREVIEW_MODULE_KEYS = ['main', 'emission', 'shape', 'velocityOverLifetime', 'forceOverLifetime', 'limitVelocityOverLifetime', 'noise', 'colorOverLifetime', 'colorBySpeed', 'sizeOverLifetime', 'sizeBySpeed', 'rotationOverLifetime', 'rotationBySpeed', 'collision', 'subEmitters', 'textureSheetAnimation', 'inheritVelocity', 'lifetimeByEmitterSpeed', 'trails', 'customData', 'renderer'];
        const PREVIEW_FIXED_TIMESTEP = 1 / 60;
        const PREVIEW_MAX_CATCHUP_STEPS = 4;
        const PREVIEW_WARMUP_SECONDS = 0.5;

        const createPreviewLayerId = (index = 0) => `layer-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`;
        const createPreviewPresetId = () => `preset-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const clampPreviewValue = (value, min, max) => Math.max(min, Math.min(max, value));
        const isFiniteNumber = (value) => typeof value === 'number' && Number.isFinite(value);
        const clonePreviewPreset = (preset) => JSON.parse(JSON.stringify(preset || createDefaultPreviewPreset()));

        function createDefaultPreviewModules() {
            return {
                main: { enabled: false, expanded: false, mode: 'main', settings: {} },
                emission: { enabled: false, expanded: false, mode: 'continuous', settings: { rate: 320, burst: 0, loop: true, duration: 0 } },
                shape: { enabled: false, expanded: false, mode: 'cone', settings: { shape: 'cone', position: [0, 0, 0], rotation: [0, 0, 0], size: [0.15, 0.15, 0.15], direction: [0, 1, 0], spread: 0.35 } },
                velocityOverLifetime: { enabled: true, expanded: false, mode: 'vector', settings: { gravity: [0, -0.6, 0], drag: 0.18 } },
                forceOverLifetime: { enabled: false, expanded: false, mode: 'force', settings: { vortexStrength: 0, radialAttraction: 0 } },
                limitVelocityOverLifetime: { enabled: false, expanded: false, mode: 'limit', settings: { speedLimit: 3.5 } },
                noise: { enabled: false, expanded: false, mode: 'perlin', settings: { noiseStrength: 0.55, noiseScale: 1.25 } },
                colorOverLifetime: { enabled: false, expanded: false, mode: 'gradient', settings: { colorStart: '#ffffff', colorEnd: '#d8e6ff' } },
                colorBySpeed: { enabled: false, expanded: false, mode: 'blend', settings: { lowSpeedColor: '#ffffff', highSpeedColor: '#ffffff' } },
                sizeOverLifetime: { enabled: false, expanded: false, mode: 'curve', settings: { size: [0.08, 0.22] } },
                sizeBySpeed: { enabled: false, expanded: false, mode: 'curve', settings: { scale: [1, 1] } },
                rotationOverLifetime: { enabled: false, expanded: false, mode: 'spin', settings: { spin: [-1.5, 1.5] } },
                rotationBySpeed: { enabled: false, expanded: false, mode: 'spin', settings: { spin: [0, 0] } },
                collision: { enabled: false, expanded: false, mode: 'world', settings: { bounce: 0, dampen: 0 } },
                subEmitters: { enabled: false, expanded: false, mode: 'none', settings: {} },
                textureSheetAnimation: { enabled: false, expanded: false, mode: 'single', settings: { columns: 1, rows: 1 } },
                inheritVelocity: { enabled: false, expanded: false, mode: 'none', settings: { factor: 0 } },
                lifetimeByEmitterSpeed: { enabled: false, expanded: false, mode: 'none', settings: { minSpeed: 0, maxSpeed: 1 } },
                trails: { enabled: false, expanded: false, mode: 'off', settings: { length: 0 } },
                customData: { enabled: false, expanded: false, mode: 'off', settings: {} },
                renderer: { enabled: false, expanded: false, mode: 'billboard', settings: { blend: 'additive', billboard: 'spherical', alphaClip: 0.01, alphaOverLife: [0, 1, 0], sizeOverLife: [0.2, 1, 0.15] } }
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

        function moduleSettingsToLayer(modules, fallbackLayer) {
            const base = fallbackLayer || createDefaultPreviewLayer(0);
            const mergedModules = clonePreviewModules(modules);
            return {
                ...base,
                emitter: {
                    ...base.emitter,
                    ...(mergedModules.emission?.settings || {}),
                    ...(mergedModules.shape?.settings || {})
                },
                particle: {
                    ...base.particle,
                    ...(mergedModules.colorOverLifetime?.settings || {}),
                    ...(mergedModules.sizeOverLifetime?.settings || {}),
                    ...(mergedModules.rotationOverLifetime?.settings || {})
                },
                simulation: {
                    ...base.simulation,
                    ...(mergedModules.velocityOverLifetime?.settings || {}),
                    ...(mergedModules.forceOverLifetime?.settings || {}),
                    ...(mergedModules.limitVelocityOverLifetime?.settings || {}),
                    ...(mergedModules.noise?.settings || {})
                },
                render: {
                    ...base.render,
                    ...(mergedModules.renderer?.settings || {})
                },
                modules: mergedModules
            };
        }

        function createDefaultPreviewLayer(index = 0) {
            return {
                id: index === 0 ? 'layer-1' : createPreviewLayerId(index),
                name: index === 0 ? 'Primary' : `Layer ${index + 1}`,
                enabled: true,
                maxParticles: PREVIEW_DEFAULT_PARTICLES_PER_LAYER,
                emitter: {
                    shape: 'cone',
                    position: [0, 0, 0],
                    rotation: [0, 0, 0],
                    size: [0.15, 0.15, 0.15],
                    rate: 320,
                    burst: 0,
                    loop: true,
                    duration: 0,
                    direction: [0, 1, 0],
                    spread: 0.35,
                    speed: [0.8, 1.6]
                },
                particle: {
                    lifetime: [1.25, 2.4],
                    size: [0.08, 0.22],
                    spin: [-1.5, 1.5],
                    colorStart: '#ffffff',
                    colorEnd: '#d8e6ff'
                },
                simulation: {
                    gravity: [0, -0.6, 0],
                    drag: 0.18,
                    noiseStrength: 0.55,
                    noiseScale: 1.25,
                    vortexStrength: 0,
                    radialAttraction: 0,
                    speedLimit: 3.5
                },
                render: {
                    blend: 'additive',
                    billboard: 'spherical',
                    alphaClip: 0.01,
                    alphaOverLife: [0, 1, 0],
                    sizeOverLife: [0.2, 1, 0.15]
                },
                modules: createDefaultPreviewModules()
            };
        }

        function createDefaultPreviewPreset() {
            return {
                version: 1,
                id: PREVIEW_DEFAULT_PRESET_ID,
                name: 'Emitter Sandbox',
                scene: {
                    background: '#05070b',
                    cameraFov: 45,
                    cameraDistance: 6,
                    cameraPitch: 18,
                    cameraYaw: 24,
                    grid: true,
                    timeScale: 1,
                    loop: true
                },
                layers: [createDefaultPreviewLayer(0)]
            };
        }

        const normalizePreviewArray = (value, length, fallback) => {
            const source = Array.isArray(value) ? value : fallback;
            const next = [];
            for (let i = 0; i < length; i++) {
                const candidate = source[i];
                next.push(isFiniteNumber(candidate) ? candidate : fallback[i]);
            }
            return next;
        };

        const normalizePreviewColor = (value, fallback) => {
            const str = String(value || fallback || '').trim();
            return /^#[0-9a-fA-F]{6}$/.test(str) ? str : fallback;
        };

        function sanitizePreviewPreset(raw) {
            const base = createDefaultPreviewPreset();
            const input = raw && typeof raw === 'object' ? raw : {};
            const scene = input.scene && typeof input.scene === 'object' ? input.scene : {};
            const rawLayers = Array.isArray(input.layers) && input.layers.length ? input.layers : base.layers;
            const layers = rawLayers.map((layer, index) => {
                const layerBase = createDefaultPreviewLayer(index);
                const source = layer && typeof layer === 'object' ? layer : {};
                const modules = clonePreviewModules(source.modules);
                const emitter = source.emitter && typeof source.emitter === 'object' ? source.emitter : {};
                const particle = source.particle && typeof source.particle === 'object' ? source.particle : {};
                const simulation = source.simulation && typeof source.simulation === 'object' ? source.simulation : {};
                const render = source.render && typeof source.render === 'object' ? source.render : {};
                const maxParticles = clampPreviewValue(parseInt(source.maxParticles, 10) || layerBase.maxParticles, 1, PREVIEW_MAX_PARTICLES_PER_LAYER);
                const moduleLayer = moduleSettingsToLayer(modules, layerBase);
                return {
                    id: String(source.id || layerBase.id),
                    name: String(source.name || layerBase.name),
                    enabled: typeof source.enabled === 'boolean' ? source.enabled : layerBase.enabled,
                    maxParticles,
                    emitter: {
                        shape: PREVIEW_EMITTER_SHAPES.includes(emitter.shape) ? emitter.shape : layerBase.emitter.shape,
                        position: normalizePreviewArray(emitter.position, 3, layerBase.emitter.position),
                        rotation: normalizePreviewArray(emitter.rotation, 3, layerBase.emitter.rotation),
                        size: normalizePreviewArray(emitter.size, 3, layerBase.emitter.size),
                        rate: isFiniteNumber(emitter.rate) ? emitter.rate : layerBase.emitter.rate,
                        burst: isFiniteNumber(emitter.burst) ? emitter.burst : layerBase.emitter.burst,
                        loop: typeof emitter.loop === 'boolean' ? emitter.loop : layerBase.emitter.loop,
                        duration: isFiniteNumber(emitter.duration) ? emitter.duration : layerBase.emitter.duration,
                        direction: normalizePreviewArray(emitter.direction, 3, layerBase.emitter.direction),
                        spread: isFiniteNumber(emitter.spread) ? emitter.spread : layerBase.emitter.spread,
                        speed: normalizePreviewArray(emitter.speed, 2, layerBase.emitter.speed).sort((a, b) => a - b)
                    },
                    particle: {
                        lifetime: normalizePreviewArray(particle.lifetime, 2, layerBase.particle.lifetime).sort((a, b) => a - b),
                        size: normalizePreviewArray(particle.size, 2, layerBase.particle.size).sort((a, b) => a - b),
                        spin: normalizePreviewArray(particle.spin, 2, layerBase.particle.spin).sort((a, b) => a - b),
                        colorStart: normalizePreviewColor(particle.colorStart, layerBase.particle.colorStart),
                        colorEnd: normalizePreviewColor(particle.colorEnd, layerBase.particle.colorEnd)
                    },
                    simulation: {
                        gravity: normalizePreviewArray(simulation.gravity, 3, layerBase.simulation.gravity),
                        drag: isFiniteNumber(simulation.drag) ? simulation.drag : layerBase.simulation.drag,
                        noiseStrength: isFiniteNumber(simulation.noiseStrength) ? simulation.noiseStrength : layerBase.simulation.noiseStrength,
                        noiseScale: isFiniteNumber(simulation.noiseScale) ? simulation.noiseScale : layerBase.simulation.noiseScale,
                        vortexStrength: isFiniteNumber(simulation.vortexStrength) ? simulation.vortexStrength : layerBase.simulation.vortexStrength,
                        radialAttraction: isFiniteNumber(simulation.radialAttraction) ? simulation.radialAttraction : layerBase.simulation.radialAttraction,
                        speedLimit: isFiniteNumber(simulation.speedLimit) ? simulation.speedLimit : layerBase.simulation.speedLimit
                    },
                    render: {
                        blend: PREVIEW_BLEND_MODES.includes(render.blend) ? render.blend : layerBase.render.blend,
                        billboard: PREVIEW_BILLBOARD_MODES.includes(render.billboard) ? render.billboard : layerBase.render.billboard,
                        alphaClip: isFiniteNumber(render.alphaClip) ? render.alphaClip : layerBase.render.alphaClip,
                        alphaOverLife: normalizePreviewArray(render.alphaOverLife, 3, layerBase.render.alphaOverLife),
                        sizeOverLife: normalizePreviewArray(render.sizeOverLife, 3, layerBase.render.sizeOverLife)
                    },
                    modules,
                    __moduleLayer: moduleLayer
                };
            });
            return {
                version: 1,
                id: String(input.id || base.id || createPreviewPresetId()),
                name: String(input.name || base.name).trim() || base.name,
                scene: {
                    background: normalizePreviewColor(scene.background, base.scene.background),
                    cameraFov: isFiniteNumber(scene.cameraFov) ? scene.cameraFov : base.scene.cameraFov,
                    cameraDistance: isFiniteNumber(scene.cameraDistance) ? scene.cameraDistance : base.scene.cameraDistance,
                    cameraPitch: isFiniteNumber(scene.cameraPitch) ? scene.cameraPitch : base.scene.cameraPitch,
                    cameraYaw: isFiniteNumber(scene.cameraYaw) ? scene.cameraYaw : base.scene.cameraYaw,
                    grid: typeof scene.grid === 'boolean' ? scene.grid : base.scene.grid,
                    timeScale: isFiniteNumber(scene.timeScale) ? scene.timeScale : base.scene.timeScale,
                    loop: typeof scene.loop === 'boolean' ? scene.loop : base.scene.loop
                },
                layers
            };
        }

        function validatePreviewPreset(raw) {
            const errors = [];
            const preset = sanitizePreviewPreset(raw);
            if (preset.version !== 1) errors.push('Preset version must be 1.');
            if (!String(preset.name || '').trim()) errors.push('Preset name is required.');
            if (!Array.isArray(preset.layers) || preset.layers.length < 1) errors.push('At least one layer is required.');
            const seenLayerIds = new Set();
            let totalParticles = 0;
            preset.layers.forEach((layer, index) => {
                if (!layer.id || seenLayerIds.has(layer.id)) errors.push(`Layer ${index + 1} must have a unique id.`);
                seenLayerIds.add(layer.id);
                if (layer.maxParticles < 1 || layer.maxParticles > PREVIEW_MAX_PARTICLES_PER_LAYER) errors.push(`Layer ${layer.name || index + 1} maxParticles must be within 1-${PREVIEW_MAX_PARTICLES_PER_LAYER}.`);
                totalParticles += layer.maxParticles;
                if (!PREVIEW_EMITTER_SHAPES.includes(layer.emitter.shape)) errors.push(`Layer ${layer.name || index + 1} has an invalid emitter shape.`);
                if (!PREVIEW_BLEND_MODES.includes(layer.render.blend)) errors.push(`Layer ${layer.name || index + 1} has an invalid blend mode.`);
                if (!PREVIEW_BILLBOARD_MODES.includes(layer.render.billboard)) errors.push(`Layer ${layer.name || index + 1} has an invalid billboard mode.`);
                [['position', layer.emitter.position, 3], ['rotation', layer.emitter.rotation, 3], ['size', layer.emitter.size, 3], ['direction', layer.emitter.direction, 3], ['speed', layer.emitter.speed, 2], ['lifetime', layer.particle.lifetime, 2], ['size', layer.particle.size, 2], ['spin', layer.particle.spin, 2], ['gravity', layer.simulation.gravity, 3], ['alphaOverLife', layer.render.alphaOverLife, 3], ['sizeOverLife', layer.render.sizeOverLife, 3]].forEach(([name, value, len]) => {
                    if (!Array.isArray(value) || value.length !== len || value.some((entry) => !isFiniteNumber(entry))) {
                        errors.push(`Layer ${layer.name || index + 1} ${name} must contain ${len} finite numbers.`);
                    }
                });
                if (layer.modules && typeof layer.modules === 'object') {
                    PREVIEW_MODULE_KEYS.forEach((key) => {
                        const module = layer.modules[key];
                        if (!module || typeof module !== 'object') errors.push(`Layer ${layer.name || index + 1} is missing module ${key}.`);
                    });
                }
                if (layer.emitter.speed[1] < layer.emitter.speed[0]) errors.push(`Layer ${layer.name || index + 1} speed range is invalid.`);
                if (layer.particle.lifetime[1] < layer.particle.lifetime[0]) errors.push(`Layer ${layer.name || index + 1} lifetime range is invalid.`);
                if (layer.particle.size[1] < layer.particle.size[0]) errors.push(`Layer ${layer.name || index + 1} size range is invalid.`);
            });
            if (totalParticles > PREVIEW_MAX_PARTICLES_TOTAL) errors.push(`Total particles cannot exceed ${PREVIEW_MAX_PARTICLES_TOTAL}.`);
            return { valid: errors.length === 0, errors, sanitizedPreset: preset };
        }

        function moduleIsExpanded(layer, moduleKey) {
            return !!layer?.modules?.[moduleKey]?.expanded;
        }

        function isPreviewWebGL2Supported() {
            try {
                const canvas = document.createElement('canvas');
                return !!canvas.getContext('webgl2');
            } catch (_) {
                return false;
            }
        }

        class PreviewParticleLayer {
            constructor(runtime, presetLayer) {
                this.runtime = runtime;
                this.presetLayer = clonePreviewPreset({ layers: [presetLayer] }).layers[0];
                this.simSize = Math.ceil(Math.sqrt(this.presetLayer.maxParticles));
                this.count = this.simSize * this.simSize;
                this.seedTexture = this.createSeedTexture();
                this.positionTargets = this.createTargets();
                this.velocityTargets = this.createTargets();
                this.positionScene = new THREE.Scene();
                this.velocityScene = new THREE.Scene();
                this.simCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
                this.simQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), null);
                this.velQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), null);
                this.positionScene.add(this.simQuad);
                this.velocityScene.add(this.velQuad);
                this.positionMaterial = this.createPositionMaterial();
                this.velocityMaterial = this.createVelocityMaterial();
                this.simQuad.material = this.positionMaterial;
                this.velQuad.material = this.velocityMaterial;
                this.renderMaterial = this.createRenderMaterial();
                this.renderMesh = this.createRenderMesh();
                this.currentIndex = 0;
                this.reset();
            }

            createTargets() {
                const options = {
                    minFilter: THREE.NearestFilter,
                    magFilter: THREE.NearestFilter,
                    type: this.runtime.floatType,
                    format: THREE.RGBAFormat,
                    depthBuffer: false,
                    stencilBuffer: false
                };
                return [
                    new THREE.WebGLRenderTarget(this.simSize, this.simSize, options),
                    new THREE.WebGLRenderTarget(this.simSize, this.simSize, options)
                ];
            }

            createSeedTexture() {
                const data = new Float32Array(this.count * 4);
                for (let i = 0; i < this.count; i++) {
                    const offset = i * 4;
                    data[offset] = Math.random();
                    data[offset + 1] = Math.random();
                    data[offset + 2] = Math.random();
                    data[offset + 3] = Math.random();
                }
                const tex = new THREE.DataTexture(data, this.simSize, this.simSize, THREE.RGBAFormat, THREE.FloatType);
                tex.needsUpdate = true;
                tex.magFilter = THREE.NearestFilter;
                tex.minFilter = THREE.NearestFilter;
                tex.wrapS = THREE.ClampToEdgeWrapping;
                tex.wrapT = THREE.ClampToEdgeWrapping;
                return tex;
            }

            createPositionMaterial() {
                const uniforms = {
                    uPrevPosition: { value: null },
                    uPrevVelocity: { value: null },
                    uSeed: { value: this.seedTexture },
                    uDelta: { value: PREVIEW_FIXED_TIMESTEP },
                    uRate: { value: this.presetLayer.emitter.rate },
                    uLoop: { value: this.presetLayer.emitter.loop ? 1 : 0 },
                    uDuration: { value: Math.max(0.0001, this.presetLayer.emitter.duration || 0.0001) },
                    uTime: { value: 0 },
                    uReset: { value: 1 },
                    uEmitterPos: { value: new THREE.Vector3(...this.presetLayer.emitter.position) },
                    uEmitterSize: { value: new THREE.Vector3(...this.presetLayer.emitter.size) },
                    uEmitterShape: { value: PREVIEW_EMITTER_SHAPES.indexOf(this.presetLayer.emitter.shape) },
                    uLifeRange: { value: new THREE.Vector2(...this.presetLayer.particle.lifetime) }
                };
                return new THREE.ShaderMaterial({
                    uniforms,
                    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
                    fragmentShader: `
                        precision highp float;
                        varying vec2 vUv;
                        uniform sampler2D uPrevPosition;
                        uniform sampler2D uPrevVelocity;
                        uniform sampler2D uSeed;
                        uniform float uDelta;
                        uniform float uRate;
                        uniform float uLoop;
                        uniform float uDuration;
                        uniform float uTime;
                        uniform float uReset;
                        uniform vec3 uEmitterPos;
                        uniform vec3 uEmitterSize;
                        uniform float uEmitterShape;
                        uniform vec2 uLifeRange;
                        vec3 spawnFromShape(vec4 seed){
                            vec3 p = vec3(0.0);
                            if (uEmitterShape < 0.5) {
                                p = vec3(0.0);
                            } else if (uEmitterShape < 1.5) {
                                float theta = seed.x * 6.2831853;
                                float phi = acos(seed.y * 2.0 - 1.0);
                                float r = pow(seed.z, 1.0 / 3.0);
                                p = vec3(sin(phi) * cos(theta), cos(phi), sin(phi) * sin(theta)) * r * uEmitterSize;
                            } else if (uEmitterShape < 2.5) {
                                p = (seed.xyz * 2.0 - 1.0) * uEmitterSize;
                            } else if (uEmitterShape < 3.5) {
                                float theta = seed.x * 6.2831853;
                                float radius = mix(0.0, uEmitterSize.x, seed.y);
                                p = vec3(cos(theta) * radius, seed.z * uEmitterSize.y, sin(theta) * radius);
                            } else {
                                float theta = seed.x * 6.2831853;
                                float radius = mix(max(0.001, uEmitterSize.x * 0.6), uEmitterSize.x, seed.y);
                                p = vec3(cos(theta) * radius, 0.0, sin(theta) * radius);
                            }
                            return uEmitterPos + p;
                        }
                        void main(){
                            vec4 prevPos = texture2D(uPrevPosition, vUv);
                            vec4 prevVel = texture2D(uPrevVelocity, vUv);
                            vec4 seed = texture2D(uSeed, vUv);
                            float life = prevPos.w;
                            float lifeSpeed = uDelta / max(0.001, mix(uLifeRange.x, uLifeRange.y, seed.w));
                            float nextLife = uReset > 0.5 ? 1.0 : (life - lifeSpeed);
                            bool dead = nextLife <= 0.0;
                            if (dead) {
                                bool canRespawn = uLoop > 0.5 || uTime <= uDuration;
                                if (canRespawn) {
                                    vec3 spawnPos = spawnFromShape(seed);
                                    gl_FragColor = vec4(spawnPos, 1.0);
                                    return;
                                }
                                gl_FragColor = vec4(prevPos.xyz, 0.0);
                                return;
                            }
                            gl_FragColor = vec4(prevPos.xyz + prevVel.xyz * uDelta, nextLife);
                        }
                    `
                });
            }

            createVelocityMaterial() {
                const uniforms = {
                    uPrevPosition: { value: null },
                    uPrevVelocity: { value: null },
                    uSeed: { value: this.seedTexture },
                    uDelta: { value: PREVIEW_FIXED_TIMESTEP },
                    uTime: { value: 0 },
                    uReset: { value: 1 },
                    uGravity: { value: new THREE.Vector3(...this.presetLayer.simulation.gravity) },
                    uDirection: { value: new THREE.Vector3(...this.presetLayer.emitter.direction) },
                    uSpeedRange: { value: new THREE.Vector2(...this.presetLayer.emitter.speed) },
                    uDrag: { value: this.presetLayer.simulation.drag },
                    uNoiseStrength: { value: this.presetLayer.simulation.noiseStrength },
                    uNoiseScale: { value: this.presetLayer.simulation.noiseScale },
                    uSpread: { value: this.presetLayer.emitter.spread },
                    uVortexStrength: { value: this.presetLayer.simulation.vortexStrength },
                    uRadialAttraction: { value: this.presetLayer.simulation.radialAttraction },
                    uSpeedLimit: { value: this.presetLayer.simulation.speedLimit }
                };
                return new THREE.ShaderMaterial({
                    uniforms,
                    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
                    fragmentShader: `
                        precision highp float;
                        varying vec2 vUv;
                        uniform sampler2D uPrevPosition;
                        uniform sampler2D uPrevVelocity;
                        uniform sampler2D uSeed;
                        uniform float uDelta;
                        uniform float uTime;
                        uniform float uReset;
                        uniform vec3 uGravity;
                        uniform vec3 uDirection;
                        uniform vec2 uSpeedRange;
                        uniform float uDrag;
                        uniform float uNoiseStrength;
                        uniform float uNoiseScale;
                        uniform float uSpread;
                        uniform float uVortexStrength;
                        uniform float uRadialAttraction;
                        uniform float uSpeedLimit;
                        vec3 hash33(vec3 p){
                            p = vec3(dot(p, vec3(127.1, 311.7, 74.7)), dot(p, vec3(269.5, 183.3, 246.1)), dot(p, vec3(113.5, 271.9, 124.6)));
                            return fract(sin(p) * 43758.5453) * 2.0 - 1.0;
                        }
                        void main(){
                            vec4 prevPos = texture2D(uPrevPosition, vUv);
                            vec4 prevVel = texture2D(uPrevVelocity, vUv);
                            vec4 seed = texture2D(uSeed, vUv);
                            vec3 vel = prevVel.xyz;
                            bool respawn = uReset > 0.5 || prevPos.w <= 0.0;
                            if (respawn) {
                                vec3 dir = normalize(uDirection + hash33(vec3(seed.xy, uTime)) * uSpread);
                                float speed = mix(uSpeedRange.x, uSpeedRange.y, seed.z);
                                gl_FragColor = vec4(dir * speed, seed.w);
                                return;
                            }
                            vec3 noise = hash33(prevPos.xyz * max(0.1, uNoiseScale) + vec3(seed.xy, uTime)) * uNoiseStrength;
                            vec3 vortex = vec3(-prevPos.z, 0.0, prevPos.x) * uVortexStrength;
                            vec3 radial = normalize(-prevPos.xyz + vec3(0.0001)) * uRadialAttraction;
                            vel += (uGravity + noise + vortex + radial) * uDelta;
                            vel *= max(0.0, 1.0 - uDrag * uDelta);
                            float speed = length(vel);
                            if (speed > uSpeedLimit && speed > 0.0001) vel = vel / speed * uSpeedLimit;
                            gl_FragColor = vec4(vel, prevVel.w);
                        }
                    `
                });
            }

            createRenderMaterial() {
                const startColor = new THREE.Color(this.presetLayer.particle.colorStart);
                const endColor = new THREE.Color(this.presetLayer.particle.colorEnd);
                return new THREE.ShaderMaterial({
                    transparent: true,
                    depthWrite: false,
                    blending: this.presetLayer.render.blend === 'additive' ? THREE.AdditiveBlending : THREE.NormalBlending,
                    uniforms: {
                        uPositionTex: { value: this.positionTargets[this.currentIndex].texture },
                        uVelocityTex: { value: this.velocityTargets[this.currentIndex].texture },
                        uSprite: { value: this.runtime.sourceTexture || this.runtime.createFallbackSourceTexture() },
                        uSimSize: { value: this.simSize },
                        uCameraRight: { value: new THREE.Vector3(1, 0, 0) },
                        uCameraUp: { value: new THREE.Vector3(0, 1, 0) },
                        uSizeRange: { value: new THREE.Vector2(...this.presetLayer.particle.size) },
                        uAlphaOverLife: { value: this.presetLayer.render.alphaOverLife.slice() },
                        uSizeOverLife: { value: this.presetLayer.render.sizeOverLife.slice() },
                        uColorStart: { value: startColor },
                        uColorEnd: { value: endColor },
                        uAlphaClip: { value: this.presetLayer.render.alphaClip }
                    },
                    vertexShader: `
                        precision highp float;
                        attribute vec2 quadCorner;
                        attribute float particleIndex;
                        uniform sampler2D uPositionTex;
                        uniform sampler2D uVelocityTex;
                        uniform float uSimSize;
                        uniform vec3 uCameraRight;
                        uniform vec3 uCameraUp;
                        uniform vec2 uSizeRange;
                        uniform float uSizeOverLife[3];
                        varying vec2 vUv;
                        varying float vLife;
                        float evalRamp(float t, float a, float b, float c){
                            if (t < 0.5) return mix(a, b, t * 2.0);
                            return mix(b, c, (t - 0.5) * 2.0);
                        }
                        void main(){
                            float x = mod(particleIndex, uSimSize);
                            float y = floor(particleIndex / uSimSize);
                            vec2 sampleUv = (vec2(x, y) + 0.5) / uSimSize;
                            vec4 posData = texture2D(uPositionTex, sampleUv);
                            vec3 positionWorld = posData.xyz;
                            float life = clamp(posData.w, 0.0, 1.0);
                            vLife = life;
                            float baseSize = mix(uSizeRange.x, uSizeRange.y, fract(particleIndex * 0.0137));
                            float sizeMul = evalRamp(1.0 - life, uSizeOverLife[0], uSizeOverLife[1], uSizeOverLife[2]);
                            vec3 billboardOffset = (uCameraRight * quadCorner.x + uCameraUp * quadCorner.y) * baseSize * sizeMul;
                            vec4 mvPosition = modelViewMatrix * vec4(positionWorld + billboardOffset, 1.0);
                            gl_Position = projectionMatrix * mvPosition;
                            vUv = quadCorner + 0.5;
                        }
                    `,
                    fragmentShader: `
                        precision highp float;
                        uniform sampler2D uSprite;
                        uniform float uAlphaOverLife[3];
                        uniform vec3 uColorStart;
                        uniform vec3 uColorEnd;
                        uniform float uAlphaClip;
                        varying vec2 vUv;
                        varying float vLife;
                        float evalRamp(float t, float a, float b, float c){
                            if (t < 0.5) return mix(a, b, t * 2.0);
                            return mix(b, c, (t - 0.5) * 2.0);
                        }
                        void main(){
                            float alpha = texture2D(uSprite, vUv).a;
                            float lifeT = clamp(1.0 - vLife, 0.0, 1.0);
                            alpha *= evalRamp(lifeT, uAlphaOverLife[0], uAlphaOverLife[1], uAlphaOverLife[2]);
                            if (alpha <= uAlphaClip) discard;
                            vec3 color = mix(uColorStart, uColorEnd, lifeT);
                            gl_FragColor = vec4(color, alpha);
                        }
                    `
                });
            }

            createRenderMesh() {
                const geometry = new THREE.InstancedBufferGeometry();
                const basePositions = new Float32Array([
                    -0.5, -0.5, 0,
                     0.5, -0.5, 0,
                    -0.5,  0.5, 0,
                     0.5,  0.5, 0
                ]);
                const baseUvs = new Float32Array([
                    0, 0,
                    1, 0,
                    0, 1,
                    1, 1
                ]);
                const indices = [0, 1, 2, 2, 1, 3];
                geometry.setIndex(indices);
                geometry.setAttribute('position', new THREE.Float32BufferAttribute(basePositions, 3));
                geometry.setAttribute('quadCorner', new THREE.Float32BufferAttribute(baseUvs.map((value) => value - 0.5), 2));
                const particleIndices = new Float32Array(this.count);
                for (let i = 0; i < this.count; i++) particleIndices[i] = i;
                geometry.setAttribute('particleIndex', new THREE.InstancedBufferAttribute(particleIndices, 1));
                geometry.instanceCount = this.count;
                return new THREE.Mesh(geometry, this.renderMaterial);
            }

            applyPreset(layer) {
                this.presetLayer = sanitizePreviewPreset({ id: 'tmp', name: 'tmp', layers: [layer] }).layers[0];
                this.positionMaterial.uniforms.uRate.value = this.presetLayer.emitter.rate;
                this.positionMaterial.uniforms.uLoop.value = this.presetLayer.emitter.loop ? 1 : 0;
                this.positionMaterial.uniforms.uDuration.value = Math.max(0.0001, this.presetLayer.emitter.duration || 0.0001);
                this.positionMaterial.uniforms.uEmitterPos.value.set(...this.presetLayer.emitter.position);
                this.positionMaterial.uniforms.uEmitterSize.value.set(...this.presetLayer.emitter.size);
                this.positionMaterial.uniforms.uEmitterShape.value = PREVIEW_EMITTER_SHAPES.indexOf(this.presetLayer.emitter.shape);
                this.positionMaterial.uniforms.uLifeRange.value.set(...this.presetLayer.particle.lifetime);
                this.velocityMaterial.uniforms.uGravity.value.set(...this.presetLayer.simulation.gravity);
                this.velocityMaterial.uniforms.uDirection.value.set(...this.presetLayer.emitter.direction);
                this.velocityMaterial.uniforms.uSpeedRange.value.set(...this.presetLayer.emitter.speed);
                this.velocityMaterial.uniforms.uDrag.value = this.presetLayer.simulation.drag;
                this.velocityMaterial.uniforms.uNoiseStrength.value = this.presetLayer.simulation.noiseStrength;
                this.velocityMaterial.uniforms.uNoiseScale.value = this.presetLayer.simulation.noiseScale;
                this.velocityMaterial.uniforms.uSpread.value = this.presetLayer.emitter.spread;
                this.velocityMaterial.uniforms.uVortexStrength.value = this.presetLayer.simulation.vortexStrength;
                this.velocityMaterial.uniforms.uRadialAttraction.value = this.presetLayer.simulation.radialAttraction;
                this.velocityMaterial.uniforms.uSpeedLimit.value = this.presetLayer.simulation.speedLimit;
                this.renderMaterial.uniforms.uSizeRange.value.set(...this.presetLayer.particle.size);
                this.renderMaterial.uniforms.uAlphaOverLife.value = this.presetLayer.render.alphaOverLife.slice();
                this.renderMaterial.uniforms.uSizeOverLife.value = this.presetLayer.render.sizeOverLife.slice();
                this.renderMaterial.uniforms.uColorStart.value.set(this.presetLayer.particle.colorStart);
                this.renderMaterial.uniforms.uColorEnd.value.set(this.presetLayer.particle.colorEnd);
                this.renderMaterial.uniforms.uAlphaClip.value = this.presetLayer.render.alphaClip;
                this.renderMaterial.blending = this.presetLayer.render.blend === 'additive' ? THREE.AdditiveBlending : THREE.NormalBlending;
                this.renderMesh.visible = !!this.presetLayer.enabled;
                this.reset();
            }

            setSourceTexture(texture) {
                this.renderMaterial.uniforms.uSprite.value = texture || this.runtime.createFallbackSourceTexture();
            }

            reset() {
                this.positionMaterial.uniforms.uReset.value = 1;
                this.velocityMaterial.uniforms.uReset.value = 1;
            }

            step(delta, absoluteTime) {
                const renderer = this.runtime.renderer;
                const srcIndex = this.currentIndex;
                const dstIndex = (this.currentIndex + 1) % 2;
                this.positionMaterial.uniforms.uPrevPosition.value = this.positionTargets[srcIndex].texture;
                this.positionMaterial.uniforms.uPrevVelocity.value = this.velocityTargets[srcIndex].texture;
                this.positionMaterial.uniforms.uDelta.value = delta;
                this.positionMaterial.uniforms.uTime.value = absoluteTime;
                this.velocityMaterial.uniforms.uPrevPosition.value = this.positionTargets[srcIndex].texture;
                this.velocityMaterial.uniforms.uPrevVelocity.value = this.velocityTargets[srcIndex].texture;
                this.velocityMaterial.uniforms.uDelta.value = delta;
                this.velocityMaterial.uniforms.uTime.value = absoluteTime;

                renderer.setRenderTarget(this.velocityTargets[dstIndex]);
                renderer.render(this.velocityScene, this.simCamera);
                renderer.setRenderTarget(this.positionTargets[dstIndex]);
                renderer.render(this.positionScene, this.simCamera);
                renderer.setRenderTarget(null);

                this.positionMaterial.uniforms.uReset.value = 0;
                this.velocityMaterial.uniforms.uReset.value = 0;
                this.currentIndex = dstIndex;
                this.renderMaterial.uniforms.uPositionTex.value = this.positionTargets[this.currentIndex].texture;
                this.renderMaterial.uniforms.uVelocityTex.value = this.velocityTargets[this.currentIndex].texture;
            }

            dispose() {
                [this.positionTargets, this.velocityTargets].flat().forEach((target) => target.dispose());
                this.seedTexture.dispose();
                this.positionMaterial.dispose();
                this.velocityMaterial.dispose();
                this.renderMaterial.dispose();
                this.renderMesh.geometry.dispose();
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
                this.currentPreset = null;
                this.sourceTexture = null;
                this.fallbackTexture = null;
                this.floatType = THREE.FloatType;
                this.floorMesh = null;
                this.mounted = false;
                this.isPlaying = true;
                this.timeScale = 1;
                this.needsWarmup = false;
                this.cameraDistance = 6;
                this.cameraPitch = 18;
                this.draggingCamera = false;
                this.lastPointerY = 0;
                this.boundPointerDown = null;
                this.boundPointerMove = null;
                this.boundPointerUp = null;
            }

            mount() {
                if (this.mounted || !this.canvas) return;
                this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
                this.renderer.setPixelRatio(window.devicePixelRatio || 1);
                this.renderer.setSize(this.canvas.clientWidth || 1, this.canvas.clientHeight || 1, false);
                this.floatType = this.renderer.capabilities.isWebGL2 ? (this.renderer.extensions.has('EXT_color_buffer_float') ? THREE.FloatType : THREE.HalfFloatType) : THREE.HalfFloatType;
                this.scene = new THREE.Scene();
                this.camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100);
                const floorGeometry = new THREE.BoxGeometry(4, 4, 4);
                const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.05, roughness: 0.95 });
                this.floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
                this.floorMesh.position.set(0, -2, 0);
                this.scene.add(this.floorMesh);
                const ambient = new THREE.AmbientLight(0xffffff, 0.8);
                ambient.intensity = 1.4;
                const directional = new THREE.DirectionalLight(0xffffff, 1.2);
                directional.position.set(3, 5, 4);
                this.scene.add(ambient);
                this.scene.add(directional);
                const hemisphere = new THREE.HemisphereLight(0xffffff, 0x3b4257, 0.7);
                this.scene.add(hemisphere);
                this.bindCameraControls();
                this.mounted = true;
                this.applyCameraState();
            }

            bindCameraControls() {
                if (!this.canvas || this.boundPointerDown) return;
                this.boundPointerDown = (event) => {
                    if (event.button !== 0) return;
                    this.draggingCamera = true;
                    this.lastPointerY = event.clientY;
                    if (this.canvas.setPointerCapture) {
                        try { this.canvas.setPointerCapture(event.pointerId); } catch (_) {}
                    }
                    event.preventDefault();
                };
                this.boundPointerMove = (event) => {
                    if (!this.draggingCamera) return;
                    const deltaY = event.clientY - this.lastPointerY;
                    this.lastPointerY = event.clientY;
                    this.setCameraPitch(this.cameraPitch - deltaY * 0.25);
                    event.preventDefault();
                };
                this.boundPointerUp = (event) => {
                    this.draggingCamera = false;
                    if (this.canvas.releasePointerCapture) {
                        try { this.canvas.releasePointerCapture(event.pointerId); } catch (_) {}
                    }
                    event.preventDefault();
                };
                this.canvas.addEventListener('pointerdown', this.boundPointerDown);
                this.canvas.addEventListener('pointermove', this.boundPointerMove);
                this.canvas.addEventListener('pointerup', this.boundPointerUp);
                this.canvas.addEventListener('pointercancel', this.boundPointerUp);
                this.canvas.style.cursor = 'grab';
            }

            unbindCameraControls() {
                if (!this.canvas || !this.boundPointerDown) return;
                this.canvas.removeEventListener('pointerdown', this.boundPointerDown);
                this.canvas.removeEventListener('pointermove', this.boundPointerMove);
                this.canvas.removeEventListener('pointerup', this.boundPointerUp);
                this.canvas.removeEventListener('pointercancel', this.boundPointerUp);
                this.boundPointerDown = null;
                this.boundPointerMove = null;
                this.boundPointerUp = null;
                this.draggingCamera = false;
                this.canvas.style.cursor = '';
            }

            createFallbackSourceTexture() {
                if (this.fallbackTexture) return this.fallbackTexture;
                const canvas = document.createElement('canvas');
                canvas.width = 64;
                canvas.height = 64;
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, 64, 64);
                const gradient = ctx.createRadialGradient(32, 32, 4, 32, 32, 28);
                gradient.addColorStop(0, 'rgba(255,255,255,1)');
                gradient.addColorStop(1, 'rgba(255,255,255,0)');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, 64, 64);
                this.fallbackTexture = new THREE.CanvasTexture(canvas);
                this.fallbackTexture.needsUpdate = true;
                return this.fallbackTexture;
            }

            setSourceImage(imageLike) {
                if (this.sourceTexture) this.sourceTexture.dispose();
                this.sourceTexture = imageLike ? new THREE.Texture(imageLike) : null;
                if (this.sourceTexture) {
                    this.sourceTexture.needsUpdate = true;
                    this.sourceTexture.minFilter = THREE.LinearFilter;
                    this.sourceTexture.magFilter = THREE.LinearFilter;
                }
                this.layers.forEach((layer) => layer.setSourceTexture(this.sourceTexture));
            }

            setPreset(preset) {
                this.currentPreset = clonePreviewPreset(preset);
                this.clearLayers();
                this.scene.background = new THREE.Color(this.currentPreset.scene.background);
                this.cameraDistance = this.currentPreset.scene.cameraDistance;
                this.cameraPitch = clampPreviewValue(this.currentPreset.scene.cameraPitch ?? this.cameraPitch, 0, 90);
                this.applyCameraState();
                this.camera.fov = this.currentPreset.scene.cameraFov;
                this.camera.updateProjectionMatrix();
                this.layers = this.currentPreset.layers.map((layer) => new PreviewParticleLayer(this, layer));
                this.layers.forEach((layer) => {
                    layer.setSourceTexture(this.sourceTexture);
                    this.scene.add(layer.renderMesh);
                });
                this.needsWarmup = true;
            }

            clearLayers() {
                this.layers.forEach((layer) => {
                    this.scene.remove(layer.renderMesh);
                    layer.dispose();
                });
                this.layers = [];
            }

            setPlaying(isPlaying) {
                this.isPlaying = !!isPlaying;
            }

            setTimeScale(value) {
                this.timeScale = clampPreviewValue(Number(value) || 1, 0, 3);
            }

            setCameraPitch(value) {
                const nextPitch = clampPreviewValue(Number(value) || 0, 0, 90);
                if (nextPitch === this.cameraPitch) return;
                this.cameraPitch = nextPitch;
                this.applyCameraState();
            }

            resetSimulation() {
                this.layers.forEach((layer) => layer.reset());
                this.needsWarmup = true;
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
                for (let i = 0; i < steps; i++) this.stepSimulation(PREVIEW_FIXED_TIMESTEP, this.clock + PREVIEW_FIXED_TIMESTEP * i);
                this.needsWarmup = false;
            }

            stepSimulation(delta, absoluteTime) {
                this.layers.forEach((layer) => layer.step(delta, absoluteTime));
            }

            tick(nowMs) {
                if (!this.renderer || !this.scene || !this.camera) return;
                const nextTime = nowMs * 0.001;
                if (!this.lastTickTime) this.lastTickTime = nextTime;
                const dt = Math.min(0.25, Math.max(0, nextTime - this.lastTickTime));
                this.lastTickTime = nextTime;
                if (this.needsWarmup) this.warmup();
                if (this.isPlaying) {
                    this.accumulator += dt * this.timeScale;
                    let steps = 0;
                    while (this.accumulator >= PREVIEW_FIXED_TIMESTEP && steps < PREVIEW_MAX_CATCHUP_STEPS) {
                        this.clock += PREVIEW_FIXED_TIMESTEP;
                        this.stepSimulation(PREVIEW_FIXED_TIMESTEP, this.clock);
                        this.accumulator -= PREVIEW_FIXED_TIMESTEP;
                        steps++;
                    }
                }
                const cameraMatrix = this.camera.matrixWorld;
                const right = new THREE.Vector3().setFromMatrixColumn(cameraMatrix, 0);
                const up = new THREE.Vector3().setFromMatrixColumn(cameraMatrix, 1);
                this.layers.forEach((layer) => {
                    layer.renderMaterial.uniforms.uCameraRight.value.copy(right);
                    layer.renderMaterial.uniforms.uCameraUp.value.copy(up);
                    layer.renderMesh.visible = !!layer.presetLayer.enabled;
                });
                this.renderer.render(this.scene, this.camera);
            }

            applyCameraState() {
                if (!this.camera) return;
                const distance = this.cameraDistance;
                const radians = THREE.MathUtils.degToRad(this.cameraPitch);
                this.camera.position.set(0, Math.sin(radians) * distance, Math.cos(radians) * distance);
                this.camera.lookAt(0, 0, 0);
            }

            dispose() {
                this.unbindCameraControls();
                this.clearLayers();
                if (this.floorMesh) {
                    this.scene?.remove?.(this.floorMesh);
                    this.floorMesh.geometry.dispose();
                    this.floorMesh.material.dispose();
                    this.floorMesh = null;
                }
                if (this.sourceTexture) this.sourceTexture.dispose();
                if (this.fallbackTexture) this.fallbackTexture.dispose();
                if (this.renderer) this.renderer.dispose();
                this.renderer = null;
                this.scene = null;
                this.camera = null;
                this.mounted = false;
            }
        }
