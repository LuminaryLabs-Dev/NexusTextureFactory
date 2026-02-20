export const STEP_TYPES = {
    BASE_SHAPE: { id: 1, name: "Base Shape", cat: "GEN", params: { p1: 0, p2: 0.8, p3: 0.02, p4: 0.05, p5: 0, p6: 0, p7: 0 }, controls: [{ key: 'p1', label: "Type", type: 'select', options: [{ label: "Circle", value: 0 }, { label: "Square", value: 1 }, { label: "Triangle", value: 2 }, { label: "Wire Circle", value: 3 }, { label: "Wire Square", value: 4 }, { label: "Wire Triangle", value: 5 }] }, { key: 'p2', label: "Size", type: 'slider', min: 0, max: 1, step: 0.01 }, { key: 'p3', label: "Softness", type: 'slider', min: 0, max: 1, step: 0.01 }, { key: 'p4', label: "Thickness", type: 'slider', min: 0, max: 0.5, step: 0.01 }] },
    BASE_GRAD: { id: 3, name: "Gradient", cat: "GEN", params: { p1: 0, p2: 0, p3: 0, p4: 0, p5: 0, p6: 0, p7: 0 }, controls: [{ key: 'p1', label: "Angle", type: 'slider', min: 0, max: 360, step: 1 }] },
    NOISE_PERLIN: { id: 4, name: "Perlin Noise", cat: "ERODE", params: { p1: 4.0, p2: 123, p3: 4, p4: 0.5, p5: 0, p6: 0, p7: 0 }, controls: [{ key: 'p1', label: "Scale", type: 'slider', min: 0, max: 10, step: 0.1 }, { key: 'p2', label: "Seed", type: 'slider', min: 0, max: 9999, step: 1 }, { key: 'p3', label: "Octaves", type: 'slider', min: 1, max: 8, step: 1 }, { key: 'p4', label: "Rolloff", type: 'slider', min: 0, max: 1, step: 0.01 }, { key: 'p6', label: "Offset X", type: 'slider', min: -1, max: 1, step: 0.01 }, { key: 'p7', label: "Offset Y", type: 'slider', min: -1, max: 1, step: 0.01 }] },
    NOISE_WORLEY: { id: 5, name: "Worley Noise", cat: "ERODE", params: { p1: 4.0, p2: 456, p3: 1, p4: 0, p5: 0, p6: 0, p7: 0 }, controls: [{ key: 'p1', label: "Scale", type: 'slider', min: 0, max: 10, step: 0.1 }, { key: 'p2', label: "Seed", type: 'slider', min: 0, max: 9999, step: 1 }, { key: 'p3', label: "Jitter", type: 'slider', min: 0, max: 2, step: 0.1 }, { key: 'p4', label: "Invert", type: 'slider', min: 0, max: 1, step: 1 }, { key: 'p6', label: "Offset X", type: 'slider', min: -1, max: 1, step: 0.01 }, { key: 'p7', label: "Offset Y", type: 'slider', min: -1, max: 1, step: 0.01 }] },
    THRESHOLD: { id: 11, name: "Threshold", cat: "FILT", params: { p1: 0.5, p2: 0, p3: 0, p4: 0, p5: 0, p6: 0, p7: 0 }, controls: [{ key: 'p1', label: "Cutoff", type: 'slider', min: 0, max: 1, step: 0.01 }] },
    FRACTAL: { id: 12, name: "Fractalize", cat: "MOD", params: { p1: 6.0, p2: 0, p3: 0, p4: 0, p5: 0, p6: 0, p7: 0 }, controls: [{ key: 'p1', label: "Segments", type: 'slider', min: 1, max: 16, step: 1 }] },
    SPIRAL: { id: 13, name: "Spiral", cat: "MOD", params: { p1: 0.5, p2: 0, p3: 0, p4: 0.5, p5: 0.5, p6: 0, p7: 0 }, controls: [{ key: 'p1', label: "Twist", type: 'slider', min: 0, max: 2, step: 0.01 }, { key: 'p4', label: "Center X", type: 'slider', min: 0, max: 1, step: 0.01 }, { key: 'p5', label: "Center Y", type: 'slider', min: 0, max: 1, step: 0.01 }] },
    VIGNETTE: { id: 14, name: "Vignette", cat: "MOD", params: { p1: 0.0, p2: 0.45, p3: 0.2, p4: 0, p5: 0, p6: 0, p7: 0 }, controls: [{ key: 'p1', label: "Shape", type: 'select', options: [{ label: "Circle", value: 0 }, { label: "Square", value: 1 }] }, { key: 'p2', label: "Size", type: 'slider', min: 0, max: 1, step: 0.01 }, { key: 'p3', label: "Softness", type: 'slider', min: 0, max: 1, step: 0.01 }] },
    BASIC: { id: 15, name: "Basic / Note", cat: "UTIL", params: { p1: 0, p2: 0, p3: 0, p4: 0, p5: 0, p6: 0, p7: 0 }, controls: [] },
    SMEAR: { id: 16, name: "Smear", cat: "MOD", params: { p1: 0, p2: 0.1, p3: 0, p4: 0, p5: 0, p6: 0, p7: 0 }, controls: [{ key: 'p1', label: "Angle", type: 'slider', min: 0, max: 360, step: 1 }, { key: 'p2', label: "Strength", type: 'slider', min: 0, max: 1, step: 0.01 }] }
};

