import {S,esc,$,toast,errs,mediaEl,PLAT,PL} from './state.js';
import * as D from './data.js';
import {prepare} from './media.js';
import {MAX_VIDEO_MB as MAXV} from './config.js';
const tmo=(p,ms)=>Promise.race([p,new Promise(r=>setTimeout(()=>r('Timed out. Check your connection and try again.'),ms))]);
let sig='',pending=false,watching=false;
const sigOf=()=>JSON.stringify([S.headline,S.tag,S.email,S.wa,S.wam,S.soc,S.services,S.work,S.inq]);
const editing=()=>{const a=document.activeElement;return !!(a&&a.matches&&a.matches('input,textarea,select'))};
const settle=async()=>{try{await Promise.race([refresh(),new Promise(r=>setTimeout(r,6000))])}catch(e){console.error(e)}sig=sigOf()};
async function sync(){if(!authed)return;const before=S.inq.length;try{await refresh()}catch(e){return}const n=sigOf();if(n===sig)return;sig=n;if(S.inq.length>before)toast('New enquiry received');if(editing()||busy){pending=true;return}render()}
document.addEventListener('focusout',()=>{if(pending)setTimeout(()=>{if(!editing()){pending=false;render()}},300)});
const startWatch=()=>{if(watching)return;watching=true;D.watch(['settings','services','projects','project_media','enquiries'],sync)};
const done=(err,ok)=>err?(console.error(err),toast('Could not save: '+err,true)):toast(ok);
let tab='overview',loading=false,authed=false,editId=null,busy=0;
const TABS=[['overview','Overview'],['inquiries','Inquiries'],['services','Services'],['work','Work'],['settings','Settings']];
function admin(){const nw=S.inq.filter(i=>i.s==='new').length;
return `<div class="adm"><nav class="side" aria-label="Admin"><a class="logo" href="#"><span>Ad<i>Worth</i></span></a>
${TABS.map(([k,l])=>`<button data-act="tab" data-k="${k}" ${tab===k?'aria-current="page"':''}>${l}${k==='inquiries'&&nw?`<span class="badge">${nw}</span>`:''}</button>`).join('')}
<button data-act="site" style="margin-top:auto">View website</button><button data-act="out">Sign out</button></nav>
<main class="main">${loading?'<div class="skel" style="width:40%"></div><div class="skel"></div><div class="skel" style="width:80%"></div>':panel()}</main></div>`}

function panel(){
if(tab==='overview')return `<h1>Overview</h1><p class="help">Your studio at a glance.</p>${S.wa?'':'<p class="help">Tip: add your WhatsApp number in Settings to show the chat button on the website.</p>'}
<div class="stats"><div class="stat"><b>${S.inq.length}</b><span>Total enquiries</span></div><div class="stat"><b>${S.services.length}</b><span>Live services</span></div><div class="stat"><b>${S.work.length}</b><span>Portfolio projects</span></div></div>
<h2 style="font-size:24px">Latest enquiries</h2>${inqList(S.inq.slice(0,3))}`;
if(tab==='inquiries')return `<h1>Inquiries</h1><p class="help">Messages from your website contact form.</p>${inqList(S.inq)}`;
if(tab==='services')return `<h1>Services</h1><p class="help">Changes appear on the website instantly.</p>
<form class="panel" data-form="addsvc" novalidate><h3 style="font-size:18px">Add a service</h3><div class="fld"><label for="at">Title</label><input id="at" name="t"><div class="err" data-e="t"></div></div><div class="fld"><label for="ad">Description</label><textarea id="ad" name="d"></textarea></div><button class="btn sm" style="justify-self:start">Add service</button></form>
<div class="list">${S.services.map(s=>`<form data-form="editsvc" data-id="${s.id}" novalidate><div class="fld"><label for="t${s.id}">Title</label><input id="t${s.id}" name="t" value="${esc(s.t)}"></div><div class="fld"><label for="d${s.id}">Description</label><textarea id="d${s.id}" name="d">${esc(s.d)}</textarea></div><div class="row"><button class="btn sm">Save</button><button type="button" class="btn sm danger" data-act="delsvc" data-id="${s.id}">Delete</button></div></form>`).join('')||'<div class="empty">No services yet. Add your first one above.</div>'}</div>`;
if(tab==='work')return workPanel();
return `<h1>Settings</h1><p class="help">Homepage text, WhatsApp and social links.</p>
<form class="panel" data-form="settings" novalidate><div class="fld"><label for="h">Homepage headline</label><input id="h" name="headline" value="${esc(S.headline)}"><div class="err" data-e="headline"></div></div>
<div class="fld"><label for="tg">Homepage subtext</label><textarea id="tg" name="tag">${esc(S.tag)}</textarea></div>
<div class="fld"><label for="em">Contact email</label><input id="em" name="email" type="email" value="${esc(S.email)}"></div><h3 style="font-size:18px;margin-top:8px">WhatsApp</h3>
<div class="fld"><label for="wa">WhatsApp number</label><input id="wa" name="wa" type="tel" inputmode="tel" autocomplete="off" placeholder="94771234567" value="${esc(S.wa)}"><div class="help">Country code first, no plus sign or spaces. Leave empty to hide the WhatsApp buttons.</div><div class="err" data-e="wa"></div></div>
<div class="fld"><label for="wam">Pre-filled message</label><input id="wam" name="wam" value="${esc(S.wam)}"></div>
<h3 style="font-size:18px;margin-top:8px">Social links</h3>
${PLAT.map(p=>`<div class="fld"><label for="s_${p}">${PL[p]}</label><input id="s_${p}" name="s_${p}" type="url" inputmode="url" autocomplete="off" placeholder="https://" value="${esc((S.soc||{})[p]||'')}"><div class="err" data-e="s_${p}"></div></div>`).join('')}
<div class="row"><button class="btn sm">Save settings</button></div>
</form>`}

