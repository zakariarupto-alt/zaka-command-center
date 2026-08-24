import {create} from 'zustand'
import {persist} from 'zustand/middleware'

export const modules=[
  ['home','Home','/'],['tasks','Tasks','/tasks'],['calendar','Calendar','/calendar'],['lifeos','LifeOS','/lifeos'],['business','Business','/business'],['warehouse','Warehouse','/warehouse'],['leads','Leads','/leads'],['clients','Clients','/clients'],['research','Research','/research'],['finance','Finance','/finance'],['memory','Memory Vault','/memory'],['team','Team','/team'],['settings','Settings','/settings']
]

const nowIso=()=>new Date().toISOString()
const dayKey=(date=new Date())=>{const d=new Date(date);const y=d.getFullYear();const m=String(d.getMonth()+1).padStart(2,'0');const day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`}
const addDays=(n,base=new Date())=>{const d=new Date(base);d.setDate(d.getDate()+n);return dayKey(d)}
const uid=()=>`${Date.now()}-${Math.random().toString(36).slice(2,8)}`
const tags=v=>Array.isArray(v)?v.map(x=>String(x).trim().toLowerCase()).filter(Boolean):String(v||'').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean)
const activity=(type,label,meta={})=>({id:uid(),type,label,meta,at:nowIso()})
const cap=(arr,n=300)=>arr.slice(0,n)
const normalizeDate=v=>v==='today'?dayKey():v==='tomorrow'?addDays(1):(v||dayKey())
const nextRecurringDate=(value,recurrence)=>{
  if(!value||!recurrence||recurrence==='none')return null
  const d=new Date(`${String(value).slice(0,10)}T12:00:00`)
  if(Number.isNaN(d.getTime()))return null
  if(recurrence==='daily')d.setDate(d.getDate()+1)
  else if(recurrence==='weekly')d.setDate(d.getDate()+7)
  else if(recurrence==='monthly')d.setMonth(d.getMonth()+1)
  else return null
  return dayKey(d)
}
const normalizeTask=t=>({
  id:t?.id||uid(),task:t?.task||'',priority:t?.priority||'medium',status:t?.status||'pending',
  due_date:t?.due_date||null,due_time:t?.due_time||'',category:t?.category||'General',
  recurrence:t?.recurrence||'none',recurrence_parent_id:t?.recurrence_parent_id||null,
  notes:t?.notes||'',created_at:t?.created_at||nowIso(),updated_at:t?.updated_at||t?.created_at||nowIso(),
  completed_at:t?.completed_at||null,...t
})
const normalizeEvent=e=>({
  id:e?.id||uid(),title:e?.title||'Untitled event',date:normalizeDate(e?.date),time:e?.time||'',
  category:e?.category||'General',notes:e?.notes||'',color:e?.color||'#7C3AED',
  created_at:e?.created_at||nowIso(),updated_at:e?.updated_at||e?.created_at||nowIso(),...e,date:normalizeDate(e?.date)
})
const normalizeMemory=m=>({
  id:m?.id||uid(),title:m?.title||'Untitled memory',content:m?.content||'',
  original_title:m?.original_title||m?.title||'Untitled memory',
  original_content:m?.original_content??m?.content??'',category:m?.category||'General',
  tags:tags(m?.tags||[]),importance:m?.importance||'normal',related:m?.related||'',
  pinned:Boolean(m?.pinned),archived:Boolean(m?.archived),deleted:Boolean(m?.deleted),
  revisions:Array.isArray(m?.revisions)?m.revisions:[],created_at:m?.created_at||m?.date||nowIso(),
  updated_at:m?.updated_at||m?.created_at||m?.date||nowIso(),...m,tags:tags(m?.tags||[])
})
const normalizeRoutine=r=>({
  id:r?.id||uid(),name:r?.name||'Routine',time:r?.time||'',category:r?.category||'personal',
  days:r?.days||['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],done:Boolean(r?.done),icon:r?.icon||'✓',
  created_at:r?.created_at||nowIso(),updated_at:r?.updated_at||r?.created_at||nowIso(),...r
})
const trashEntry=(entityType,item,label='Deleted item')=>({
  id:uid(),entityType,item,deleted_at:nowIso(),label
})

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
  activityLog:[],dailyHistory:[],trashBin:[],
  systemMeta:{schemaVersion:5,lastDailyReset:dayKey(),lastBackupAt:null,lastMutationAt:nowIso()},
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
    trashBin:Array.isArray(p.trashBin)?p.trashBin:[],
    systemMeta:{...current.systemMeta,...(p.systemMeta||{}),schemaVersion:5},
    moduleEnabled:{...current.moduleEnabled,...(p.moduleEnabled||{})},
    activityLog:Array.isArray(p.activityLog)?p.activityLog:[],
    dailyHistory:Array.isArray(p.dailyHistory)?p.dailyHistory:[]
  }
}

export const useCommandStore=create(persist((set,get)=>({
  ...defaults,
  ensureDailyState:()=>set(s=>{
    const today=dayKey()
    if(s.systemMeta?.lastDailyReset===today)return{}
    const routinePct=Math.round((s.routines.filter(x=>x.done).length/Math.max(s.routines.length,1))*100)
    const focusPct=Math.round((s.focusBlocks.filter(x=>x.done).length/Math.max(s.focusBlocks.length,1))*100)
    return{
      routines:s.routines.map(x=>({...x,done:false})),
      focusBlocks:s.focusBlocks.map(x=>({...x,done:false})),
      dailyHistory:[{date:s.systemMeta?.lastDailyReset||today,routinePct,focusPct},...(s.dailyHistory||[])].slice(0,90),
      systemMeta:{...s.systemMeta,lastDailyReset:today,lastMutationAt:nowIso()},
      activityLog:cap([activity('system','Daily state rolled forward'),...(s.activityLog||[])])
    }
  }),

  addTodo:data=>set(s=>{
    const t=normalizeTask(typeof data==='string'?{task:data}:data)
    return{todos:[t,...s.todos],systemMeta:{...s.systemMeta,lastMutationAt:nowIso()},activityLog:cap([activity('task',`Added task: ${t.task}`),...s.activityLog])}
  }),
  updateTodo:(id,patch)=>set(s=>({
    todos:s.todos.map(x=>x.id===id?normalizeTask({...x,...patch,updated_at:nowIso()}):x),
    systemMeta:{...s.systemMeta,lastMutationAt:nowIso()}
  })),
  toggleTodo:id=>set(s=>{
    const item=s.todos.find(x=>x.id===id)
    if(!item)return{}
    const completing=item.status!=='completed'
    let todos=s.todos.map(x=>x.id===id?normalizeTask({...x,status:completing?'completed':'pending',completed_at:completing?nowIso():null,updated_at:nowIso()}):x)
    const nextDate=completing?nextRecurringDate(item.due_date,item.recurrence):null
    if(nextDate&&!todos.some(x=>x.recurrence_parent_id===item.id&&x.due_date===nextDate&&x.status!=='completed')){
      const next=normalizeTask({...item,id:uid(),status:'pending',due_date:nextDate,completed_at:null,created_at:nowIso(),updated_at:nowIso(),recurrence_parent_id:item.id})
      todos=[next,...todos]
    }
    return{todos,systemMeta:{...s.systemMeta,lastMutationAt:nowIso()},activityLog:cap([activity('task',completing?`Completed task: ${item.task}`:`Reopened task: ${item.task}`,nextDate?{nextDue:nextDate}:{}),...s.activityLog])}
  }),
  deleteTodo:id=>set(s=>{
    const item=s.todos.find(x=>x.id===id);if(!item)return{}
    return{todos:s.todos.filter(x=>x.id!==id),trashBin:cap([trashEntry('todo',item,item.task),...(s.trashBin||[])],100),systemMeta:{...s.systemMeta,lastMutationAt:nowIso()},activityLog:cap([activity('delete',`Moved task to Trash: ${item.task}`),...s.activityLog])}
  }),

  addEvent:data=>set(s=>{const e=normalizeEvent(data);return{events:[e,...s.events],systemMeta:{...s.systemMeta,lastMutationAt:nowIso()},activityLog:cap([activity('calendar',`Added event: ${e.title}`),...s.activityLog])}}),
  updateEvent:(id,patch)=>set(s=>({events:s.events.map(x=>x.id===id?normalizeEvent({...x,...patch,updated_at:nowIso()}):x),systemMeta:{...s.systemMeta,lastMutationAt:nowIso()}})),
  deleteEvent:id=>set(s=>{const item=s.events.find(x=>x.id===id);if(!item)return{};return{events:s.events.filter(x=>x.id!==id),trashBin:cap([trashEntry('event',item,item.title),...(s.trashBin||[])],100),systemMeta:{...s.systemMeta,lastMutationAt:nowIso()},activityLog:cap([activity('delete',`Moved event to Trash: ${item.title}`),...s.activityLog])}}),

  toggleFocus:id=>set(s=>({focusBlocks:s.focusBlocks.map(x=>x.id===id?{...x,done:!x.done}:x),systemMeta:{...s.systemMeta,lastMutationAt:nowIso()}})),
  addRoutine:data=>set(s=>({routines:[...s.routines,normalizeRoutine(data)],systemMeta:{...s.systemMeta,lastMutationAt:nowIso()}})),
  updateRoutine:(id,patch)=>set(s=>({routines:s.routines.map(x=>x.id===id?normalizeRoutine({...x,...patch,updated_at:nowIso()}):x),systemMeta:{...s.systemMeta,lastMutationAt:nowIso()}})),
  toggleRoutine:id=>set(s=>({routines:s.routines.map(x=>x.id===id?{...x,done:!x.done,updated_at:nowIso()}:x),systemMeta:{...s.systemMeta,lastMutationAt:nowIso()}})),
  deleteRoutine:id=>set(s=>{const item=s.routines.find(x=>x.id===id);if(!item)return{};return{routines:s.routines.filter(x=>x.id!==id),trashBin:cap([trashEntry('routine',item,item.name),...(s.trashBin||[])],100),systemMeta:{...s.systemMeta,lastMutationAt:nowIso()}}}),
  resetRoutines:()=>set(s=>({routines:s.routines.map(x=>({...x,done:false,updated_at:nowIso()})),focusBlocks:s.focusBlocks.map(x=>({...x,done:false})),systemMeta:{...s.systemMeta,lastMutationAt:nowIso()}})),

  addBusiness:data=>set(s=>({businesses:[...s.businesses,{id:uid(),status:'active',color:'#7C3AED',platforms:[],goals:[],...data}],systemMeta:{...s.systemMeta,lastMutationAt:nowIso()}})),
  updateBusiness:(id,patch)=>set(s=>({businesses:s.businesses.map(x=>x.id===id?{...x,...patch,updated_at:nowIso()}:x),systemMeta:{...s.systemMeta,lastMutationAt:nowIso()}})),
  deleteBusiness:id=>set(s=>{const item=s.businesses.find(x=>x.id===id);if(!item)return{};return{businesses:s.businesses.filter(x=>x.id!==id),trashBin:cap([trashEntry('business',item,item.name),...(s.trashBin||[])],100),systemMeta:{...s.systemMeta,lastMutationAt:nowIso()}}}),

  addProduct:data=>set(s=>({products:[...s.products,{id:uid(),stock:0,low_alert:5,platforms:[],updated_at:nowIso(),...data}],systemMeta:{...s.systemMeta,lastMutationAt:nowIso()}})),
  updateProduct:(id,patch)=>set(s=>({products:s.products.map(x=>x.id===id?{...x,...patch,updated_at:nowIso()}:x),systemMeta:{...s.systemMeta,lastMutationAt:nowIso()}})),
  adjustStock:(id,amount)=>set(s=>({products:s.products.map(x=>x.id===id?{...x,stock:Math.max(0,Number(x.stock||0)+Number(amount||0)),updated_at:nowIso()}:x),systemMeta:{...s.systemMeta,lastMutationAt:nowIso()}})),
  deleteProduct:id=>set(s=>{const item=s.products.find(x=>x.id===id);if(!item)return{};return{products:s.products.filter(x=>x.id!==id),trashBin:cap([trashEntry('product',item,item.name),...(s.trashBin||[])],100),systemMeta:{...s.systemMeta,lastMutationAt:nowIso()}}}),

  addLead:data=>set(s=>({leads:[{id:uid(),status:'new',temperature:'warm',created_at:nowIso(),updated_at:nowIso(),...data},...s.leads],systemMeta:{...s.systemMeta,lastMutationAt:nowIso()}})),
  updateLead:(id,patch)=>set(s=>({leads:s.leads.map(x=>x.id===id?{...x,...patch,updated_at:nowIso()}:x),systemMeta:{...s.systemMeta,lastMutationAt:nowIso()}})),
  moveLead:(id,status)=>set(s=>({leads:s.leads.map(x=>x.id===id?{...x,status,updated_at:nowIso()}:x),systemMeta:{...s.systemMeta,lastMutationAt:nowIso()}})),
  deleteLead:id=>set(s=>{const item=s.leads.find(x=>x.id===id);if(!item)return{};return{leads:s.leads.filter(x=>x.id!==id),trashBin:cap([trashEntry('lead',item,item.name||item.business),...(s.trashBin||[])],100),systemMeta:{...s.systemMeta,lastMutationAt:nowIso()}}}),
  convertLeadToClient:id=>set(s=>{const l=s.leads.find(x=>x.id===id);if(!l)return{};const c={id:uid(),name:l.name,business:l.business,phone:l.phone||'',email:'',service:l.service,status:'active',monthly:0,total_value:Number(l.value||0),payment_status:'pending',next_follow_up:l.follow_up||'',start_date:dayKey(),tasks:[],notes:l.notes||'',color:'#2563EB',created_at:nowIso()};return{clients:[c,...s.clients],leads:s.leads.map(x=>x.id===id?{...x,status:'won',updated_at:nowIso()}:x),systemMeta:{...s.systemMeta,lastMutationAt:nowIso()},activityLog:cap([activity('lead',`Converted lead to client: ${l.name||l.business}`),...s.activityLog])}}),

  addClient:data=>set(s=>({clients:[{id:uid(),status:'active',payment_status:'pending',tasks:[],created_at:nowIso(),...data},...s.clients],systemMeta:{...s.systemMeta,lastMutationAt:nowIso()}})),
  updateClient:(id,patch)=>set(s=>({clients:s.clients.map(x=>x.id===id?{...x,...patch,updated_at:nowIso()}:x),systemMeta:{...s.systemMeta,lastMutationAt:nowIso()}})),
  deleteClient:id=>set(s=>{const item=s.clients.find(x=>x.id===id);if(!item)return{};return{clients:s.clients.filter(x=>x.id!==id),trashBin:cap([trashEntry('client',item,item.name||item.business),...(s.trashBin||[])],100),systemMeta:{...s.systemMeta,lastMutationAt:nowIso()}}}),

  addResearch:data=>set(s=>({research:[{id:uid(),date:dayKey(),status:'in-progress',saved_to_vault:false,...data},...s.research],systemMeta:{...s.systemMeta,lastMutationAt:nowIso()}})),
  updateResearch:(id,patch)=>set(s=>({research:s.research.map(x=>x.id===id?{...x,...patch,updated_at:nowIso()}:x),systemMeta:{...s.systemMeta,lastMutationAt:nowIso()}})),
  saveResearchToMemory:id=>set(s=>{const r=s.research.find(x=>x.id===id);if(!r)return{};const m=normalizeMemory({title:r.title,content:[r.summary,r.action_items].filter(Boolean).join('\n\n'),category:'Research',tags:['research',r.type||'general'],related:r.url||''});return{research:s.research.map(x=>x.id===id?{...x,saved_to_vault:true}:x),memories:[m,...s.memories],systemMeta:{...s.systemMeta,lastMutationAt:nowIso()}}}),
  deleteResearch:id=>set(s=>{const item=s.research.find(x=>x.id===id);if(!item)return{};return{research:s.research.filter(x=>x.id!==id),trashBin:cap([trashEntry('research',item,item.title),...(s.trashBin||[])],100),systemMeta:{...s.systemMeta,lastMutationAt:nowIso()}}}),

  addIncome:data=>set(s=>({income:[{id:uid(),date:dayKey(),currency:'GBP',category:'General',...data},...s.income],systemMeta:{...s.systemMeta,lastMutationAt:nowIso()}})),
  updateIncome:(id,patch)=>set(s=>({income:s.income.map(x=>x.id===id?{...x,...patch,updated_at:nowIso()}:x),systemMeta:{...s.systemMeta,lastMutationAt:nowIso()}})),
  deleteIncome:id=>set(s=>{const item=s.income.find(x=>x.id===id);if(!item)return{};return{income:s.income.filter(x=>x.id!==id),trashBin:cap([trashEntry('income',item,item.description||item.source||'Income'),...(s.trashBin||[])],100),systemMeta:{...s.systemMeta,lastMutationAt:nowIso()}}}),
  addExpense:data=>set(s=>({expenses:[{id:uid(),date:dayKey(),currency:'GBP',category:'General',...data},...s.expenses],systemMeta:{...s.systemMeta,lastMutationAt:nowIso()}})),
  updateExpense:(id,patch)=>set(s=>({expenses:s.expenses.map(x=>x.id===id?{...x,...patch,updated_at:nowIso()}:x),systemMeta:{...s.systemMeta,lastMutationAt:nowIso()}})),
  deleteExpense:id=>set(s=>{const item=s.expenses.find(x=>x.id===id);if(!item)return{};return{expenses:s.expenses.filter(x=>x.id!==id),trashBin:cap([trashEntry('expense',item,item.description||item.category||'Expense'),...(s.trashBin||[])],100),systemMeta:{...s.systemMeta,lastMutationAt:nowIso()}}}),
  setMonthlyGoal:v=>set(s=>({monthlyGoal:Number(v)||0,systemMeta:{...s.systemMeta,lastMutationAt:nowIso()}})),

  addMemory:data=>set(s=>{const m=normalizeMemory(data);return{memories:[m,...s.memories],systemMeta:{...s.systemMeta,lastMutationAt:nowIso()},activityLog:cap([activity('memory',`Saved memory: ${m.title}`),...s.activityLog])}}),
  updateMemory:(id,patch)=>set(s=>({memories:s.memories.map(x=>{if(x.id!==id)return x;const revision={at:nowIso(),title:x.title,content:x.content,category:x.category,tags:x.tags};return normalizeMemory({...x,...patch,updated_at:nowIso(),revisions:[revision,...(x.revisions||[])].slice(0,50)})}),systemMeta:{...s.systemMeta,lastMutationAt:nowIso()}})),
  togglePinMemory:id=>set(s=>({memories:s.memories.map(x=>x.id===id?{...x,pinned:!x.pinned,updated_at:nowIso()}:x),systemMeta:{...s.systemMeta,lastMutationAt:nowIso()}})),
  archiveMemory:id=>set(s=>({memories:s.memories.map(x=>x.id===id?{...x,archived:true,deleted:false,updated_at:nowIso()}:x),systemMeta:{...s.systemMeta,lastMutationAt:nowIso()}})),
  trashMemory:id=>set(s=>({memories:s.memories.map(x=>x.id===id?{...x,deleted:true,archived:false,updated_at:nowIso()}:x),systemMeta:{...s.systemMeta,lastMutationAt:nowIso()}})),
  restoreMemory:id=>set(s=>({memories:s.memories.map(x=>x.id===id?{...x,deleted:false,archived:false,updated_at:nowIso()}:x),systemMeta:{...s.systemMeta,lastMutationAt:nowIso()}})),
  permanentlyDeleteMemory:id=>set(s=>({memories:s.memories.filter(x=>x.id!==id),systemMeta:{...s.systemMeta,lastMutationAt:nowIso()}})),

  addTeamMember:data=>set(s=>({team:[...s.team,{id:uid(),status:'active',tasks:[],created_at:nowIso(),...data}],systemMeta:{...s.systemMeta,lastMutationAt:nowIso()}})),
  updateTeamMember:(id,patch)=>set(s=>({team:s.team.map(x=>x.id===id?{...x,...patch,updated_at:nowIso()}:x),systemMeta:{...s.systemMeta,lastMutationAt:nowIso()}})),
  deleteTeamMember:id=>set(s=>{const item=s.team.find(x=>x.id===id);if(!item)return{};return{team:s.team.filter(x=>x.id!==id),trashBin:cap([trashEntry('team',item,item.name),...(s.trashBin||[])],100),systemMeta:{...s.systemMeta,lastMutationAt:nowIso()}}}),

  restoreTrashItem:trashId=>set(s=>{
    const entry=(s.trashBin||[]).find(x=>x.id===trashId)
    if(!entry)return{}
    const next={trashBin:(s.trashBin||[]).filter(x=>x.id!==trashId),systemMeta:{...s.systemMeta,lastMutationAt:nowIso()},activityLog:cap([activity('restore',`Restored ${entry.label}`),...s.activityLog])}
    const item=entry.item
    if(entry.entityType==='todo')next.todos=[normalizeTask(item),...s.todos]
    else if(entry.entityType==='event')next.events=[normalizeEvent(item),...s.events]
    else if(entry.entityType==='routine')next.routines=[normalizeRoutine(item),...s.routines]
    else if(entry.entityType==='business')next.businesses=[item,...s.businesses]
    else if(entry.entityType==='product')next.products=[item,...s.products]
    else if(entry.entityType==='lead')next.leads=[item,...s.leads]
    else if(entry.entityType==='client')next.clients=[item,...s.clients]
    else if(entry.entityType==='research')next.research=[item,...s.research]
    else if(entry.entityType==='income')next.income=[item,...s.income]
    else if(entry.entityType==='expense')next.expenses=[item,...s.expenses]
    else if(entry.entityType==='team')next.team=[item,...s.team]
    return next
  }),
  permanentlyDeleteTrashItem:trashId=>set(s=>({trashBin:(s.trashBin||[]).filter(x=>x.id!==trashId),systemMeta:{...s.systemMeta,lastMutationAt:nowIso()}})),
  emptyTrash:()=>set(s=>({trashBin:[],systemMeta:{...s.systemMeta,lastMutationAt:nowIso()},activityLog:cap([activity('delete','Emptied recovery Trash'),...s.activityLog])})),

  toggleModule:id=>set(s=>({moduleEnabled:{...s.moduleEnabled,[id]:!s.moduleEnabled[id]},systemMeta:{...s.systemMeta,lastMutationAt:nowIso()}})),
  toggleWebhook:id=>set(s=>({webhooks:s.webhooks.map(x=>x.id===id?{...x,enabled:!x.enabled}:x),systemMeta:{...s.systemMeta,lastMutationAt:nowIso()}})),
  updateWebhook:(id,patch)=>set(s=>({webhooks:s.webhooks.map(x=>x.id===id?{...x,...patch}:x),systemMeta:{...s.systemMeta,lastMutationAt:nowIso()}})),
  markBackup:()=>set(s=>({systemMeta:{...s.systemMeta,lastBackupAt:nowIso()}})),
  replaceState:data=>set(s=>migrate(data,{...defaults,...s})),
  exportState:()=>get()
}),{name:'zaka-command-center-v1',version:5,merge:migrate}))
