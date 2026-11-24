import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { makeProjection } from './dist/projection.js';
for (const view of ['north','grid']) {
  const root=path.resolve('../../web/data/tinyhkust',view==='grid'?'grid':'');
  const m=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
  const b=m.bounds,[lon,lat]=makeProjection(m.geo).toLonLat((b.minX+b.maxX)/2,(b.minY+b.maxY)/2);
  const out=path.resolve('../../web',view==='grid'?'hkust-campus-isometric.png':'hkust-campus.png');
  const args=['--max-old-space-size=8192','dist/cli.js','--city','tinyhkust'];
  if(view==='grid')args.push('--view','grid');
  args.push('preview','--at',`${lon},${lat}`,'--size',`${b.maxX-b.minX},${b.maxY-b.minY}`,'--out',out);
  const r=spawnSync(process.execPath,args,{stdio:'inherit'});if(r.status!==0)process.exit(r.status??1);
}