function inqList(a){return a.length?`<div class="list">${a.map(i=>`<div><div class="h"><span><b>${esc(i.n)}</b> · <a href="mailto:${esc(i.e)}">${esc(i.e)}</a></span><span><span class="pill ${i.s==='new'?'new':''}">${i.s==='new'?'New':'Handled'}</span> <span class="pill">${esc(i.v)}</span></span></div><p style="margin:0">${esc(i.m)}</p><div class="row"><button class="btn sm ghost" data-act="tog" data-id="${i.id}">Mark ${i.s==='new'?'handled':'new'}</button><button class="btn sm danger" data-act="delinq" data-id="${i.id}">Delete</button></div></div>`).join('')}</div>`:`<div class="empty"><b>No enquiries yet.</b><br>New messages from the contact form will appear here.</div>`}


const workPanel=()=>{const w=S.work.find(x=>x.id==editId);return w?editor(w):`<h1>Work</h1><p class="help">Each project is a case study with its own photos and videos.</p>
<form class="panel" data-form="newproject" novalidate><h3 style="font-size:18px">New project</h3><div class="fld"><label for="np">Title</label><input id="np" name="t"><div class="err" data-e="t"></div></div><div class="fld"><label for="nc">Category</label><select id="nc" name="c">${catOpts('Videography')}</select></div><button class="btn sm" style="justify-self:start">Create and add media</button></form>
<div class="list">${S.work.map(w=>`<div class="wi"><span class="thumb t${w.k%4}">${mediaEl(w)}</span><span><b>${esc(w.t)}</b><br><span class="pill">${esc(w.c)}</span> <span class="pill">${w.items.length} item${w.items.length===1?'':'s'}</span>${w.client?` <span class="pill">${esc(w.client)}</span>`:''}</span><button class="btn sm ghost" data-act="editproj" data-id="${w.id}">Edit</button><button class="btn sm danger" data-act="delwork" data-id="${w.id}" aria-label="Delete ${esc(w.t)}">Delete</button></div>`).join('')||'<div class="empty">No projects yet. Create your first one above.</div>'}</div>`};
const editor=w=>`<button class="btn sm ghost" data-act="back">← All projects</button><h1 style="margin-top:16px">${esc(w.t)}</h1><p class="help">Details and captions save automatically when you leave a field.</p>
<div class="panel"><h3 style="font-size:18px">Details</h3>
<div class="fld"><label for="pt">Title</label><input id="pt" data-pf="title" value="${esc(w.t)}"></div>
<div class="fld"><label for="pc">Category</label><select id="pc" data-pf="category">${catOpts(w.c)}</select></div>
<div class="fld"><label for="pcl">Client name</label><input id="pcl" data-pf="client" value="${esc(w.client)}"></div>
<div class="fld"><label for="pr">Result or metric</label><input id="pr" data-pf="result" placeholder="For example: 3x more enquiries in 60 days" value="${esc(w.result)}"></div>
<div class="fld"><label for="pq">Client testimonial</label><textarea id="pq" data-pf="quote">${esc(w.quote)}</textarea></div>
<div class="fld"><label for="pb">Testimonial from</label><input id="pb" data-pf="quote_by" placeholder="Name, role" value="${esc(w.by)}"></div></div>
<div class="panel"><h3 style="font-size:18px">Photos and videos</h3><div class="fld"><label for="pf">Add files</label><input id="pf" type="file" multiple accept="image/*,video/mp4,video/quicktime,video/webm" data-up="${w.id}"><div class="help">Select several at once. JPG, PNG, WebP or MP4. Videos up to ${MAXV} MB. A video set as the cover plays automatically on the website, so choose a short, light clip for it.</div></div><div id="queue" role="status"></div></div>
<div class="gal">${w.items.map((it,i)=>`<div class="gi"><div class="gt">${it.type==='video'&&!it.thumb?`<video src="${esc(it.url)}#t=0.1" preload="metadata" muted playsinline></video>`:`<img src="${esc(it.thumb||it.url)}" alt="" loading="lazy">`}${it.type==='video'?'<span class="tag">Video</span>':''}${(w.cover===it.id||(!w.cover&&!i))?'<span class="tag cv">Cover</span>':''}</div><input data-cap="${it.id}" placeholder="Caption (optional)" aria-label="Caption" value="${esc(it.caption)}"><div class="row"><button class="btn sm ghost" data-act="cover" data-id="${it.id}">Cover</button><button class="btn sm ghost" data-act="up" data-id="${it.id}" aria-label="Move earlier"${i?'':' disabled'}>↑</button><button class="btn sm ghost" data-act="dn" data-id="${it.id}" aria-label="Move later"${i<w.items.length-1?'':' disabled'}>↓</button><button class="btn sm danger" data-act="delitem" data-id="${it.id}">Remove</button></div></div>`).join('')||'<div class="empty">No photos or videos yet. Add some above.</div>'}</div>`;
async function upload(pid,files){const w=S.work.find(x=>x.id==pid),q=$('#queue');if(!w||!q)return;busy++;let ok=0,fail=0,pos=Math.max(-1,...w.items.map(i=>i.pos))+1;
const rows=files.map(f=>{const r=document.createElement('div');r.className='qi';r.textContent=f.name+': waiting';q.append(r);return r});
for(let i=0;i<files.length;i++){const f=files[i],r=rows[i],bad=fileErr(f),set=(m,c)=>{r.textContent=f.name+': '+m;r.className='qi'+(c?' '+c:'')};if(bad){set(bad,'bad');fail++;continue}
try{set('preparing…');const p=await prepare(f);set('uploading…');const err=await tmo(D.addItem(pid,p,pos,!w.items.length&&!ok&&!w.cover),180000);if(err){set(err,'bad');fail++}else{set('done','ok');ok++;pos++}}catch(x){console.error(x);set('failed','bad');fail++}}
busy--;await settle();const html=q.innerHTML;if(!busy){render();const nq=$('#queue');if(nq)nq.innerHTML=html}
if(fail)toast(ok+' added, '+fail+' failed. See the list for details.',true);else toast(ok+' file'+(ok===1?'':'s')+' added')}
const CATS=['Videography','Editing','Design','Social Media','Website'],catOpts=c=>[...new Set([...CATS,c])].map(x=>`<option${x===c?' selected':''}>${esc(x)}</option>`).join('');
const fileErr=F=>!/^(image|video)\//.test(F.type)?'Use an image (JPG, PNG, WebP) or an MP4 video.':F.size>(F.type.startsWith('video')?MAXV:25)*1048576?(F.type.startsWith('video')?'Video is over '+MAXV+' MB.':'Photo is over 25 MB.'):'';
const loginView=()=>`<div class="login"><form class="panel" data-form="login" novalidate><a class="logo" href="../"><span>Ad<i>Worth</i></span></a><div class="fld"><label for="le">Email</label><input id="le" name="email" type="email" autocomplete="username" required></div><div class="fld"><label for="lp">Password</label><input id="lp" name="pass" type="password" autocomplete="current-password" required><div class="err" data-e="pass"></div></div><button class="btn" type="submit">Sign in</button></form></div>`;
const setupView=`<div class="login"><div class="panel"><a class="logo" href="../"><span>Ad<i>Worth</i></span></a><h1 style="font-size:28px">Connect Supabase</h1><p class="help">The admin panel needs a database. Follow the steps in README.md, then paste your project URL and anon key into <b>js/config.js</b>.</p></div></div>`;
async function refresh(){await Promise.all([D.loadPublic(),D.loadInquiries()])}
function render(){$('#app').innerHTML=!D.live?setupView:authed?admin():loginView()}
document.addEventListener('submit',async e=>{const f=e.target,k=f.dataset.form;if(!k)return;e.preventDefault();const btn=f.querySelector('button:not([type=button])'),lab=btn&&btn.textContent;if(btn&&k!=='login'){btn.disabled=true;btn.textContent='Saving…'}try{await handle(f,k)}catch(x){console.error(x);toast('Could not save: '+(x.message||x),true)}finally{if(btn&&btn.isConnected){btn.disabled=false;btn.textContent=lab}}});
async function handle(f,k){const d=Object.fromEntries(new FormData(f)),v={};let err='';
if(k==='login'){const {error}=await D.sb.auth.signInWithPassword({email:d.email.trim(),password:d.pass});if(error){v.pass='Email or password is not correct.';errs(f,v);return}authed=true;await settle();render();startWatch();return}
if(k==='addsvc'){if(!d.t.trim()){v.t='Give the service a title.';errs(f,v);return}err=await D.addService(d.t.trim(),d.d.trim());done(err,'Service added')}
else if(k==='editsvc'){if(!d.t.trim())return toast('Title cannot be empty');err=await D.editService(f.dataset.id,d.t.trim(),d.d.trim());done(err,'Saved')}
else if(k==='newproject'){if(!d.t.trim()){v.t='Give the project a title.';errs(f,v);return}const r=await D.createProject(d.t.trim(),d.c);if(r.error)done(r.error);else{editId=r.id;toast('Project created. Add photos and videos below.')}}
else if(k==='settings'){if(!d.headline.trim())v.headline='Headline cannot be empty.';const wa=(d.wa||'').replace(/\D/g,'');if((d.wa||'').trim()&&(wa.length<8||wa.length>15))v.wa='Enter the full number with country code, for example 94771234567.';const soc={};for(const p of PLAT){const u=(d['s_'+p]||'').trim();if(!u){soc[p]='';continue}const x=/^https?:\/\//i.test(u)?u:'https://'+u;try{new URL(x);soc[p]=x}catch(e){v['s_'+p]='Enter a valid link.'}}if(!errs(f,v))return;err=await D.saveSettings({headline:d.headline.trim(),tag:d.tag.trim(),email:d.email.trim(),wa,wam:d.wam.trim(),soc});done(err,'Settings saved')}
await settle();render()}
document.addEventListener('click',async e=>{const b=e.target.closest('[data-act]');if(!b)return;const a=b.dataset.act,id=b.dataset.id;let err='';
if(a==='tab'){tab=b.dataset.k;return render()}if(a==='site'){location.href='../';return}if(a==='out'){await D.sb.auth.signOut();authed=false;return render()}
if(a==='editproj'){editId=+id;return render()}if(a==='back'){editId=null;return render()}
const W=S.work.find(x=>x.id==editId),IT=W&&W.items.find(x=>x.id==id);
if(a==='cover'&&W)err=await D.updateProject(W.id,{cover_id:+id});else if((a==='up'||a==='dn')&&W&&IT)err=await D.reorder(W,IT,a==='up'?-1:1);else if(a==='delitem'&&W&&IT){if(!confirm('Remove this photo or video?'))return;err=await D.deleteItem(W,IT)}
else if(a==='delsvc'){if(!confirm('Delete this service?'))return;err=await D.delService(id)}
else if(a==='delwork'){if(!confirm('Delete this project and all its photos and videos?'))return;err=await D.deleteProject(S.work.find(x=>x.id==id))}
else if(a==='delinq'){if(!confirm('Delete this enquiry?'))return;err=await D.delEnq(id)}
else if(a==='tog'){const i=S.inq.find(x=>x.id==id);err=await D.setEnq(id,i.s==='new'?'done':'new')}else return;
if(err)toast('Could not save: '+err,true);await settle();render()});
(async()=>{if(D.live){const {data}=await D.sb.auth.getSession();if(data.session){authed=true;await settle();startWatch()}}render()})();

document.addEventListener('change',async e=>{const t=e.target,w=S.work.find(x=>x.id==editId);if(!w)return;
if(t.dataset.pf){const f=t.dataset.pf,v=t.value.trim(),map={title:'t',category:'c',client:'client',result:'result',quote:'quote',quote_by:'by'};if(f==='title'&&!v){toast('Title cannot be empty',true);t.value=w.t;return}const err=await D.updateProject(w.id,{[f]:v});if(!err){w[map[f]]=v;sig=sigOf()}done(err,'Saved');return}
if(t.dataset.cap){const it=w.items.find(x=>x.id==t.dataset.cap);if(!it)return;const v=t.value.trim(),err=await D.updateItem(it.id,{caption:v});if(!err){it.caption=v;sig=sigOf()}done(err,'Saved');return}
if(t.dataset.up){const files=[...t.files];t.value='';if(files.length)upload(+t.dataset.up,files)}});
