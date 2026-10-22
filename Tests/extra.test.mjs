import test from "node:test";import assert from "node:assert/strict";import {extraOperations as ops} from "../Kits/extra.mjs";
const w=9,h=9,mask=new Float32Array(w*h);mask[4*w+4]=1;
test("six operations return finite alpha",()=>{for(const op of Object.values(ops)){const out=op.apply({w,h,inputs:[mask],params:op.params});assert.equal(out.length,w*h);assert.ok(out.every(v=>Number.isFinite(v)&&v>=0&&v<=1));}});
test("morphology and outline",()=>{const dil=ops.dilate.apply({w,h,inputs:[mask],params:{radius:1}});assert.equal(dil.reduce((a,v)=>a+v,0),9);const edge=ops.outline.apply({w,h,inputs:[mask],params:{radius:1}});assert.equal(edge[4*w+4],0);assert.equal(edge[4*w+5],1);});
test("reject invalid input and radius",()=>{assert.throws(()=>ops.erode.apply({w,h,inputs:[],params:{radius:1}}));assert.throws(()=>ops.dilate.apply({w,h,inputs:[mask],params:{radius:100}}));});
