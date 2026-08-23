import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const modules = [
  ['home','Home','/'],['lifeos','LifeOS','/lifeos'],['business','Business','/business'],['warehouse','Warehouse','/warehouse'],['leads','Leads','/leads'],['clients','Clients','/clients'],['research','Research','/research'],['finance','Finance','/finance'],['memory','Memory Vault','/memory'],['team','Team','/team'],['settings','Settings','/settings']
]

const todayKey = () => new Date().toISOString().slice(0,10)
const nowIso = () => new Date().toISOString()
const uid = () => Date.now() + Math.floor(Math.random()*1000)
const cap = (items,max=250) => items.slice(0,max)
const activity = (type,label,meta={}) => ({id:uid(),type,label,meta,at:nowIso()})
const pct = (items=[]) => items.length ? Math.round(items.filter(x=>x.done).length/items.length*100) : 0
const normalizeTags = tags => Array.isArray(tags) ? tags.map(x=>String(x).trim().toLowerCase()).filter(Boolean) : String(tags||'').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean)
const normalizeMemory = m => ({
  pinned:false,
  archived:false,
  deleted:false,
  created_at:m?.created_at||m?.date||nowIso(),
  updated_at:m?.updated_at||m?.created_at||m?.date||nowIso(),
  original_title:m?.original_title||m?.title||'',
  original_content:m?.original_content||m?.content||'',
  revisions:Array.isArray(m?.revisions)?m.revisions:[],
  tags:normalizeTags(m?.tags||[]),
  category:m?.category||'General',
  ...m,
})

