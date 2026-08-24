import React,{useEffect,useMemo,useState} from 'react'
import {RotateCcw,ShieldCheck,Trash2,X} from 'lucide-react'
import {useCommandStore} from './store.js'

const BACKUP_KEY='memory-space-safety-backup-v1'

const cleanState=state=>{
  const clean={}
  Object.entries(state).forEach(([key,value])=>{if(typeof value!=='function')clean[key]=value})
  return clean
}

export default function SafetyDock(){
  const trash=useCommandStore(s=>s.trashBin||[])
  const restore=useCommandStore(s=>s.restoreTrashItem)
  const permanentlyDelete=useCommandStore(s=>s.permanentlyDeleteTrashItem)
  const emptyTrash=useCommandStore(s=>s.emptyTrash)
  const [open,setOpen]=useState(false)
  const [savedAt,setSavedAt]=useState(null)

  useEffect(()=>{
    let timer
    const save=state=>{
      clearTimeout(timer)
      timer=setTimeout(()=>{
        try{
          const stamp=new Date().toISOString()
          localStorage.setItem(BACKUP_KEY,JSON.stringify({saved_at:stamp,state:cleanState(state)}))
          setSavedAt(stamp)
        }catch{}
      },700)
    }
    save(useCommandStore.getState())
    const unsub=useCommandStore.subscribe(save)
    return()=>{clearTimeout(timer);unsub()}
  },[])

  const recent=useMemo(()=>trash.slice(0,6),[trash])
  const savedLabel=savedAt?new Date(savedAt).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}):'starting'

  return <div className={`safetyDock ${open?'open':''}`}>
    <button className="safetyPill" onClick={()=>setOpen(v=>!v)} aria-expanded={open}>
      <ShieldCheck size={15}/><span>Protected</span>{trash.length>0&&<b>{trash.length}</b>}
    </button>
    {open&&<section className="safetyPanel">
      <header><div><span>Data Safety</span><strong>Recovery Center</strong></div><button onClick={()=>setOpen(false)} aria-label="Close"><X size={14}/></button></header>
      <div className="safetyStatus"><ShieldCheck size={16}/><div><strong>Rolling local safety copy active</strong><small>Last copy: {savedLabel} · separate from the main app storage</small></div></div>
      <div className="safetyTitle"><span>Recently deleted</span><b>{trash.length}</b></div>
      <div className="safetyList">
        {recent.map(item=><div className="safetyItem" key={item.id}><div><strong>{item.label||'Deleted item'}</strong><small>{item.entityType} · {new Date(item.deleted_at).toLocaleString('en-GB',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}</small></div><div><button className="restoreBtn" onClick={()=>restore(item.id)} title="Restore"><RotateCcw size={13}/></button><button className="purgeBtn" onClick={()=>{if(confirm('Permanently delete this recovered item?'))permanentlyDelete(item.id)}} title="Delete forever"><Trash2 size={13}/></button></div></div>)}
        {!recent.length&&<div className="safetyEmpty">Nothing deleted. Your recovery bin is clear.</div>}
      </div>
      {trash.length>0&&<button className="emptyTrashBtn" onClick={()=>{if(confirm('Permanently empty the recovery bin?'))emptyTrash()}}>Empty recovery bin</button>}
    </section>}
  </div>
}
