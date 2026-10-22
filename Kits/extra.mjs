// V4 CPU mask operations. GPU legacy parity has not been certified.
const clamp=x=>Math.max(0,Math.min(1,x));
const src=(inputs,w,h)=>{const a=inputs?.[0];if(!(a instanceof Float32Array)||a.length!==w*h)throw Error("Operation requires image input");return a;};
const pixel=(a,w,h,x,y)=>a[Math.max(0,Math.min(h-1,y))*w+Math.max(0,Math.min(w-1,x))];
const morphology=(w,h,a,r,mode)=>{r=Math.trunc(Number(r));if(!Number.isFinite(r)||r<0||r>16)throw Error("radius must be 0-16");const out=new Float32Array(w*h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){let v=mode==="erode"?1:0;for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r++){const s=pixel(a,w,h,x+dx,y+dy);v=mode==="erode"?Math.min(v,s):Math.max(v,s);}out[y*w+x]=v;}return out;};
export const extraOperations=Object.freeze({
 vignette:{id:"vignette",params:{radius:.4,softness:.15},apply:({w,h,params})=>{const a=new Float32Array(w*h),r=Number(params.radius),s=Math.max(.00001,Number(params.softness));for(let y=0;y<h;y++)for(let x=0;x<w;x++)a[y*w+x]=clamp((r-Math.hypot((x+.5)/w-.5,(y+.5)/h-.5))/s);return a;}},
 posterize:{id:"posterize",params:{levels:4},apply:({w,h,inputs,params})=>{const a=src(inputs,w,h),n=Math.trunc(Number(params.levels));if(!Number.isFinite(n)||n<2||n>256)throw Error("levels must be 2-256");return Float32Array.from(a,v=>Math.round(clamp(v)*(n-1))/(n-1));}},
 dilate:{id:"dilate",params:{radius:1},apply:({w,h,inputs,params})=>morphology(w,h,src(inputs,w,h),params.radius,"dilate")},
 erode:{id:"erode",params:{radius:1},apply:({w,h,inputs,params})=>morphology(w,h,src(inputs,w,h),params.radius,"erode")},
 outline:{id:"outline",params:{radius:2},apply:({w,h,inputs,params})=>{const a=src(inputs,w,h),r=Number(params.radius);if(!Number.isInteger(r)||r<1||r>16)throw Error("radius must be 1-16");const b=morphology(w,h,a,r,"dilate");return Float32Array.from(b,(v,i)=>clamp(v-a[i]));}},
 spiral:{id:"spiral",params:{turns:1.2},apply:({w,h,inputs,params})=>{const a=src(inputs,w,h),t=Number(params.turns);if(!Number.isFinite(t)||Math.abs(t)>20)throw Error("invalid turns");const out=new Float32Array(a.length);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const dx=(x+.5)/w-.5,dy=(y+.5)/h-.5,r=Math.hypot(dx,dy),ang=-t*2*Math.PI*Math.max(0,1-r*2),cs=Math.cos(ang),sn=Math.sin(ang);out[y*w+x]=pixel(a,w,h,Math.round(((dx*cs-dy*sn)+.5)*w-.5),Math.round(((dx*sn+dy*cs)+.5)*h-.5));}return out;}}
});
