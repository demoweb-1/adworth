// Prepares files in the browser before upload: resized photo + small grid version,
// and a preview still for videos, so pages stay fast and storage stays small.
async function scale(file,max,q,png){const i=await createImageBitmap(file),r=Math.min(1,max/Math.max(i.width,i.height)),c=document.createElement('canvas');c.width=Math.round(i.width*r);c.height=Math.round(i.height*r);const x=c.getContext('2d');if(!png){x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height)}x.drawImage(i,0,0,c.width,c.height);return new Promise((ok,no)=>c.toBlob(b=>b?ok(b):no(new Error('Could not process image')),png?'image/png':'image/jpeg',q))}
function poster(file){return new Promise(ok=>{const v=document.createElement('video'),u=URL.createObjectURL(file);let done=false;const fin=b=>{if(done)return;done=true;URL.revokeObjectURL(u);ok(b)};
v.muted=true;v.playsInline=true;v.preload='metadata';v.src=u;v.onloadeddata=()=>{v.currentTime=Math.min(1,(v.duration||2)/3)};
v.onseeked=()=>{try{const r=Math.min(1,900/Math.max(v.videoWidth,v.videoHeight)),c=document.createElement('canvas');c.width=Math.round(v.videoWidth*r);c.height=Math.round(v.videoHeight*r);c.getContext('2d').drawImage(v,0,0,c.width,c.height);c.toBlob(b=>fin(b),'image/jpeg',.8)}catch(e){fin(null)}};
v.onerror=()=>fin(null);setTimeout(()=>fin(null),8000)})}
export async function prepare(file){
if(file.type.startsWith('video'))return {type:'video',full:file,thumb:await poster(file),size:file.size};
try{const png=file.type==='image/png',full=await scale(file,1800,.86,png),thumb=await scale(file,900,.8,false);return {type:'image',full,thumb,size:full.size}}
catch(e){return {type:'image',full:file,thumb:null,size:file.size}}}
