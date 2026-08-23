import {create} from 'zustand'
import {persist} from 'zustand/middleware'

export const modules=[
  ['home','Home','/'],['tasks','Tasks','/tasks'],['calendar','Calendar','/calendar'],['lifeos','LifeOS','/lifeos'],['business','Business','/business'],['warehouse','Warehouse','/warehouse'],['leads','Leads','/leads'],['clients','Clients','/clients'],['research','Research','/research'],['finance','Finance','/finance'],['memory','Memory Vault','/memory'],['team','Team','/team'],['settings','Settings','/settings']
]

const nowIso=()=>new Date().toISOString()
const dayKey=(date=new Date())=>{const d=new Date(date);const y=d.getFullYear();const m=String(d.getMonth()+1).padStart(2,'0');const day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`}
const addDays=(n)=>{const d=new Date();d.setDate(d.getDate()+n);return dayKey(d)}
const uid=()=>`${Date.now()}-${Math.random().toString(36).slice(2,8)}`
const tags=v=>Array.isArray(v)?v.map(x=>String(x).trim().toLowerCase()).filter(Boolean):String(v||'').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean)
const activity=(type,label,meta={})=>({id:uid(),type,label,meta,at:nowIso()})
const cap=(arr,n=300)=>arr.slice(0,n)
const normalizeDate=v=>v==='today'?dayKey():v==='tomorrow'?addDays(1):(v||dayKey())
const normalizeTask=t=>({id:t?.id||uid(),task:t?.task||'',priority:t?.priority||'medium',status:t?.status||'pending',due_date:t?.due_date||null,due_time:t?.due_time||'',category:t?.category||'General',recurrence:t?.recurrence||'none',notes:t?.notes||'',created_at:t?.created_at||nowIso(),completed_at:t?.completed_at||null,...t})
const normalizeEvent=e=>({id:e?.id||uid(),title:e?.title||'Untitled event',date:normalizeDate(e?.date),time:e?.time||'',category:e?.category||'General',notes:e?.notes||'',color:e?.color||'#7C3AED',created_at:e?.created_at||nowIso(),...e,date:normalizeDate(e?.date)})
const normalizeMemory=m=>({id:m?.id||uid(),title:m?.title||'Untitled memory',content:m?.content||'',original_title:m?.original_title||m?.title||'Untitled memory',original_content:m?.original_content??m?.content??'',category:m?.category||'General',tags:tags(m?.tags||[]),importance:m?.importance||'normal',related:m?.related||'',pinned:Boolean(m?.pinned),archived:Boolean(m?.archived),deleted:Boolean(m?.deleted),revisions:Array.isArray(m?.revisions)?m.revisions:[],created_at:m?.created_at||m?.date||nowIso(),updated_at:m?.updated_at||m?.created_at||m?.date||nowIso(),...m,tags:tags(m?.tags||[])})
const normalizeRoutine=r=>({id:r?.id||uid(),name:r?.name||'Routine',time:r?.time||'',category:r?.category||'personal',days:r?.days||['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],done:Boolean(r?.done),icon:r?.icon||'✓',created_at:r?.created_at||nowIso(),...r})

const defaults={
  events:[
    normalizeEvent({id:'e1',title:'Morning Planning',date:dayKey(),time:'07:00',category:'Personal',color:'#FF6B9D'}),
    normalizeEvent({id:'e2',title:'Client Follow-up Block',date:dayKey(),time:'11:00',category:'Business',color:'#2563EB'}),
    normalizeEvent({id:'e3',title:'Warehouse Stock Check',date:dayKey(),time:'14:00',category:'Business',color:'#059669'})
  ],
  todos:[
    normalizeTask({id:'t1',task:'Review today’s priorities',priority:'high',due_date:dayKey(),category:'Personal'}),
    normalizeTask({id:'t2',task:'Follow up with active leads',priority:'medium',due_date:dayKey(),category:'Business'}),
    normalizeTask({id:'t3',task:'Update stock counts',priority:'low',due_date:addDays(1),category:'Warehouse'})
  ],
  focusBlocks:[
    {id:'f1',block:'Deep Work',task:'Most important work block',time:'09:00–11:00',done:false,icon:'🎯',color:'#7C3AED'},
    {id:'f2',block:'Business',task:'Sales & client work',time:'11:30–13:00',done:false,icon:'💼',color:'#2563EB'},
    {id:'f3',block:'Health',task:'Gym / exercise',time:'18:00–19:00',done:false,icon:'💪',color:'#059669'}
  ],
  routines:[
    normalizeRoutine({id:'r1',name:'Morning Planning',time:'08:30',category:'personal',icon:'☀️'}),
    normalizeRoutine({id:'r2',name:'English Practice',time:'09:00',category:'study',icon:'📚'}),
    normalizeRoutine({id:'r3',name:'Business Work Block',time:'10:00',category:'business',icon:'💼'}),
    normalizeRoutine({id:'r4',name:'Gym',time:'18:00',category:'health',icon:'💪'}),
    normalizeRoutine({id:'r5',name:'Personal Branding',time:'20:00',category:'branding',icon:'🎯'})
  ],
  businesses:[
    {id:'b1',name:'Nutri Ghor',type:'E-commerce',status:'active',color:'#059669',revenue_target:3000,description:'Food and e-commerce operations.',platforms:['Website','Facebook','WhatsApp'],goals:['Grow monthly revenue','Improve analytics','Automate operations']},
    {id:'b2',name:'Imagine Mart LLC',type:'US E-commerce',status:'active',color:'#2563EB',revenue_target:2000,description:'Marketplace and cross-border e-commerce operations.',platforms:['eBay','Amazon','Walmart'],goals:['Improve marketplace readiness','Track profitability','Build supplier network']},
    {id:'b3',name:'Innogen Digital',type:'Agency + Systems',status:'building',color:'#7C3AED',revenue_target:5000,description:'Digital growth, company formation, tracking and automation services.',platforms:['Website','WhatsApp','LinkedIn'],goals:['Build repeatable sales process','Automate CRM','Grow retainers']}
  ],
  products:[
    {id:'p1',sku:'NG-GHEE-500',name:'Ghee 500g',business:'Nutri Ghor',supplier:'Local supplier',buy_price:0,sell_price:1050,stock:0,low_alert:10,rack:'A1',platforms:['Nutri Ghor'],updated_at:nowIso()},
    {id:'p2',sku:'NG-GHEE-900',name:'Ghee 900g',business:'Nutri Ghor',supplier:'Local supplier',buy_price:0,sell_price:1800,stock:0,low_alert:10,rack:'A2',platforms:['Nutri Ghor'],updated_at:nowIso()},
    {id:'p3',sku:'NG-OIL-1L',name:'Mustard Oil 1L',business:'Nutri Ghor',supplier:'Local supplier',buy_price:0,sell_price:350,stock:0,low_alert:15,rack:'B1',platforms:['Nutri Ghor'],updated_at:nowIso()}
  ],
  leads:[{id:'l1',name:'Sample Lead',business:'Prospect',phone:'',source:'WhatsApp',service:'Company Formation',value:250,temperature:'warm',status:'new',follow_up:'',notes:'',created_at:nowIso(),updated_at:nowIso()}],
  clients:[{id:'c1',name:'Sample Client',business:'Client Business',phone:'',email:'',service:'Digital Service',status:'active',monthly:300,total_value:300,payment_status:'pending',next_follow_up:'',start_date:dayKey(),tasks:['Monthly follow-up','Status report'],notes:'',color:'#2563EB',created_at:nowIso()}],
  research:[{id:'rs1',title:'AI & Automation Opportunities',url:'',type:'ai',status:'in-progress',summary:'Track useful tools and workflows that create measurable value.',action_items:'',date:dayKey(),saved_to_vault:false}],
  income:[],expenses:[],monthlyGoal:5000,
  memories:[normalizeMemory({id:'m1',title:'Memory Space Purpose',content:'One permanent place for notes, ideas, lessons, decisions and important information that should still be findable years later.',tags:['system','memory-space'],category:'Systems',importance:'important',pinned:true})],
  team:[{id:'tm1',name:'MD Zakaria Islam',role:'Founder & CEO',phone:'',email:'',status:'active',tasks:['Strategy','Business development','Systems'],color:'#FF6B9D',created_at:nowIso()}],
  activityLog:[],dailyHistory:[],
  systemMeta:{schemaVersion:4,lastDailyReset:dayKey(),lastBackupAt:null},
  webhooks:[
    {id:'w1',name:'Telegram Command',path:'/api/webhooks/telegram-command',enabled:false,url:''},
    {id:'w2',name:'n8n Task Push',path:'/api/webhooks/n8n-task',enabled:false,url:''},
    {id:'w3',name:'AI Daily Briefing',path:'/api/webhooks/ai-briefing',enabled:false,url:''},
    {id:'w4',name:'Research Result',path:'/api/webhooks/research-result',enabled:false,url:''},
    {id:'w5',name:'Google Calendar Sync',path:'/api/webhooks/calendar-sync',enabled:false,url:''}
  ],
  moduleEnabled:Object.fromEntries(modules.map(([id])=>[id,true]))
}

const migrate=(persisted,current)=>{
  const p=persisted||{}
  return {
    ...current,...p,
    todos:Array.isArray(p.todos)?p.todos.map(normalizeTask):current.todos,
    events:Array.isArray(p.events)?p.events.map(normalizeEvent):current.events,
    routines:Array.isArray(p.routines)?p.routines.map(normalizeRoutine):current.routines,
    memories:Array.isArray(p.memories)?p.memories.map(normalizeMemory):current.memories,
    systemMeta:{...current.systemMeta,...(p.systemMeta||{}),schemaVersion:4},
    moduleEnabled:{...current.moduleEnabled,...(p.moduleEnabled||{})},
    activityLog:Array.isArray(p.activityLog)?p.activityLog:[],dailyHistory:Array.isArray(p.dailyHistory)?p.dailyHistory:[]
  }
}

export const useCommandStore=create(persist((set,get)=>({
  ...defaults,
  ensureDailyState:()=>set(s=>{const today=dayKey();if(s.systemMeta?.lastDailyReset===today)return{};const routinePct=Math.round((s.routines.filter(x=>x.done).length/Math.max(s.routines.length,1))*100);const focusPct=Math.round((s.focusBlocks.filter(x=>x.done).length/Math.max(s.focusBlocks.length,1))*100);return{routines:s.routines.map(x=>({...x,done:false})),focusBlocks:s.focusBlocks.map(x=>({...x,done:false})),dailyHistory:[{date:s.systemMeta?.lastDailyReset||today,routinePct,focusPct},...(s.dailyHistory||[])].slice(0,90),systemMeta:{...s.systemMeta,lastDailyReset:today},activityLog:cap([activity('system','Daily state rolled forward'),...(s.activityLog||[])])}}),

  addTodo:data=>set(s=>{const t=normalizeTask(typeof data==='string'?{task:data}:data);return{todos:[t,...s.todos],activityLog:cap([activity('task',`Added task: ${t.task}`),...s.activityLog])}}),
  updateTodo:(id,patch)=>set(s=>({todos:s.todos.map(x=>x.id===id?{...x,...patch}:x)})),
  toggleTodo:id=>set(s=>({todos:s.todos.map(x=>x.id===id?{...x,status:x.status==='completed'?'pending':'completed',completed_at:x.status==='completed'?null:nowIso()}:x)})),
  deleteTodo:id=>set(s=>({todos:s.todos.filter(x=>x.id!==id)})),

  addEvent:data=>set(s=>({events:[normalizeEvent(data),...s.events]})),
  updateEvent:(id,patch)=>set(s=>({events:s.events.map(x=>x.id===id?normalizeEvent({...x,...patch}):x)})),
  deleteEvent:id=>set(s=>({events:s.events.filter(x=>x.id!==id)})),

  toggleFocus:id=>set(s=>({focusBlocks:s.focusBlocks.map(x=>x.id===id?{...x,done:!x.done}:x)})),
  addRoutine:data=>set(s=>({routines:[...s.routines,normalizeRoutine(data)]})),
  updateRoutine:(id,patch)=>set(s=>({routines:s.routines.map(x=>x.id===id?{...x,...patch}:x)})),
  toggleRoutine:id=>set(s=>({routines:s.routines.map(x=>x.id===id?{...x,done:!x.done}:x)})),
  deleteRoutine:id=>set(s=>({routines:s.routines.filter(x=>x.id!==id)})),
  resetRoutines:()=>set(s=>({routines:s.routines.map(x=>({...x,done:false})),focusBlocks:s.focusBlocks.map(x=>({...x,done:false}))})),

  addBusiness:data=>set(s=>({businesses:[...s.businesses,{id:uid(),status:'active',color:'#7C3AED',platforms:[],goals:[],...data}]})),
  updateBusiness:(id,patch)=>set(s=>({businesses:s.businesses.map(x=>x.id===id?{...x,...patch}:x)})),
  deleteBusiness:id=>set(s=>({businesses:s.businesses.filter(x=>x.id!==id)})),

  addProduct:data=>set(s=>({products:[...s.products,{id:uid(),stock:0,low_alert:5,platforms:[],updated_at:nowIso(),...data}]})),
  updateProduct:(id,patch)=>set(s=>({products:s.products.map(x=>x.id===id?{...x,...patch,updated_at:nowIso()}:x)})),
  adjustStock:(id,amount)=>set(s=>({products:s.products.map(x=>x.id===id?{...x,stock:Math.max(0,Number(x.stock||0)+Number(amount||0)),updated_at:nowIso()}:x)})),
  deleteProduct:id=>set(s=>({products:s.products.filter(x=>x.id!==id)})),

  addLead:data=>set(s=>({leads:[{id:uid(),status:'new',temperature:'warm',created_at:nowIso(),updated_at:nowIso(),...data},...s.leads]})),
  updateLead:(id,patch)=>set(s=>({leads:s.leads.map(x=>x.id===id?{...x,...patch,updated_at:nowIso()}:x)})),
  moveLead:(id,status)=>set(s=>({leads:s.leads.map(x=>x.id===id?{...x,status,updated_at:nowIso()}:x)})),
  deleteLead:id=>set(s=>({leads:s.leads.filter(x=>x.id!==id)})),
  convertLeadToClient:id=>set(s=>{const l=s.leads.find(x=>x.id===id);if(!l)return{};const c={id:uid(),name:l.name,business:l.business,phone:l.phone||'',email:'',service:l.service,status:'active',monthly:0,total_value:Number(l.value||0),payment_status:'pending',next_follow_up:l.follow_up||'',start_date:dayKey(),tasks:[],notes:l.notes||'',color:'#2563EB',created_at:nowIso()};return{clients:[c,...s.clients],leads:s.leads.map(x=>x.id===id?{...x,status:'won',updated_at:nowIso()}:x)}}),

  addClient:data=>set(s=>({clients:[{id:uid(),status:'active',payment_status:'pending',tasks:[],created_at:nowIso(),...data},...s.clients]})),
  updateClient:(id,patch)=>set(s=>({clients:s.clients.map(x=>x.id===id?{...x,...patch}:x)})),
  deleteClient:id=>set(s=>({clients:s.clients.filter(x=>x.id!==id)})),

  addResearch:data=>set(s=>({research:[{id:uid(),date:dayKey(),status:'in-progress',saved_to_vault:false,...data},...s.research]})),
  updateResearch:(id,patch)=>set(s=>({research:s.research.map(x=>x.id===id?{...x,...patch}:x)})),
  saveResearchToMemory:id=>set(s=>{const r=s.research.find(x=>x.id===id);if(!r)return{};const m=normalizeMemory({title:r.title,content:[r.summary,r.action_items].filter(Boolean).join('\n\n'),category:'Research',tags:['research',r.type||'general'],related:r.url||''});return{research:s.research.map(x=>x.id===id?{...x,saved_to_vault:true}:x),memories:[m,...s.memories]}}),
  deleteResearch:id=>set(s=>({research:s.research.filter(x=>x.id!==id)})),

  addIncome:data=>set(s=>({income:[{id:uid(),date:dayKey(),currency:'GBP',category:'General',...data},...s.income]})),
  updateIncome:(id,patch)=>set(s=>({income:s.income.map(x=>x.id===id?{...x,...patch}:x)})),
  deleteIncome:id=>set(s=>({income:s.income.filter(x=>x.id!==id)})),
  addExpense:data=>set(s=>({expenses:[{id:uid(),date:dayKey(),currency:'GBP',category:'General',...data},...s.expenses]})),
  updateExpense:(id,patch)=>set(s=>({expenses:s.expenses.map(x=>x.id===id?{...x,...patch}:x)})),
  deleteExpense:id=>set(s=>({expenses:s.expenses.filter(x=>x.id!==id)})),
  setMonthlyGoal:v=>set({monthlyGoal:Number(v)||0}),

  addMemory:data=>set(s=>{const m=normalizeMemory(data);return{memories:[m,...s.memories],activityLog:cap([activity('memory',`Saved memory: ${m.title}`),...s.activityLog])}}),
  updateMemory:(id,patch)=>set(s=>({memories:s.memories.map(x=>{if(x.id!==id)return x;const revision={at:nowIso(),title:x.title,content:x.content,category:x.category,tags:x.tags};return normalizeMemory({...x,...patch,updated_at:nowIso(),revisions:[revision,...(x.revisions||[])].slice(0,50)})})})),
  togglePinMemory:id=>set(s=>({memories:s.memories.map(x=>x.id===id?{...x,pinned:!x.pinned,updated_at:nowIso()}:x)})),
  archiveMemory:id=>set(s=>({memories:s.memories.map(x=>x.id===id?{...x,archived:true,deleted:false,updated_at:nowIso()}:x)})),
  trashMemory:id=>set(s=>({memories:s.memories.map(x=>x.id===id?{...x,deleted:true,archived:false,updated_at:nowIso()}:x)})),
  restoreMemory:id=>set(s=>({memories:s.memories.map(x=>x.id===id?{...x,deleted:false,archived:false,updated_at:nowIso()}:x)})),
  permanentlyDeleteMemory:id=>set(s=>({memories:s.memories.filter(x=>x.id!==id)})),

  addTeamMember:data=>set(s=>({team:[...s.team,{id:uid(),status:'active',tasks:[],created_at:nowIso(),...data}]})),
  updateTeamMember:(id,patch)=>set(s=>({team:s.team.map(x=>x.id===id?{...x,...patch}:x)})),
  deleteTeamMember:id=>set(s=>({team:s.team.filter(x=>x.id!==id)})),

  toggleModule:id=>set(s=>({moduleEnabled:{...s.moduleEnabled,[id]:!s.moduleEnabled[id]}})),
  toggleWebhook:id=>set(s=>({webhooks:s.webhooks.map(x=>x.id===id?{...x,enabled:!x.enabled}:x)})),
  updateWebhook:(id,patch)=>set(s=>({webhooks:s.webhooks.map(x=>x.id===id?{...x,...patch}:x)})),
  markBackup:()=>set(s=>({systemMeta:{...s.systemMeta,lastBackupAt:nowIso()}})),
  replaceState:data=>set(s=>migrate(data,{...defaults,...s})),
  exportState:()=>get()
}),{name:'zaka-command-center-v1',version:4,merge:migrate}))
