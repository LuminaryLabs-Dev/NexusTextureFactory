export const VS_SOURCE = `attribute vec2 position; varying vec2 vUv; void main() { vUv = position * 0.5 + 0.5; gl_Position = vec4(position, 0.0, 1.0); }`;

export const FS_TEMPLATE = `precision mediump float; varying vec2 vUv; uniform sampler2D u_prevTexture; uniform vec2 u_resolution; uniform int u_stepType; uniform int u_blendMode; uniform float p1; uniform float p2; uniform float p3; uniform float p4; uniform float p5; uniform float p6; uniform float p7; uniform float u_power; uniform float u_mult; uniform float u_scale; uniform float u_offsetX; uniform float u_offsetY; uniform bool u_hasPrev;
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); } float snoise(vec2 v) { const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439); vec2 i  = floor(v + dot(v, C.yy) ); vec2 x0 = v -   i + dot(i, C.xx); vec2 i1; i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0); vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1; i = mod(i, 289.0); vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 )); vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0); m = m*m ; m = m*m ; vec3 x = 2.0 * fract(p * C.www) - 1.0; vec3 h = abs(x) - 0.5; vec3 ox = floor(x + 0.5); vec3 a0 = x - ox; m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h ); vec3 g; g.x  = a0.x  * x0.x  + h.x  * x0.y; g.yz = a0.yz * x12.xz + h.yz * x12.yw; return 130.0 * dot(m, g); } vec2 random2( vec2 p ) { return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453); } float worley(vec2 st, float jitter, bool invert) { vec2 i_st = floor(st); vec2 f_st = fract(st); float m_dist = 1.0; for (int y= -1; y <= 1; y++) { for (int x= -1; x <= 1; x++) { vec2 neighbor = vec2(float(x),float(y)); vec2 point = random2(i_st + neighbor); point = 0.5 + 0.5*sin(6.2831*point + jitter); vec2 diff = neighbor + point - f_st; float dist = length(diff); m_dist = min(m_dist, dist); } } return invert ? (1.0 - m_dist) : m_dist; }
    float samplePrev(vec2 uv) { if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return 0.0; return texture2D(u_prevTexture, uv).a; }
    float sdTriangle(vec2 p, float r) { const float k = sqrt(3.0); p.x = abs(p.x) - r; p.y = p.y + r / k; if(p.x + k*p.y > 0.0) p = vec2(p.x - k*p.y, -k*p.x - p.y)/2.0; p.x -= clamp( p.x, -2.0*r, 0.0 ); return -length(p)*sign(p.y); }
    float op_shape_sdf(vec2 uv, float type, float size) { vec2 p = (uv - 0.5) * 2.0; if (type < 0.5 || (type >= 2.5 && type < 3.5)) return length(p) - size; if ((type >= 0.5 && type < 1.5) || (type >= 3.5 && type < 4.5)) return max(abs(p.x), abs(p.y)) - size; if ((type >= 1.5 && type < 2.5) || type >= 4.5) return sdTriangle(p, size); return 0.0; }
    float op_base_shape(vec2 uv, float type, float size, float softness, float thickness) { float d = op_shape_sdf(uv, type, size); bool isWire = type >= 2.5; if (isWire) return 1.0 - smoothstep(thickness, thickness + max(0.001, softness), abs(d)); else return 1.0 - smoothstep(0.0, max(0.001, softness), d); }
    float op_gradient(vec2 uv, float angle) { float rad = radians(angle); vec2 dir = vec2(cos(rad), sin(rad)); float v = dot(uv - 0.5, dir) + 0.5; return clamp(v, 0.0, 1.0); }
    float op_perlin(vec2 uv, float scale, float seed, float octaves, float rolloff, float offx, float offy) { vec2 p = (uv + vec2(offx, offy)) * scale + vec2(seed * 17.0, seed * 9.3); float total = 0.0; float amp = 1.0; float maxAmp = 0.0; for(int i = 0; i < 8; i++) { if (float(i) >= octaves) break; total += snoise(p) * amp; maxAmp += amp; p *= 2.0; amp *= rolloff; } float n = total / maxAmp; return n * 0.5 + 0.5; }
    float op_worley(vec2 uv, float scale, float seed, float jitter, float invert, float offx, float offy) { vec2 p = (uv + vec2(offx, offy)) * scale + vec2(seed * 5.2, seed * 1.4); return worley(p, jitter, invert > 0.5); }
    float op_vignette(vec2 uv, float shape, float size, float softness) { float d_circle = length(uv - 0.5); float d_square = max(abs(uv.x - 0.5), abs(uv.y - 0.5)); float d = mix(d_circle, d_square, step(0.5, shape)); return 1.0 - smoothstep(size - softness, size, d); }
    float op_smear(vec2 uv, float angle, float strength) { float rad = radians(angle); vec2 dir = vec2(cos(rad), sin(rad)); float total = 0.0; float count = 8.0; for(float i = 0.0; i < 8.0; i++) { float t = (i / (count - 1.0)) - 0.5; vec2 offset = dir * strength * t; total += samplePrev(uv + offset); } return total / count; }
    vec2 apply_spiral(vec2 uv, float twist, float cx, float cy) { vec2 center = vec2(cx, cy); vec2 d = uv - center; float r = length(d); float a = atan(d.y, d.x); a += twist * (1.0 - smoothstep(0.0, 1.0, r)) * 6.28; return center + vec2(cos(a), sin(a)) * r; }
    vec2 apply_fractal(vec2 uv, float segments) { vec2 d = uv - 0.5; float r = length(d); float a = atan(d.y, d.x); float seg = 6.2831 / segments; a = mod(a, seg); a = abs(a - seg/2.0); return vec2(0.5) + vec2(cos(a), sin(a)) * r; }
    void main() { vec2 uv = vUv; float prevAlpha = texture2D(u_prevTexture, uv).a; if (!u_hasPrev) prevAlpha = 0.0; vec2 opUV = (uv - 0.5) / max(0.001, u_scale) + 0.5 - vec2(u_offsetX, u_offsetY); float currentAlpha = 0.0; vec2 modUv = opUV; if (u_stepType == 12) { modUv = apply_fractal(opUV, p1); float val = samplePrev(modUv); val = clamp(pow(val, u_power) * u_mult, 0.0, 1.0); gl_FragColor = vec4(1.0, 1.0, 1.0, val); return; } if (u_stepType == 13) { modUv = apply_spiral(opUV, p1, p4, p5); float val = samplePrev(modUv); val = clamp(pow(val, u_power) * u_mult, 0.0, 1.0); gl_FragColor = vec4(1.0, 1.0, 1.0, val); return; } if (u_stepType == 16) { float val = op_smear(opUV, p1, p2); val = clamp(pow(val, u_power) * u_mult, 0.0, 1.0); gl_FragColor = vec4(1.0, 1.0, 1.0, val); return; } if (u_stepType == 1) currentAlpha = op_base_shape(opUV, p1, p2, p3, p4); else if (u_stepType == 3) currentAlpha = op_gradient(opUV, p1); else if (u_stepType == 4) currentAlpha = op_perlin(opUV, p1, p2, p3, p4, p6, p7); else if (u_stepType == 5) currentAlpha = op_worley(opUV, p1, p2, p3, p4, p6, p7); else if (u_stepType == 11) { currentAlpha = step(p1, samplePrev(opUV)); currentAlpha = clamp(pow(currentAlpha, u_power) * u_mult, 0.0, 1.0); gl_FragColor = vec4(1.0, 1.0, 1.0, currentAlpha); return; } else if (u_stepType == 14) currentAlpha = op_vignette(opUV, p1, p2, p3); else if (u_stepType == 15) currentAlpha = samplePrev(opUV); currentAlpha = clamp(pow(currentAlpha, u_power) * u_mult, 0.0, 1.0); float finalAlpha = prevAlpha; if (u_blendMode == 0) finalAlpha = currentAlpha; else if (u_blendMode == 1) finalAlpha = max(0.0, prevAlpha - currentAlpha); else if (u_blendMode == 2) finalAlpha = prevAlpha * currentAlpha; else if (u_blendMode == 3) finalAlpha = min(1.0, prevAlpha + currentAlpha); else if (u_blendMode == 4) finalAlpha = max(prevAlpha, currentAlpha); else if (u_blendMode == 5) finalAlpha = min(prevAlpha, currentAlpha); gl_FragColor = vec4(1.0, 1.0, 1.0, finalAlpha); }
`;

