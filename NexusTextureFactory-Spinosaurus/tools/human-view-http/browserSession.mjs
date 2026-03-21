import { chromium } from 'playwright';

function pushBounded(list, value, max = 200) {
  list.push(value);
  if (list.length > max) list.splice(0, list.length - max);
}

async function attachPageObservers(state) {
  if (!state.page) return;
  state.consoleLogs = [];
  state.networkLogs = [];
  state.page.on('console', (msg) => {
    pushBounded(state.consoleLogs, {
      type: msg.type(),
      text: msg.text(),
      at: new Date().toISOString()
    });
  });
  state.page.on('request', (req) => {
    pushBounded(state.networkLogs, {
      method: req.method(),
      url: req.url(),
      at: new Date().toISOString()
    });
  });
  state.page.on('pageerror', (error) => {
    pushBounded(state.consoleLogs, {
      type: 'pageerror',
      text: error.message,
      at: new Date().toISOString()
    });
  });
}

export async function startSession(state, { width = 1440, height = 960, headless = false } = {}) {
  if (state.browser && state.page) {
    await state.page.setViewportSize({ width, height });
    state.session.viewport = { width, height };
    state.session.headless = !!headless;
    return { ok: true, session_ready: true };
  }
  state.browser = await chromium.launch({ headless: !!headless, channel: 'chrome' });
  state.context = await state.browser.newContext({ viewport: { width, height } });
  state.page = await state.context.newPage();
  state.session.browserReady = true;
  state.session.viewport = { width, height };
  state.session.headless = !!headless;
  await attachPageObservers(state);
  return { ok: true, session_ready: true };
}

export async function stopSession(state) {
  if (state.context) await state.context.close();
  if (state.browser) await state.browser.close();
  state.browser = null;
  state.context = null;
  state.page = null;
  state.session.browserReady = false;
  state.consoleLogs = [];
  state.networkLogs = [];
  return { ok: true };
}

export async function openApp(state, { url }) {
  if (!state.page) throw new Error('Browser session has not been started.');
  if (!url) throw new Error('App URL is required.');
  await state.page.goto(url, { waitUntil: 'networkidle' });
  state.appUrl = url;
  return {
    ok: true,
    url,
    title: await state.page.title()
  };
}

export async function reloadApp(state) {
  if (!state.page) throw new Error('Browser session has not been started.');
  await state.page.reload({ waitUntil: 'networkidle' });
  return { ok: true, title: await state.page.title() };
}

export async function getAppStatus(state) {
  if (!state.page) {
    return {
      url: '',
      title: '',
      viewport: state.session.viewport,
      preview_tab_visible: false,
      settings_tab_visible: false
    };
  }
  const previewVisible = await state.page.locator('text=PREVIEW').first().isVisible().catch(() => false);
  const settingsVisible = await state.page.locator('text=SETTINGS').first().isVisible().catch(() => false);
  return {
    url: state.page.url(),
    title: await state.page.title(),
    viewport: state.page.viewportSize(),
    preview_tab_visible: previewVisible,
    settings_tab_visible: settingsVisible
  };
}

async function activateTab(state, tab) {
  if (!state.page) throw new Error('Browser session has not been started.');
  const label = String(tab || '').trim().toUpperCase();
  await state.page.getByRole('button', { name: label }).click();
  await state.page.waitForTimeout(250);
}

export async function navigateAction(state, { tab, url }) {
  if (url) return openApp(state, { url });
  if (!tab) throw new Error('Tab or URL is required.');
  await activateTab(state, tab);
  return { ok: true };
}

export async function clickAction(state, { selector }) {
  if (!state.page) throw new Error('Browser session has not been started.');
  if (!selector) throw new Error('Selector is required.');
  await state.page.locator(selector).first().click();
  return { ok: true };
}

export async function typeAction(state, { selector, text = '' }) {
  if (!state.page) throw new Error('Browser session has not been started.');
  if (!selector) throw new Error('Selector is required.');
  const locator = state.page.locator(selector).first();
  await locator.fill('');
  await locator.type(String(text));
  return { ok: true };
}

