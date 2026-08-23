import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const modules = [
  ['home','Home','/'],['lifeos','LifeOS','/lifeos'],['business','Business','/business'],['warehouse','Warehouse','/warehouse'],['leads','Leads','/leads'],['clients','Clients','/clients'],['research','Research','/research'],['finance','Finance','/finance'],['memory','Memory Vault','/memory'],['team','Team','/team'],['settings','Settings','/settings']
]

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
    {id:1,task:'Connect Supabase to Command Center',priority:'high',status:'pending'},
    {id:2,task:'Follow up with leads',priority:'medium',status:'pending'},
    {id:3,task:'Update Warehouse stock counts',priority:'low',status:'completed'},
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
  leads:[
    {id:1,name:'Sample Lead',business:'Innogen Prospect',source:'WhatsApp',service:'Company Formation',value:250,status:'new',follow_up:'',notes:''},
  ],
  clients:[
    {id:1,name:'Sample Client',business:'Client Business',service:'Digital Service',status:'active',monthly:300,start_date:'2026-06-01',tasks:['Monthly follow-up','Status report'],notes:'',color:'#2563EB'},
  ],
  research:[
    {id:1,title:'AI & Automation Opportunities',type:'ai',status:'in-progress',summary:'Track useful tools and workflow ideas that can create measurable business value.',date:'2026-08-23',saved_to_vault:false},
  ],
  income:[],
  expenses:[],
  monthlyGoal:5000,
  memories:[
    {id:1,title:'Command Center Purpose',content:'One central operating system for personal execution, businesses, leads, clients, finance, research, team and automation.',tags:['system','command-center'],category:'Systems',date:'2026-08-23'},
  ],
  team:[
    {id:1,name:'MD Zakaria Islam',role:'Founder & CEO',phone:'',email:'',tasks:['Strategy','Business development','Systems'],active:true,avatar:'ZI',color:'#FF6B9D'},
  ],
  webhooks:[
    {id:1,name:'Telegram Command',path:'/api/webhooks/telegram-command',enabled:false,url:''},
    {id:2,name:'n8n Task Push',path:'/api/webhooks/n8n-task',enabled:false,url:''},
    {id:3,name:'AI Daily Briefing',path:'/api/webhooks/ai-briefing',enabled:false,url:''},
    {id:4,name:'Research Result',path:'/api/webhooks/research-result',enabled:false,url:''},
    {id:5,name:'Google Calendar Sync',path:'/api/webhooks/calendar-sync',enabled:false,url:''},
  ],
  moduleEnabled:Object.fromEntries(modules.map(([id])=>[id,true])),
}

export const useCommandStore = create(persist((set,get)=>({
  ...defaults,
  toggleFocus:id=>set(s=>({focusBlocks:s.focusBlocks.map(x=>x.id===id?{...x,done:!x.done}:x)})),
  toggleRoutine:id=>set(s=>({routines:s.routines.map(x=>x.id===id?{...x,done:!x.done}:x)})),
  resetRoutines:()=>set(s=>({routines:s.routines.map(x=>({...x,done:false}))})),
  toggleTodo:id=>set(s=>({todos:s.todos.map(x=>x.id===id?{...x,status:x.status==='completed'?'pending':'completed'}:x)})),
  addTodo:task=>set(s=>({todos:[{id:Date.now(),task,priority:'medium',status:'pending'},...s.todos]})),
  moveLead:(id,status)=>set(s=>({leads:s.leads.map(x=>x.id===id?{...x,status}:x)})),
  toggleModule:id=>set(s=>({moduleEnabled:{...s.moduleEnabled,[id]:!s.moduleEnabled[id]}})),
  toggleWebhook:id=>set(s=>({webhooks:s.webhooks.map(x=>x.id===id?{...x,enabled:!x.enabled}:x)})),
  addMemory:memory=>set(s=>({memories:[{id:Date.now(),date:new Date().toISOString().slice(0,10),...memory},...s.memories]})),
  replaceState:data=>set({...defaults,...data}),
  exportState:()=>get(),
}),{
  name:'zaka-command-center-v1',
  version:1,
  merge:(persisted,current)=>({...current,...persisted}),
}))
