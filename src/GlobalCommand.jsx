import React,{useEffect,useMemo,useRef,useState} from 'react'
import {Brain,CalendarDays,Command,FlaskConical,ListTodo,Package,Search,Users,UsersRound,X,Zap} from 'lucide-react'
import {useNavigate} from 'react-router-dom'
import {useCommandStore} from './store.js'

const routeMeta={
  task:{label:'Task',path:'/tasks',icon:ListTodo},event:{label:'Calendar',path:'/calendar',icon:CalendarDays},memory:{label:'Memory',path:'/memory',icon:Brain},lead:{label:'Lead',path:'/leads',icon:Users},client:{label:'Client',path:'/clients',icon:UsersRound},product:{label:'Product',path:'/warehouse',icon:Package},research:{label:'Research',path:'/research',icon:FlaskConical}
}

const text=v=>String(v??'').toLowerCase()
const todayKey=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}

export default function GlobalCommand(){
  const nav=useNavigate();const inputRef=useRef(null);const [open,setOpen]=useState(false);const [q,setQ]=useState('');const [active,setActive]=useState(0)
  const s=useCommandStore()
  useEffect(()=>{const onKey=e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setOpen(v=>!v)}if(e.key==='Escape')setOpen(false)};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[])
  useEffect(()=>{if(open)setTimeout(()=>inputRef.current?.focus(),30)},[open])

  const items=useMemo(()=>[
    ...s.todos.map(x=>({type:'task',id:x.id,title:x.task,sub:`${x.priority||'medium'} priority${x.due_date?` · ${x.due_date}`:''}`,hay:`${x.task} ${x.category} ${x.notes}`})),
    ...s.events.map(x=>({type:'event',id:x.id,title:x.title,sub:`${x.date||''} ${x.time||''}`,hay:`${x.title} ${x.category} ${x.notes}`})),
    ...s.memories.filter(x=>!x.deleted).map(x=>({type:'memory',id:x.id,title:x.title,sub:`${x.category||'General'}${x.pinned?' · pinned':''}`,hay:`${x.title} ${x.content} ${(x.tags||[]).join(' ')} ${x.related}`})),
    ...s.leads.map(x=>({type:'lead',id:x.id,title:x.name||x.business||'Lead',sub:`${x.status||'new'} · ${x.service||''}`,hay:`${x.name} ${x.business} ${x.phone} ${x.service} ${x.notes}`})),
    ...s.clients.map(x=>({type:'client',id:x.id,title:x.name||x.business||'Client',sub:`${x.status||'active'} · ${x.service||''}`,hay:`${x.name} ${x.business} ${x.phone} ${x.email} ${x.service} ${x.notes}`})),
    ...s.products.map(x=>({type:'product',id:x.id,title:x.name,sub:`${x.sku||''} · stock ${x.stock??0}`,hay:`${x.name} ${x.sku} ${x.business} ${x.supplier}`})),
    ...s.research.map(x=>({type:'research',id:x.id,title:x.title,sub:`${x.status||''} · ${x.type||''}`,hay:`${x.title} ${x.summary} ${x.action_items} ${x.url}`}))
  ],[s.todos,s.events,s.memories,s.leads,s.clients,s.products,s.research])

  const term=q.trim().toLowerCase();const command=term.startsWith('task:')?'task':term.startsWith('memory:')?'memory':null
  const results=useMemo(()=>{if(!term||command)return items.slice(0,10);const words=term.split(/\s+/);return items.map(item=>({item,score:words.reduce((a,w)=>a+(text(item.title).includes(w)?4:0)+(text(item.sub).includes(w)?2:0)+(text(item.hay).includes(w)?1:0),0)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,12).map(x=>x.item)},[items,term,command])
  useEffect(()=>setActive(0),[q,open])

  const close=()=>{setOpen(false);setQ('')}
  const select=item=>{nav(routeMeta[item.type].path);close()}
  const capture=()=>{const body=q.slice(q.indexOf(':')+1).trim();if(!body)return;if(command==='task')s.addTodo({task:body,priority:'medium',due_date:todayKey(),category:'Quick Capture'});else s.addMemory({title:body.slice(0,80),content:body,category:'Quick Capture',tags:['command']});nav(command==='task'?'/tasks':'/memory');close()}
  const onKeyDown=e=>{if(e.key==='ArrowDown'){e.preventDefault();setActive(x=>Math.min(x+1,Math.max(results.length-1,0)))}if(e.key==='ArrowUp'){e.preventDefault();setActive(x=>Math.max(x-1,0))}if(e.key==='Enter'){e.preventDefault();command?capture():results[active]&&select(results[active])}}

  return <>
    <button className="commandLauncher" onClick={()=>setOpen(true)} aria-label="Open universal command center"><Command size={14}/><span>Search</span><kbd>⌘K</kbd></button>
    {open&&<div className="commandBackdrop" onMouseDown={close}><section className="commandPanel" onMouseDown={e=>e.stopPropagation()}>
      <header><div className="commandBrand"><span><Zap size={14}/></span><div><b>MEMORY SPACE</b><small>Universal Command Center</small></div></div><button onClick={close}><X size={16}/></button></header>
      <div className="commandSearch"><Search size={17}/><input ref={inputRef} value={q} onChange={e=>setQ(e.target.value)} onKeyDown={onKeyDown} placeholder="Search everything… or type task: / memory:"/><kbd>ESC</kbd></div>
      {command?<button className="commandCapture" onClick={capture}><span>{command==='task'?<ListTodo size={17}/>:<Brain size={17}/>}</span><div><b>Create {command}</b><small>{q.slice(q.indexOf(':')+1).trim()||`Type something after ${command}:`}</small></div><em>Enter ↵</em></button>:<div className="commandResults">{results.map((item,i)=>{const meta=routeMeta[item.type];const Icon=meta.icon;return <button key={`${item.type}-${item.id}`} className={i===active?'active':''} onMouseEnter={()=>setActive(i)} onClick={()=>select(item)}><span className={`commandType ${item.type}`}><Icon size={15}/></span><div><b>{item.title||'Untitled'}</b><small>{item.sub}</small></div><em>{meta.label}</em></button>})}{!results.length&&<div className="commandEmpty"><Search size={20}/><b>No result found</b><span>Try another word, or use <strong>task:</strong> / <strong>memory:</strong> to capture instantly.</span></div>}</div>}
      <footer><span><kbd>↑</kbd><kbd>↓</kbd> navigate</span><span><kbd>↵</kbd> open</span><span><strong>task:</strong> quick task</span><span><strong>memory:</strong> quick memory</span></footer>
    </section></div>}
  </>
}
