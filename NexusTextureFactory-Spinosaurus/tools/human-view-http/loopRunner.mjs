import fs from 'node:fs/promises';
import path from 'node:path';
import { captureFullApp, captureViewport, ensureArtifactDirs } from './capture.mjs';
import {
  openApp,
  openPreviewTab,
  selectPreviewSource,
  applyPreviewControlSet
} from './browserSession.mjs';

async function writeLoopReport(state, report) {
  await ensureArtifactDirs(state);
  const filePath = path.join(state.reportsRoot, `${new Date().toISOString().replace(/[:.]/g, '-')}-${report.loop_name}.json`);
  await fs.writeFile(filePath, JSON.stringify(report, null, 2));
  return filePath;
}

export async function runValidationPass(state, { pass_name = 'preview_visibility' } = {}) {
  if (!state.page) throw new Error('Browser session has not been started.');
  const screenshots = [];
  if (pass_name === 'preview_visibility') {
    await openPreviewTab(state);
    screenshots.push((await captureFullApp(state, { label: 'preview-full', fullPage: true })).file_path);
    screenshots.push((await captureViewport(state, { label: 'preview-viewport' })).file_path);
  } else if (pass_name === 'control_binding') {
    screenshots.push((await captureFullApp(state, { label: 'control-before', fullPage: true })).file_path);
    await applyPreviewControlSet(state, { emitter: { Rate: 480 }, simulation: { drag: 0.35 } });
    screenshots.push((await captureFullApp(state, { label: 'control-after', fullPage: true })).file_path);
  } else {
    screenshots.push((await captureFullApp(state, { label: 'pass-generic', fullPage: true })).file_path);
  }
  const console_summary = state.consoleLogs.slice(-10);
  const verdict = console_summary.some((entry) => ['error', 'pageerror'].includes(entry.type)) ? 'fail' : 'pass';
  return { ok: true, verdict, screenshots, console_summary };
}

export async function runLoop(state, { loop_name = 'toolchain_readiness', target_url = '', max_iterations = 3 } = {}) {
  if (state.loop.running) throw new Error('A loop is already running.');
  state.loop = {
    running: true,
    loopName: loop_name,
    iteration: 0,
    lastVerdict: '',
    latestCapturePaths: [],
    stopRequested: false,
    startedAt: new Date().toISOString(),
    finishedAt: '',
    targetUrl: target_url
  };
  const run = async () => {
    try {
      for (let iteration = 1; iteration <= Math.max(1, max_iterations); iteration++) {
        if (state.loop.stopRequested) break;
        state.loop.iteration = iteration;
        if (target_url) await openApp(state, { url: target_url });
        let result;
        if (loop_name === 'toolchain_readiness') {
          const full = await captureFullApp(state, { label: `toolchain-${iteration}`, fullPage: true });
          result = { verdict: 'pass', screenshots: [full.file_path] };
        } else if (loop_name === 'preview_visibility') {
          await openPreviewTab(state);
          if (iteration === 1 && !state.appUrl && target_url) await openApp(state, { url: target_url });
          const pass = await runValidationPass(state, { pass_name: 'preview_visibility' });
          result = pass;
        } else if (loop_name === 'control_binding') {
          const pass = await runValidationPass(state, { pass_name: 'control_binding' });
          result = pass;
        } else if (loop_name === 'regression') {
          const before = await captureFullApp(state, { label: `regression-before-${iteration}`, fullPage: true });
          const viewport = await captureViewport(state, { label: `regression-viewport-${iteration}` });
          result = { verdict: 'pass', screenshots: [before.file_path, viewport.file_path] };
        } else {
          const fallback = await captureFullApp(state, { label: `loop-${iteration}`, fullPage: true });
          result = { verdict: 'pass', screenshots: [fallback.file_path] };
        }
        state.loop.lastVerdict = result.verdict;
        state.loop.latestCapturePaths = result.screenshots || [];
        if (result.verdict !== 'pass') break;
      }
      state.loop.running = false;
      state.loop.finishedAt = new Date().toISOString();
      await writeLoopReport(state, {
        loop_name: state.loop.loopName,
        iteration: state.loop.iteration,
        verdict: state.loop.lastVerdict,
        captures: state.loop.latestCapturePaths,
        console: state.consoleLogs.slice(-25),
        network: state.networkLogs.slice(-25)
      });
    } catch (error) {
      state.latestError = error.message;
      state.loop.lastVerdict = 'fail';
      state.loop.running = false;
      state.loop.finishedAt = new Date().toISOString();
      await writeLoopReport(state, {
        loop_name: state.loop.loopName,
        iteration: state.loop.iteration,
        verdict: 'fail',
        error: error.message
      });
    }
  };
  run();
  return { ok: true, running: true };
}

export async function stopLoop(state) {
  state.loop.stopRequested = true;
  state.loop.running = false;
  state.loop.finishedAt = new Date().toISOString();
  return { ok: true };
}
