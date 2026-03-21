const baseUrl = process.env.HUMAN_VIEW_HTTP_BASE_URL || 'http://127.0.0.1:41777';
const loopName = process.env.HUMAN_VIEW_LOOP_NAME || 'preview_visibility';
const targetUrl = process.env.HUMAN_VIEW_TARGET_URL || 'http://127.0.0.1:3014/';
const maxIterations = Number(process.env.HUMAN_VIEW_MAX_ITERATIONS || 3);

async function request(path, body) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {})
  });
  const payload = await response.json();
  if (!response.ok || payload?.ok === false) throw new Error(payload?.error || `Request failed: ${response.status}`);
  return payload;
}

await request('/loop/run', {
  loop_name: loopName,
  target_url: targetUrl,
  max_iterations: maxIterations
});

console.log(`loop started: ${loopName}`);
