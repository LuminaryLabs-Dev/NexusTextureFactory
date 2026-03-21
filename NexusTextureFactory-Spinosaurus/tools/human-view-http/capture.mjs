import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

export async function ensureArtifactDirs(state) {
  await fs.mkdir(state.capturesRoot, { recursive: true });
  await fs.mkdir(state.reportsRoot, { recursive: true });
}

function buildCapturePath(state, label) {
  const safeLabel = String(label || 'capture').replace(/[^a-z0-9-_]+/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'capture';
  return path.join(state.capturesRoot, `${new Date().toISOString().replace(/[:.]/g, '-')}-${safeLabel}.png`);
}

export async function captureFullApp(state, { label = 'full-app', fullPage = true } = {}) {
  if (!state.page) throw new Error('No active page for capture.');
  await ensureArtifactDirs(state);
  const filePath = buildCapturePath(state, label);
  await state.page.screenshot({ path: filePath, fullPage: !!fullPage });
  const metadata = await sharp(filePath).metadata();
  const payload = {
    ok: true,
    file_path: filePath,
    captured_at: new Date().toISOString(),
    width: metadata.width || 0,
    height: metadata.height || 0,
    mode: 'full_app'
  };
  state.latestCapture = payload;
  return payload;
}

export async function captureViewport(state, { label = 'viewport' } = {}) {
  if (!state.page) throw new Error('No active page for capture.');
  await ensureArtifactDirs(state);
  const filePath = buildCapturePath(state, label);
  await state.page.screenshot({ path: filePath, fullPage: false });
  const metadata = await sharp(filePath).metadata();
  const payload = {
    ok: true,
    file_path: filePath,
    captured_at: new Date().toISOString(),
    width: metadata.width || 0,
    height: metadata.height || 0,
    mode: 'viewport'
  };
  state.latestCapture = payload;
  return payload;
}

export async function captureElement(state, { selector, label = 'element' } = {}) {
  if (!state.page) throw new Error('No active page for capture.');
  if (!selector) throw new Error('Element selector is required.');
  await ensureArtifactDirs(state);
  const locator = state.page.locator(selector).first();
  await locator.waitFor({ state: 'visible', timeout: 5000 });
  const filePath = buildCapturePath(state, label);
  await locator.screenshot({ path: filePath });
  const metadata = await sharp(filePath).metadata();
  const payload = {
    ok: true,
    file_path: filePath,
    captured_at: new Date().toISOString(),
    width: metadata.width || 0,
    height: metadata.height || 0,
    mode: 'element'
  };
  state.latestCapture = payload;
  return payload;
}
