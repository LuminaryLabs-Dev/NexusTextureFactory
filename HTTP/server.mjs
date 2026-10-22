import {createServer} from "node:http";
import {runCommand} from "../Modules/commands.mjs";
const port=Number(process.env.PORT??3794);
createServer(async(req,res)=>{res.setHeader("content-type","application/json");if(req.method!=="POST"||req.url!=="/run"){res.writeHead(404);res.end(JSON.stringify({error:"POST /run"}));return;}let raw="";try{for await(const b of req){raw+=b;if(raw.length>2000000)throw Error("Request too large");}const input=JSON.parse(raw);res.end(JSON.stringify(runCommand(input.command,input.args)));}catch(e){res.writeHead(400);res.end(JSON.stringify({error:e.message}));}}).listen(port,"127.0.0.1",()=>console.log("TextureFactory HTTP on "+port));