const defaults = {
  events:[
    {id:1,title:'Morning Planning',date:'today',time:'07:00',color:'#FF6B9D'},
    {id:2,title:'Client Call — Imagine Mart',date:'today',time:'11:00',color:'#2563EB'},
    {id:3,title:'Warehouse Stock Check',date:'today',time:'14:00',color:'#059669'},
  ],
  focusBlocks:[
    {id:1,block:'Study',task:'Complete English Course Module 3',time:'08:00–09:00',done:false,icon:'📚',color:'#7C3AED'},
    {id:2,block:'Business',task:'Review Nutri Ghor inventory',time:'10:00–12:00',done:false,icon:'💼',color:'#2563EB'},
    {id:3,block:'Gym',task:'Chest & Triceps workout',time:'13:00–14:00',done:true,icon:'💪',color:'#059669'},
    {id:4,block:'Prayer',task:'Dhuhr + Asr on time',time:'On time',done:false,icon:'🤲',color:'#D97706'},
    {id:5,block:'Branding',task:'Record 1 LinkedIn post',time:'16:00–17:00',done:false,icon:'🎯',color:'#FF6B9D'},
  ],
  bookNotes:{book:'$100M Offers',author:'Alex Hormozi',lesson:'Create a Grand Slam Offer so good people feel stupid saying no. Stack value until the price feels low.',action:'Rewrite Nutri Ghor product descriptions using value-stacking framework before end of week.',progress:65},
  aiBriefing:{date:'Today',summary:'AI agents replacing entry-level SaaS roles. UK health supplement market growing 12% YoY. TikTok Shop remains a major discovery channel for impulse buys.',opportunity:'Research high-margin e-commerce categories with clear differentiation.',action:'Research top 3 niches this week.',source:'Manual — automation can be connected later'},
  todos:[
    {id:1,task:'Connect Supabase to Command Center',priority:'high',status:'pending',created_at:nowIso(),completed_at:null},
    {id:2,task:'Follow up with leads',priority:'medium',status:'pending',created_at:nowIso(),completed_at:null},
    {id:3,task:'Update Warehouse stock counts',priority:'low',status:'completed',created_at:nowIso(),completed_at:nowIso()},
  ],
  ideas:{knowledge:'The 10x Rule — under-action is often a bigger problem than bad strategy.',business_idea:'Build repeatable service products around cross-border e-commerce operations.',marketing_hook:'Turn complicated business setup into one clear operating system.',content_idea:'Document the process of building systems and automations in public.'},
  routines:[
    {id:1,name:'Fajr Prayer',time:'05:00',category:'prayer',done:false,icon:'🤲'},
    {id:2,name:'Morning Workout / Gym',time:'06:30',category:'gym',done:false,icon:'💪'},
    {id:3,name:'English Study Block',time:'08:00',category:'academic',done:false,icon:'📚'},
    {id:4,name:'Business Work Block',time:'10:00',category:'business',done:false,icon:'💼'},
    {id:5,name:'Personal Branding Block',time:'19:00',category:'branding',done:false,icon:'🎯'},
  ],
  businesses:[
    {id:1,name:'Nutri Ghor',type:'E-commerce',status:'active',color:'#059669',revenue_target:3000,description:'Health and food brand operations.',platforms:['Website','Facebook','WhatsApp'],goals:['Grow monthly revenue','Improve analytics','Automate operations']},
    {id:2,name:'Imagine Mart LLC',type:'Multi-product E-commerce',status:'active',color:'#2563EB',revenue_target:2000,description:'US e-commerce operations across marketplaces.',platforms:['eBay','Amazon','Walmart'],goals:['Improve marketplace readiness','Build supplier network','Track profitability']},
    {id:3,name:'Innogen Digital',type:'Agency + Systems',status:'building',color:'#7C3AED',revenue_target:5000,description:'Digital growth, company formation, tracking and automation services.',platforms:['Website','WhatsApp','LinkedIn'],goals:['Build repeatable sales process','Automate CRM','Grow retainers']},
  ],
  products:[
    {id:1,sku:'NG-GHEE-500',name:'Ghee 500g',supplier:'Local supplier',buy_price:0,sell_price:1050,stock:0,rack:'A1',platforms:['Nutri Ghor'],low_alert:10},
    {id:2,sku:'NG-GHEE-900',name:'Ghee 900g',supplier:'Local supplier',buy_price:0,sell_price:1800,stock:0,rack:'A2',platforms:['Nutri Ghor'],low_alert:10},
    {id:3,sku:'NG-OIL-1L',name:'Mustard Oil 1L',supplier:'Local supplier',buy_price:0,sell_price:350,stock:0,rack:'B1',platforms:['Nutri Ghor'],low_alert:15},
  ],
  leads:[{id:1,name:'Sample Lead',business:'Innogen Prospect',source:'WhatsApp',service:'Company Formation',value:250,status:'new',follow_up:'',notes:'',created_at:nowIso()}],
  clients:[{id:1,name:'Sample Client',business:'Client Business',service:'Digital Service',status:'active',monthly:300,start_date:'2026-06-01',tasks:['Monthly follow-up','Status report'],notes:'',color:'#2563EB'}],
  research:[{id:1,title:'AI & Automation Opportunities',type:'ai',status:'in-progress',summary:'Track useful tools and workflow ideas that can create measurable business value.',date:'2026-08-23',saved_to_vault:false}],
  income:[],expenses:[],monthlyGoal:5000,
  memories:[normalizeMemory({id:1,title:'Memory Space Purpose',content:'One permanent place for notes, ideas, lessons, decisions and important information that should still be findable years later.',tags:['system','memory-space'],category:'Systems',date:'2026-08-23',pinned:true})],
  team:[{id:1,name:'MD Zakaria Islam',role:'Founder & CEO',phone:'',email:'',tasks:['Strategy','Business development','Systems'],active:true,avatar:'ZI',color:'#FF6B9D'}],
  webhooks:[
    {id:1,name:'Telegram Command',path:'/api/webhooks/telegram-command',enabled:false,url:''},
    {id:2,name:'n8n Task Push',path:'/api/webhooks/n8n-task',enabled:false,url:''},
    {id:3,name:'AI Daily Briefing',path:'/api/webhooks/ai-briefing',enabled:false,url:''},
    {id:4,name:'Research Result',path:'/api/webhooks/research-result',enabled:false,url:''},
    {id:5,name:'Google Calendar Sync',path:'/api/webhooks/calendar-sync',enabled:false,url:''},
  ],
  moduleEnabled:Object.fromEntries(modules.map(([id])=>[id,true])),
  systemMeta:{schemaVersion:3,lastDailyReset:todayKey(),lastBackupAt:null},
  dailyHistory:[],activityLog:[],
}

function dailySnapshot(state,date){return {date,routinePct:pct(state.routines),focusPct:pct(state.focusBlocks),routinesDone:(state.routines||[]).filter(x=>x.done).length,routinesTotal:(state.routines||[]).length,focusDone:(state.focusBlocks||[]).filter(x=>x.done).length,focusTotal:(state.focusBlocks||[]).length,tasksCompleted:(state.todos||[]).filter(x=>x.status==='completed'&&String(x.completed_at||'').startsWith(date)).length}}

