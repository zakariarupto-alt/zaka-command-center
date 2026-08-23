import React,{useEffect,useMemo,useState} from 'react'
import {createPortal} from 'react-dom'
import {useLocation,useNavigate} from 'react-router-dom'
import {BookOpen,Brain,BriefcaseBusiness,CalendarDays,CheckCircle2,CircleDollarSign,FlaskConical,Kanban,Lightbulb,ListTodo,MailOpen,Search,ShieldCheck,Sparkles,TrendingUp,Users,UsersRound,Youtube} from 'lucide-react'
import {useCommandStore} from './store.js'

const pad=n=>String(n).padStart(2,'0')
const keyOf=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
const todayKey=()=>keyOf(new Date())
const tomorrowKey=()=>{const d=new Date();d.setDate(d.getDate()+1);return keyOf(d)}
const daySeed=()=>Number(todayKey().replaceAll('-',''))
const money=n=>`$${Number(n||0).toLocaleString(undefined,{maximumFractionDigits:0})}`
const stageLabels={new:'New Lead',contacted:'Prospect',interested:'Interested',proposal:'Proposal Sent','follow-up':'Nurture',won:'Won',lost:'Lost'}
const stageOrder=['new','contacted','interested','proposal','follow-up','won','lost']

const bookNotes=[
  {book:'Atomic Habits',lesson:'Make the good habit obvious, attractive, easy and satisfying.',tag:'Systems'},
  {book:'The Psychology of Money',lesson:'Doing well with money is more about behavior than raw intelligence.',tag:'Finance'},
  {book:'Deep Work',lesson:'Protect uninterrupted focus as a competitive advantage.',tag:'Focus'},
  {book:'Zero to One',lesson:'Create something meaningfully different instead of competing on sameness.',tag:'Business'},
  {book:'The Almanack of Naval Ravikant',lesson:'Specific knowledge, leverage and accountability compound together.',tag:'Leverage'}
]
const facts=[
  'Octopuses have three hearts and blue blood.',
  'A day on Venus is longer than a year on Venus.',
  'Honey can remain edible for thousands of years when sealed properly.',
  'Bananas are berries, while strawberries are not botanical berries.',
  'Sharks existed before trees appeared on Earth.'
]
const newsletters=[
  {source:'AI Operator Daily',title:'Agents are becoming workflow infrastructure',points:['Use agents for bounded repeatable work','Keep human approval on money/data actions','Measure saved time, not novelty']},
  {source:'Growth Brief',title:'Distribution is becoming the moat',points:['Short-form content feeds long-form trust','Owned email lists reduce platform risk','Repurpose one insight across channels']},
  {source:'Commerce Signals',title:'Retention beats acquisition inflation',points:['Track contribution margin by channel','Improve repeat purchase loops','Automate post-purchase follow-up']}
]
const initialContent=[
  {id:'c1',title:'AI workflow teardown',stage:'Idea',type:'YouTube'},
  {id:'c2',title:'3 tracking mistakes brands make',stage:'Record',type:'Short'},
  {id:'c3',title:'Company formation checklist',stage:'In Edit',type:'Carousel'},
  {id:'c4',title:'Best automation stack under $100',stage:'Ready to Publish',type:'Thread'}
]
const competitors=[
  {channel:'AI Advantage',metric:'1.2M views / 30d',sponsors:'Notion · HubSpot'},
  {channel:'Future Tools',metric:'860K views / 30d',sponsors:'Gamma · Riverside'},
  {channel:'Creator Science',metric:'420K views / 30d',sponsors:'ConvertKit · Kajabi'}
]
const investments=[
  {name:'Crypto',value:12400,change:8.4},
  {name:'Stocks',value:18650,change:3.1},
  {name:'Startups',value:9000,change:0},
  {name:'Fixed Deposits',value:14200,change:1.8},
  {name:'Land',value:28500,change:5.2}
]

function Section({n,title,icon:Icon,children,wide=false,accent='purple'}){return <section className={`proSection ${wide?'wide':''} accent-${accent}`}><header><div className="proSectionIcon"><Icon size={17}/></div><div><span>0{n} · COMMAND MODULE</span><h3>{title}</h3></div></header><div className="proSectionBody">{children}</div></section>}

