import React,{useMemo,useState} from 'react'
import {useLocation} from 'react-router-dom'
import {useCommandStore} from './store.js'

const categories=['General','Idea','Decision','Lesson','Business','Personal','Research','Systems','Important']
const fmt=iso=>{try{return new Date(iso).toLocaleString('en-GB',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}catch{return iso||'—'}}

export default function MemorySpaceArchive(){
  const {pathname}=useLocation()
  const s=useCommandStore()
  const [q,setQ]=useState('')
  const [view,setView]=useState('active')
  const [category,setCategory]=useState('all')
  const [title,setTitle]=useState('')
  const [content,setContent]=useState('')
  const [tags,setTags]=useState('')
  const [newCategory,setNewCategory]=useState('General')
  const [editing,setEditing]=useState(null)
  const [showHistory,setShowHistory]=useState(null)
  if(pathname!=='/memory') return null

  const memories=s.memories||[]
  const counts={active:memories.filter(x=>!x.deleted&&!x.archived).length,pinned:memories.filter(x=>x.pinned&&!x.deleted&&!x.archived).length,archived:memories.filter(x=>x.archived&&!x.deleted).length,trash:memories.filter(x=>x.deleted).length}
  const usedCategories=useMemo(()=>['all',...Array.from(new Set(memories.map(x=>x.category).filter(Boolean)))],[memories])
  const items=useMemo(()=>memories.filter(m=>{
    const stateOk=view==='active'?(!m.deleted&&!m.archived):view==='pinned'?(m.pinned&&!m.deleted&&!m.archived):view==='archived'?(m.archived&&!m.deleted):m.deleted
    const catOk=category==='all'||m.category===category
    const hay=`${m.title||''} ${m.content||''} ${(m.tags||[]).join(' ')} ${m.category||''}`.toLowerCase()
    return stateOk&&catOk&&hay.includes(q.trim().toLowerCase())
  }).sort((a,b)=>Number(b.pinned)-Number(a.pinned)||String(b.updated_at||b.created_at||'').localeCompare(String(a.updated_at||a.created_at||''))),[memories,view,category,q])

  const resetForm=()=>{setTitle('');setContent('');setTags('');setNewCategory('General');setEditing(null)}
  const save=()=>{
    if(!title.trim()&&!content.trim()) return
    const payload={title:title.trim()||'Untitled memory',content:content.trim(),category:newCategory,tags:tags.split(',').map(x=>x.trim()).filter(Boolean)}
    if(editing){s.updateMemory(editing,payload)}else{s.addMemory(payload)}
    resetForm()
  }
  const startEdit=m=>{setEditing(m.id);setTitle(m.title||'');setContent(m.content||'');setTags((m.tags||[]).join(', '));setNewCategory(m.category||'General');window.scrollTo({top:0,behavior:'smooth'})}
  const itemForHistory=showHistory?memories.find(x=>x.id===showHistory):null

  return <section className="memorySpaceOverlay">
    <div className="msWrap">
      <div className="msHero">
        <div><span className="msEyebrow">Permanent personal archive</span><h2>Memory Space</h2><p>Save what matters now. Find the same thought, decision, lesson or note years later.</p></div>
        <div className="msHeroStats"><div><b>{counts.active}</b><span>Active</span></div><div><b>{counts.pinned}</b><span>Pinned</span></div><div><b>{counts.archived}</b><span>Archived</span></div></div>
      </div>

      <div className="msComposer">
        <div className="msComposerTop"><strong>{editing?'Edit memory':'Capture a memory'}</strong><span>{editing?'A revision will be kept automatically':'Original text will be preserved'}</span></div>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title — e.g. Idea for client onboarding" />
        <textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="Write the full note, idea, decision, lesson or important information here..." rows={5}/>
        <div className="msFields"><select value={newCategory} onChange={e=>setNewCategory(e.target.value)}>{categories.map(x=><option key={x}>{x}</option>)}</select><input value={tags} onChange={e=>setTags(e.target.value)} placeholder="Tags separated by commas"/><button className="msPrimary" onClick={save}>{editing?'Save revision':'Save memory'}</button>{editing&&<button className="msGhost" onClick={resetForm}>Cancel</button>}</div>
      </div>

      <div className="msToolbar">
        <div className="msSearch"><span>⌕</span><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search title, exact words, tags, category..."/></div>
        <div className="msViews">{[['active','Memories'],['pinned','Pinned'],['archived','Archive'],['trash','Trash']].map(([id,label])=><button key={id} className={view===id?'active':''} onClick={()=>setView(id)}>{label}<small>{counts[id]??0}</small></button>)}</div>
      </div>

      <div className="msCategoryRow">{usedCategories.map(x=><button key={x} className={category===x?'active':''} onClick={()=>setCategory(x)}>{x}</button>)}</div>

      <div className="msList">
        {items.length===0&&<div className="msEmpty"><b>No memories here yet.</b><span>Capture something above or change the current filter.</span></div>}
        {items.map(m=><article className={`msCard ${m.pinned?'pinned':''}`} key={m.id}>
          <div className="msCardTop"><div><span className="msCategory">{m.category||'General'}</span>{m.pinned&&<span className="msPinned">Pinned</span>}</div><time>{fmt(m.updated_at||m.created_at||m.date)}</time></div>
          <h3>{m.title}</h3><p>{m.content}</p>
          {(m.tags||[]).length>0&&<div className="msTags">{m.tags.map(t=><span key={t}>#{t}</span>)}</div>}
          <div className="msMeta"><span>Created {fmt(m.created_at||m.date)}</span>{(m.revisions||[]).length>0&&<button onClick={()=>setShowHistory(m.id)}>{m.revisions.length} revision{m.revisions.length===1?'':'s'}</button>}</div>
          <div className="msActions">
            {!m.deleted&&!m.archived&&<><button onClick={()=>s.togglePinMemory(m.id)}>{m.pinned?'Unpin':'Pin'}</button><button onClick={()=>startEdit(m)}>Edit</button><button onClick={()=>s.archiveMemory(m.id)}>Archive</button><button className="danger" onClick={()=>s.trashMemory(m.id)}>Trash</button></>}
            {m.archived&&!m.deleted&&<><button onClick={()=>s.restoreMemory(m.id)}>Restore</button><button className="danger" onClick={()=>s.trashMemory(m.id)}>Trash</button></>}
            {m.deleted&&<><button onClick={()=>s.restoreMemory(m.id)}>Restore</button><button className="danger" onClick={()=>{if(confirm('Permanently delete this memory? This cannot be undone.'))s.permanentlyDeleteMemory(m.id)}}>Delete forever</button></>}
          </div>
        </article>)}
      </div>

      {itemForHistory&&<div className="msModalBackdrop" onClick={()=>setShowHistory(null)}><div className="msModal" onClick={e=>e.stopPropagation()}><div className="msModalHead"><div><span>Revision history</span><h3>{itemForHistory.title}</h3></div><button onClick={()=>setShowHistory(null)}>×</button></div><div className="msOriginal"><b>Original version</b><h4>{itemForHistory.original_title}</h4><p>{itemForHistory.original_content}</p></div>{(itemForHistory.revisions||[]).map((r,i)=><div className="msRevision" key={`${r.at}-${i}`}><time>{fmt(r.at)}</time><h4>{r.title}</h4><p>{r.content}</p></div>)}</div></div>}
    </div>
  </section>
}
