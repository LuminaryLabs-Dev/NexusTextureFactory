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
        }
