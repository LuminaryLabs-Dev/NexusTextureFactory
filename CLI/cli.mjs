#!/usr/bin/env node
import {readFile,writeFile,mkdir} from "node:fs/promises";
import {resolve,dirname} from "node:path";
import {renderRecipe,validateRecipe} from "../Core/engine.mjs";
import {encodePng} from "../Modules/png.mjs";
import {listOperations} from "../Kits/registry.mjs";
const [command,file,dest]=process.argv.slice(2);
try{
 if(command==="list"){console.log(JSON.stringify(listOperations(),null,2));}
 else if(["validate","render"].includes(command)){if(!file)throw Error("Missing recipe JSON path");const recipe=JSON.parse(await readFile(resolve(file),"utf8"));validateRecipe(recipe);if(command==="validate")console.log("Valid recipe");else{const output=resolve(dest??"texture.png");await mkdir(dirname(output),{recursive:true});await writeFile(output,encodePng(renderRecipe(recipe)));console.log(output);}}
 else throw Error("Usage: texture list | validate <recipe.json> | render <recipe.json> [output.png]");
}catch(e){console.error(e.message);process.exitCode=1;}