function migrateDaily(persisted,current){
  const incoming=persisted||{}
  const merged={...current,...incoming,memories:Array.isArray(incoming.memories)?incoming.memories.map(normalizeMemory):current.memories,systemMeta:{...current.systemMeta,...(incoming.systemMeta||{}),schemaVersion:3},dailyHistory:Array.isArray(incoming.dailyHistory)?incoming.dailyHistory:[],activityLog:Array.isArray(incoming.activityLog)?incoming.activityLog:[]}
  const today=todayKey();const previous=incoming.systemMeta?.lastDailyReset
  if(!previous){merged.systemMeta.lastDailyReset=today;return merged}
  if(previous!==today){merged.dailyHistory=[dailySnapshot(merged,previous),...(merged.dailyHistory||[]).filter(x=>x.date!==previous)].slice(0,90);merged.routines=(merged.routines||[]).map(x=>({...x,done:false,completed_at:null}));merged.focusBlocks=(merged.focusBlocks||[]).map(x=>({...x,done:false,completed_at:null}));merged.systemMeta.lastDailyReset=today;merged.activityLog=cap([activity('system','New day started automatically',{from:previous,to:today}),...(merged.activityLog||[])])}
  return merged
}

export const useCommandStore=create(persist((set,get)=>({
  ...defaults,
  ensureDailyState:()=>set(s=>{const today=todayKey(),previous=s.systemMeta?.lastDailyReset;if(!previous)return{systemMeta:{...s.systemMeta,lastDailyReset:today}};if(previous===today)return{};return{dailyHistory:[dailySnapshot(s,previous),...(s.dailyHistory||[]).filter(x=>x.date!==previous)].slice(0,90),routines:s.routines.map(x=>({...x,done:false,completed_at:null})),focusBlocks:s.focusBlocks.map(x=>({...x,done:false,completed_at:null})),systemMeta:{...s.systemMeta,lastDailyReset:today},activityLog:cap([activity('system','New day started automatically',{from:previous,to:today}),...s.activityLog])}}),
  toggleFocus:id=>set(s=>{const current=s.focusBlocks.find(x=>x.id===id),done=!current?.done;return{focusBlocks:s.focusBlocks.map(x=>x.id===id?{...x,done,completed_at:done?nowIso():null}:x),activityLog:cap([activity('focus',`${done?'Completed':'Reopened'} focus: ${current?.block||'Focus'}`),...s.activityLog])}}),
  updateFocus:(id,patch)=>set(s=>({focusBlocks:s.focusBlocks.map(x=>x.id===id?{...x,...patch}:x)})),
  toggleRoutine:id=>set(s=>{const current=s.routines.find(x=>x.id===id),done=!current?.done;return{routines:s.routines.map(x=>x.id===id?{...x,done,completed_at:done?nowIso():null}:x),activityLog:cap([activity('routine',`${done?'Completed':'Reopened'} routine: ${current?.name||'Routine'}`),...s.activityLog])}}),
  resetRoutines:()=>set(s=>({routines:s.routines.map(x=>({...x,done:false,completed_at:null})),systemMeta:{...s.systemMeta,lastDailyReset:todayKey()},activityLog:cap([activity('routine','Daily routines reset manually'),...s.activityLog])})),
  toggleTodo:id=>set(s=>{const current=s.todos.find(x=>x.id===id),completed=current?.status!=='completed';return{todos:s.todos.map(x=>x.id===id?{...x,status:completed?'completed':'pending',completed_at:completed?nowIso():null}:x),activityLog:cap([activity('task',`${completed?'Completed':'Reopened'} task: ${current?.task||'Task'}`),...s.activityLog])}}),
  addTodo:(task,priority='medium')=>set(s=>({todos:[{id:uid(),task,priority,status:'pending',created_at:nowIso(),completed_at:null},...s.todos],activityLog:cap([activity('task',`Added task: ${task}`),...s.activityLog])})),
  updateTodo:(id,patch)=>set(s=>({todos:s.todos.map(x=>x.id===id?{...x,...patch}:x)})),deleteTodo:id=>set(s=>({todos:s.todos.filter(x=>x.id!==id)})),
  addEvent:event=>set(s=>({events:[...s.events,{id:uid(),color:'#2563EB',...event}]})),updateEvent:(id,patch)=>set(s=>({events:s.events.map(x=>x.id===id?{...x,...patch}:x)})),deleteEvent:id=>set(s=>({events:s.events.filter(x=>x.id!==id)})),
  updateBusiness:(id,patch)=>set(s=>({businesses:s.businesses.map(x=>x.id===id?{...x,...patch}:x)})),
  addProduct:product=>set(s=>({products:[...s.products,{id:uid(),...product}]})),updateProduct:(id,patch)=>set(s=>({products:s.products.map(x=>x.id===id?{...x,...patch}:x)})),deleteProduct:id=>set(s=>({products:s.products.filter(x=>x.id!==id)})),
  addLead:lead=>set(s=>({leads:[{id:uid(),status:'new',created_at:nowIso(),...lead},...s.leads],activityLog:cap([activity('lead',`Added lead: ${lead.name||lead.business||'New lead'}`),...s.activityLog])})),updateLead:(id,patch)=>set(s=>({leads:s.leads.map(x=>x.id===id?{...x,...patch}:x)})),deleteLead:id=>set(s=>({leads:s.leads.filter(x=>x.id!==id)})),moveLead:(id,status)=>set(s=>{const lead=s.leads.find(x=>x.id===id);return{leads:s.leads.map(x=>x.id===id?{...x,status,updated_at:nowIso()}:x),activityLog:cap([activity('lead',`${lead?.name||'Lead'} moved to ${status}`),...s.activityLog])}}),
  addClient:client=>set(s=>({clients:[{id:uid(),...client},...s.clients]})),updateClient:(id,patch)=>set(s=>({clients:s.clients.map(x=>x.id===id?{...x,...patch}:x)})),deleteClient:id=>set(s=>({clients:s.clients.filter(x=>x.id!==id)})),
  addResearch:item=>set(s=>({research:[{id:uid(),date:todayKey(),status:'pending',...item},...s.research]})),updateResearch:(id,patch)=>set(s=>({research:s.research.map(x=>x.id===id?{...x,...patch}:x)})),deleteResearch:id=>set(s=>({research:s.research.filter(x=>x.id!==id)})),
  addIncome:item=>set(s=>({income:[{id:uid(),currency:'GBP',date:todayKey(),...item},...s.income]})),addExpense:item=>set(s=>({expenses:[{id:uid(),currency:'GBP',date:todayKey(),...item},...s.expenses]})),deleteIncome:id=>set(s=>({income:s.income.filter(x=>x.id!==id)})),deleteExpense:id=>set(s=>({expenses:s.expenses.filter(x=>x.id!==id)})),setMonthlyGoal:value=>set({monthlyGoal:Number(value)||0}),
  addMemory:memory=>set(s=>{const created=normalizeMemory({id:uid(),date:todayKey(),created_at:nowIso(),updated_at:nowIso(),...memory});return{memories:[created,...s.memories],activityLog:cap([activity('memory',`Saved memory: ${created.title||'Untitled'}`),...s.activityLog])}}),
  updateMemory:(id,patch)=>set(s=>({memories:s.memories.map(x=>{if(x.id!==id)return x;const revision={at:nowIso(),title:x.title,content:x.content,tags:x.tags,category:x.category};return normalizeMemory({...x,...patch,updated_at:nowIso(),revisions:cap([revision,...(x.revisions||[])],50)})})})),
  togglePinMemory:id=>set(s=>({memories:s.memories.map(x=>x.id===id?{...x,pinned:!x.pinned,updated_at:nowIso()}:x)})),
  archiveMemory:id=>set(s=>({memories:s.memories.map(x=>x.id===id?{...x,archived:true,deleted:false,updated_at:nowIso()}:x)})),
  restoreMemory:id=>set(s=>({memories:s.memories.map(x=>x.id===id?{...x,archived:false,deleted:false,updated_at:nowIso()}:x)})),
  trashMemory:id=>set(s=>({memories:s.memories.map(x=>x.id===id?{...x,deleted:true,archived:false,updated_at:nowIso()}:x)})),
  permanentlyDeleteMemory:id=>set(s=>({memories:s.memories.filter(x=>x.id!==id)})),
  addTeamMember:member=>set(s=>({team:[...s.team,{id:uid(),active:true,...member}]})),updateTeamMember:(id,patch)=>set(s=>({team:s.team.map(x=>x.id===id?{...x,...patch}:x)})),deleteTeamMember:id=>set(s=>({team:s.team.filter(x=>x.id!==id)})),
  toggleModule:id=>set(s=>({moduleEnabled:{...s.moduleEnabled,[id]:!s.moduleEnabled[id]}})),toggleWebhook:id=>set(s=>({webhooks:s.webhooks.map(x=>x.id===id?{...x,enabled:!x.enabled}:x)})),updateWebhook:(id,patch)=>set(s=>({webhooks:s.webhooks.map(x=>x.id===id?{...x,...patch}:x)})),
  markBackup:()=>set(s=>({systemMeta:{...s.systemMeta,lastBackupAt:nowIso()}})),
  replaceState:data=>set(s=>({...defaults,...data,memories:Array.isArray(data?.memories)?data.memories.map(normalizeMemory):defaults.memories,systemMeta:{...defaults.systemMeta,...(data?.systemMeta||{}),schemaVersion:3,lastDailyReset:todayKey()},activityLog:cap([activity('system','Backup imported'),...(data?.activityLog||s.activityLog||[])])})),
  exportState:()=>get(),
}),{name:'zaka-command-center-v1',version:3,merge:migrateDaily}))