export class TextureEngine {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this.gl = this.canvas.getContext('webgl', { preserveDrawingBuffer: true, alpha: true });
        if (!this.gl) return;
        this.program = this.createProgram(VS_SOURCE, FS_TEMPLATE);
        this.fbos = [this.createFBO(), this.createFBO()];
        this.stepTextures = [];
        this.quad = this.createQuad();
    }
    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        return this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS) ? shader : null;
    }
    createProgram(vs, fs) {
        const program = this.gl.createProgram();
        const vShader = this.createShader(this.gl.VERTEX_SHADER, vs);
        const fShader = this.createShader(this.gl.FRAGMENT_SHADER, fs);
        this.gl.attachShader(program, vShader);
        this.gl.attachShader(program, fShader);
        this.gl.linkProgram(program);
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
    renderStack(steps) {
        const gl = this.gl;
        gl.useProgram(this.program);
        const attLoc = gl.getAttribLocation(this.program, "position");
        gl.enableVertexAttribArray(attLoc);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
        gl.vertexAttribPointer(attLoc, 2, gl.FLOAT, false, 0, 0);
        const locs = {
            u_prevTexture: gl.getUniformLocation(this.program, "u_prevTexture"),
            u_resolution: gl.getUniformLocation(this.program, "u_resolution"),
            u_stepType: gl.getUniformLocation(this.program, "u_stepType"),
            u_blendMode: gl.getUniformLocation(this.program, "u_blendMode"),
            p1: gl.getUniformLocation(this.program, "p1"),
            p2: gl.getUniformLocation(this.program, "p2"),
            p3: gl.getUniformLocation(this.program, "p3"),
            p4: gl.getUniformLocation(this.program, "p4"),
            p5: gl.getUniformLocation(this.program, "p5"),
            p6: gl.getUniformLocation(this.program, "p6"),
            p7: gl.getUniformLocation(this.program, "p7"),
            u_power: gl.getUniformLocation(this.program, "u_power"),
            u_mult: gl.getUniformLocation(this.program, "u_mult"),
            u_scale: gl.getUniformLocation(this.program, "u_scale"),
            u_offsetX: gl.getUniformLocation(this.program, "u_offsetX"),
            u_offsetY: gl.getUniformLocation(this.program, "u_offsetY"),
            u_hasPrev: gl.getUniformLocation(this.program, "u_hasPrev")
        };
        gl.uniform2f(locs.u_resolution, this.width, this.height);
        let prevTex = null;
        if (this.stepTextures.length < steps.length) {
            for (let i = this.stepTextures.length; i < steps.length; i++) this.stepTextures.push(this.createFBO());
        }
        steps.forEach((step, index) => {
            const dest = this.stepTextures[index];
            gl.bindFramebuffer(gl.FRAMEBUFFER, dest.fbo);
            gl.viewport(0, 0, this.width, this.height);
            gl.clear(gl.COLOR_BUFFER_BIT);
            if (!step.active) {
                if (!prevTex) {
                    gl.clearColor(0, 0, 0, 0);
                    gl.clear(gl.COLOR_BUFFER_BIT);
                } else {
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, prevTex);
                    gl.uniform1i(locs.u_prevTexture, 0);
                    gl.uniform1i(locs.u_hasPrev, prevTex ? 1 : 0);
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
        });
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        return this.stepTextures.slice(0, steps.length);
    }
    getTextureUrl(textureIndex) {
        const fbo = this.stepTextures[textureIndex].fbo;
        const gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        const pixels = new Uint8Array(this.width * this.height * 4);
        gl.readPixels(0, 0, this.width, this.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.width;
        tempCanvas.height = this.height;
        const ctx = tempCanvas.getContext('2d');
        const imageData = ctx.createImageData(this.width, this.height);
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const srcIdx = (y * this.width + x) * 4;
                const dstIdx = ((this.height - 1 - y) * this.width + x) * 4;
                imageData.data[dstIdx] = pixels[srcIdx];
                imageData.data[dstIdx + 1] = pixels[srcIdx + 1];
                imageData.data[dstIdx + 2] = pixels[srcIdx + 2];
                imageData.data[dstIdx + 3] = pixels[srcIdx + 3];
            }
        }
        ctx.putImageData(imageData, 0, 0);
        return tempCanvas.toDataURL();
    }
    analyzeTexture(textureIndex) {
        const fbo = this.stepTextures[textureIndex].fbo;
        const gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        const pixels = new Uint8Array(this.width * this.height * 4);
        gl.readPixels(0, 0, this.width, this.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        let totalAlpha = 0;
        let sumX = 0;
        let sumY = 0;
        let minX = this.width,
            maxX = 0,
            minY = this.height,
            maxY = 0;
        let totalGradient = 0;
        let gradCount = 0;
        for (let i = 0; i < pixels.length; i += 4) {
            const a = pixels[i + 3];
            if (a > 10) {
                totalAlpha += a;
                const idx = i / 4;
                const x = idx % this.width;
                const y = Math.floor(idx / this.width);
                sumX += x * a;
                sumY += y * a;
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
            const idx = i / 4;
            const x = idx % this.width;
            const y = Math.floor(idx / this.width);
            if (x < this.width - 1 && y < this.height - 1) {
                const right = pixels[i + 4 + 3];
                const down = pixels[i + this.width * 4 + 3];
                totalGradient += Math.abs(a - right) + Math.abs(a - down);
                gradCount++;
            }
        }
        const density = (totalAlpha / (this.width * this.height)) / 255.0;
        const avgGrad = totalGradient / (gradCount || 1);
        const sScore = Math.max(0, 1.0 - (avgGrad / 40.0));
        if (totalAlpha === 0) return {
            density: 0,
            cScore: 0,
            sScore: 1.0
        };
        const cx = sumX / totalAlpha;
        const cy = sumY / totalAlpha;
        const buckets = new Float32Array(32).fill(0);
        for (let i = 0; i < pixels.length; i += 4) {
            const a = pixels[i + 3];
            if (a > 0) {
                const idx = i / 4;
                const x = idx % this.width;
                const y = Math.floor(idx / this.width);
                let angle = Math.atan2(y - cy, x - cx);
                if (angle < 0) angle += Math.PI * 2;
                const bIdx = Math.floor((angle / (Math.PI * 2)) * 32) % 32;
                buckets[bIdx] += a;
            }
        }
        let sumB = 0;
        for (let i = 0; i < 32; i++) sumB += buckets[i];
        const mean = sumB / 32;
        let varianceSum = 0;
        for (let i = 0; i < 32; i++) varianceSum += Math.pow(buckets[i] - mean, 2);
        const cv = (mean === 0) ? 1 : Math.sqrt(varianceSum / 32) / mean;
        const w = maxX - minX;
        const h = maxY - minY;
        const ar = w / (h || 1);
        const penalty = (ar < 0.8 || ar > 1.25) ? 0.5 : 1.0;
        const cScore = Math.max(0, 1.0 - (cv * 2.5)) * penalty;
        return {
            density,
            cScore,
            sScore
        };
    }
}
