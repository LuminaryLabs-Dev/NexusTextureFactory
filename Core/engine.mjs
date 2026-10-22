import {operations} from "../Kits/registry.mjs";
export const SCHEMA="nexustexture.recipe/1";
export function validateRecipe(recipe){
 if(!recipe||recipe.schemaVersion!==SCHEMA)throw Error("Expected "+SCHEMA);
 const w=recipe.canvas?.width,h=recipe.canvas?.height;
 if(!Number.isInteger(w)||!Number.isInteger(h)||w<1||h<1||w>4096||h>4096||w*h>4194304)throw Error("Invalid or oversized canvas");
 if(!Array.isArray(recipe.nodes)||!recipe.nodes.length||recipe.nodes.length>128)throw Error("Recipe requires 1-128 nodes");
 const seen=new Set();
 for(const n of recipe.nodes){if(typeof n.id!=="string"||!/^[-\w]{1,80}$/.test(n.id)||seen.has(n.id))throw Error("Invalid or duplicate node ID");if(!operations[n.kit])throw Error("Unknown kit: "+n.kit);if((n.inputs??[]).some(id=>!seen.has(id)))throw Error("Inputs must refer to earlier nodes");seen.add(n.id);}
 if(!seen.has(recipe.output))throw Error("Missing output node");return true;
}
export function renderRecipe(recipe){
 validateRecipe(recipe);const {width:w,height:h}=recipe.canvas,seed=Number(recipe.seed??0);if(!Number.isFinite(seed))throw Error("Invalid seed");
 const outputs=new Map();
 for(const n of recipe.nodes){const op=operations[n.kit];const data=op.apply({w,h,seed,params:{...op.params,...n.params},inputs:(n.inputs??[]).map(id=>outputs.get(id))});if(data.length!==w*h||data.some(v=>!Number.isFinite(v)))throw Error("Invalid node pixels: "+n.id);outputs.set(n.id,data);}
 return {width:w,height:h,alpha:outputs.get(recipe.output),nodes:[...outputs.keys()]};
}
