import test from "node:test";import assert from "node:assert/strict";import {renderRecipe,validateRecipe} from "../Core/engine.mjs";import {encodePng} from "../Modules/png.mjs";import {operations} from "../Kits/registry.mjs";
const recipe={schemaVersion:"nexustexture.recipe/1",seed:3,canvas:{width:16,height:16},nodes:[{id:"a",kit:"shape"},{id:"b",kit:"noise"},{id:"c",kit:"blend",inputs:["a","b"]}],output:"c"};
test("deterministic output and PNG",()=>{const a=renderRecipe(recipe),b=renderRecipe(recipe);assert.deepEqual(a.alpha,b.alpha);const png=encodePng(a);assert.equal(png.subarray(1,4).toString(),"PNG");});
test("operation registry nonempty",()=>assert.ok(Object.keys(operations).length>=5));
test("reject invalid dependency graphs",()=>assert.throws(()=>validateRecipe({...recipe,nodes:[{id:"x",kit:"blend",inputs:["later"]}]})));
