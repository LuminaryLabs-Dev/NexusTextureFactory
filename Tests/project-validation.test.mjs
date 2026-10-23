import test from 'node:test';
import assert from 'node:assert/strict';
import { validateProject, validateSnapshot, PROJECT_SCHEMA } from '../Core/projects/project-validation.mjs';
const project = () => ({schemaVersion:PROJECT_SCHEMA,id:'id-1',name:'Magic Initiation',createdAt:'2026-10-23',updatedAt:'2026-10-23',settings:{resolution:512},activeTextureId:null});
test('accepts valid versioned project',()=>assert.equal(validateProject(project()).id,'id-1'));
test('rejects wrong schema and empty names',()=>{assert.throws(()=>validateProject({...project(),schemaVersion:'v0'}));assert.throws(()=>validateProject({...project(),name:''}));});
test('accepts complete blob-backed snapshot',()=>{const s={state:{'alphacarve-meta-library-v1':JSON.stringify([{storageKey:'blob1'}])},blobs:[['blob1',new Blob(['PNG'])]]};assert.equal(validateSnapshot(s),s);});
test('rejects missing or duplicate blobs',()=>{const s={state:{'alphacarve-meta-library-v1':JSON.stringify([{storageKey:'missing'}])},blobs:[]};assert.throws(()=>validateSnapshot(s),/Missing/);assert.throws(()=>validateSnapshot({state:{},blobs:[['x',new Blob()],['x',new Blob()]]}),/duplicate/);});
test('rejects corrupt legacy records',()=>assert.throws(()=>validateSnapshot({state:{'alphacarve-meta-library-v1':'{'},blobs:[]}),/Corrupt/));
