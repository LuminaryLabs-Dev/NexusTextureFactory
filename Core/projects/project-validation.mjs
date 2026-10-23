export const PROJECT_SCHEMA = 'nexustexture.project/1';
export function validateProject(project) {
  if (!project || typeof project !== 'object' || Array.isArray(project)) throw new TypeError('Project must be an object');
  if (project.schemaVersion !== PROJECT_SCHEMA) throw new TypeError('Unsupported project schema');
  for (const field of ['id', 'name', 'createdAt', 'updatedAt']) {
    if (typeof project[field] !== 'string' || !project[field].trim()) throw new TypeError(`Invalid project ${field}`);
  }
  if (!project.settings || typeof project.settings !== 'object' || Array.isArray(project.settings)) throw new TypeError('Invalid project settings');
  if (project.activeTextureId != null && typeof project.activeTextureId !== 'string') throw new TypeError('Invalid active texture');
  return project;
}
export function validateSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) throw new TypeError('Invalid snapshot');
  if (!snapshot.state || typeof snapshot.state !== 'object' || Array.isArray(snapshot.state)) throw new TypeError('Invalid snapshot state');
  if (!Array.isArray(snapshot.blobs)) throw new TypeError('Invalid snapshot blobs');
  const seen = new Set();
  for (const [key, blob] of snapshot.blobs) {
    if (typeof key !== 'string' || !key || seen.has(key)) throw new TypeError('Invalid or duplicate blob key');
    if (!blob || typeof blob.size !== 'number') throw new TypeError('Invalid binary asset');
    seen.add(key);
  }
  const raw = snapshot.state['alphacarve-meta-library-v1'];
  if (raw !== undefined) {
    if (typeof raw !== 'string') throw new TypeError('Invalid legacy library encoding');
    let records;
    try { records = JSON.parse(raw); } catch { throw new TypeError('Corrupt legacy library JSON'); }
    if (!Array.isArray(records)) throw new TypeError('Invalid legacy library records');
    for (const item of records) {
      if (item?.storageKey && !seen.has(item.storageKey)) throw new TypeError(`Missing texture blob: ${item.storageKey}`);
    }
  }
  return snapshot;
}
