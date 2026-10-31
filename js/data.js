import {SUPABASE_URL as URL_,SUPABASE_ANON_KEY as KEY_} from './config.js';
import {S} from './state.js';
export const live=!!(URL_&&KEY_);
export const sb=live?(await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm')).createClient(URL_,KEY_):null;
const pub=p=>sb.storage.from('media').getPublicUrl(p).data.publicUrl;
const run=async q=>{const {error}=await q;return error?error.message:''};
export async function loadPublic(){if(!live)return;
const [a,b,c]=await Promise.all([sb.from('settings').select('*').eq('id',1).maybeSingle(),sb.from('services').select('*').order('position').order('id'),sb.from('projects').select('*').order('position').order('id',{ascending:false})]);
if(a.data)Object.assign(S,{headline:a.data.headline||S.headline,tag:a.data.tagline||S.tag,email:a.data.email||S.email,wa:a.data.whatsapp||'',wam:a.data.wa_message||S.wam,soc:{...S.soc,...(a.data.socials||{})}});
if(b.data)S.services=b.data.map(r=>({id:r.id,t:r.title,d:r.description||''}));
if(c.data)S.work=c.data.map(r=>({id:r.id,t:r.title,c:r.category,k:r.id%4,mt:r.media_type,path:r.media_path,url:r.media_path?pub(r.media_path):''}))}
export async function loadInquiries(){const {data}=await sb.from('enquiries').select('*').order('created_at',{ascending:false});S.inq=(data||[]).map(r=>({id:r.id,n:r.name,e:r.email,v:r.service||'',m:r.message,s:r.status}))}
export const sendEnq=o=>run(sb.from('enquiries').insert(o));
export const saveSettings=o=>run(sb.from('settings').upsert({id:1,headline:o.headline,tagline:o.tag,email:o.email,whatsapp:o.wa,wa_message:o.wam,socials:o.soc}));
export const addService=(t,d)=>run(sb.from('services').insert({title:t,description:d,position:S.services.length}));
export const editService=(id,t,d)=>run(sb.from('services').update({title:t,description:d}).eq('id',id));
export const delService=id=>run(sb.from('services').delete().eq('id',id));
export const setEnq=(id,status)=>run(sb.from('enquiries').update({status}).eq('id',id));
export const delEnq=id=>run(sb.from('enquiries').delete().eq('id',id));
export async function addProject(title,category,file){const ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','video/mp4':'mp4','video/quicktime':'mov','video/webm':'webm'}[file.type]||'bin',path=`${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`;
const up=await sb.storage.from('media').upload(path,file,{contentType:file.type,cacheControl:'31536000'});if(up.error)return up.error.message;
const err=await run(sb.from('projects').insert({title,category,media_path:path,media_type:file.type.startsWith('video')?'video':'image'}));if(err)await sb.storage.from('media').remove([path]);return err}
export async function delProject(w){if(w.path)await sb.storage.from('media').remove([w.path]);return run(sb.from('projects').delete().eq('id',w.id))}
