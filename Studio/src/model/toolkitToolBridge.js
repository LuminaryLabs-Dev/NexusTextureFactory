        const TOOLKIT_DEFAULT_URL = 'http://127.0.0.1:41777';
        const TOOLKIT_UI_STORAGE_KEY = 'spinosaurus-toolkit-ui-v1';

        class ToolkitToolBridge {
            constructor(baseUrl = TOOLKIT_DEFAULT_URL) {
                this.baseUrl = String(baseUrl || TOOLKIT_DEFAULT_URL).replace(/\/+$/, '');
            }

            setBaseUrl(baseUrl) {
                this.baseUrl = String(baseUrl || TOOLKIT_DEFAULT_URL).replace(/\/+$/, '');
            }

            async request(path, options = {}) {
                const response = await fetch(`${this.baseUrl}${path}`, {
                    method: options.method || 'GET',
                    headers: options.rawBody
                        ? { ...(options.headers || {}) }
                        : { 'Content-Type': 'application/json', ...(options.headers || {}) },
                    body: options.rawBody ? options.rawBody : (options.body ? JSON.stringify(options.body) : undefined)
                });
                let payload = null;
                try {
                    payload = await response.json();
                } catch (_) {
                    payload = null;
                }
                if (!response.ok) {
                    throw new Error(payload?.error || payload?.message || `Request failed: ${response.status}`);
                }
                return payload;
            }

            health() {
                return this.request('/toolkit/health');
            }

            catalog() {
                return this.request('/toolkit/catalog');
            }

            run(category, tool, args = {}) {
                return this.request('/toolkit/run', { method: 'POST', body: { category, tool, args } });
            }

            latestRun() {
                return this.request('/toolkit/runs/latest');
            }

            logs() {
                return this.request('/toolkit/logs');
            }

            previewVideoStart(config = {}) {
                return this.request('/toolkit/preview/video/start', { method: 'POST', body: config });
            }

            previewVideoFrame(jobId, frameIndex, blob) {
                return this.request(`/toolkit/preview/video/frame?jobId=${encodeURIComponent(jobId)}&frameIndex=${encodeURIComponent(frameIndex)}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'image/jpeg' },
                    rawBody: blob
                });
            }

            previewVideoFinalize(jobId) {
                return this.request('/toolkit/preview/video/finalize', { method: 'POST', body: { jobId } });
            }

            previewVideoStatus(jobId) {
                return this.request(`/toolkit/preview/video/status/${encodeURIComponent(jobId)}`);
            }

            previewVideoCancel(jobId) {
                return this.request('/toolkit/preview/video/cancel', { method: 'POST', body: { jobId } });
            }

            captureVideoStart(config = {}) {
                return this.request('/toolkit/capture/video/start', { method: 'POST', body: config });
            }

            captureVideoFrame(jobId, frameIndex, blob) {
                return this.request(`/toolkit/capture/video/frame?jobId=${encodeURIComponent(jobId)}&frameIndex=${encodeURIComponent(frameIndex)}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'image/jpeg' },
                    rawBody: blob
                });
            }

            captureVideoFinalize(jobId) {
                return this.request('/toolkit/capture/video/finalize', { method: 'POST', body: { jobId } });
            }

            captureVideoStatus(jobId) {
                return this.request(`/toolkit/capture/video/status/${encodeURIComponent(jobId)}`);
            }

            captureVideoCancel(jobId) {
                return this.request('/toolkit/capture/video/cancel', { method: 'POST', body: { jobId } });
            }

            captureVideoReview(payload = {}) {
                return this.request('/toolkit/capture/video/review', { method: 'POST', body: payload });
            }
        }