export default function CommandCenterPro(){
  const {pathname}=useLocation();const nav=useNavigate();const s=useCommandStore();const [target,setTarget]=useState(null)
  const [memoryQuery,setMemoryQuery]=useState('');const [researchInput,setResearchInput]=useState('');const [quickTask,setQuickTask]=useState('')
  const [content,setContent]=useState(()=>{try{return JSON.parse(localStorage.getItem('memory-space-content-kanban-v1'))||initialContent}catch{return initialContent}})
  useEffect(()=>setTarget(document.querySelector('.content')),[pathname])
  useEffect(()=>{try{localStorage.setItem('memory-space-content-kanban-v1',JSON.stringify(content))}catch{}},[content])
  if(pathname!=='/'||!target)return null

  const today=todayKey(),tomorrow=tomorrowKey();const meetings=[...s.events].filter(x=>x.date===today||x.date===tomorrow).sort((a,b)=>`${a.date}${a.time||''}`.localeCompare(`${b.date}${b.time||''}`))
  const note=bookNotes[daySeed()%bookNotes.length],fact=facts[daySeed()%facts.length]
  const totalNet=investments.reduce((a,x)=>a+x.value,0)
  const maxInvest=Math.max(...investments.map(x=>x.value),1)
  const memoryResults=useMemo(()=>{const q=memoryQuery.trim().toLowerCase();if(!q)return s.memories.filter(x=>!x.deleted&&!x.archived).slice(0,5);const words=q.split(/\s+/);return s.memories.filter(x=>!x.deleted&&!x.archived).map(m=>({m,score:words.reduce((a,w)=>a+(String(m.title||'').toLowerCase().includes(w)?4:0)+(String(m.content||'').toLowerCase().includes(w)?2:0)+((m.tags||[]).join(' ').toLowerCase().includes(w)?1:0),0)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,5).map(x=>x.m)},[memoryQuery,s.memories])
  const addTask=()=>{if(!quickTask.trim())return;s.addTodo({task:quickTask.trim(),priority:'medium',due_date:today,category:'Command Center'});setQuickTask('')}
  const runResearch=type=>{if(!researchInput.trim())return;s.addResearch({title:researchInput.trim(),type:type==='business'?'business':'youtube',status:'in-progress',summary:type==='business'?'Business idea research queued from Command Center.':'YouTube script generation queued from Command Center.',action_items:type==='business'?'Market · competition · offer · economics':'Hook · structure · proof · CTA'});nav('/research')}
  const onDrop=(id,stage)=>setContent(items=>items.map(x=>x.id===id?{...x,stage}:x))
  const clientMetric=(i,base)=>Math.max(1,(i+1)*base)

  return createPortal(<div className="proDeck">
    <div className="proDeckHead"><div><span><Sparkles size={13}/> ADVANCED COMMAND CENTER</span><h2>12 intelligent modules, one operating surface.</h2><p>Frontend-ready today. Structured so AI, email, analytics, calendar and finance backends can be connected later.</p></div><button onClick={()=>window.dispatchEvent(new KeyboardEvent('keydown',{key:'k',metaKey:true}))}>⌘K Universal Search</button></div>

    <div className="proGrid">
      <Section n={1} title="Calendar & Meetings" icon={CalendarDays} accent="blue"><div className="meetingList">{meetings.length?meetings.slice(0,6).map(e=><button key={e.id} onClick={()=>nav('/calendar')}><time>{e.date===today?'TODAY':'TOMORROW'} · {e.time||'ANY TIME'}</time><strong>{e.title}</strong><small>{e.category||'General'}</small></button>):<div className="proEmpty">No meetings today or tomorrow.</div>}</div></Section>

      <Section n={2} title="Book Notes" icon={BookOpen} accent="purple"><div className="lessonCard"><span>DAILY LESSON · {note.tag}</span><h4>{note.book}</h4><p>{note.lesson}</p><button onClick={()=>s.addMemory({title:`Book note — ${note.book}`,content:note.lesson,category:'Book Notes',tags:['book','daily-lesson']})}>Save to Memory Vault</button></div></Section>

      <Section n={3} title="To-Do List" icon={ListTodo} accent="orange"><div className="proQuick"><input value={quickTask} onChange={e=>setQuickTask(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addTask()} placeholder="Add a task for today…"/><button onClick={addTask}>Add</button></div><div className="miniTodoList">{s.todos.filter(x=>x.status!=='completed').slice(0,5).map(t=><button key={t.id} onClick={()=>s.toggleTodo(t.id)}><i/><span>{t.task}</span><em>{t.priority}</em></button>)}</div></Section>

      <Section n={4} title="Weird Knowledge" icon={Lightbulb} accent="gold"><div className="factCard"><span>DAILY RANDOM KNOWLEDGE</span><p>“{fact}”</p><small>Designed for curiosity and idea cross-pollination.</small></div></Section>

      <Section n={5} title="Newsletter Insights" icon={MailOpen} accent="cyan" wide><div className="newsletterGrid">{newsletters.map(n=><article key={n.source}><span>{n.source}</span><h4>{n.title}</h4>{n.points.map(p=><p key={p}><CheckCircle2 size={12}/>{p}</p>)}</article>)}</div></Section>

      <Section n={6} title="Social Intel & Content Calendar" icon={Kanban} accent="pink" wide><div className="contentBoard">{['Idea','Record','In Edit','Ready to Publish'].map(stage=><div className="contentColumn" key={stage} onDragOver={e=>e.preventDefault()} onDrop={e=>onDrop(e.dataTransfer.getData('text/plain'),stage)}><header><span>{stage}</span><b>{content.filter(x=>x.stage===stage).length}</b></header>{content.filter(x=>x.stage===stage).map(item=><article key={item.id} draggable onDragStart={e=>e.dataTransfer.setData('text/plain',item.id)}><small>{item.type}</small><strong>{item.title}</strong><em>Drag to move</em></article>)}</div>)}</div><div className="competitorIntel"><div className="intelTitle"><Youtube size={15}/><strong>Competitor & Sponsor Monitor</strong></div>{competitors.map(c=><article key={c.channel}><div><strong>{c.channel}</strong><small>{c.metric}</small></div><span>{c.sponsors}</span></article>)}</div></Section>

      <Section n={7} title="Investment Tracker" icon={CircleDollarSign} accent="green" wide><div className="netWorthHero"><div><span>ESTIMATED NET WORTH · DUMMY DATA</span><strong>{money(totalNet)}</strong><small>Connect brokerage, banking and valuation sources later.</small></div><TrendingUp size={28}/></div><div className="investmentGrid">{investments.map(x=><article key={x.name}><div><span>{x.name}</span><strong>{money(x.value)}</strong></div><div className="investBar"><i style={{width:`${x.value/maxInvest*100}%`}}/></div><small className={x.change>=0?'up':'down'}>{x.change>=0?'+':''}{x.change}% tracked change</small></article>)}</div></Section>

      <Section n={8} title="Clients" icon={UsersRound} accent="blue" wide><div className="clientMetricGrid">{s.clients.slice(0,6).map((c,i)=><button key={c.id} onClick={()=>nav('/clients')}><header><div><span>{c.status||'active'}</span><strong>{c.name||c.business}</strong></div><BriefcaseBusiness size={16}/></header><div className="metricRow"><span>SEO keywords<b>{clientMetric(i,14)}</b></span><span>Avg. rank<b>#{clientMetric(i,3)}</b></span><span>Google Ads<b>{money(clientMetric(i,180))}</b></span><span>FB Ads<b>{money(clientMetric(i,120))}</b></span></div><footer><i className="siteOk"/> Website status: healthy</footer></button>)}</div></Section>

      <Section n={9} title="Lead Management" icon={Users} accent="orange" wide><div className="proPipeline">{stageOrder.map(stage=><div key={stage}><header><span>{stageLabels[stage]}</span><b>{s.leads.filter(x=>x.status===stage).length}</b></header>{s.leads.filter(x=>x.status===stage).slice(0,4).map(l=><button key={l.id} onClick={()=>nav('/leads')}><strong>{l.name||l.business||'Lead'}</strong><small>{l.service||'No service set'}</small><em>{l.value?money(l.value):'—'}</em></button>)}</div>)}</div></Section>

      <Section n={10} title="Research" icon={FlaskConical} accent="purple"><div className="researchLaunch"><textarea value={researchInput} onChange={e=>setResearchInput(e.target.value)} placeholder="Describe a business idea, topic or YouTube concept…"/><button onClick={()=>runResearch('business')}><BriefcaseBusiness size={14}/>Research Business Idea</button><button onClick={()=>runResearch('youtube')}><Youtube size={14}/>Generate YouTube Script</button></div></Section>

      <Section n={11} title="Memory Vault" icon={Brain} accent="pink"><div className="naturalSearch"><Search size={15}/><input value={memoryQuery} onChange={e=>setMemoryQuery(e.target.value)} placeholder="Search a past thought, decision, idea…"/></div><div className="memorySearchResults">{memoryResults.map(m=><button key={m.id} onClick={()=>nav('/memory')}><span>{m.category||'General'}</span><strong>{m.title}</strong><small>{String(m.content||'').slice(0,100)}</small></button>)}</div><p className="aiReadyNote">AI-ready search UI; current prototype uses local text relevance.</p></Section>

      <Section n={12} title="Team" icon={ShieldCheck} accent="cyan" wide><div className="secureTable"><div className="secureBanner"><ShieldCheck size={15}/><span>Sensitive fields are visually masked in this frontend prototype.</span></div><div className="tableScroll"><table><thead><tr><th>Name</th><th>Role</th><th>Email</th><th>Phone</th><th>Bank Account</th><th>Status</th></tr></thead><tbody>{s.team.map((t,i)=><tr key={t.id}><td><strong>{t.name}</strong></td><td>{t.role||'—'}</td><td>{t.email||'demo@company.com'}</td><td>{t.phone||'+•• ••••• ••••'}</td><td>•••• •••• {String(4821+i*137).slice(-4)}</td><td><span className="secureStatus">{t.status||'active'}</span></td></tr>)}</tbody></table></div></div></Section>
    </div>
  </div>,target)
}
