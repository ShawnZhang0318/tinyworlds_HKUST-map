const $ = (id) => document.getElementById(id);
const canvas = $('map'), ctx = canvas.getContext('2d', { alpha: false });
const state = { manifest: null, view: 'north', x: 0, y: 0, scale: .3, w: 0, h: 0, labels: true, selected: null, places: [], cache: new Map(), loading: false };
let pending = false, overview = null, drag = null;
const dataRoot = () => `data/tinyhkust/${state.view === 'grid' ? 'grid/' : ''}`;
function requestDraw() { if (!pending) { pending = true; requestAnimationFrame(draw); } }
function project(lon, lat) {
  const g = state.manifest.geo, rad = Math.PI / 180;
  const east = (lon-g.lon0)*rad*6371008.8*Math.cos(g.lat0*rad), north = (lat-g.lat0)*rad*6371008.8;
  const b = g.betaDeg*rad, p = east*Math.sin(b)+north*Math.cos(b), q = east*Math.cos(b)-north*Math.sin(b);
  return [(p+q)*g.k,(q-p)*g.k/2];
}
const screen = (x,y) => [(x-state.x)*state.scale+state.w/2,(y-state.y)*state.scale+state.h/2];
const mapPoint = (x,y) => [(x-state.w/2)/state.scale+state.x,(y-state.h/2)/state.scale+state.y];
function fit() {
  if (!state.manifest) return;
  state.selected=null;$('selection').hidden=true;
  const b=state.manifest.bounds, left = innerWidth>760 && !$('sidebar').hidden ? 340 : 55;
  state.scale = Math.min((state.w-left-150)/(b.maxX-b.minX),(state.h-170)/(b.maxY-b.minY));
  state.scale = Math.max(.045, Math.min(1,state.scale));
  state.x = (b.minX+b.maxX)/2 - left/(2*state.scale); state.y=(b.minY+b.maxY)/2;
  requestDraw();
}
function zoom(factor, x=state.w/2, y=state.h/2) {
  if (!state.manifest) return;
  const before=mapPoint(x,y); state.scale=Math.max(.045,Math.min(4,state.scale*factor));
  const after=mapPoint(x,y); state.x+=before[0]-after[0];state.y+=before[1]-after[1];requestDraw();
}
function imageFor(key,url) {
  let img=state.cache.get(key);
  if (!img) { img=new Image(); img.onload=requestDraw;img.onerror=()=>{img.failed=true;requestDraw()};img.src=url;state.cache.set(key,img); }
  return img;
}
function draw() {
  pending=false; const d=Math.min(devicePixelRatio||1,2);ctx.setTransform(d,0,0,d,0,0);
  ctx.fillStyle='#173d4b';ctx.fillRect(0,0,state.w,state.h);
  const m=state.manifest;if(!m)return;
  const b=m.bounds;ctx.imageSmoothingEnabled=state.scale<.8;
  if(overview?.complete&&overview.naturalWidth) { const [x,y]=screen(b.minX,b.minY);ctx.drawImage(overview,x,y,(b.maxX-b.minX)*state.scale,(b.maxY-b.minY)*state.scale); }
  const z=Math.min(m.levels.length-1,Math.max(0,Math.floor(Math.log2(1/state.scale))));
  const level=m.levels.find(l=>l.z===z)??m.levels[0],unit=m.tileSize*2**level.z;
  const [x0,y0]=mapPoint(0,0),[x1,y1]=mapPoint(state.w,state.h);
  const tx0=Math.max(0,Math.floor((x0-m.origin.x)/unit)),ty0=Math.max(0,Math.floor((y0-m.origin.y)/unit));
  const tx1=Math.min(level.cols-1,Math.floor((x1-m.origin.x)/unit)),ty1=Math.min(level.rows-1,Math.floor((y1-m.origin.y)/unit));
  const bits=level.bits;
  for(let ty=ty0;ty<=ty1;ty++)for(let tx=tx0;tx<=tx1;tx++) {
    const bit=tx+ty*level.cols;if(!(bits[bit>>3]&(1<<(bit&7))))continue;
    const key=`${state.view}/${level.z}/${tx}_${ty}`,img=imageFor(key,`${dataRoot()}tiles/${level.z}/${tx}_${ty}.webp?v=${m.build}`);
    if(img.complete&&img.naturalWidth){const [x,y]=screen(m.origin.x+tx*unit,m.origin.y+ty*unit);ctx.drawImage(img,x,y,unit*state.scale+.25,unit*state.scale+.25);}
  }
  if(state.labels) drawMarkers();
  const len=innerWidth<=760?65:85,metres=len/(state.scale*m.geo.k*Math.SQRT2);
  $('scale-label').textContent=`${Math.round(metres/5)*5} m`;
  $('status').textContent=`${state.view==='north'?'北向全景':'等距视角'} · ${Math.round(state.scale*100)}%`;
}
function drawMarkers() {
  let shown=0;
  for(const p of state.places){
    if(p.t==='street'||p.t==='borough'||p.t==='hood')continue;
    const [x,y]=screen(...project(p.lon,p.lat));if(x<0||y<90||x>state.w||y>state.h-55)continue;
    const selected=state.selected?.key===p.key;
    if(!selected&&shown++>32)continue;
    ctx.beginPath();ctx.arc(x,y,selected?6:3.5,0,Math.PI*2);ctx.fillStyle=selected?'#ffb477':'#f4f4d8';ctx.fill();ctx.strokeStyle='#1f505c';ctx.lineWidth=1.5;ctx.stroke();
    if(selected||(state.scale>.45&&shown<=8&&p.r>=60)){
      const text=p.n.length>30?p.n.slice(0,29)+'…':p.n;ctx.font=`${selected?'600 ':''}12px "Microsoft YaHei",sans-serif`;
      const tw=ctx.measureText(text).width;ctx.fillStyle='rgba(10,37,45,.93)';ctx.fillRect(x-tw/2-8,y-36,tw+16,24);ctx.fillStyle=selected?'#ffbd8c':'#f3f5e5';ctx.fillText(text,x-tw/2,y-20);
    }
  }
}
function showPlace(p) {
  state.selected=p;[state.x,state.y]=project(p.lon,p.lat);state.scale=Math.max(state.scale,1);
  if(innerWidth>760)state.x-=130/state.scale;
  $('selection').hidden=false;$('selection-title').textContent=p.n;
  $('selection-context').textContent=`${p.b||'清水湾校园'} · ${p.lat.toFixed(5)}, ${p.lon.toFixed(5)}`;
  $('osm-link').href=`https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lon}#map=19/${p.lat}/${p.lon}`;
  if(innerWidth<=760){$('sidebar').hidden=true;$('expand').hidden=false;}
  updateList();requestDraw();
}
function updateList() {
  const normalize = (s) => s.toLocaleLowerCase().replaceAll('图','圖').replaceAll('书','書').replaceAll('馆','館').replaceAll('学','學').replaceAll('术','術').replaceAll('艺','藝').replaceAll('郑','鄭').replaceAll('湾','灣').replaceAll('楼','樓').replaceAll('广','廣').replaceAll('场','場').replaceAll('园','園').replaceAll('东','東').replaceAll('龙','龍').replaceAll('红鸟','火鳥').replaceAll('火鸟','火鳥');
  const query=normalize($('search').value.trim());const el=$('places');el.replaceChildren();
  const matches=state.places.filter(p=>normalize(p.n+' '+(p.b??'')).includes(query)&&p.t!=='borough').slice(0,query?100:35);
  if(!matches.length){const p=document.createElement('p');p.className='muted';p.textContent='没有找到这个地点。可以试试英文名称。';el.append(p);return;}
  matches.forEach((p,i)=>{const btn=document.createElement('button');btn.className='place'+(state.selected?.key===p.key?' active':'');
    const pin=document.createElement('span');pin.className='pin';pin.textContent=String(i+1).padStart(2,'0');const copy=document.createElement('span');
    const name=document.createElement('span');name.className='name';const chinese=/[\u3400-\u9fff]/.test(p.n);name.textContent=chinese?p.n.replace(/\s+[A-Za-z].*/,''):p.n;const context=document.createElement('small');context.textContent=chinese?(p.n.match(/[A-Za-z].*/)?.[0]||p.b):p.b||'CLEAR WATER BAY';copy.append(name,context);btn.append(pin,copy);btn.onclick=()=>showPlace(p);el.append(btn);});
}
async function load(view) {
  if(state.loading)return;state.loading=true;const prior=state.manifest?mapPoint(state.w/2,state.h/2):null;
  try {
    const root=`data/tinyhkust/${view==='grid'?'grid/':''}`;
    const [mr,pr]=await Promise.all([fetch(root+'manifest.json'),fetch(root+'places.json')]);
    if(!mr.ok||!pr.ok)throw new Error('地图数据尚未准备好，请稍后刷新。');
    const m=await mr.json(),placesData=await pr.json(),places=Array.isArray(placesData)?placesData:placesData.places;
    for(const l of m.levels)l.bits=Uint8Array.from(atob(l.tiles),c=>c.charCodeAt(0));
    state.manifest=m;state.view=view;state.cache.clear();
    const seen=new Set();state.places=places.filter(p=>p.n&&p.lon&&p.lat).sort((a,b)=>b.r-a.r||a.n.localeCompare(b.n))
      .filter(p=>{if(seen.has(p.n))return false;seen.add(p.n);return true}).map(p=>({...p,key:`${p.n}:${p.lon}:${p.lat}`}));
    overview=new Image();overview.onload=requestDraw;overview.src=root+m.overview.src+'?v='+m.build;
    $('north').classList.toggle('active',view==='north');$('grid').classList.toggle('active',view==='grid');
    document.querySelector('.compass i').style.transform=`rotate(${m.northDeg}deg)`;
    $('sources').textContent=m.attribution.join(' · ');
    updateList();if(state.selected)showPlace(state.selected);else fit();$('error').hidden=true;
  } catch(e){$('error').textContent=e.message;$('error').hidden=false;}finally{state.loading=false;requestDraw();}
}
function resize(){state.w=innerWidth;state.h=innerHeight;const d=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(state.w*d);canvas.height=Math.round(state.h*d);requestDraw();}
window.addEventListener('resize',resize);resize();
canvas.addEventListener('wheel',e=>{e.preventDefault();zoom(Math.exp(-e.deltaY*.0015),e.clientX,e.clientY)},{passive:false});
canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture(e.pointerId);drag={id:e.pointerId,x:e.clientX,y:e.clientY,dx:0,dy:0};canvas.classList.add('dragging')});
canvas.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.dx+=Math.abs(dx);drag.dy+=Math.abs(dy);state.x-=dx/state.scale;state.y-=dy/state.scale;drag.x=e.clientX;drag.y=e.clientY;requestDraw()});
canvas.addEventListener('pointerup',e=>{if(drag&&drag.dx+drag.dy<8&&state.labels){let nearest=null,distance=18;for(const p of state.places){if(['street','borough','hood'].includes(p.t))continue;const [x,y]=screen(...project(p.lon,p.lat)),d=Math.hypot(x-e.clientX,y-e.clientY);if(d<distance){distance=d;nearest=p}}if(nearest)showPlace(nearest);}drag=null;canvas.classList.remove('dragging')});
canvas.addEventListener('pointercancel',()=>{drag=null;canvas.classList.remove('dragging')});
canvas.addEventListener('dblclick',e=>zoom(1.6,e.clientX,e.clientY));
canvas.addEventListener('keydown',e=>{const d=80/state.scale;if(e.key==='ArrowLeft')state.x-=d;else if(e.key==='ArrowRight')state.x+=d;else if(e.key==='ArrowUp')state.y-=d;else if(e.key==='ArrowDown')state.y+=d;else if(e.key==='+'||e.key==='=')zoom(1.4);else if(e.key==='-')zoom(1/1.4);else if(e.key==='Home')fit();else return;e.preventDefault();requestDraw()});
$('plus').onclick=()=>zoom(1.5);$('minus').onclick=()=>zoom(1/1.5);$('fit').onclick=fit;
$('north').onclick=()=>load('north');$('grid').onclick=()=>load('grid');$('search').oninput=updateList;
$('labels').onclick=()=>{state.labels=!state.labels;$('labels').setAttribute('aria-pressed',String(state.labels));requestDraw()};
$('close-selection').onclick=()=>{$('selection').hidden=true;state.selected=null;updateList();requestDraw()};
$('collapse').onclick=()=>{$('sidebar').hidden=true;$('expand').hidden=false;requestDraw()};
$('expand').onclick=()=>{$('sidebar').hidden=false;$('expand').hidden=true;requestDraw()};
if(innerWidth<1100){$('sidebar').hidden=true;$('expand').hidden=false;}
load('north');
