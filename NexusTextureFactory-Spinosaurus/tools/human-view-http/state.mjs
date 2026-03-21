import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');
const artifactsRoot = path.join(projectRoot, '.human-view');
const capturesRoot = path.join(artifactsRoot, 'captures');
const reportsRoot = path.join(artifactsRoot, 'reports');

export function createState() {
  return {
    projectRoot,
    capturesRoot,
    reportsRoot,
    browser: null,
    context: null,
    page: null,
    consoleLogs: [],
    networkLogs: [],
    latestCapture: null,
    latestError: '',
    appUrl: '',
    session: {
      browserReady: false,
      viewport: { width: 1440, height: 960 },
      headless: false
    },
    loop: {
      running: false,
      loopName: '',
      iteration: 0,
      lastVerdict: '',
      latestCapturePaths: [],
      stopRequested: false,
      startedAt: '',
      finishedAt: '',
      targetUrl: ''
    }
  };
}
