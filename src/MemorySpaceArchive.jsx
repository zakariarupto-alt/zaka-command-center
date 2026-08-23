import React,{useMemo,useState} from 'react'
import {useLocation} from 'react-router-dom'
import {useCommandStore} from './store.js'

const categories=['General','Idea','Decision','Lesson','Business','Personal','Research','Systems','Important']
const importanceLevels=['Normal','Important','Critical']
const fmt=iso=>{try{return new Date(iso).toLocaleString('en-GB',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}catch{return iso||'—'}}
const yearOf=m=>String(m.created_at||m.date||'').slice(0,4)||'Unknown'
const downloadJson=(name,data)=>{const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();URL.revokeObjectURL(url)}

export default function MemorySpaceArchive(){
  const {pathname}=useLocation()
  const s=useCommandStore()
  const [q,setQ]=useState('')
  const [view,setView]=useState('active')
  const [category,setCategory]=useState('all')
  const [year,setYear]=useState('all')
  const [sort,setSort]=useState('updated')
  const [title,setTitle]=useState('')
  const [content,setContent]=useState('')
  const [tags,setTags]=useState('')
  const [newCategory,setNewCategory]=useState('General')
  const [importance,setImportance]=useState('Normal')
  const [related,setRelated]=useState('')
  const [editing,setEditing]=useState(null)
  const [showHistory,setShowHistory]=useState(null)
  if(pathname!=='/memory') return null

  const memories=s.memories||[]
  const counts={active:memories.filter(x=>!x.deleted&&!x.archived).length,pinned:memories.filter(x=>x.pinned&&!x.deleted&&!x.archived).length,archived:memories.filter(x=>x.archived&&!x.deleted).length,trash:memories.filter(x=>x.deleted).length}
  const usedCategories=useMemo(()=>['all',...Array.from(new Set(memories.map(x=>x.category).filter(Boolean)))],[memories])
  const years=useMemo(()=>['all',...Array.from(new Set(memories.map(yearOf))).filter(x=>x&&x!=='Unknown').sort((a,b)=>b.localeCompare(a))],[memories])
  const items=useMemo(()=>{
    const needle=q.trim().toLowerCase()
    const filtered=memories.filter(m=>{
      const stateOk=view==='active'?(!m.deleted&&!m.archived):view==='pinned'?(m.pinned&&!m.deleted&&!m.archived):view==='archived'?(m.archived&&!m.deleted):m.deleted
      const catOk=category==='all'||m.category===category
      const yearOk=year==='all'||yearOf(m)===year
      const hay=`${m.title||''} ${m.content||''} ${(m.tags||[]).join(' ')} ${m.category||''} ${m.related||''} ${m.importance||''} ${m.original_title||''} ${m.original_content||''}`.toLowerCase()
      return stateOk&&catOk&&yearOk&&hay.includes(needle)
    })
    return filtered.sort((a,b)=>{
      if(sort==='created') return String(b.created_at||b.date||'').localeCompare(String(a.created_at||a.date||''))
      if(sort==='oldest') return String(a.created_at||a.date||'').localeCompare(String(b.created_at||b.date||''))
      if(sort==='title') return String(a.title||'').localeCompare(String(b.title||''))
      return Number(b.pinned)-Number(a.pinned)||String(b.updated_at||b.created_at||'').localeCompare(String(a.updated_at||a.created_at||''))
    })
  },[memories,view,category,year,q,sort])

  const resetForm=()=>{setTitle('');setContent('');setTags('');setNewCategory('General');setImportance('Normal');setRelated('');setEditing(null)}
  const save=()=>{
    if(!title.trim()&&!content.trim()) return
    const payload={title:title.trim()||'Untitled memory',content:content.trim(),category:newCategory,tags:tags.split(',').map(x=>x.trim()).filter(Boolean),importance,related:related.trim()}
    if(editing){s.updateMemory(editing,payload)}else{s.addMemory(payload)}
    resetForm()
  }
  const startEdit=m=>{setEditing(m.id);setTitle(m.title||'');setContent(m.content||'');setTags((m.tags||[]).join(', '));setNewCategory(m.category||'General');setImportance(m.importance||'Normal');setRelated(m.related||'');window.scrollTo({top:0,behavior:'smooth'})}
  const itemForHistory=showHistory?memories.find(x=>x.id===showHistory):null
  const exportFiltered=()=>downloadJson(`memory-space-${view}-${new Date().toISOString().slice(0,10)}.json`,items)
  const exportAll=()=>downloadJson(`memory-space-full-${new Date().toISOString().slice(0,10)}.json`,memories)

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
        <div className="msFields msFieldsV2">
          <select value={newCategory} onChange={e=>setNewCategory(e.target.value)}>{categories.map(x=><option key={x}>{x}</option>)}</select>
          <select value={importance} onChange={e=>setImportance(e.target.value)}>{importanceLevels.map(x=><option key={x}>{x}</option>)}</select>
          <input value={related} onChange={e=>setRelated(e.target.value)} placeholder="Related business / project"/>
          <input value={tags} onChange={e=>setTags(e.target.value)} placeholder="Tags separated by commas"/>
          <button className="msPrimary" onClick={save}>{editing?'Save revision':'Save memory'}</button>
          {editing&&<button className="msGhost" onClick={resetForm}>Cancel</button>}
        </div>
      </div>

      <div className="msToolbar">
        <div className="msSearch"><span>⌕</span><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search exact words, title, tags, category, project..."/></div>
        <div className="msViews">{[['active','Memories'],['pinned','Pinned'],['archived','Archive'],['trash','Trash']].map(([id,label])=><button key={id} className={view===id?'active':''} onClick={()=>setView(id)}>{label}<small>{counts[id]??0}</small></button>)}</div>
      </div>

      <div className="msControlRow">
        <select value={year} onChange={e=>setYear(e.target.value)}><option value="all">All years</option>{years.filter(x=>x!=='all').map(x=><option key={x} value={x}>{x}</option>)}</select>
        <select value={sort} onChange={e=>setSort(e.target.value)}><option value="updated">Recently updated</option><option value="created">Newest created</option><option value="oldest">Oldest first</option><option value="title">Title A–Z</option></select>
        <span>{items.length} result{items.length===1?'':'s'}</span>
        <div className="msExportBtns"><button onClick={exportFiltered}>Export current</button><button onClick={exportAll}>Export all memories</button></div>
      </div>

      <div className="msCategoryRow">{usedCategories.map(x=><button key={x} className={category===x?'active':''} onClick={()=>setCategory(x)}>{x}</button>)}</div>

      <div className="msList">
        {items.length===0&&<div className="msEmpty"><b>No memories here yet.</b><span>Capture something above or change the current filter.</span></div>}
        {items.map(m=><article className={`msCard ${m.pinned?'pinned':''} ${String(m.importance||'').toLowerCase()==='critical'?'critical':''}`} key={m.id}>
          <div className="msCardTop"><div><span className="msCategory">{m.category||'General'}</span>{m.pinned&&<span className="msPinned">Pinned</span>}{m.importance&&m.importance!=='Normal'&&<span className={`msImportance ${m.importance.toLowerCase()}`}>{m.importance}</span>}</div><time>{fmt(m.updated_at||m.created_at||m.date)}</time></div>
          <h3>{m.title}</h3><p>{m.content}</p>
          {m.related&&<div className="msRelated"><b>Related:</b> {m.related}</div>}
          {(m.tags||[]).length>0&&<div className="msTags">{m.tags.map(t=><span key={t}>#{t}</span>)}</div>}
          <div className="msMeta"><span>Created {fmt(m.created_at||m.date)}</span>{(m.revisions||[]).length>0&&<button onClick={()=>setShowHistory(m.id)}>{m.revisions.length} revision{m.revisions.length===1?'':'s'}</button>}</div>
          <div className="msActions">
            {!m.deleted&&!m.archived&&<><button onClick={()=>s.togglePinMemory(m.id)}>{m.pinned?'Unpin':'Pin'}</button><button onClick={()=>startEdit(m)}>Edit</button><button onClick={()=>s.archiveMemory(m.id)}>Archive</button><button onClick={()=>downloadJson(`memory-${m.id}.json`,m)}>Export</button><button className="danger" onClick={()=>s.trashMemory(m.id)}>Trash</button></>}
            {m.archived&&!m.deleted&&<><button onClick={()=>s.restoreMemory(m.id)}>Restore</button><button onClick={()=>downloadJson(`memory-${m.id}.json`,m)}>Export</button><button className="danger" onClick={()=>s.trashMemory(m.id)}>Trash</button></>}
            {m.deleted&&<><button onClick={()=>s.restoreMemory(m.id)}>Restore</button><button onClick={()=>downloadJson(`memory-${m.id}.json`,m)}>Export</button><button className="danger" onClick={()=>{if(confirm('Permanently delete this memory? This cannot be undone.'))s.permanentlyDeleteMemory(m.id)}}>Delete forever</button></>}
          </div>
        </article>)}
      </div>

      {itemForHistory&&<div className="msModalBackdrop" onClick={()=>setShowHistory(null)}><div className="msModal" onClick={e=>e.stopPropagation()}><div className="msModalHead"><div><span>Revision history</span><h3>{itemForHistory.title}</h3></div><button onClick={()=>setShowHistory(null)}>×</button></div><div className="msOriginal"><b>Original version</b><h4>{itemForHistory.original_title}</h4><p>{itemForHistory.original_content}</p></div>{(itemForHistory.revisions||[]).map((r,i)=><div className="msRevision" key={`${r.at}-${i}`}><time>{fmt(r.at)}</time><h4>{r.title}</h4><p>{r.content}</p></div>)}</div></div>}
    </div>
  </section>
}
