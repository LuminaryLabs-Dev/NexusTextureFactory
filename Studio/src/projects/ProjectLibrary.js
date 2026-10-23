
function ProjectLibrary({onClose}) {
 const [projects,setProjects]=React.useState([]),[active,setActive]=React.useState(null),[error,setError]=React.useState(""),[busy,setBusy]=React.useState(false);
 const [saveStatus,setSaveStatus]=React.useState("Ready");
 React.useEffect(()=>{const listener=e=>setSaveStatus(e.detail.status);window.addEventListener("texture-project-save",listener);return()=>window.removeEventListener("texture-project-save",listener);},[]);
 const fileRef=React.useRef(null);
 const refresh=React.useCallback(async()=>{setProjects(await TextureProjects.list());setActive(await TextureProjects.active());},[]);
 React.useEffect(()=>{TextureProjects.initialize().then(refresh).catch(e=>setError(e.message));},[refresh]);
 const action=async(fn)=>{setBusy(true);setError("");try{await fn();await refresh();}catch(e){setError(e.message);}finally{setBusy(false);}};
 const download=(name,contents)=>{const url=URL.createObjectURL(new Blob([contents],{type:"application/json"}));const a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 return <div className="absolute inset-0 z-50 bg-[#111] text-gray-200 overflow-y-auto p-6">
 <div className="max-w-3xl mx-auto space-y-5">
 <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">NexusTextureFactory</h1><p className="text-gray-400 text-sm">Local project library · Stored in this browser · {saveStatus}</p></div><button className="border border-gray-600 px-4 py-2 rounded" onClick={onClose}>Back to Studio</button></div>
 <div className="flex flex-wrap gap-2">
 <button className="bg-blue-600 px-4 py-2 rounded" disabled={busy} onClick={()=>action(async()=>{const name=prompt("New project name");if(name)await TextureProjects.create(name);})}>New Project</button>
 <button className="border border-gray-600 px-4 py-2 rounded" onClick={()=>fileRef.current.click()}>Import Project</button>
 <input type="file" accept=".json,application/json" ref={fileRef} className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)action(async()=>{await TextureProjects.importProject(await f.text());});e.target.value="";}}/>
 <button className="border border-gray-600 px-4 py-2 rounded" onClick={()=>action(()=>TextureProjects.importLegacy())}>Copy Current V3 Save</button>
 </div>
 {error&&<p role="alert" className="text-red-400">{error}</p>}
 <p className="text-xs text-gray-400">Opening a project restores its saved textures and settings and reloads Studio. Export backups before clearing browser data. Saves from other origins require import.</p>
 <div className="space-y-2">{projects.map(p=><div key={p.id} className="border border-gray-700 bg-[#1b1b1b] rounded p-4">
 <div className="flex justify-between gap-4"><div><strong>{p.name}</strong>{active===p.id&&<span className="ml-2 text-blue-300 text-xs">ACTIVE</span>}<div className="text-xs text-gray-400">{p.updatedAt}</div></div><div className="flex flex-wrap justify-end gap-2">
 <button disabled={busy} className="text-blue-300" onClick={()=>action(async()=>{await TextureProjects.open(p.id);location.reload();})}>Open</button>
 <button disabled={busy||active!==p.id} onClick={()=>action(()=>TextureProjects.save(p.id))}>Save</button>
 <button disabled={busy} onClick={()=>action(async()=>{const name=prompt("Rename project",p.name);if(name)await TextureProjects.rename(p.id,name);})}>Rename</button>
 <button disabled={busy} onClick={()=>action(()=>TextureProjects.duplicate(p.id))}>Duplicate</button>
 <button disabled={busy} onClick={()=>action(async()=>download(p.name.replace(/[^\w-]/g,"_")+".json",await TextureProjects.exportProject(p.id)))}>Export</button>
 <button disabled={busy} className="text-red-400" onClick={()=>action(async()=>{if(confirm("Delete this local project? Export a backup first."))await TextureProjects.remove(p.id);})}>Delete</button>
 </div></div></div>)}</div>
 </div></div>;
}
