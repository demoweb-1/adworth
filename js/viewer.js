// Case-study viewer (full-screen, swipeable) and category filter for the Work grid.
import {S,esc,$} from './state.js';
let flt='All',open=null,opener=null,vr=0;
function prog(){const r=document.querySelector('.work'),p=document.querySelector('.wprog');if(!r||!p)return;const sw=r.scrollWidth,cw=r.clientWidth;p.hidden=sw<=cw+2;if(p.hidden)return;const i=p.firstElementChild;i.style.width=(cw/sw*100)+'%';i.style.left=(r.scrollLeft/sw*100)+'%'}
document.addEventListener('scroll',e=>{if(e.target.classList&&e.target.classList.contains('work'))prog()},true);addEventListener('resize',prog);
export function applyFilter(){document.querySelectorAll('.work figure').forEach(f=>{f.hidden=!(flt==='All'||f.dataset.cat===flt)});document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===flt)));prog()}
const cur=()=>{const t=document.querySelector('#viewer .vtrack');return t?Math.round(t.scrollLeft/Math.max(1,t.clientWidth)):0};
function mark(i){const v=$('#viewer');if(!v)return;const n=v.querySelectorAll('.vs').length;v.querySelector('.vcount').textContent=(i+1)+' / '+n;
v.querySelectorAll('.vthumbs button').forEach((b,k)=>{k===i?b.setAttribute('aria-current','true'):b.removeAttribute('aria-current')});
v.querySelectorAll('.vs').forEach((s,k)=>{if(k!==i){const m=s.querySelector('video');if(m)m.pause()}})}
function go(i){const t=document.querySelector('#viewer .vtrack');if(t)t.scrollTo({left:i*t.clientWidth,behavior:'smooth'})}
function step(d){const n=document.querySelectorAll('#viewer .vs').length;go(Math.max(0,Math.min(n-1,cur()+d)))}
export function hide(){const v=$('#viewer');if(v)v.remove();$('#app').inert=false;document.documentElement.style.overflow='';open=null;if(opener&&opener.isConnected)opener.focus();opener=null}
export function show(id){const w=S.work.find(x=>x.id===id);if(!w||!w.items.length){hide();return}if(open===id)return;const prev=opener;hide();opener=prev;const its=w.items;
const el=document.createElement('div');el.id='viewer';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label',w.t);
el.innerHTML=`<div class="vbar"><button class="vx" data-vclose aria-label="Close">×</button><span class="vname">${esc(w.t)}</span><span class="vcount" aria-live="polite">1 / ${its.length}</span></div>
<div class="vstage"><div class="vtrack" tabindex="0" aria-label="Photos and videos">${its.map((it,i)=>`<figure class="vs">${it.type==='video'?`<video src="${esc(it.url)}"${it.thumb?` poster="${esc(it.thumb)}"`:''} controls playsinline preload="metadata"></video>`:`<img src="${esc(it.url)}" alt="${esc(it.caption||w.t)}"${i?' loading="lazy"':''} decoding="async">`}${it.caption?`<figcaption>${esc(it.caption)}</figcaption>`:''}</figure>`).join('')}</div>
${its.length>1?'<button class="varr l" data-vdir="-1" aria-label="Previous">‹</button><button class="varr r" data-vdir="1" aria-label="Next">›</button>':''}</div>
${its.length>1?`<div class="vthumbs">${its.map((it,i)=>`<button data-vt="${i}" aria-label="Show item ${i+1}"${i?'':' aria-current="true"'}><img src="${esc(it.thumb||it.url)}" alt="" loading="lazy">${it.type==='video'?'<i>▶</i>':''}</button>`).join('')}</div>`:''}
<div class="vd"><div class="eyebrow">${esc(w.c)}</div><h2 class="vt">${esc(w.t)}</h2>${w.client?`<p class="vc">Client: ${esc(w.client)}</p>`:''}${w.result?`<p class="vr">${esc(w.result)}</p>`:''}${w.quote?`<blockquote class="vq"><p>“${esc(w.quote)}”</p>${w.by?`<cite>${esc(w.by)}</cite>`:''}</blockquote>`:''}<a class="btn" href="#contact" data-vgo>Start a project like this</a></div>`;
document.body.append(el);$('#app').inert=true;document.documentElement.style.overflow='hidden';open=id;
const tr=el.querySelector('.vtrack');tr.addEventListener('scroll',()=>{if(!vr)vr=requestAnimationFrame(()=>{vr=0;mark(cur())})},{passive:true});el.querySelector('.vx').focus()}
export function close(){if(history.state&&history.state.v)history.back();else{history.replaceState(null,'','#work');hide();const w=document.getElementById('work');if(w)w.scrollIntoView()}}
export function route(){const m=/^#project-(\d+)$/.exec(location.hash);if(m){if(open!==+m[1])show(+m[1])}else if(open!==null)hide()}
document.addEventListener('click',e=>{const t=e.target;if(!t.closest)return;
const f=t.closest('[data-filter]');if(f){flt=f.dataset.filter;applyFilter();const r=document.querySelector('.work');if(r)r.scrollTo({left:0,behavior:'smooth'});return}
const wd=t.closest('[data-wdir]');if(wd){const r=document.querySelector('.work'),c=r&&r.querySelector('figure:not([hidden])');if(r&&c)r.scrollBy({left:wd.dataset.wdir*(c.offsetWidth+16),behavior:'smooth'});return}
const o=t.closest('[data-open]');if(o){e.preventDefault();opener=o;history.pushState({v:1},'','#project-'+o.dataset.open);show(+o.dataset.open);return}
if(t.closest('[data-vclose]')){close();return}
if(t.closest('[data-vgo]')){e.preventDefault();hide();history.replaceState(null,'','#contact');const c=document.getElementById('contact');if(c)c.scrollIntoView();return}
const th=t.closest('[data-vt]');if(th){go(+th.dataset.vt);return}
const ar=t.closest('[data-vdir]');if(ar)step(+ar.dataset.vdir)});
document.addEventListener('keydown',e=>{if(open===null)return;if(e.key==='Escape')close();else if(e.key==='ArrowRight')step(1);else if(e.key==='ArrowLeft')step(-1)});
