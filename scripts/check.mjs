import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const read=(file)=>fs.readFileSync(path.join(root,file));
const json=(file)=>JSON.parse(read(file));
function assert(ok,message){if(!ok)throw new Error(message);}
const source=json('data/sources.json'),upstream=json('UPSTREAM.json');
assert(source.release===upstream.data_release,'Data version and provenance disagree.');
assert(read('LICENSE').toString().includes('Nihey Takizawa'),'Upstream copyright must be retained.');
assert(read('vendor/tinyworlds-pipeline/LICENSE').equals(read('LICENSES/tinyworlds-MIT.txt')),'Upstream license copies differ.');
for(const [file,entry] of Object.entries(json('data/checksums.json').files)){
  const bytes=read('data/raw/'+file),hash=crypto.createHash('sha256').update(bytes).digest('hex');
  assert(bytes.length===entry.bytes&&hash===entry.sha256,`Source snapshot checksum mismatch: ${file}`);
}
for(const view of ['','grid/']){
  const base='web/data/tinyhkust/'+view,m=json(base+'manifest.json'),places=json(base+'places.json').places;
  assert(m.geo.lon0>114&&m.geo.lat0>22,'Manifest is not the HKUST map.');
  assert(places.some(p=>p.n==='火鳥 Red Bird'),'Mapped Red Bird landmark missing.');
  let tiles=0;
  for(const l of m.levels){const bits=Buffer.from(l.tiles,'base64');for(let i=0;i<l.cols*l.rows;i++)if(bits[i>>3]&(1<<(i&7))){assert(fs.existsSync(path.join(root,base,'tiles',String(l.z),`${i%l.cols}_${Math.floor(i/l.cols)}.webp`)),`Missing ${view} tile at level ${l.z}, index ${i}`);tiles++;}}
  assert(fs.existsSync(path.join(root,base,m.overview.src)),'Overview image missing.');
  for(const lang of ['en-US','pt-BR','es-ES','zh-CN'])assert(Object.keys(json(base+`sights.${lang}.json`)).length>0,`Missing ${lang} descriptions`);
  for(const lang of ['en-US','pt-BR','es-ES'])assert(json(base+`quiz.${lang}.json`).questions.length>0,`Missing ${lang} questions`);
  console.log(`${view||'north/'}: ${tiles} tiles, ${places.length} indexed places, all referenced assets present`);
}
for(const [file,w,h] of [['hkust-campus.png',5400,3038],['hkust-campus-isometric.png',5550,3075],['hkust-academic-detail.png',1400,900]]){
  const data=read('web/'+file);assert(data.subarray(1,4).toString()==='PNG'&&data.readUInt32BE(16)===w&&data.readUInt32BE(20)===h,`Invalid PNG export: ${file}`);
}
console.log('Source snapshots, licensing notices, manifests and PNG exports verified.');
