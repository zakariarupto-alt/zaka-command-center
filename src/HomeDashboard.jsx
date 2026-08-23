import React,{useMemo,useState} from 'react'
import {useLocation} from 'react-router-dom'
import {useCommandStore} from './store.js'

const todayKey=()=>new Date().toISOString().slice(0,10)
const fmtTime=t=>t||'Any time'
const priorityRank={high:0,medium:1,low:2}

export default function HomeDashboard(){
  const {pathname}=useLocation()
  const s=useCommandStore()
  const [captureType,setCaptureType]=useState('task')
  const [capture,setCapture]=useState('')
  const [priority,setPriority]=useState('medium')
  if(pathname!=='/') return null

  const today=todayKey()
  const openTasks=(s.todos||[]).filter(x=>x.status!=='completed')
  const todayTasks=openTasks.filter(x=>!x.due_date||x.due_date===today).sort((a,b)=>(priorityRank[a.priority]??9)-(priorityRank[b.priority]??9))
  const overdueTasks=openTasks.filter(x=>x.due_date&&x.due_date<today)
  const upcomingTasks=openTasks.filter(x=>x.due_date&&x.due_date>today).sort((a,b)=>String(a.due_date).localeCompare(String(b.due_date))).slice(0,5)
  const overdueLeads=(s.leads||[]).filter(x=>x.follow_up&&x.follow_up<today&&!['won','lost'].includes(x.status))
  const todayEvents=(s.events||[]).filter(x=>x.date==='today'||x.date===today).sort((a,b)=>String(a.time||'').localeCompare(String(b.time||'')))
  const upcomingEvents=(s.events||[]).filter(x=>x.date==='tomorrow'||(x.date&&x.date!==today&&x.date!=='today')).slice(0,5)
  const routineDone=(s.routines||[]).filter(x=>x.done).length
  const focusDone=(s.focusBlocks||[]).filter(x=>x.done).length
  const completedToday=(s.todos||[]).filter(x=>x.status==='completed'&&String(x.completed_at||'').startsWith(today)).length
  const routinePct=Math.round(routineDone/Math.max((s.routines||[]).length,1)*100)
  const focusPct=Math.round(focusDone/Math.max((s.focusBlocks||[]).length,1)*100)
  const taskPct=Math.round(completedToday/Math.max(completedToday+todayTasks.length,1)*100)
  const dailyScore=Math.round((routinePct+focusPct+taskPct)/3)
  const recentMemories=useMemo(()=>[...(s.memories||[])].filter(x=>!x.deleted&&!x.archived).sort((a,b)=>String(b.updated_at||b.created_at||'').localeCompare(String(a.updated_at||a.created_at||''))).slice(0,4),[s.memories])
  const topPriority=todayTasks.find(x=>x.priority==='high')||todayTasks[0]
  const nextEvent=todayEvents.find(e=>!e.time||e.time>=new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',hour12:false}))||todayEvents[0]

  const saveCapture=()=>{
    const value=capture.trim();if(!value)return
    if(captureType==='task') s.addTodo(value,priority)
    else s.addMemory({title:value.length>60?`${value.slice(0,57)}...`:value,content:value,category:'General',tags:['quick-capture']})
    setCapture('')
  }

  return <section className="homeSpaceOverlay"><div className="hsWrap">
    <div className="hsHero">
      <div><span className="hsEyebrow">Today · {new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'})}</span><h2>Memory Space</h2><p>Your daily control surface — priorities, schedule, routines, follow-ups and quick capture in one place.</p></div>
      <div className="hsScore"><span>Daily Score</span><strong>{dailyScore}%</strong><small>{completedToday} task{completedToday===1?'':'s'} completed today</small></div>
    </div>

    <div className="hsPulse">
      <div><span>Today Tasks</span><strong>{todayTasks.length}</strong><small>{topPriority?.task||'Nothing urgent'}</small></div>
      <div className={overdueTasks.length+overdueLeads.length?'warn':''}><span>Overdue</span><strong>{overdueTasks.length+overdueLeads.length}</strong><small>{overdueTasks.length} tasks · {overdueLeads.length} follow-ups</small></div>
      <div><span>Routine</span><strong>{routinePct}%</strong><small>{routineDone}/{(s.routines||[]).length} complete</small></div>
      <div><span>Next Event</span><strong>{nextEvent?.time||'Clear'}</strong><small>{nextEvent?.title||'No event scheduled'}</small></div>
    </div>

    <div className="hsQuickCapture">
      <div className="hsCaptureTabs"><button className={captureType==='task'?'active':''} onClick={()=>setCaptureType('task')}>Task</button><button className={captureType==='memory'?'active':''} onClick={()=>setCaptureType('memory')}>Memory</button></div>
      <input value={capture} onChange={e=>setCapture(e.target.value)} onKeyDown={e=>e.key==='Enter'&&saveCapture()} placeholder={captureType==='task'?'What needs to get done?':'What do you want to remember?'}/>
      {captureType==='task'&&<select value={priority} onChange={e=>setPriority(e.target.value)}><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select>}
      <button onClick={saveCapture}>Save</button>
    </div>

    <div className="hsGrid">
      <article className="hsPanel hsTasks"><div className="hsPanelHead"><div><span>Execution</span><h3>Today&apos;s Tasks</h3></div><a href="/lifeos">LifeOS →</a></div>
        <div className="hsTaskList">{todayTasks.length===0&&<div className="hsEmpty">No open tasks for today.</div>}{todayTasks.slice(0,7).map(t=><button key={t.id} className={`hsTask ${t.priority||'medium'}`} onClick={()=>s.toggleTodo(t.id)}><i/><div><strong>{t.task}</strong><small>{t.priority||'medium'} priority{t.due_date?` · ${t.due_date}`:''}</small></div></button>)}</div>
      </article>

      <article className="hsPanel"><div className="hsPanelHead"><div><span>Schedule</span><h3>Today&apos;s Calendar</h3></div><small>{todayEvents.length} event{todayEvents.length===1?'':'s'}</small></div>
        <div className="hsTimeline">{todayEvents.length===0&&<div className="hsEmpty">No events scheduled today.</div>}{todayEvents.map(e=><div key={e.id}><time>{fmtTime(e.time)}</time><i style={{background:e.color||'#7c3aed'}}/><div><strong>{e.title}</strong><small>{e.date==='today'?'Today':e.date}</small></div></div>)}</div>
        {upcomingEvents.length>0&&<div className="hsUpcoming"><b>Upcoming</b>{upcomingEvents.map(e=><span key={e.id}>{e.title} · {e.date}</span>)}</div>}
      </article>

      <article className="hsPanel"><div className="hsPanelHead"><div><span>Consistency</span><h3>Daily Routine</h3></div><strong className="hsPercent">{routinePct}%</strong></div>
        <div className="hsProgress"><span style={{width:`${routinePct}%`}}/></div><div className="hsRoutineList">{(s.routines||[]).map(r=><button key={r.id} className={r.done?'done':''} onClick={()=>s.toggleRoutine(r.id)}><i>{r.done?'✓':''}</i><div><strong>{r.icon} {r.name}</strong><small>{r.time} · {r.category}</small></div></button>)}</div>
      </article>

      <article className="hsPanel"><div className="hsPanelHead"><div><span>Attention</span><h3>Overdue & Upcoming</h3></div><span className={overdueTasks.length+overdueLeads.length?'hsAlert':'hsOk'}>{overdueTasks.length+overdueLeads.length?'Needs action':'Clear'}</span></div>
        <div className="hsAttention">{overdueTasks.map(t=><div className="danger" key={`t-${t.id}`}><b>Task overdue</b><strong>{t.task}</strong><small>Due {t.due_date}</small></div>)}{overdueLeads.map(l=><div className="danger" key={`l-${l.id}`}><b>Lead follow-up overdue</b><strong>{l.name||l.business}</strong><small>Follow-up {l.follow_up}</small></div>)}{overdueTasks.length+overdueLeads.length===0&&<div className="hsEmpty">Nothing overdue right now.</div>}{upcomingTasks.length>0&&<div className="hsUpcomingTasks"><b>Upcoming tasks</b>{upcomingTasks.map(t=><span key={t.id}>{t.due_date} · {t.task}</span>)}</div>}</div>
      </article>

      <article className="hsPanel hsWide"><div className="hsPanelHead"><div><span>Second Brain</span><h3>Recent Memories</h3></div><a href="/memory">Open Memory Vault →</a></div>
        <div className="hsMemoryRow">{recentMemories.length===0&&<div className="hsEmpty">No memories captured yet.</div>}{recentMemories.map(m=><a href="/memory" key={m.id}><span>{m.category||'General'}</span><strong>{m.title}</strong><p>{m.content}</p><small>{(m.tags||[]).slice(0,3).map(x=>`#${x}`).join(' ')}</small></a>)}</div>
      </article>
    </div>
  </div></section>
}