export async function selectAction(state, { selector, value }) {
  if (!state.page) throw new Error('Browser session has not been started.');
  if (!selector) throw new Error('Selector is required.');
  await state.page.locator(selector).first().selectOption(String(value));
  return { ok: true };
}

export async function pressAction(state, { key }) {
  if (!state.page) throw new Error('Browser session has not been started.');
  if (!key) throw new Error('Key is required.');
  await state.page.keyboard.press(String(key));
  return { ok: true };
}

export async function domSnapshot(state) {
  if (!state.page) throw new Error('Browser session has not been started.');
  const snapshot = await state.page.evaluate(() => {
    const interestingSelectors = [
      'button',
      'select',
      'input',
      'textarea',
      'canvas.preview-canvas-host',
      '[role="tab"]'
    ];
    const nodes = interestingSelectors.flatMap((selector) =>
      [...document.querySelectorAll(selector)].map((node) => ({
        tag: node.tagName.toLowerCase(),
        text: (node.textContent || '').trim().slice(0, 200),
        value: 'value' in node ? node.value : undefined,
        ariaLabel: node.getAttribute('aria-label'),
        selector
      }))
    );
    return {
      title: document.title,
      url: location.href,
      bodyText: document.body.innerText.slice(0, 5000),
      nodes
    };
  });
  return { ok: true, snapshot };
}

export async function openPreviewTab(state) {
  await activateTab(state, 'PREVIEW');
  const layoutPresent = await state.page.locator('canvas.preview-canvas-host').first().isVisible().catch(() => false)
    || await state.page.locator('select').first().isVisible().catch(() => false);
  return { ok: layoutPresent, layout_present: layoutPresent };
}

export async function selectPreviewSource(state, { source_id, source_name }) {
  if (!state.page) throw new Error('Browser session has not been started.');
  await openPreviewTab(state);
  const select = state.page.locator('select').nth(0);
  if (source_id) await select.selectOption(String(source_id));
  else if (source_name) await select.selectOption({ label: String(source_name) });
  else throw new Error('source_id or source_name is required.');
  await state.page.waitForTimeout(250);
  return { ok: true };
}

export async function selectPreviewPreset(state, { preset_name }) {
  if (!state.page) throw new Error('Browser session has not been started.');
  await openPreviewTab(state);
  if (!preset_name) throw new Error('preset_name is required.');
  await state.page.locator('select').nth(1).selectOption({ label: String(preset_name) });
  await state.page.waitForTimeout(250);
  return { ok: true };
}

export async function applyPreviewControlSet(state, payload = {}) {
  if (!state.page) throw new Error('Browser session has not been started.');
  await openPreviewTab(state);
  await state.page.evaluate((patch) => {
    const applySimpleFields = (entries) => {
      entries.forEach(([label, value]) => {
        if (value === undefined || value === null) return;
        const labels = [...document.querySelectorAll('label')];
        const target = labels.find((node) => node.textContent.trim().toLowerCase() === String(label).trim().toLowerCase());
        if (!target) return;
        const container = target.parentElement;
        const input = container?.querySelector('input, select, textarea');
        if (!input) return;
        if (input.tagName === 'SELECT') {
          input.value = String(value);
          input.dispatchEvent(new Event('change', { bubbles: true }));
          return;
        }
        if (input.type === 'checkbox') {
          input.checked = !!value;
          input.dispatchEvent(new Event('change', { bubbles: true }));
          return;
        }
        input.value = String(value);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
    };
    const flatten = (group) => Object.entries(group || {});
    applySimpleFields(flatten(patch.scene));
    applySimpleFields(flatten(patch.layer));
    applySimpleFields(flatten(patch.emitter));
    applySimpleFields(flatten(patch.particle));
    applySimpleFields(flatten(patch.simulation));
    applySimpleFields(flatten(patch.render));
  }, payload);
  await state.page.waitForTimeout(250);
  return { ok: true };
}
