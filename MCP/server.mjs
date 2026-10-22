import {runCommand} from "../Modules/commands.mjs";
import {createInterface} from "node:readline";
const tools=["list_operations","validate_recipe","render_recipe"];
const send=message=>process.stdout.write(JSON.stringify(message)+"\n");
const io=createInterface({input:process.stdin,crlfDelay:Infinity});
for await(const line of io){let msg;try{msg=JSON.parse(line);if(msg.method==="initialize")send({jsonrpc:"2.0",id:msg.id,result:{protocolVersion:"2025-03-26",capabilities:{tools:{}},serverInfo:{name:"nexustexturefactory",version:"4.0.0-alpha"}}});else if(msg.method==="tools/list")send({jsonrpc:"2.0",id:msg.id,result:{tools:tools.map(name=>({name,description:name.replace(/_/g," "),inputSchema:{type:"object",properties:{recipe:{type:"object"}},additionalProperties:false}}))}});else if(msg.method==="tools/call"){const result=runCommand(msg.params.name,msg.params.arguments??{});send({jsonrpc:"2.0",id:msg.id,result:{content:[{type:"text",text:JSON.stringify(result)}]}});}else if(msg.id!=null)send({jsonrpc:"2.0",id:msg.id,error:{code:-32601,message:"Unknown method"}});}catch(e){send({jsonrpc:"2.0",id:msg?.id??null,error:{code:-32603,message:e.message}});}}
