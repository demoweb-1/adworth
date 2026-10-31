import {S,esc,$,errs,mail,mediaEl,PLAT,PL} from './state.js';
import {live,loadPublic,sendEnq} from './data.js';
import {bind} from './motion.js';
const waLink=t=>S.wa?'https://wa.me/'+S.wa+'?text='+encodeURIComponent(t||S.wam||''):'';
const WAI='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11.5a8 8 0 01-11.8 7L4 20l1.5-4.1A8 8 0 1120 11.5z"/><path d="M9.3 8.9c.3 2.1 2.3 4.1 4.5 4.5l1-1.1-1.5-.9-.7.6a3.4 3.4 0 01-1.6-1.6l.6-.7-.9-1.5-1.4 1.7z" fill="currentColor" stroke="none"/></svg>';
function site(){return `
<nav class="top" aria-label="Main"><div class="wrap"><a class="logo" href="#"><span>Ad<i>Worth</i></span></a>
<div class="links"><a href="#services">Services</a>${S.work.length?'<a href="#work">Work</a>':''}<a href="#contact">Contact</a></div>
<a class="btn sm" href="#contact">Start a project</a></div></nav>
<main>
<div class="wrap hero"><div><div class="eyebrow">Digital marketing studio</div><h1>${S.headline.split(' ').map((w,i,a)=>`<span class="w"><b style="--i:${i}">${i===a.length-1?`<em>${esc(w)}</em>`:esc(w)}</b></span>`).join(' ')}</h1><p>${esc(S.tag)}</p>
<div class="row"><a class="btn" href="#contact">Start a project</a>${S.work.length?'<a class="btn ghost" href="#work">See our work</a>':''}</div><ol class="idx" aria-label="Services">${S.services.map((s,i)=>`<li><span>0${i+1}</span>${esc(s.t)}</li>`).join('')}</ol></div>
<div class="heroart" id="ha"><div class="art" role="img" aria-label="AdWorth rising arrow mark"></div></div></div>
<section class="say"><div class="wrap"><p id="say">${'We shoot it. We cut it. We design it. We post it. We build the site it lands on.'.split(' ').map(w=>`<span>${w}</span>`).join(' ')}</p></div></section>
${S.services.length?`<section id="services" class="story" style="--n:${S.services.length}"><div class="stage"><div class="wrap sgrid"><div><div class="eyebrow">What we do</div><div class="steps">${S.services.map((s,i)=>`<article class="step${i?'':' on'}"><span class="cnt">0${i+1} / 0${S.services.length}</span><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p></article>`).join('')}</div></div>
<div class="sidxw"><span class="sbar" aria-hidden="true"><i></i></span><ol class="sidx" aria-label="Services">${S.services.map((s,i)=>`<li><button type="button" data-go="${i}" class="${i?'':'on'}">${esc(s.t)}</button></li>`).join('')}</ol></div></div></div></section>`:''}
${S.work.length?`<section id="work"><div class="wrap rv"><div class="eyebrow">Selected work</div><h2>Recent work.</h2><p class="sub">A look at what we have made for businesses like yours.</p>
<div class="work">${S.work.map((w,i)=>`<figure class="cl" style="--d:${i*90}ms"><div class="ph t${w.k%4}" ${w.url?'':`role="img" aria-label="${esc(w.t)} placeholder"`}>${mediaEl(w)}</div>${w.mt==='video'?'<button class="snd" data-act="snd" aria-label="Toggle sound" aria-pressed="false"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M3 9v6h4l5 4V5L7 9H3z"/><path class="wv" d="M15.5 9a4 4 0 010 6" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round"/></svg></button>':''}<figcaption>${esc(w.t)}<small>${esc(w.c)}</small></figcaption></figure>`).join('')||'<p class="empty">Projects coming soon.</p>'}</div></div></section>`:''}
<section id="contact"><div class="wrap contact rv"><div><div class="eyebrow">Contact</div><h2>Let’s make something people notice.</h2><p class="sub">Tell us about your business. We reply within one working day.</p><div class="row" style="margin-top:8px">${S.wa?`<a class="btn ghost" href="${esc(waLink())}" target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a>`:''}<a class="btn ghost" href="mailto:${esc(S.email)}">Email us</a></div></div>
<form class="f" data-form="inquiry" novalidate><input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
<div class="fld"><label for="n">Name</label><input id="n" name="name" autocomplete="name" required><div class="err" data-e="name"></div></div>
<div class="fld"><label for="e">Email</label><input id="e" name="email" type="email" autocomplete="email" inputmode="email" required><div class="err" data-e="email"></div></div>
<div class="fld"><label for="s">Service</label><select id="s" name="service"><option>Not sure yet</option>${S.services.map(s=>`<option>${esc(s.t)}</option>`).join('')}</select></div>
<div class="fld"><label for="m">Project details</label><textarea id="m" name="msg" required></textarea><div class="err" data-e="msg"></div></div>
<button class="btn" type="submit">Send enquiry</button><div class="ok" role="status" id="okmsg"></div></form></div></section>
</main>
<footer><div class="wrap"><span>© 2026 AdWorth. All rights reserved.</span><nav class="soc" aria-label="Social media">${PLAT.filter(p=>S.soc&&S.soc[p]).map(p=>`<a href="${esc(S.soc[p])}" target="_blank" rel="noopener noreferrer">${PL[p]}</a>`).join('')}</nav></div><div class="big" aria-hidden="true">AdWorth</div></footer>
<nav class="dock" aria-label="Sections"><a href="#services">Services</a>${S.work.length?'<a href="#work">Work</a>':''}<a href="#contact">Contact</a></nav>
${S.wa?`<a class="wafab" href="${esc(waLink())}" target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">${WAI}<span>WhatsApp</span></a>`:''}`}



function render(){$('#app').innerHTML=site();bind()}
document.addEventListener('submit',async e=>{const f=e.target;if(f.dataset.form!=='inquiry')return;e.preventDefault();const d=Object.fromEntries(new FormData(f)),v={};
if(!d.name.trim())v.name='Please enter your name.';if(!mail.test(d.email))v.email='Enter a valid email address.';if(!d.msg.trim())v.msg='Tell us a little about your project.';if(!errs(f,v))return;
const out=$('#okmsg'),btn=f.querySelector('button[type=submit]');if(d.website){out.textContent='Thank you.';return}btn.disabled=true;
const err=live?await sendEnq({name:d.name.trim(),email:d.email.trim(),service:d.service,message:d.msg.trim()}):'not connected';btn.disabled=false;
if(err){out.className='err';out.textContent='Sorry, that did not send. Please try again or message us on WhatsApp.';return}
out.className='ok';out.innerHTML='Thank you — we will be in touch within one working day.'+(S.wa?' <a href="'+esc(waLink(S.wam+'\n\nName: '+d.name+'\nService: '+d.service+'\n'+d.msg))+'" target="_blank" rel="noopener noreferrer">Send it on WhatsApp too</a>':'');f.reset()});
document.addEventListener('click',e=>{const b=e.target.closest('[data-act="snd"]');if(!b)return;const v=b.closest('figure').querySelector('video');if(v){v.muted=!v.muted;b.classList.toggle('on',!v.muted);b.setAttribute('aria-pressed',String(!v.muted))}});
loadPublic().catch(()=>{}).finally(render);
document.addEventListener('click',e=>{const g=e.target.closest('[data-go]');if(!g)return;const st=$('#services'),n=S.services.length;scrollTo({top:st.getBoundingClientRect().top+scrollY+(+g.dataset.go+.5)/n*(st.offsetHeight-innerHeight),behavior:'smooth'})});