export const STEP_MENU_GROUPS = [{ label: "GENERATORS", keys: ['BASE_SHAPE', 'BASE_GRAD'] }, { label: "NOISE", keys: ['NOISE_PERLIN', 'NOISE_WORLEY'] }, { label: "MODIFIERS", keys: ['SMEAR', 'FRACTAL', 'SPIRAL', 'THRESHOLD', 'VIGNETTE'] }, { label: "UTILITY", keys: ['BASIC'] }];

export const BLEND_MODES = [{ id: 0, name: "Overwrite" }, { id: 1, name: "Subtract" }, { id: 2, name: "Multiply" }, { id: 3, name: "Add" }, { id: 4, name: "Max (Lighten)" }, { id: 5, name: "Min (Darken)" }];

export const FILTER_PIPELINE = [
    { id: 'integrity', name: 'INTEGRITY', rejectLabel: 'FAINT', execute: (items, ctx) => items.filter(i => i.density < ctx.minDensity).map(i => i.id) },
    { id: 'solidity', name: 'SOLIDITY', rejectLabel: 'SOLID', execute: (items, ctx) => items.filter(i => i.density > (ctx.maxDensity || 0.75)).map(i => i.id) },
    {
        id: 'semantic', name: 'SEMANTIC', rejectLabel: 'MISMATCH',
        execute: (items, ctx) => {
            if (!ctx.useAI || !ctx.prompt) return [];
            const p = ctx.prompt.toLowerCase();
            const rejects = [];
            items.forEach(item => {
                let reject = false;
                const baseStep = item.config.find(s => s.typeDef.cat === 'GEN');
                const t = baseStep ? baseStep.params.p1 : -1;
                const isRound = t === 0 || t === 3; const isBox = t === 1 || t === 4; const isTri = t === 2 || t === 5;

                if ((p.includes('circle') || p.includes('round')) && (isBox || isTri)) reject = true;
                if ((p.includes('square') || p.includes('box')) && (isRound || isTri)) reject = true;
                if ((p.includes('triangle')) && (isRound || isBox)) reject = true;
                if (reject) rejects.push(item.id);
            });
            return rejects;
        }
    },
    {
        id: 'variance', name: 'VARIANCE', rejectLabel: 'DUPE',
        execute: (items, ctx) => {
            const rejects = [];
            const count = Math.floor(items.length * (ctx.strictness || 0.1));
            const ids = items.map(i => i.id);
            if (ids.length < 5) return [];
            for (let k = 0; k < count; k++) {
                const r = Math.floor(Math.random() * ids.length);
                if (!rejects.includes(ids[r])) rejects.push(ids[r]);
            }
            return rejects;
        }
    }
];

export const generateSemanticName = (item, existingNames) => {
    const config = item.config;
    const density = item.density;
    const simplicity = item.sScore;

    let category = "Particle";
    if (density > 0.8 || (simplicity > 0.9 && density > 0.5)) category = "Mask";
    else if (density < 0.1) category = "VFX";

    let shape = "Blob";
    const baseStep = config.find(s => s.typeDef.cat === 'GEN');
    if (baseStep) {
        const t = Math.round(baseStep.params.p1);
        if (t === 0) shape = "Circle";
        else if (t === 1) shape = "Square";
        else if (t === 2) shape = "Triangle";
        else if (t === 3) shape = "Ring";
        else if (t === 4) shape = "Frame";
        else if (t === 5) shape = "TriFrame";
    }

    let variant = "Standard";
    const avgPower = config.reduce((acc, s) => acc + s.universal.power, 0) / config.length;

    if (config.some(s => s.typeDef.id === 12)) variant = "Fractal";
    else if (config.some(s => s.typeDef.id === 13)) variant = "Swirl";
    else if (config.some(s => s.typeDef.id === 16)) variant = "Streak";
    else if (avgPower > 1.8) variant = "Hard";
    else if (avgPower < 0.8) variant = "Soft";
    else if (item.sScore < 0.3) variant = "Noisy";
    else if (density < 0.2) variant = "Faded";
    else variant = "Gradient";

    let coreName = `${category}_${shape}_${variant}`;
    let finalName = coreName;
    let counter = 1;
    while (existingNames.has(finalName)) {
        counter++;
        finalName = `${coreName}_v${counter.toString().padStart(2, '0')}`;
    }
    return finalName;
};
