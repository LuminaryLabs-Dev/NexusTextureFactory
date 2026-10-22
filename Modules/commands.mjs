import {renderRecipe,validateRecipe} from "../Core/engine.mjs";
import {listOperations} from "../Kits/registry.mjs";
import {encodePng} from "./png.mjs";
export function runCommand(name,args={}){switch(name){case"list_operations":return {operations:listOperations()};case"validate_recipe":validateRecipe(args.recipe);return {valid:true};case"render_recipe":{const result=renderRecipe(args.recipe);return {width:result.width,height:result.height,pngBase64:encodePng(result).toString("base64")};}default:throw Error("Unknown command: "+name);}}
