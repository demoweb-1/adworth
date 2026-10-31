import {SUPABASE_URL as URL_,SUPABASE_ANON_KEY as KEY_} from './config.js';
import {S} from './state.js';
export const live=!!(URL_&&KEY_);
export const sb=live?(await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm')).createClient(URL_,KEY_):null;
const pub=p=>sb.storage.from('media').getPublicUrl(p).data.publicUrl;
const run=async(q,anon)=>{const {data,error}=await(anon?q:q.select('id'));if(error)return error.message;if(!anon&&!data?.length)return 'Nothing was changed. Please sign out, sign in again and retry.';return ''};
export async function loadPublic(){if(!live)return;
const [a,b,c,m]=await Promise.all([sb.from('settings').select('*').eq('id',1).maybeSingle(),sb.from('services').select('*').order('position').order('id'),sb.from('projects').select('*').order('position').order('id',{ascending:false}),sb.from('project_media').select('*').order('position').order('id')]);
if(a.data)Object.assign(S,{headline:a.data.headline||S.headline,tag:a.data.tagline||S.tag,email:a.data.email||S.email,wa:a.data.whatsapp||'',wam:a.data.wa_message||S.wam,soc:{...S.soc,...(a.data.socials||{})}});
if(b.data)S.services=b.data.map(r=>({id:r.id,t:r.title,d:r.description||''}));
if(c.data){const by={};(m.data||[]).forEach(r=>{(by[r.project_id]=by[r.project_id]||[]).push({id:r.id,type:r.type,url:pub(r.path),thumb:r.thumb_path?pub(r.thumb_path):'',caption:r.caption||'',pos:r.position,path:r.path,thumbPath:r.thumb_path})});
S.work=c.data.map(r=>{let it=by[r.id]||[];if(!it.length&&r.media_path)it=[{id:null,type:r.media_type,url:pub(r.media_path),thumb:'',caption:'',pos:0,path:r.media_path}];const cv=it.find(x=>x.id===r.cover_id)||it[0],ps=cv&&cv.type==='video'&&cv.thumb;
return {id:r.id,t:r.title,c:r.category,client:r.client||'',result:r.result||'',quote:r.quote||'',by:r.quote_by||'',cover:r.cover_id,items:it,k:r.id%4,mt:cv?(ps?'image':cv.type):'',url:cv?(ps?cv.thumb:(cv.thumb||cv.url)):'',path:r.media_path}})}}
export async function loadInquiries(){const {data}=await sb.from('enquiries').select('*').order('created_at',{ascending:false});S.inq=(data||[]).map(r=>({id:r.id,n:r.name,e:r.email,v:r.service||'',m:r.message,s:r.status}))}
export const sendEnq=o=>run(sb.from('enquiries').insert(o),1);
export const saveSettings=o=>run(sb.from('settings').upsert({id:1,headline:o.headline,tagline:o.tag,email:o.email,whatsapp:o.wa,wa_message:o.wam,socials:o.soc}));
export const addService=(t,d)=>run(sb.from('services').insert({title:t,description:d,position:S.services.length}));
export const editService=(id,t,d)=>run(sb.from('services').update({title:t,description:d}).eq('id',id));
export const delService=id=>run(sb.from('services').delete().eq('id',id));
export const setEnq=(id,status)=>run(sb.from('enquiries').update({status}).eq('id',id));
export const delEnq=id=>run(sb.from('enquiries').delete().eq('id',id));
const put=async(p,b)=>{const {error}=await sb.storage.from('media').upload(p,b,{contentType:b.type,cacheControl:'31536000'});return error?error.message:''};
const rm=p=>p.length?sb.storage.from('media').remove(p):0;
export async function createProject(title,category){const {data,error}=await sb.from('projects').insert({title,category}).select('id');return {id:data&&data[0]&&data[0].id,error:error?error.message:''}}
export const updateProject=(id,f)=>run(sb.from('projects').update(f).eq('id',id));
export const updateItem=(id,f)=>run(sb.from('project_media').update(f).eq('id',id));
export async function addItem(pid,p,position,makeCover){const base=`p${pid}/${Date.now()}-${Math.random().toString(36).slice(2,7)}`,ext=p.type==='video'?({'video/quicktime':'mov','video/webm':'webm'}[p.full.type]||'mp4'):(p.full.type==='image/png'?'png':'jpg'),path=`${base}.${ext}`;
let e=await put(path,p.full);if(e)return e;let tp=null;if(p.thumb){tp=`${base}-t.jpg`;e=await put(tp,p.thumb);if(e){await rm([path]);return e}}
const {data,error}=await sb.from('project_media').insert({project_id:pid,type:p.type,path,thumb_path:tp,position,size_bytes:p.size}).select('id');
if(error||!data||!data.length){await rm([path,tp].filter(Boolean));return error?error.message:'Nothing was saved.'}
return makeCover?updateProject(pid,{cover_id:data[0].id}):''}
export async function deleteItem(w,it){await rm([it.path,it.thumbPath].filter(Boolean));const e=await run(sb.from('project_media').delete().eq('id',it.id));if(e)return e;
if(w.cover===it.id){const nx=w.items.find(x=>x.id!==it.id);return updateProject(w.id,{cover_id:nx?nx.id:null})}return ''}
export async function reorder(w,it,dir){const o=[...w.items],i=o.findIndex(x=>x.id===it.id),j=i+dir;if(j<0||j>=o.length)return '';[o[i],o[j]]=[o[j],o[i]];
const rs=await Promise.all(o.map((x,k)=>x.pos!==k?sb.from('project_media').update({position:k}).eq('id',x.id):null).filter(Boolean));const bad=rs.find(r=>r.error);return bad?bad.error.message:''}
export async function deleteProject(w){await rm([...w.items.flatMap(x=>[x.path,x.thumbPath]),w.path].filter(Boolean));return run(sb.from('projects').delete().eq('id',w.id))}

export function watch(tables,cb){if(!live)return;let t,ok=false;const fire=()=>{clearTimeout(t);t=setTimeout(cb,350)};
const ch=sb.channel('adworth-'+Math.random().toString(36).slice(2));tables.forEach(tb=>ch.on('postgres_changes',{event:'*',schema:'public',table:tb},fire));
ch.subscribe(s=>{ok=s==='SUBSCRIBED'});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)cb()});
setInterval(()=>{if(!ok&&!document.hidden)cb()},45000)}
