import {S,esc,$,toast,errs,mediaEl,PLAT,PL} from './state.js';
import * as D from './data.js';
import {MAX_VIDEO_MB as MAXV} from './config.js';
const done=(err,ok)=>err?(console.error(err),toast('Could not save: '+err,true)):toast(ok);
let tab='overview',loading=false,authed=false;
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
if(tab==='work')return `<h1>Work</h1><p class="help">Portfolio projects shown on the website.</p>
<form class="panel" data-form="addwork" novalidate><h3 style="font-size:18px">Add a project</h3><div class="fld"><label for="wt">Title</label><input id="wt" name="t"><div class="err" data-e="t"></div></div><div class="fld"><label for="wc">Category</label><select id="wc" name="c"><option>Videography</option><option>Editing</option><option>Design</option><option>Social Media</option><option>Website</option></select></div><div class="fld"><label for="wf">Photo or video</label><input id="wf" name="file" type="file" accept="image/*,video/mp4,video/quicktime,video/webm"><div class="help">JPG, PNG, WebP or MP4. Videos up to ${MAXV} MB.</div><div class="err" data-e="file"></div></div><button class="btn sm" style="justify-self:start">Add project</button></form>
<div class="list">${S.work.map(w=>`<form class="wi wedit" data-form="editwork" data-id="${w.id}" novalidate><span class="thumb t${w.k%4}">${mediaEl(w)}</span><div class="wf"><div class="fld"><label for="wt${w.id}">Title</label><input id="wt${w.id}" name="t" value="${esc(w.t)}"></div><div class="fld"><label for="wc${w.id}">Category</label><select id="wc${w.id}" name="c">${catOpts(w.c)}</select></div><div class="fld"><label for="wf${w.id}">Replace photo or video (optional)</label><input id="wf${w.id}" name="file" type="file" accept="image/*,video/mp4,video/quicktime,video/webm"><div class="err" data-e="file"></div></div><div class="row"><button class="btn sm">Save</button><button type="button" class="btn sm danger" data-act="delwork" data-id="${w.id}">Remove</button></div></div></form>`).join('')||'<div class="empty">No projects yet. Add one above.</div>'}</div>`;
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

async function shrink(b){try{const i=await createImageBitmap(b),r=Math.min(1,1600/Math.max(i.width,i.height)),c=document.createElement('canvas');c.width=Math.round(i.width*r);c.height=Math.round(i.height*r);c.getContext('2d').drawImage(i,0,0,c.width,c.height);return await new Promise(ok=>c.toBlob(x=>ok(x||b),b.type==='image/png'?'image/png':'image/jpeg',.88))}catch(e){return b}}

const CATS=['Videography','Editing','Design','Social Media','Website'],catOpts=c=>[...new Set([...CATS,c])].map(x=>`<option${x===c?' selected':''}>${esc(x)}</option>`).join('');
const fileErr=F=>!/^(image|video)\//.test(F.type)?'Use an image (JPG, PNG, WebP) or an MP4 video.':F.size>(F.type.startsWith('video')?MAXV:25)*1048576?(F.type.startsWith('video')?'Video is over '+MAXV+' MB.':'Photo is over 25 MB.'):'';
const loginView=()=>`<div class="login"><form class="panel" data-form="login" novalidate><a class="logo" href="../"><span>Ad<i>Worth</i></span></a><div class="fld"><label for="le">Email</label><input id="le" name="email" type="email" autocomplete="username" required></div><div class="fld"><label for="lp">Password</label><input id="lp" name="pass" type="password" autocomplete="current-password" required><div class="err" data-e="pass"></div></div><button class="btn" type="submit">Sign in</button></form></div>`;
const setupView=`<div class="login"><div class="panel"><a class="logo" href="../"><span>Ad<i>Worth</i></span></a><h1 style="font-size:28px">Connect Supabase</h1><p class="help">The admin panel needs a database. Follow the steps in README.md, then paste your project URL and anon key into <b>js/config.js</b>.</p></div></div>`;
async function refresh(){await Promise.all([D.loadPublic(),D.loadInquiries()])}
function render(){$('#app').innerHTML=!D.live?setupView:authed?admin():loginView()}
document.addEventListener('submit',async e=>{const f=e.target,k=f.dataset.form;if(!k)return;e.preventDefault();const d=Object.fromEntries(new FormData(f)),v={};let err='';
if(k==='login'){const {error}=await D.sb.auth.signInWithPassword({email:d.email.trim(),password:d.pass});if(error){v.pass='Email or password is not correct.';errs(f,v);return}authed=true;await refresh();render();return}
if(k==='addsvc'){if(!d.t.trim()){v.t='Give the service a title.';errs(f,v);return}err=await D.addService(d.t.trim(),d.d.trim());done(err,'Service added')}
else if(k==='editsvc'){if(!d.t.trim())return toast('Title cannot be empty');err=await D.editService(f.dataset.id,d.t.trim(),d.d.trim());done(err,'Saved')}
else if(k==='addwork'||k==='editwork'){const F=d.file,has=F&&F.size,add=k==='addwork';if(!d.t.trim())v.t='Give the project a title.';if(add&&!has)v.file='Choose a photo or an MP4 video.';else if(has)v.file=fileErr(F);if(!v.file)delete v.file;if(!errs(f,v))return;toast(has?'Uploading…':'Saving…');let b=has?F:null;if(b&&/jpeg|png|webp/.test(b.type))b=await shrink(b);err=add?await D.addProject(d.t.trim(),d.c,b):await D.editProject(S.work.find(x=>x.id==f.dataset.id),d.t.trim(),d.c,b);done(err,(add?'Project added':'Saved'))}
else if(k==='settings'){if(!d.headline.trim())v.headline='Headline cannot be empty.';const wa=(d.wa||'').replace(/\D/g,'');if((d.wa||'').trim()&&(wa.length<8||wa.length>15))v.wa='Enter the full number with country code, for example 94771234567.';const soc={};for(const p of PLAT){const u=(d['s_'+p]||'').trim();if(!u){soc[p]='';continue}const x=/^https?:\/\//i.test(u)?u:'https://'+u;try{new URL(x);soc[p]=x}catch(e){v['s_'+p]='Enter a valid link.'}}if(!errs(f,v))return;err=await D.saveSettings({headline:d.headline.trim(),tag:d.tag.trim(),email:d.email.trim(),wa,wam:d.wam.trim(),soc});done(err,'Settings saved')}
await refresh();render()});
document.addEventListener('click',async e=>{const b=e.target.closest('[data-act]');if(!b)return;const a=b.dataset.act,id=b.dataset.id;let err='';
if(a==='tab'){tab=b.dataset.k;return render()}if(a==='site'){location.href='../';return}if(a==='out'){await D.sb.auth.signOut();authed=false;return render()}
if(a==='delsvc'){if(!confirm('Delete this service?'))return;err=await D.delService(id)}
else if(a==='delwork'){if(!confirm('Remove this project and its file?'))return;err=await D.delProject(S.work.find(x=>x.id==id))}
else if(a==='delinq'){if(!confirm('Delete this enquiry?'))return;err=await D.delEnq(id)}
else if(a==='tog'){const i=S.inq.find(x=>x.id==id);err=await D.setEnq(id,i.s==='new'?'done':'new')}else return;
if(err)toast('Could not save: '+err,true);await refresh();render()});
(async()=>{if(D.live){const {data}=await D.sb.auth.getSession();if(data.session){authed=true;await refresh()}}render()})();
