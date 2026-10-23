import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// The V3 browser loads these scripts through Babel. A literal backslash-n
// between JSX nodes is a parsing error, but a static Pages build will not catch it.
test('Studio app JSX contains no literal escaped line break artifacts', () => {
  const source = readFileSync(new URL('../Studio/src/view/App.js', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /\\\\n/, 'Literal backslash-n can break JSX parsing');
  assert.match(source, /<ProjectLibrary onClose=/);
  assert.match(source, /<NavBar uiVM=/);
});
