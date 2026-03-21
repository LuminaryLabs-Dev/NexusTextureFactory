        const HUMAN_VIEW_DEFAULT_URL = 'http://127.0.0.1:41777';
        const HUMAN_VIEW_UI_STORAGE_KEY = 'spinosaurus-human-view-ui-v1';

        class HumanViewHttpBridge {
            constructor(baseUrl = HUMAN_VIEW_DEFAULT_URL) {
                this.baseUrl = String(baseUrl || HUMAN_VIEW_DEFAULT_URL).replace(/\/+$/, '');
            }

            setBaseUrl(baseUrl) {
                this.baseUrl = String(baseUrl || HUMAN_VIEW_DEFAULT_URL).replace(/\/+$/, '');
            }

            async request(path, options = {}) {
                const response = await fetch(`${this.baseUrl}${path}`, {
                    method: options.method || 'GET',
                    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
                    body: options.body ? JSON.stringify(options.body) : undefined
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

            health() { return this.request('/health'); }
            startSession(body = {}) { return this.request('/session/start', { method: 'POST', body }); }
            stopSession() { return this.request('/session/stop', { method: 'POST' }); }
            openApp(url) { return this.request('/app/open', { method: 'POST', body: { url } }); }
            reloadApp() { return this.request('/app/reload', { method: 'POST' }); }
            appStatus() { return this.request('/app/status'); }
            captureFullApp(label = 'full-app', fullPage = true) { return this.request('/capture/full_app', { method: 'POST', body: { label, full_page: fullPage } }); }
            captureViewport(label = 'viewport') { return this.request('/capture/viewport', { method: 'POST', body: { label } }); }
            latestCapture() { return this.request('/capture/latest'); }
            inspectConsole() { return this.request('/inspect/console'); }
            inspectNetwork() { return this.request('/inspect/network'); }
            domSnapshot() { return this.request('/inspect/dom_snapshot', { method: 'POST' }); }
            runLoop(loopName, targetUrl, maxIterations = 3) { return this.request('/loop/run', { method: 'POST', body: { loop_name: loopName, target_url: targetUrl, max_iterations: maxIterations } }); }
            loopStatus() { return this.request('/loop/status'); }
            stopLoop() { return this.request('/loop/stop', { method: 'POST' }); }
            openPreview() { return this.request('/particle/open_preview', { method: 'POST' }); }
        }
