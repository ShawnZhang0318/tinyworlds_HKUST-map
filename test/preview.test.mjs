import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {startServer} from '../scripts/serve.mjs';
let server,base;
before(async()=>{server=await startServer({port:0});base=`http://127.0.0.1:${server.address().port}`;});
after(async()=>{await new Promise(resolve=>server.close(resolve));});
test('viewer is served with explicit upstream attribution',async()=>{
  const r=await fetch(base+'/');assert.equal(r.status,200);assert.match(r.headers.get('content-type'),/text\/html/);assert.match(await r.text(),/https:\/\/github\.com\/nihey\/tinyworlds/);
});
test('both orientations expose their generated map data',async()=>{
  for(const view of ['','grid/']){const r=await fetch(base+'/data/tinyhkust/'+view+'manifest.json');assert.equal(r.status,200);const m=await r.json();assert.equal(m.name,'tinyhkust');assert.equal(m.levels.length,5);}
});
test('download endpoint serves a real high-resolution PNG',async()=>{
  const r=await fetch(base+'/hkust-campus.png');assert.equal(r.status,200);assert.equal(r.headers.get('content-type'),'image/png');const b=Buffer.from(await r.arrayBuffer());assert.equal(b.readUInt32BE(16),5400);assert.equal(b.readUInt32BE(20),3038);
});
test('preview server rejects traversal outside the public folder',async()=>{
  const r=await fetch(base+'/%2e%2e%2fLICENSE');assert.equal(r.status,403);assert.doesNotMatch(await r.text(),/MIT License/);
});
test('missing assets return an error instead of the app shell',async()=>{
  const r=await fetch(base+'/missing-file.webp');assert.equal(r.status,404);
});
