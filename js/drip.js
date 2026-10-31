// Flat vector liquid drips behind the hero. Pure SVG, merged with a "goo" filter so
// tendrils swell, pinch off and fall like paint. Honors reduced motion.
const NS='http://www.w3.org/2000/svg',R=(a,b)=>a+Math.random()*(b-a),ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
export function initDrip(){
const svg=document.getElementById('drip');if(!svg)return;
const rm=matchMedia('(prefers-reduced-motion:reduce)').matches;
let W=0,H=0,D=[],last=0;
function paint(d){d.rect.setAttribute('height',Math.max(0,d.len));d.dot.setAttribute('cy',d.y);d.dot.setAttribute('r',Math.max(0,d.w*d.k*d.o))}
function build(){W=innerWidth;H=innerHeight;svg.setAttribute('viewBox','0 0 '+W+' '+H);svg.style.height=H+'px';
svg.innerHTML='<defs><filter id="goo" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur in="SourceGraphic" stdDeviation="4" result="b"/><feColorMatrix in="b" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 18 -7"/></filter></defs><g filter="url(#goo)" fill="currentColor"><rect x="-20" y="-40" width="'+(W+40)+'" height="58"/><g id="dg"></g></g>';
const g=svg.querySelector('#dg'),n=Math.max(4,Math.min(12,Math.round(W/140)));D=[];
for(let i=0;i<n;i++){const w=R(10,16),d={x:(i+R(.2,.8))*W/n,w,max:R(.2,.55)*H,dur:R(5,8),t:-R(0,2),ph:'grow',y:10,v:0,len:0,o:1,k:.75,rect:document.createElementNS(NS,'rect'),dot:document.createElementNS(NS,'circle')};
d.rect.setAttribute('width',w);d.rect.setAttribute('x',d.x-w/2);d.rect.setAttribute('y',10);d.rect.setAttribute('rx',w/2);d.dot.setAttribute('cx',d.x);g.append(d.rect,d.dot);
if(rm){d.len=d.max*.35;d.y=10+d.len;d.t=0}paint(d);D.push(d)}}
function step(d,dt){
if(d.ph==='wait'){d.t+=dt;if(d.t>=0){d.ph='grow';d.t=0;d.len=0;d.y=10;d.o=1;d.k=.75;d.dur=R(5,8);d.max=R(.2,.55)*H}return}
if(d.ph==='grow'){d.t+=dt;if(d.t<0)return;const p=Math.min(1,d.t/d.dur);d.len=d.max*ease(p);d.y=10+d.len;d.k=.75+.4*Math.pow(p,8);if(p>=1){d.ph='fall';d.v=0;d.k=.85}return}
d.v+=1300*dt;d.y+=d.v*dt;d.len=Math.max(0,d.len-260*dt);
if(d.y>H*.55)d.o=Math.max(0,1-(d.y-H*.55)/(H*.3));
if(d.o<=0||d.y>H){d.ph='wait';d.t=-R(.5,3.5);d.len=0;d.o=0}}
function frame(ts){requestAnimationFrame(frame);const dt=Math.min(.05,(ts-last)/1000||0);last=ts;if(scrollY>H*1.2)return;for(const d of D){step(d,dt);paint(d)}}
build();if(!rm)requestAnimationFrame(frame);
let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{if(innerWidth!==W)build()},200)});
}
