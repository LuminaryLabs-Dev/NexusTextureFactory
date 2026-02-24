        const { useState, useEffect, useRef, useMemo, useCallback } = React;

        // ==========================================
        // 1. GLOBAL CONSTANTS & ENGINE CLASS
        // ==========================================

        const BLEND_MODES = [
            { id: 0, name: "Overwrite" },
            { id: 1, name: "Subtract" },
            { id: 2, name: "Multiply" },
            { id: 3, name: "Add" },
            { id: 4, name: "Max (Lighten)" },
            { id: 5, name: "Min (Darken)" }
        ];

        const VS_SOURCE = `attribute vec2 position; varying vec2 vUv; void main() { vUv = position * 0.5 + 0.5; gl_Position = vec4(position, 0.0, 1.0); }`;
        const FS_TEMPLATE = `precision mediump float; varying vec2 vUv; uniform sampler2D u_prevTexture; uniform vec2 u_resolution; uniform int u_stepType; uniform int u_blendMode; uniform float p1; uniform float p2; uniform float p3; uniform float p4; uniform float p5; uniform float p6; uniform float p7; uniform float u_power; uniform float u_mult; uniform float u_scale; uniform float u_offsetX; uniform float u_offsetY; uniform bool u_hasPrev; vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); } float snoise(vec2 v) { const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439); vec2 i  = floor(v + dot(v, C.yy) ); vec2 x0 = v -   i + dot(i, C.xx); vec2 i1; i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0); vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1; i = mod(i, 289.0); vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 )); vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0); m = m*m ; m = m*m ; vec3 x = 2.0 * fract(p * C.www) - 1.0; vec3 h = abs(x) - 0.5; vec3 ox = floor(x + 0.5); vec3 a0 = x - ox; m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h ); vec3 g; g.x  = a0.x  * x0.x  + h.x  * x0.y; g.yz = a0.yz * x12.xz + h.yz * x12.yw; return 130.0 * dot(m, g); } vec2 random2( vec2 p ) { return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453); } float worley(vec2 st, float jitter, bool invert) { vec2 i_st = floor(st); vec2 f_st = fract(st); float m_dist = 1.0; for (int y= -1; y <= 1; y++) { for (int x= -1; x <= 1; x++) { vec2 neighbor = vec2(float(x),float(y)); vec2 point = random2(i_st + neighbor); point = 0.5 + 0.5*sin(6.2831*point + jitter); vec2 diff = neighbor + point - f_st; float dist = length(diff); m_dist = min(m_dist, dist); } } return invert ? (1.0 - m_dist) : m_dist; } float samplePrev(vec2 uv) { if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return 0.0; return texture2D(u_prevTexture, uv).a; } float sdTriangle(vec2 p, float r) { const float k = sqrt(3.0); p.x = abs(p.x) - r; p.y = p.y + r / k; if(p.x + k*p.y > 0.0) p = vec2(p.x - k*p.y, -k*p.x - p.y)/2.0; p.x -= clamp( p.x, -2.0*r, 0.0 ); return -length(p)*sign(p.y); } float op_shape_sdf(vec2 uv, float type, float size) { vec2 p = (uv - 0.5) * 2.0; if (type < 0.5 || (type >= 2.5 && type < 3.5)) return length(p) - size; if ((type >= 0.5 && type < 1.5) || (type >= 3.5 && type < 4.5)) return max(abs(p.x), abs(p.y)) - size; if ((type >= 1.5 && type < 2.5) || type >= 4.5) return sdTriangle(p, size); return 0.0; } float op_base_shape(vec2 uv, float type, float size, float softness, float thickness) { float d = op_shape_sdf(uv, type, size); bool isWire = type >= 2.5; if (isWire) return 1.0 - smoothstep(thickness, thickness + max(0.001, softness), abs(d)); else return 1.0 - smoothstep(0.0, max(0.001, softness), d); } float op_gradient(vec2 uv, float angle) { float rad = radians(angle); vec2 dir = vec2(cos(rad), sin(rad)); float v = dot(uv - 0.5, dir) + 0.5; return clamp(v, 0.0, 1.0); } float op_perlin(vec2 uv, float scale, float seed, float octaves, float rolloff, float offx, float offy) { vec2 p = (uv + vec2(offx, offy)) * scale + vec2(seed * 17.0, seed * 9.3); float total = 0.0; float amp = 1.0; float maxAmp = 0.0; for(int i = 0; i < 8; i++) { if (float(i) >= octaves) break; total += snoise(p) * amp; maxAmp += amp; p *= 2.0; amp *= rolloff; } float n = total / maxAmp; return n * 0.5 + 0.5; } float op_worley(vec2 uv, float scale, float seed, float jitter, float invert, float offx, float offy) { vec2 p = (uv + vec2(offx, offy)) * scale + vec2(seed * 5.2, seed * 1.4); return worley(p, jitter, invert > 0.5); } float op_vignette(vec2 uv, float shape, float size, float softness) { float d_circle = length(uv - 0.5); float d_square = max(abs(uv.x - 0.5), abs(uv.y - 0.5)); float d = mix(d_circle, d_square, step(0.5, shape)); return 1.0 - smoothstep(size - softness, size, d); } float op_smear(vec2 uv, float angle, float strength) { float rad = radians(angle); vec2 dir = vec2(cos(rad), sin(rad)); float total = 0.0; float count = 8.0; for(float i = 0.0; i < 8.0; i++) { float t = (i / (count - 1.0)) - 0.5; vec2 offset = dir * strength * t; total += samplePrev(uv + offset); } return total / count; } vec2 apply_spiral(vec2 uv, float twist, float cx, float cy) { vec2 center = vec2(cx, cy); vec2 d = uv - center; float r = length(d); float a = atan(d.y, d.x); a += twist * (1.0 - smoothstep(0.0, 1.0, r)) * 6.28; return center + vec2(cos(a), sin(a)) * r; } vec2 apply_fractal(vec2 uv, float segments) { vec2 d = uv - 0.5; float r = length(d); float a = atan(d.y, d.x); float seg = 6.2831 / segments; a = mod(a, seg); a = abs(a - seg/2.0); return vec2(0.5) + vec2(cos(a), sin(a)) * r; } void main() { vec2 uv = vUv; float prevAlpha = texture2D(u_prevTexture, uv).a; if (!u_hasPrev) prevAlpha = 0.0; vec2 opUV = (uv - 0.5) / max(0.001, u_scale) + 0.5 - vec2(u_offsetX, u_offsetY); float currentAlpha = 0.0; vec2 modUv = opUV; if (u_stepType == 12) { modUv = apply_fractal(opUV, p1); float val = samplePrev(modUv); val = clamp(pow(val, u_power) * u_mult, 0.0, 1.0); gl_FragColor = vec4(1.0, 1.0, 1.0, val); return; } if (u_stepType == 13) { modUv = apply_spiral(opUV, p1, p4, p5); float val = samplePrev(modUv); val = clamp(pow(val, u_power) * u_mult, 0.0, 1.0); gl_FragColor = vec4(1.0, 1.0, 1.0, val); return; } if (u_stepType == 16) { float val = op_smear(opUV, p1, p2); val = clamp(pow(val, u_power) * u_mult, 0.0, 1.0); gl_FragColor = vec4(1.0, 1.0, 1.0, val); return; } if (u_stepType == 1) currentAlpha = op_base_shape(opUV, p1, p2, p3, p4); else if (u_stepType == 3) currentAlpha = op_gradient(opUV, p1); else if (u_stepType == 4) currentAlpha = op_perlin(opUV, p1, p2, p3, p4, p6, p7); else if (u_stepType == 5) currentAlpha = op_worley(opUV, p1, p2, p3, p4, p6, p7); else if (u_stepType == 11) { currentAlpha = step(p1, samplePrev(opUV)); currentAlpha = clamp(pow(currentAlpha, u_power) * u_mult, 0.0, 1.0); gl_FragColor = vec4(1.0, 1.0, 1.0, currentAlpha); return; } else if (u_stepType == 14) currentAlpha = op_vignette(opUV, p1, p2, p3); else if (u_stepType == 15) currentAlpha = samplePrev(opUV); currentAlpha = clamp(pow(currentAlpha, u_power) * u_mult, 0.0, 1.0); float finalAlpha = prevAlpha; if (u_blendMode == 0) finalAlpha = currentAlpha; else if (u_blendMode == 1) finalAlpha = max(0.0, prevAlpha - currentAlpha); else if (u_blendMode == 2) finalAlpha = prevAlpha * currentAlpha; else if (u_blendMode == 3) finalAlpha = min(1.0, prevAlpha + currentAlpha); else if (u_blendMode == 4) finalAlpha = max(prevAlpha, currentAlpha); else if (u_blendMode == 5) finalAlpha = min(prevAlpha, currentAlpha); gl_FragColor = vec4(1.0, 1.0, 1.0, finalAlpha); }`;

        const STEP_TYPES = {
            BASE_SHAPE: { id: 1, name: "Base Shape", cat: "GEN", params: { p1: 0, p2: 0.8, p3: 0.02, p4: 0.05, p5: 0, p6: 0, p7: 0 }, controls: [{ key: 'p1', label: "Type", type: 'select', options: [{ label: "Circle", value: 0 }, { label: "Square", value: 1 }, { label: "Triangle", value: 2 }, { label: "Wire Circle", value: 3 }, { label: "Wire Square", value: 4 }, { label: "Wire Triangle", value: 5 }] }, { key: 'p2', label: "Size", type: 'slider', min: 0, max: 1, step: 0.01 }, { key: 'p3', label: "Softness", type: 'slider', min: 0, max: 1, step: 0.01 }, { key: 'p4', label: "Thickness", type: 'slider', min: 0, max: 0.5, step: 0.01 }] },
            BASE_GRAD: { id: 3, name: "Gradient", cat: "GEN", params: { p1: 0, p2: 0, p3: 0, p4: 0, p5: 0, p6: 0, p7: 0 }, controls: [{ key: 'p1', label: "Angle", type: 'slider', min: 0, max: 360, step: 1 }] },
            NOISE_PERLIN: { id: 4, name: "Perlin Noise", cat: "ERODE", params: { p1: 4.0, p2: 123, p3: 4, p4: 0.5, p5: 0, p6: 0, p7: 0 }, controls: [{ key: 'p1', label: "Scale", type: 'slider', min: 0, max: 10, step: 0.1 }, { key: 'p2', label: "Seed", type: 'slider', min: 0, max: 9999, step: 1 }, { key: 'p3', label: "Octaves", type: 'slider', min: 1, max: 8, step: 1 }, { key: 'p4', label: "Rolloff", type: 'slider', min: 0, max: 1, step: 0.01 }, { key: 'p6', label: "Offset X", type: 'slider', min: -1, max: 1, step: 0.01 }, { key: 'p7', label: "Offset Y", type: 'slider', min: -1, max: 1, step: 0.01 }] },
            NOISE_WORLEY: { id: 5, name: "Worley Noise", cat: "ERODE", params: { p1: 4.0, p2: 456, p3: 1, p4: 0, p5: 0, p6: 0, p7: 0 }, controls: [{ key: 'p1', label: "Scale", type: 'slider', min: 0, max: 10, step: 0.1 }, { key: 'p2', label: "Seed", type: 'slider', min: 0, max: 9999, step: 1 }, { key: 'p3', label: "Jitter", type: 'slider', min: 0, max: 2, step: 0.1 }, { key: 'p4', label: "Invert", type: 'slider', min: 0, max: 1, step: 1 }, { key: 'p6', label: "Offset X", type: 'slider', min: -1, max: 1, step: 0.01 }, { key: 'p7', label: "Offset Y", type: 'slider', min: -1, max: 1, step: 0.01 }] },
            THRESHOLD: { id: 11, name: "Threshold", cat: "FILT", params: { p1: 0.5, p2: 0, p3: 0, p4: 0, p5: 0, p6: 0, p7: 0 }, controls: [{ key: 'p1', label: "Cutoff", type: 'slider', min: 0, max: 1, step: 0.01 }] },
            FRACTAL: { id: 12, name: "Fractalize", cat: "MOD", params: { p1: 6.0, p2: 0, p3: 0, p4: 0, p5: 0, p6: 0, p7: 0 }, controls: [{ key: 'p1', label: "Segments", type: 'slider', min: 1, max: 16, step: 1 }] },
            SPIRAL: { id: 13, name: "Spiral", cat: "MOD", params: { p1: 0.5, p2: 0, p3: 0, p4: 0.5, p5: 0.5, p6: 0, p7: 0 }, controls: [{ key: 'p1', label: "Twist", type: 'slider', min: 0, max: 2, step: 0.01 }, { key: 'p4', label: "Center X", type: 'slider', min: 0, max: 1, step: 0.01 }, { key: 'p5', label: "Center Y", type: 'slider', min: 0, max: 1, step: 0.01 }] },
            VIGNETTE: { id: 14, name: "Vignette", cat: "MOD", params: { p1: 0.0, p2: 0.45, p3: 0.2, p4: 0, p5: 0, p6: 0, p7: 0 }, controls: [{ key: 'p1', label: "Shape", type: 'select', options: [{ label: "Circle", value: 0 }, { label: "Square", value: 1 }] }, { key: 'p2', label: "Size", type: 'slider', min: 0, max: 1, step: 0.01 }, { key: 'p3', label: "Softness", type: 'slider', min: 0, max: 1, step: 0.01 }] },
            BASIC: { id: 15, name: "Basic / Note", cat: "UTIL", params: { p1: 0, p2: 0, p3: 0, p4: 0, p5: 0, p6: 0, p7: 0 }, controls: [] },
            SMEAR: { id: 16, name: "Smear", cat: "MOD", params: { p1: 0, p2: 0.1, p3: 0, p4: 0, p5: 0, p6: 0, p7: 0 }, controls: [{ key: 'p1', label: "Angle", type: 'slider', min: 0, max: 360, step: 1 }, { key: 'p2', label: "Strength", type: 'slider', min: 0, max: 1, step: 0.01 }] },
            DOMAIN_WARP: { id: 101, name: "Domain Warp", cat: "MOD", customOpType: "shader", customCode: "float hash21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); } float noise2(vec2 p){ vec2 i = floor(p); vec2 f = fract(p); float a = hash21(i); float b = hash21(i + vec2(1.0, 0.0)); float c = hash21(i + vec2(0.0, 1.0)); float d = hash21(i + vec2(1.0, 1.0)); vec2 u = f * f * (3.0 - 2.0 * f); return mix(mix(a, b, u.x), mix(c, d, u.x), u.y); } float customOp(vec2 uv){ vec2 p = uv * max(0.001, p1) + vec2(p2 * 0.013, p2 * 0.029); float nx = noise2(p + vec2(12.3, 3.7)); float ny = noise2(p + vec2(4.1, 17.0)); vec2 warp = (vec2(nx, ny) - 0.5) * 2.0 * p3 * 0.2; return samplePrev(uv + warp); }", params: { p1: 4.0, p2: 123, p3: 0.35, p4: 0, p5: 0, p6: 0, p7: 0 }, controls: [{ key: 'p1', label: "Warp Scale", type: 'slider', min: 0, max: 10, step: 0.1 }, { key: 'p2', label: "Seed", type: 'slider', min: 0, max: 9999, step: 1 }, { key: 'p3', label: "Warp Strength", type: 'slider', min: 0, max: 1, step: 0.01 }] },
            RADIAL_WARP: { id: 102, name: "Radial Warp", cat: "MOD", customOpType: "shader", customCode: "float customOp(vec2 uv){ vec2 c = vec2(p4, p5); vec2 d = uv - c; float r = length(d); float radius = max(0.001, p3); if (r > radius) return samplePrev(uv); float mode = floor(p1 + 0.5); vec2 outUv = uv; if (mode < 0.5) { float a = atan(d.y, d.x); float t = 1.0 - (r / radius); a += p2 * t * 6.2831853; outUv = c + vec2(cos(a), sin(a)) * r; } else { float k = p2 * (1.0 - r / radius); float scale = (mode < 1.5) ? (1.0 - k) : (1.0 + k); outUv = c + d * max(0.001, scale); } return samplePrev(outUv); }", params: { p1: 0, p2: 0.5, p3: 0.5, p4: 0.5, p5: 0.5, p6: 0, p7: 0 }, controls: [{ key: 'p1', label: "Mode", type: 'select', options: [{ label: "Twirl", value: 0 }, { label: "Pinch", value: 1 }, { label: "Bulge", value: 2 }] }, { key: 'p2', label: "Strength", type: 'slider', min: -2, max: 2, step: 0.01 }, { key: 'p3', label: "Radius", type: 'slider', min: 0, max: 1, step: 0.01 }, { key: 'p4', label: "Center X", type: 'slider', min: 0, max: 1, step: 0.01 }, { key: 'p5', label: "Center Y", type: 'slider', min: 0, max: 1, step: 0.01 }] },
            KALEIDOSCOPE_PLUS: { id: 103, name: "Kaleidoscope", cat: "MOD", customOpType: "shader", customCode: "float customOp(vec2 uv){ vec2 d = uv - 0.5; float r = length(d); float a = atan(d.y, d.x) + radians(p2); float seg = 6.2831853 / max(1.0, p1); a = mod(a, seg); if (p3 > 0.5) a = abs(a - seg * 0.5); vec2 outUv = vec2(0.5) + vec2(cos(a), sin(a)) * r; return samplePrev(outUv); }", params: { p1: 6, p2: 0, p3: 1, p4: 0, p5: 0, p6: 0, p7: 0 }, controls: [{ key: 'p1', label: "Segments", type: 'slider', min: 1, max: 32, step: 1 }, { key: 'p2', label: "Rotation", type: 'slider', min: 0, max: 360, step: 1 }, { key: 'p3', label: "Mirror", type: 'slider', min: 0, max: 1, step: 1 }] },
            MORPH_DILATE_ERODE: { id: 104, name: "Morph Dilate/Erode", cat: "FILT", customOpType: "shader", customCode: "float customOp(vec2 uv){ float mode = floor(p1 + 0.5); int radius = int(clamp(floor(p2 + 0.5), 0.0, 8.0)); vec2 texel = 1.0 / max(vec2(1.0), u_resolution); float outA = (mode < 0.5) ? 0.0 : 1.0; for (int y = -8; y <= 8; y++) { for (int x = -8; x <= 8; x++) { if (abs(x) > radius || abs(y) > radius) continue; float a = samplePrev(uv + vec2(float(x), float(y)) * texel); if (mode < 0.5) outA = max(outA, a); else outA = min(outA, a); } } return outA; }", params: { p1: 0, p2: 2, p3: 0, p4: 0, p5: 0, p6: 0, p7: 0 }, controls: [{ key: 'p1', label: "Mode", type: 'select', options: [{ label: "Dilate", value: 0 }, { label: "Erode", value: 1 }] }, { key: 'p2', label: "Radius (px)", type: 'slider', min: 0, max: 8, step: 1 }] },
            MORPH_OPEN_CLOSE: { id: 105, name: "Morph Open/Close", cat: "FILT", customOpType: "shader", customCode: "float morphDilate(vec2 uv, int r, vec2 texel){ float outA = 0.0; for (int y = -8; y <= 8; y++) for (int x = -8; x <= 8; x++) { if (abs(x) > r || abs(y) > r) continue; outA = max(outA, samplePrev(uv + vec2(float(x), float(y)) * texel)); } return outA; } float morphErode(vec2 uv, int r, vec2 texel){ float outA = 1.0; for (int y = -8; y <= 8; y++) for (int x = -8; x <= 8; x++) { if (abs(x) > r || abs(y) > r) continue; outA = min(outA, samplePrev(uv + vec2(float(x), float(y)) * texel)); } return outA; } float customOp(vec2 uv){ float mode = floor(p1 + 0.5); int r = int(clamp(floor(p2 + 0.5), 0.0, 8.0)); vec2 texel = 1.0 / max(vec2(1.0), u_resolution); if (mode < 0.5) return morphDilate(uv, r, texel); return morphErode(uv, r, texel); }", params: { p1: 0, p2: 2, p3: 0, p4: 0, p5: 0, p6: 0, p7: 0 }, controls: [{ key: 'p1', label: "Mode", type: 'select', options: [{ label: "Open (Smooth)", value: 0 }, { label: "Close (Fill)", value: 1 }] }, { key: 'p2', label: "Radius (px)", type: 'slider', min: 0, max: 8, step: 1 }] },
            EDGE_SOBEL: { id: 106, name: "Edge Detect", cat: "FILT", customOpType: "shader", customCode: "float customOp(vec2 uv){ vec2 t = 1.0 / max(vec2(1.0), u_resolution); float tl = samplePrev(uv + vec2(-t.x, -t.y)); float tc = samplePrev(uv + vec2(0.0, -t.y)); float tr = samplePrev(uv + vec2(t.x, -t.y)); float ml = samplePrev(uv + vec2(-t.x, 0.0)); float mr = samplePrev(uv + vec2(t.x, 0.0)); float bl = samplePrev(uv + vec2(-t.x, t.y)); float bc = samplePrev(uv + vec2(0.0, t.y)); float br = samplePrev(uv + vec2(t.x, t.y)); float gx = -tl - 2.0 * ml - bl + tr + 2.0 * mr + br; float gy = -tl - 2.0 * tc - tr + bl + 2.0 * bc + br; float g = length(vec2(gx, gy)) * p1; float a = smoothstep(p2, p2 + 0.05, g); if (p3 > 0.5) a = 1.0 - a; return clamp(a, 0.0, 1.0); }", params: { p1: 1.0, p2: 0.1, p3: 0, p4: 0, p5: 0, p6: 0, p7: 0 }, controls: [{ key: 'p1', label: "Strength", type: 'slider', min: 0, max: 5, step: 0.05 }, { key: 'p2', label: "Threshold", type: 'slider', min: 0, max: 1, step: 0.01 }, { key: 'p3', label: "Invert", type: 'slider', min: 0, max: 1, step: 1 }] },
            OUTLINE_ALPHA: { id: 107, name: "Outline", cat: "FILT", customOpType: "shader", customCode: "float customOp(vec2 uv){ vec2 t = 1.0 / max(vec2(1.0), u_resolution); float center = samplePrev(uv); float radius = clamp(p1, 0.0, 8.0); float maxN = 0.0; float minN = 1.0; for (int y = -8; y <= 8; y++) for (int x = -8; x <= 8; x++) { float dx = float(x); float dy = float(y); if (sqrt(dx*dx + dy*dy) > radius) continue; float a = samplePrev(uv + vec2(dx, dy) * t); maxN = max(maxN, a); minN = min(minN, a); } float outer = max(0.0, maxN - center); float inner = max(0.0, center - minN); float mode = floor(p3 + 0.5); float outA = outer; if (mode > 0.5 && mode < 1.5) outA = inner; if (mode >= 1.5) outA = max(outer, inner); return smoothstep(0.0, max(0.001, p2), outA); }", params: { p1: 2.0, p2: 0.1, p3: 2, p4: 0, p5: 0, p6: 0, p7: 0 }, controls: [{ key: 'p1', label: "Thickness (px)", type: 'slider', min: 0, max: 8, step: 1 }, { key: 'p2', label: "Softness", type: 'slider', min: 0.01, max: 1, step: 0.01 }, { key: 'p3', label: "Mode", type: 'select', options: [{ label: "Outer", value: 0 }, { label: "Inner", value: 1 }, { label: "Both", value: 2 }] }] },
            POSTERIZE_ALPHA: { id: 108, name: "Posterize Alpha", cat: "FILT", customOpType: "shader", customCode: "float customOp(vec2 uv){ float a = samplePrev(uv); float steps = max(2.0, floor(p1 + 0.5)); a = clamp(a + p2, 0.0, 1.0); return floor(a * (steps - 1.0) + 0.5) / (steps - 1.0); }", params: { p1: 4, p2: 0, p3: 0, p4: 0, p5: 0, p6: 0, p7: 0 }, controls: [{ key: 'p1', label: "Steps", type: 'slider', min: 2, max: 16, step: 1 }, { key: 'p2', label: "Bias", type: 'slider', min: -1, max: 1, step: 0.01 }] },
            DISTANCE_BANDS: { id: 109, name: "Distance Bands", cat: "FILT", customOpType: "shader", customCode: "float customOp(vec2 uv){ float a = samplePrev(uv); vec2 t = 1.0 / max(vec2(1.0), u_resolution); float sum = 0.0; float count = 0.0; for (int y = -2; y <= 2; y++) for (int x = -2; x <= 2; x++) { sum += samplePrev(uv + vec2(float(x), float(y)) * t); count += 1.0; } float avg = sum / max(1.0, count); float edge = abs(a - avg); float phase = fract(edge * max(1.0, p1) + p4); float band = smoothstep(p2, p2 + max(0.001, p3), phase) - smoothstep(p2 + p3, p2 + p3 + max(0.001, p3), phase); return clamp(band, 0.0, 1.0); }", params: { p1: 8, p2: 0.3, p3: 0.1, p4: 0.0, p5: 0, p6: 0, p7: 0 }, controls: [{ key: 'p1', label: "Frequency", type: 'slider', min: 1, max: 64, step: 1 }, { key: 'p2', label: "Band Start", type: 'slider', min: 0, max: 1, step: 0.01 }, { key: 'p3', label: "Band Width", type: 'slider', min: 0.01, max: 0.5, step: 0.01 }, { key: 'p4', label: "Phase", type: 'slider', min: 0, max: 1, step: 0.01 }] },
            LIBRARY_STAMP_SCATTER: { id: 110, name: "Library Stamp/Scatter", cat: "MOD", customOpType: "shader", customCode: "float hash1(float n){ return fract(sin(n) * 43758.5453123); } float customOp(vec2 uv){ float count = clamp(floor(p1 + 0.5), 1.0, 16.0); float jitter = p2; float sMin = max(0.05, p3); float sMax = max(sMin, p4); float seed = p5 * 13.17; float outA = 0.0; for (int i = 0; i < 16; i++) { if (float(i) >= count) break; float fi = float(i) + seed; vec2 c = vec2(hash1(fi * 1.7), hash1(fi * 2.3)); c = mix(vec2(0.5), c, jitter); float s = mix(sMin, sMax, hash1(fi * 3.1)); vec2 suv = (uv - c) / s + 0.5; outA = max(outA, sampleLibrary(suv)); } return outA; }", params: { p1: 8, p2: 1.0, p3: 0.2, p4: 0.8, p5: 123, p6: 0, p7: 0 }, controls: [{ key: 'p1', label: "Count", type: 'slider', min: 1, max: 16, step: 1 }, { key: 'p2', label: "Jitter", type: 'slider', min: 0, max: 1, step: 0.01 }, { key: 'p3', label: "Scale Min", type: 'slider', min: 0.05, max: 2, step: 0.01 }, { key: 'p4', label: "Scale Max", type: 'slider', min: 0.05, max: 2, step: 0.01 }, { key: 'p5', label: "Seed", type: 'slider', min: 0, max: 9999, step: 1 }] },
            LIBRARY_DISPLACE: { id: 111, name: "Library Displace", cat: "MOD", customOpType: "shader", customCode: "float customOp(vec2 uv){ vec2 p = uv * max(0.001, p2) + vec2(p3 * 0.01, p3 * 0.03); float ax = sampleLibrary(p + vec2(0.13, 0.37)); float ay = sampleLibrary(p + vec2(0.71, 0.19)); vec2 d = (vec2(ax, ay) - 0.5) * 2.0 * p1 * 0.2; return samplePrev(uv + d); }", params: { p1: 0.35, p2: 3.0, p3: 123, p4: 0, p5: 0, p6: 0, p7: 0 }, controls: [{ key: 'p1', label: "Strength", type: 'slider', min: 0, max: 1, step: 0.01 }, { key: 'p2', label: "Scale", type: 'slider', min: 0, max: 10, step: 0.1 }, { key: 'p3', label: "Seed", type: 'slider', min: 0, max: 9999, step: 1 }] }
        };

        const STEP_MENU_GROUPS = [
            { label: "GENERATORS", keys: ['BASE_SHAPE', 'BASE_GRAD'] },
            { label: "NOISE / ERODE", keys: ['NOISE_PERLIN', 'NOISE_WORLEY'] },
            { label: "FILTERS", keys: ['THRESHOLD', 'MORPH_DILATE_ERODE', 'MORPH_OPEN_CLOSE', 'EDGE_SOBEL', 'OUTLINE_ALPHA', 'POSTERIZE_ALPHA', 'DISTANCE_BANDS'] },
            { label: "MODIFIERS", keys: ['FRACTAL', 'SPIRAL', 'VIGNETTE', 'SMEAR', 'DOMAIN_WARP', 'RADIAL_WARP', 'KALEIDOSCOPE_PLUS', 'LIBRARY_STAMP_SCATTER', 'LIBRARY_DISPLACE'] },
            { label: "UTILITY", keys: ['BASIC'] }
        ];

        const OPERATION_EXPLANATIONS = {
            BASE_SHAPE: "Creates a base alpha shape (filled or wireframe circle/square/triangle).",
            BASE_GRAD: "Creates a directional gradient alpha mask using angle.",
            NOISE_PERLIN: "Applies smooth fractal Perlin noise for organic breakup.",
            NOISE_WORLEY: "Applies cellular/Worley noise for chunky or crack-like breakup.",
            THRESHOLD: "Converts soft alpha into hard black/white regions at a cutoff.",
            FRACTAL: "Repeats radial wedges to create kaleidoscope/fractal symmetry.",
            SPIRAL: "Warps source alpha around a center point with spiral twist.",
            VIGNETTE: "Fades edges inward with circular or square falloff.",
            BASIC: "Pass-through utility step for notes or simple pipeline placeholders.",
            SMEAR: "Directional blur/smear sampled along an angle and strength.",
            DOMAIN_WARP: "Warps alpha sampling coordinates using procedural noise vectors.",
            RADIAL_WARP: "Applies twirl, pinch, or bulge radial transform to alpha.",
            KALEIDOSCOPE_PLUS: "Mirrors angular wedges for kaleidoscope symmetry.",
            MORPH_DILATE_ERODE: "Expands or shrinks alpha regions by neighborhood sampling.",
            MORPH_OPEN_CLOSE: "Smooths or fills alpha masks using morphology passes.",
            EDGE_SOBEL: "Extracts edge alpha from gradient magnitude.",
            OUTLINE_ALPHA: "Creates inner/outer outlines from alpha boundaries.",
            POSTERIZE_ALPHA: "Quantizes alpha into discrete stepped levels.",
            DISTANCE_BANDS: "Builds contour-like alpha bands from local distance cues.",
            LIBRARY_STAMP_SCATTER: "Scatters repeated alpha stamps with randomized placement/scale.",
            LIBRARY_DISPLACE: "Displaces alpha sampling based on alpha-derived vectors."
        };

        const DEFAULT_CUSTOM_GLSL = `float customOp(vec2 uv) {
    vec2 p = uv - 0.5;
    float d = length(p);
    return 1.0 - smoothstep(0.2, 0.45, d);
}`;

        const DEFAULT_CUSTOM_JS = `// Return alpha from 0.0 to 1.0
const cx = 0.5;
const cy = 0.5;
const dx = uvx - cx;
const dy = uvy - cy;
const d = Math.sqrt(dx * dx + dy * dy);
return Math.max(0, Math.min(1, 1 - d * 2.2));`;

        const MAX_GENERATION_WORKERS = 5;
        const MAX_PACKAGING_WORKERS = 5;
        const MAX_DELETE_HISTORY = 10;
        const FILTER_MODULE_KEYS = ['NOISE_PERLIN', 'NOISE_WORLEY', 'THRESHOLD', 'FRACTAL', 'SPIRAL', 'SMEAR', 'VIGNETTE', 'DOMAIN_WARP', 'RADIAL_WARP', 'KALEIDOSCOPE_PLUS', 'MORPH_DILATE_ERODE', 'MORPH_OPEN_CLOSE', 'EDGE_SOBEL', 'OUTLINE_ALPHA', 'POSTERIZE_ALPHA', 'DISTANCE_BANDS', 'LIBRARY_STAMP_SCATTER', 'LIBRARY_DISPLACE'];
        const TEXTURE_DB_NAME = 'alphacarve-texture-cache';
        const TEXTURE_DB_STORE = 'textures';
        const META_KEY_LIBRARY = 'alphacarve-meta-library-v1';
        const META_KEY_CUSTOM_OPS = 'alphacarve-meta-custom-ops-v1';
        const META_KEY_FILTER_MODULES = 'alphacarve-meta-filter-modules-v1';
        const META_KEY_QUALITY_FILTERS = 'alphacarve-meta-quality-filters-v1';
        const META_KEY_DREAM_PARAMS = 'alphacarve-meta-dream-params-v1';
        const META_KEY_UI_PREFS = 'alphacarve-meta-ui-prefs-v1';
        const META_KEY_PACK_CONFIG = 'alphacarve-meta-pack-config-v1';
        const META_KEY_FLIPBOOK_CONFIG = 'alphacarve-meta-flipbook-config-v1';

        const getDefaultBlendForCategory = (cat) => {
            if (cat === 'GEN') return 0;
            if (cat === 'ERODE') return 1;
            return 2;
        };

        const createDefaultFilterModules = () => FILTER_MODULE_KEYS.map((key, idx) => {
            const td = STEP_TYPES[key];
            return {
                id: `fm-${key}-${idx}`,
                key,
                enabled: false,
                expanded: false,
                blendMode: getDefaultBlendForCategory(td.cat),
                params: { ...td.params },
                universal: { power: 1.0, mult: 1.0, scale: 1.0, offsetX: 0.0, offsetY: 0.0 }
            };
        });

        const STEP_TYPE_KEY_BY_ID = Object.entries(STEP_TYPES).reduce((acc, [key, value]) => {
            acc[value.id] = key;
            return acc;
        }, {});

        const createDefaultFlipbookConfig = () => {
            const operations = {};
            Object.entries(STEP_TYPES).forEach(([key, td]) => {
                const params = {};
                td.controls.forEach((c) => {
                    if (c.type !== 'slider') return;
                    const isAngle = /angle/i.test(c.label || '');
                    const span = Number(c.max) - Number(c.min);
                    params[c.key] = {
                        enabled: false,
                        range: isAngle ? 24 : Math.max(0.01, span * 0.08),
                        speed: 1.0,
                        phase: 0.0,
                        wave: 'wrap'
                    };
                });
                operations[key] = {
                    enabled: false,
                    expanded: false,
                    speed: 1.0,
                    wave: 'wrap',
                    universal: {
                        mult: { enabled: false, range: 0.05, speed: 1.0, phase: 0.11, wave: 'wrap' },
                        scale: { enabled: false, range: 0.02, speed: 1.0, phase: 0.29, wave: 'wrap' }
                    },
                    params
                };
            });

            const turnOn = (opKey, paramKey, range, speed = 1.0, wave = 'wrap', phase = 0.0) => {
                const op = operations[opKey];
                if (!op) return;
                op.enabled = true;
                if (paramKey === 'mult' || paramKey === 'scale') {
                    op.universal[paramKey] = { enabled: true, range, speed, phase, wave };
                    return;
                }
                if (!op.params[paramKey]) return;
                op.params[paramKey] = { enabled: true, range, speed, phase, wave };
            };

            turnOn('NOISE_PERLIN', 'p6', 0.35);
            turnOn('NOISE_PERLIN', 'p7', 0.35, 1.0, 'wrap', 0.17);
            turnOn('NOISE_WORLEY', 'p6', 0.28);
            turnOn('NOISE_WORLEY', 'p7', 0.28, 1.0, 'wrap', 0.17);
            turnOn('SPIRAL', 'p1', 0.16, 1.0, 'pingpong');
            turnOn('SMEAR', 'p2', 0.06, 0.8, 'pingpong');
            turnOn('DOMAIN_WARP', 'p3', 0.08, 0.9, 'pingpong');
            turnOn('RADIAL_WARP', 'p2', 0.2, 0.8, 'pingpong');
            turnOn('LIBRARY_DISPLACE', 'p1', 0.08, 0.8, 'pingpong');
            turnOn('NOISE_PERLIN', 'mult', 0.02, 1.0, 'wrap', 0.11);
            turnOn('NOISE_PERLIN', 'scale', 0.01, 1.0, 'wrap', 0.29);
            turnOn('NOISE_WORLEY', 'mult', 0.02, 1.0, 'wrap', 0.11);
            turnOn('NOISE_WORLEY', 'scale', 0.01, 1.0, 'wrap', 0.29);

            return {
                global: {
                    enabled: true,
                    frameCount: 16,
                    strength: 1.0,
                    baseSpeed: 1.0,
                    seedMode: 'stable'
                },
                quality: {
                    enabled: true,
                    minFrameDensity: 0.03,
                    maxEmptyFrameRatio: 0.25,
                    minFrameDelta: 0.008,
                    maxFrameDelta: 0.2
                },
                operations
            };
        };

        let textureDbPromise = null;
        const getTextureDb = () => {
            if (textureDbPromise) return textureDbPromise;
            textureDbPromise = new Promise((resolve, reject) => {
                const req = indexedDB.open(TEXTURE_DB_NAME, 1);
                req.onupgradeneeded = () => {
                    const db = req.result;
                    if (!db.objectStoreNames.contains(TEXTURE_DB_STORE)) {
                        db.createObjectStore(TEXTURE_DB_STORE);
                    }
                };
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => reject(req.error);
            });
            return textureDbPromise;
        };

        const storeTextureBlob = async (key, blob) => {
            const db = await getTextureDb();
            await new Promise((resolve, reject) => {
                const tx = db.transaction(TEXTURE_DB_STORE, 'readwrite');
                tx.objectStore(TEXTURE_DB_STORE).put(blob, key);
                tx.oncomplete = () => resolve();
                tx.onerror = () => reject(tx.error);
            });
        };

        const loadTextureBlob = async (key) => {
            const db = await getTextureDb();
            return await new Promise((resolve, reject) => {
                const tx = db.transaction(TEXTURE_DB_STORE, 'readonly');
                const req = tx.objectStore(TEXTURE_DB_STORE).get(key);
                req.onsuccess = () => resolve(req.result || null);
                req.onerror = () => reject(req.error);
            });
        };

        const deleteTextureBlob = async (key) => {
            const db = await getTextureDb();
            await new Promise((resolve, reject) => {
                const tx = db.transaction(TEXTURE_DB_STORE, 'readwrite');
                tx.objectStore(TEXTURE_DB_STORE).delete(key);
                tx.oncomplete = () => resolve();
                tx.onerror = () => reject(tx.error);
            });
        };

        const dataUrlToBlob = async (dataUrl) => {
            const res = await fetch(dataUrl);
            return await res.blob();
        };

        const formatBytes = (bytes) => {
            if (!bytes || bytes <= 0) return '0 B';
            const units = ['B', 'KB', 'MB', 'GB', 'TB'];
            const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
            const value = bytes / Math.pow(1024, i);
            return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
        };

        const clamp01 = (value) => Math.max(0, Math.min(1, value));
        const ANIMATION_MODES = ['wrap', 'loop', 'pingpong'];

        const hashStringToInt = (value) => {
            const s = String(value || '');
            let h = 2166136261 >>> 0;
            for (let i = 0; i < s.length; i++) {
                h ^= s.charCodeAt(i);
                h = Math.imul(h, 16777619);
            }
            return h >>> 0;
        };

        const pickAnimationMode = (seed, stepIndex, propertyKey) => {
            const h = hashStringToInt(`${seed}|${stepIndex}|${propertyKey}`);
            return ANIMATION_MODES[h % ANIMATION_MODES.length];
        };

        const animationWave = (mode, t01) => {
            const t = ((t01 % 1) + 1) % 1;
            if (mode === 'wrap') return Math.sin(t * Math.PI * 2);
            if (mode === 'loop') return t;
            // pingpong
            return t < 0.5 ? t * 2 : (1 - t) * 2;
        };

        const resolveStepKey = (step) => {
            if (!step?.typeDef) return null;
            if (step.typeKey) return step.typeKey;
            return STEP_TYPE_KEY_BY_ID[step.typeDef.id] || null;
        };

        const findControlForParam = (stepKey, paramKey) => {
            const td = stepKey ? STEP_TYPES[stepKey] : null;
            if (!td || !Array.isArray(td.controls)) return null;
            return td.controls.find((c) => c.key === paramKey) || null;
        };

        const clampToControl = (value, control) => {
            if (!control || control.type !== 'slider') return value;
            return Math.max(Number(control.min), Math.min(Number(control.max), value));
        };

        const buildAnimatedConfigFrame = (baseConfig, frameIndex, totalFrames, seed = 'default', flipbookConfig) => {
            if (!Array.isArray(baseConfig)) return [];
            const fbGlobal = flipbookConfig?.global || {};
            if (frameIndex <= 0 || totalFrames <= 1 || fbGlobal.enabled === false) {
                return JSON.parse(JSON.stringify(baseConfig));
            }
            const t = frameIndex / Math.max(1, totalFrames - 1);
            const baseStrength = Number(fbGlobal.strength ?? 1.0);
            const baseSpeed = Number(fbGlobal.baseSpeed ?? 1.0);
            return baseConfig.map((s, idx) => {
                if (idx === 0 || idx === baseConfig.length - 1) return s;
                const nextParams = { ...s.params };
                const nextUniversal = { ...s.universal };
                const stepKey = resolveStepKey(s);
                const opCfg = (stepKey && flipbookConfig?.operations?.[stepKey]) ? flipbookConfig.operations[stepKey] : null;
                if (!opCfg || !opCfg.enabled) return { ...s, params: nextParams, universal: nextUniversal };

                Object.keys(nextParams).forEach((paramKey) => {
                    const pCfg = opCfg.params?.[paramKey];
                    if (!pCfg || !pCfg.enabled) return;
                    const waveMode = pCfg.wave || opCfg.wave || pickAnimationMode(seed, idx, paramKey);
                    const speed = baseSpeed * Number(opCfg.speed ?? 1.0) * Number(pCfg.speed ?? 1.0);
                    const phase = Number(pCfg.phase ?? 0.0);
                    const wave = animationWave(waveMode, t * speed + phase);
                    const delta = wave * Number(pCfg.range ?? 0) * baseStrength;
                    const ctrl = findControlForParam(stepKey, paramKey);
                    const nextValue = (Number(s.params[paramKey]) || 0) + delta;
                    nextParams[paramKey] = clampToControl(nextValue, ctrl);
                });

                ['mult', 'scale'].forEach((key) => {
                    const uCfg = opCfg.universal?.[key];
                    if (!uCfg || !uCfg.enabled) return;
                    const waveMode = uCfg.wave || opCfg.wave || pickAnimationMode(seed, idx, key);
                    const speed = baseSpeed * Number(opCfg.speed ?? 1.0) * Number(uCfg.speed ?? 1.0);
                    const phase = Number(uCfg.phase ?? 0.0);
                    const wave = animationWave(waveMode, t * speed + phase);
                    const delta = wave * Number(uCfg.range ?? 0) * baseStrength;
                    nextUniversal[key] = (Number(s.universal[key]) || 0) + delta;
                });
                return { ...s, params: nextParams, universal: nextUniversal };
            });
        };

        const extractAlphaFromPixels = (pixels) => {
            const alpha = new Uint8Array(pixels.length / 4);
            for (let i = 0, j = 0; i < pixels.length; i += 4, j++) alpha[j] = pixels[i + 3];
            return alpha;
        };

        const computeFrameDelta = (prevAlpha, nextAlpha) => {
            if (!prevAlpha || !nextAlpha || prevAlpha.length !== nextAlpha.length) return 0;
            let diff = 0;
            for (let i = 0; i < prevAlpha.length; i++) diff += Math.abs(prevAlpha[i] - nextAlpha[i]);
            return diff / (prevAlpha.length * 255);
        };

        const evaluateFlipbookFrames = (analyses, deltas, qualityConfig) => {
            const quality = qualityConfig || {};
            if (quality.enabled === false) return { pass: true, reason: '', metrics: {} };
            const frameCount = Math.max(1, analyses.length);
            const minDensity = Number(quality.minFrameDensity ?? 0);
            const maxEmptyRatio = Number(quality.maxEmptyFrameRatio ?? 1);
            const minDelta = Number(quality.minFrameDelta ?? 0);
            const maxDelta = Number(quality.maxFrameDelta ?? 1);
            let empty = 0;
            analyses.forEach((a) => { if (!a || a.density < minDensity) empty++; });
            const emptyRatio = empty / frameCount;
            const avgDelta = deltas.length ? (deltas.reduce((sum, v) => sum + v, 0) / deltas.length) : 0;
            const maxObservedDelta = deltas.length ? Math.max(...deltas) : 0;
            const minObservedDelta = deltas.length ? Math.min(...deltas) : 0;
            if (emptyRatio > maxEmptyRatio) return { pass: false, reason: 'too_many_empty_frames', metrics: { emptyRatio, avgDelta, maxObservedDelta, minObservedDelta } };
            if (avgDelta < minDelta) return { pass: false, reason: 'motion_too_static', metrics: { emptyRatio, avgDelta, maxObservedDelta, minObservedDelta } };
            if (maxObservedDelta > maxDelta) return { pass: false, reason: 'motion_too_busy', metrics: { emptyRatio, avgDelta, maxObservedDelta, minObservedDelta } };
            return { pass: true, reason: '', metrics: { emptyRatio, avgDelta, maxObservedDelta, minObservedDelta } };
        };

        const computeAlphaHash = (pixels, width, height) => {
            const small = 8;
            const sampled = [];
            let total = 0;
            for (let sy = 0; sy < small; sy++) {
                for (let sx = 0; sx < small; sx++) {
                    const x = Math.min(width - 1, Math.floor((sx / (small - 1)) * (width - 1)));
                    const y = Math.min(height - 1, Math.floor((sy / (small - 1)) * (height - 1)));
                    const idx = (y * width + x) * 4 + 3;
                    const value = pixels[idx];
                    sampled.push(value);
                    total += value;
                }
            }
            const avg = total / sampled.length;
            return sampled.map(v => (v >= avg ? '1' : '0')).join('');
        };

        const hammingDistance = (a, b) => {
            if (!a || !b) return 64;
            const len = Math.min(a.length, b.length);
            let diff = Math.abs(a.length - b.length);
            for (let i = 0; i < len; i++) if (a[i] !== b[i]) diff++;
            return diff;
        };

	        class TextureEngine {
	            constructor(width, height) {
	                this.width = width;
	                this.height = height;
	                this.canvas = document.createElement('canvas');
	                this.canvas.width = width;
	                this.canvas.height = height;
	                this.gl = this.canvas.getContext('webgl', { preserveDrawingBuffer: true, alpha: true });
	                if (!this.gl) return;
	                this.program = this.createProgram(VS_SOURCE, FS_TEMPLATE);
	                this.stepTextures = [];
	                this.quad = this.createQuad();
	                this.customPrograms = {};
	                this.baseProgramMeta = null;
	                this.libraryTexture = null;
	                this.readbackPixels = null;
	            }
	            createShader(type, source) {
	                const shader = this.gl.createShader(type);
	                this.gl.shaderSource(shader, source);
	                this.gl.compileShader(shader);
	                if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
	                    this.gl.deleteShader(shader);
	                    return null;
	                }
	                return shader;
	            }
	            createProgram(vs, fs) {
	                const program = this.gl.createProgram();
	                const vShader = this.createShader(this.gl.VERTEX_SHADER, vs);
	                const fShader = this.createShader(this.gl.FRAGMENT_SHADER, fs);
	                if (!vShader || !fShader) return null;
	                this.gl.attachShader(program, vShader);
	                this.gl.attachShader(program, fShader);
	                this.gl.linkProgram(program);
	                this.gl.deleteShader(vShader);
	                this.gl.deleteShader(fShader);
	                return this.gl.getProgramParameter(program, this.gl.LINK_STATUS) ? program : null;
	            }
	            createQuad() {
	                const buffer = this.gl.createBuffer();
	                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
	                const verts = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
	                this.gl.bufferData(this.gl.ARRAY_BUFFER, verts, this.gl.STATIC_DRAW);
	                return buffer;
	            }
	            createFBO() {
	                const texture = this.gl.createTexture();
	                this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
	                this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.width, this.height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
	                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
	                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
	                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
	                const fbo = this.gl.createFramebuffer();
	                this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, fbo);
	                this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, texture, 0);
	                this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
	                return { fbo, texture };
	            }
	            ensureStepTextures(requiredCount) {
	                if (this.stepTextures.length >= requiredCount) return;
	                for (let i = this.stepTextures.length; i < requiredCount; i++) {
	                    this.stepTextures.push(this.createFBO());
	                }
	            }
	            getBaseProgramMeta() {
	                if (this.baseProgramMeta) return this.baseProgramMeta;
	                const gl = this.gl;
	                const program = this.program;
	                const meta = {
	                    program,
	                    attLoc: gl.getAttribLocation(program, "position"),
	                    locs: {
	                        u_prevTexture: gl.getUniformLocation(program, "u_prevTexture"),
	                        u_resolution: gl.getUniformLocation(program, "u_resolution"),
	                        u_stepType: gl.getUniformLocation(program, "u_stepType"),
	                        u_blendMode: gl.getUniformLocation(program, "u_blendMode"),
	                        p1: gl.getUniformLocation(program, "p1"),
	                        p2: gl.getUniformLocation(program, "p2"),
	                        p3: gl.getUniformLocation(program, "p3"),
	                        p4: gl.getUniformLocation(program, "p4"),
	                        p5: gl.getUniformLocation(program, "p5"),
	                        p6: gl.getUniformLocation(program, "p6"),
	                        p7: gl.getUniformLocation(program, "p7"),
	                        u_power: gl.getUniformLocation(program, "u_power"),
	                        u_mult: gl.getUniformLocation(program, "u_mult"),
	                        u_scale: gl.getUniformLocation(program, "u_scale"),
	                        u_offsetX: gl.getUniformLocation(program, "u_offsetX"),
	                        u_offsetY: gl.getUniformLocation(program, "u_offsetY"),
	                        u_hasPrev: gl.getUniformLocation(program, "u_hasPrev")
	                    }
	                };
	                this.baseProgramMeta = meta;
	                return meta;
	            }
	            buildCustomProgramMeta(customCode) {
	                const fs = `precision mediump float;
varying vec2 vUv;
uniform sampler2D u_prevTexture;
uniform sampler2D u_libraryTexture;
uniform vec2 u_resolution;
uniform int u_blendMode;
uniform float p1;
uniform float p2;
uniform float p3;
uniform float p4;
uniform float p5;
uniform float p6;
uniform float p7;
uniform float u_power;
uniform float u_mult;
uniform float u_scale;
uniform float u_offsetX;
uniform float u_offsetY;
uniform float u_hasPrevF;
uniform float u_hasLibraryF;
float samplePrev(vec2 uv){ if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return 0.0; return texture2D(u_prevTexture, uv).a; }
float sampleLibrary(vec2 uv){ if (u_hasLibraryF < 0.5) return samplePrev(uv); if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return 0.0; return texture2D(u_libraryTexture, uv).a; }
${customCode}
void main() {
    float prevAlpha = texture2D(u_prevTexture, vUv).a;
    if (u_hasPrevF < 0.5) prevAlpha = 0.0;
    vec2 uv = (vUv - 0.5) / max(0.001, u_scale) + 0.5 - vec2(u_offsetX, u_offsetY);
    float currentAlpha = clamp(customOp(uv), 0.0, 1.0);
    currentAlpha = clamp(pow(currentAlpha, u_power) * u_mult, 0.0, 1.0);
    float finalAlpha = prevAlpha;
    if (u_blendMode == 0) finalAlpha = currentAlpha;
    else if (u_blendMode == 1) finalAlpha = max(0.0, prevAlpha - currentAlpha);
    else if (u_blendMode == 2) finalAlpha = prevAlpha * currentAlpha;
    else if (u_blendMode == 3) finalAlpha = min(1.0, prevAlpha + currentAlpha);
    else if (u_blendMode == 4) finalAlpha = max(prevAlpha, currentAlpha);
    else if (u_blendMode == 5) finalAlpha = min(prevAlpha, currentAlpha);
    gl_FragColor = vec4(1.0, 1.0, 1.0, finalAlpha);
}`;
	                const program = this.createProgram(VS_SOURCE, fs);
	                if (!program) return null;
	                const gl = this.gl;
	                return {
	                    program,
	                    attLoc: gl.getAttribLocation(program, "position"),
	                    locs: {
	                        u_prevTexture: gl.getUniformLocation(program, "u_prevTexture"),
	                        u_libraryTexture: gl.getUniformLocation(program, "u_libraryTexture"),
	                        u_hasLibraryF: gl.getUniformLocation(program, "u_hasLibraryF"),
	                        u_resolution: gl.getUniformLocation(program, "u_resolution"),
	                        u_blendMode: gl.getUniformLocation(program, "u_blendMode"),
	                        p1: gl.getUniformLocation(program, "p1"),
	                        p2: gl.getUniformLocation(program, "p2"),
	                        p3: gl.getUniformLocation(program, "p3"),
	                        p4: gl.getUniformLocation(program, "p4"),
	                        p5: gl.getUniformLocation(program, "p5"),
	                        p6: gl.getUniformLocation(program, "p6"),
	                        p7: gl.getUniformLocation(program, "p7"),
	                        u_power: gl.getUniformLocation(program, "u_power"),
	                        u_mult: gl.getUniformLocation(program, "u_mult"),
	                        u_scale: gl.getUniformLocation(program, "u_scale"),
	                        u_offsetX: gl.getUniformLocation(program, "u_offsetX"),
	                        u_offsetY: gl.getUniformLocation(program, "u_offsetY"),
	                        u_hasPrevF: gl.getUniformLocation(program, "u_hasPrevF")
	                    }
	                };
	            }
	            getCustomProgram(customCode) {
	                if (this.customPrograms[customCode]) return this.customPrograms[customCode];
	                const meta = this.buildCustomProgramMeta(customCode);
	                this.customPrograms[customCode] = meta;
	                return meta;
	            }
	            setLibrarySourceTexture(librarySource) {
	                const gl = this.gl;
	                if (!gl || !librarySource) return false;
	                if (!this.libraryTexture) {
	                    this.libraryTexture = gl.createTexture();
	                    gl.bindTexture(gl.TEXTURE_2D, this.libraryTexture);
	                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	                }
	                gl.activeTexture(gl.TEXTURE1);
	                gl.bindTexture(gl.TEXTURE_2D, this.libraryTexture);
	                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, librarySource);
	                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
	                return true;
	            }
	            bindQuadProgram(meta) {
	                const gl = this.gl;
	                gl.useProgram(meta.program);
	                gl.enableVertexAttribArray(meta.attLoc);
	                gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
	                gl.vertexAttribPointer(meta.attLoc, 2, gl.FLOAT, false, 0, 0);
	            }
	            renderStack(steps, options = {}) {
	                const gl = this.gl;
	                if (!gl || !this.program) return [];
	                this.ensureStepTextures(steps.length);
	                const hasLibrarySource = this.setLibrarySourceTexture(options.librarySource);
	                const baseMeta = this.getBaseProgramMeta();
	                this.bindQuadProgram(baseMeta);
	                gl.uniform2f(baseMeta.locs.u_resolution, this.width, this.height);
	                let prevTex = null;
	                for (let index = 0; index < steps.length; index++) {
	                    const step = steps[index];
	                    const dest = this.stepTextures[index];
	                    gl.bindFramebuffer(gl.FRAMEBUFFER, dest.fbo);
	                    gl.viewport(0, 0, this.width, this.height);
	                    gl.clear(gl.COLOR_BUFFER_BIT);
	                    const customOpType = step.customOpType || step.typeDef.customOpType;
	                    const customCode = step.customCode || step.typeDef.customCode;
	                    if (customOpType === 'shader' && customCode) {
	                        const customMeta = this.getCustomProgram(customCode);
	                        if (customMeta) {
	                            this.bindQuadProgram(customMeta);
	                            const locs = customMeta.locs;
	                            gl.activeTexture(gl.TEXTURE0);
	                            gl.bindTexture(gl.TEXTURE_2D, prevTex);
	                            gl.uniform1i(locs.u_prevTexture, 0);
	                            gl.activeTexture(gl.TEXTURE1);
	                            gl.bindTexture(gl.TEXTURE_2D, this.libraryTexture || null);
	                            gl.uniform1i(locs.u_libraryTexture, 1);
	                            gl.uniform1f(locs.u_hasLibraryF, hasLibrarySource ? 1.0 : 0.0);
	                            gl.uniform1f(locs.u_hasPrevF, prevTex ? 1.0 : 0.0);
	                            gl.uniform2f(locs.u_resolution, this.width, this.height);
	                            gl.uniform1i(locs.u_blendMode, step.blendMode);
	                            gl.uniform1f(locs.p1, step.params.p1);
	                            gl.uniform1f(locs.p2, step.params.p2);
	                            gl.uniform1f(locs.p3, step.params.p3);
	                            gl.uniform1f(locs.p4, step.params.p4);
	                            gl.uniform1f(locs.p5, step.params.p5);
	                            gl.uniform1f(locs.p6, step.params.p6 || 0);
	                            gl.uniform1f(locs.p7, step.params.p7 || 0);
	                            gl.uniform1f(locs.u_power, step.universal.power);
	                            gl.uniform1f(locs.u_mult, step.universal.mult);
	                            gl.uniform1f(locs.u_scale, step.universal.scale);
	                            gl.uniform1f(locs.u_offsetX, step.universal.offsetX || 0.0);
	                            gl.uniform1f(locs.u_offsetY, step.universal.offsetY || 0.0);
	                            gl.drawArrays(gl.TRIANGLES, 0, 6);
	                            prevTex = dest.texture;
	                            this.bindQuadProgram(baseMeta);
	                            continue;
	                        }
	                    }
	                    const locs = baseMeta.locs;
	                    if (!step.active) {
	                        if (!prevTex) {
	                            gl.clearColor(0, 0, 0, 0);
	                            gl.clear(gl.COLOR_BUFFER_BIT);
	                        } else {
	                            gl.activeTexture(gl.TEXTURE0);
	                            gl.bindTexture(gl.TEXTURE_2D, prevTex);
	                            gl.uniform1i(locs.u_prevTexture, 0);
	                            gl.uniform1i(locs.u_hasPrev, 1);
	                            gl.uniform1i(locs.u_stepType, 999);
	                            gl.uniform1i(locs.u_blendMode, 1);
	                        }
	                    } else {
	                        gl.activeTexture(gl.TEXTURE0);
	                        gl.bindTexture(gl.TEXTURE_2D, prevTex);
	                        gl.uniform1i(locs.u_prevTexture, 0);
	                        gl.uniform1i(locs.u_hasPrev, prevTex ? 1 : 0);
	                        gl.uniform1i(locs.u_stepType, step.typeDef.id);
	                        gl.uniform1i(locs.u_blendMode, step.blendMode);
	                        gl.uniform1f(locs.p1, step.params.p1);
	                        gl.uniform1f(locs.p2, step.params.p2);
	                        gl.uniform1f(locs.p3, step.params.p3);
	                        gl.uniform1f(locs.p4, step.params.p4);
	                        gl.uniform1f(locs.p5, step.params.p5);
	                        gl.uniform1f(locs.p6, step.params.p6 || 0);
	                        gl.uniform1f(locs.p7, step.params.p7 || 0);
	                        gl.uniform1f(locs.u_power, step.universal.power);
	                        gl.uniform1f(locs.u_mult, step.universal.mult);
	                        gl.uniform1f(locs.u_scale, step.universal.scale);
	                        gl.uniform1f(locs.u_offsetX, step.universal.offsetX || 0.0);
	                        gl.uniform1f(locs.u_offsetY, step.universal.offsetY || 0.0);
	                    }
	                    gl.drawArrays(gl.TRIANGLES, 0, 6);
	                    prevTex = dest.texture;
	                }
	                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	                return this.stepTextures.slice(0, steps.length);
	            }
	            readPixels(textureIndex) {
	                const fbo = this.stepTextures[textureIndex].fbo;
	                const gl = this.gl;
	                if (!this.readbackPixels || this.readbackPixels.length !== this.width * this.height * 4) {
	                    this.readbackPixels = new Uint8Array(this.width * this.height * 4);
	                }
	                gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
	                gl.readPixels(0, 0, this.width, this.height, gl.RGBA, gl.UNSIGNED_BYTE, this.readbackPixels);
	                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	                return this.readbackPixels;
	            }
	            pixelsToCanvas(pixels) {
	                const canvas = document.createElement('canvas');
	                canvas.width = this.width;
	                canvas.height = this.height;
	                const ctx = canvas.getContext('2d');
	                const imageData = ctx.createImageData(this.width, this.height);
	                for (let y = 0; y < this.height; y++) {
	                    for (let x = 0; x < this.width; x++) {
	                        const sourceIdx = (y * this.width + x) * 4;
	                        const destIdx = ((this.height - 1 - y) * this.width + x) * 4;
	                        const alpha = pixels[sourceIdx + 3];
	                        imageData.data[destIdx] = 255;
	                        imageData.data[destIdx + 1] = 255;
	                        imageData.data[destIdx + 2] = 255;
	                        imageData.data[destIdx + 3] = alpha;
	                    }
	                }
	                ctx.putImageData(imageData, 0, 0);
	                return canvas;
	            }
	            getTextureCanvas(textureIndex) {
	                const pixels = this.readPixels(textureIndex);
	                return this.pixelsToCanvas(pixels);
	            }
	            async getTextureCanvasAndBlob(textureIndex, mimeType = 'image/png', quality) {
	                const canvas = this.getTextureCanvas(textureIndex);
	                const blob = await new Promise((resolve) => {
	                    canvas.toBlob((nextBlob) => resolve(nextBlob || new Blob()), mimeType, quality);
	                });
	                return { canvas, blob };
	            }
	            getTextureUrl(textureIndex) {
	                const canvas = this.getTextureCanvas(textureIndex);
	                return canvas.toDataURL();
	            }
	            async getTextureBlob(textureIndex, mimeType = 'image/png', quality) {
	                const canvas = this.getTextureCanvas(textureIndex);
	                return await new Promise((resolve) => {
	                    canvas.toBlob((blob) => resolve(blob || new Blob()), mimeType, quality);
	                });
	            }
	            analyzeTexture(textureIndex) {
	                const pixels = this.readPixels(textureIndex);
	                const alphaMask = new Uint8Array(this.width * this.height);
	                let tA = 0; let tG = 0; let gC = 0; let area = 0; let perimeter = 0; let minX = this.width; let minY = this.height; let maxX = -1; let maxY = -1;
	                for (let i = 0; i < pixels.length; i += 4) {
	                    const a = pixels[i + 3];
	                    if (a > 10) tA += a;
	                    const pixelIndex = i / 4;
	                    const x = pixelIndex % this.width;
	                    const y = Math.floor(pixelIndex / this.width);
	                    const solid = a >= 127 ? 1 : 0;
	                    alphaMask[pixelIndex] = solid;
	                    if (solid) {
	                        area++;
	                        if (x < minX) minX = x;
	                        if (y < minY) minY = y;
	                        if (x > maxX) maxX = x;
	                        if (y > maxY) maxY = y;
	                    }
	                    if (x < this.width - 1 && y < this.height - 1) {
	                        const r = pixels[i + 4 + 3];
	                        const d = pixels[i + this.width * 4 + 3];
	                        tG += Math.abs(a - r) + Math.abs(a - d);
	                        gC++;
	                    }
	                }
	                for (let y = 0; y < this.height; y++) {
	                    for (let x = 0; x < this.width; x++) {
	                        const idx = y * this.width + x;
	                        if (!alphaMask[idx]) continue;
	                        const left = x > 0 ? alphaMask[idx - 1] : 0;
	                        const right = x < this.width - 1 ? alphaMask[idx + 1] : 0;
	                        const up = y > 0 ? alphaMask[idx - this.width] : 0;
	                        const down = y < this.height - 1 ? alphaMask[idx + this.width] : 0;
	                        perimeter += (left ? 0 : 1) + (right ? 0 : 1) + (up ? 0 : 1) + (down ? 0 : 1);
	                    }
	                }
	                const density = (tA / (this.width * this.height)) / 255.0;
	                const aG = tG / (gC || 1);
	                const sScore = Math.max(0, 1.0 - (aG / 40.0));
	                const circularity = area > 0 && perimeter > 0 ? clamp01((4.0 * Math.PI * area) / (perimeter * perimeter)) : 0;
	                const bboxW = maxX >= minX ? (maxX - minX + 1) : 0;
	                const bboxH = maxY >= minY ? (maxY - minY + 1) : 0;
	                const bboxArea = bboxW * bboxH;
	                const fillRatio = bboxArea > 0 ? area / bboxArea : 0;
	                const aspectRatio = bboxH > 0 ? bboxW / bboxH : 0;
	                const aspectScore = aspectRatio > 0 ? clamp01(1.0 - Math.abs(1.0 - aspectRatio)) : 0;
	                const squareness = clamp01(fillRatio * aspectScore);
	                const hash = computeAlphaHash(pixels, this.width, this.height);
	                return { density, sScore, circularity, squareness, hash };
	            }
	        }

        // ==========================================
        // 3. UI HELPERS & COMPONENTS (Hoisted)
        // ==========================================

        function generateSemanticName(item, existingNames) {
            const config = item.config;
            let shape = "Blob"; const baseStep = config.find(s => s.typeDef.cat === 'GEN');
            if (baseStep) {
                const t = Math.round(baseStep.params.p1);
                if (t === 0) shape = "Circle"; else if (t === 1) shape = "Square"; else if (t === 2) shape = "Triangle"; else if (t === 3) shape = "Ring"; else if (t === 4) shape = "Frame"; else if (t === 5) shape = "TriFrame";
            }
            let variant = "Standard";
            if (config.some(s => s.typeDef.id === 12)) variant = "Fractal"; else if (config.some(s => s.typeDef.id === 13)) variant = "Swirl"; else if (config.some(s => s.typeDef.id === 16)) variant = "Streak";
            let coreName = `${shape}_${variant}`;
            let counter = 1; let finalName = `${coreName}_${counter.toString().padStart(2, '0')}`;
            while (existingNames.has(finalName)) { counter++; finalName = `${coreName}_${counter.toString().padStart(2, '0')}`; }
            return finalName;
        }

        function GizmoOverlayComp({ step }) {
            if (!step.active) return null; const id = step.typeDef.id; const p = step.params; const scale = step.universal.scale !== undefined ? step.universal.scale : 1.0; const offX = step.universal.offsetX || 0.0; const offY = step.universal.offsetY || 0.0;
            const centerX = 50 + (offX * scale * 100); const centerY = 50 - (offY * scale * 100);
            let gizmo = null;
            if (id === 1) { const type = p.p1; const sz = p.p2 * scale; if (type == 0 || type == 3) gizmo = <circle cx={centerX} cy={centerY} r={sz * 50} fill="none" stroke="yellow" strokeWidth="1" strokeDasharray="4 2" />; else if (type == 1 || type == 4) gizmo = <rect x={centerX - sz * 50} y={centerY - sz * 50} width={sz * 100} height={sz * 100} fill="none" stroke="yellow" strokeWidth="1" strokeDasharray="4 2" />; }
            return <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100" preserveAspectRatio="none">{gizmo}</svg>;
        }
