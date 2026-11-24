import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url)),pipe=path.join(root,'vendor/tinyworlds-pipeline');
const raw=path.join(pipe,'data/tinyhkust/raw'),refresh=process.argv.includes('--refresh');
const compiler=path.join(pipe,'node_modules/typescript/bin/tsc');
if(!fs.existsSync(compiler))throw new Error('Install the generator first: npm run pipeline:install');
function runNode(file,args=[],cwd=pipe){const r=spawnSync(process.execPath,[file,...args],{cwd,stdio:'inherit'});if(r.error)throw r.error;if(r.status!==0)throw new Error(`${path.basename(file)} failed (${r.status})`);}
function compile(){runNode(compiler,['--project','tsconfig.json']);}
function cli(args){runNode('dist/cli.js',['--city','tinyhkust',...args]);}
fs.mkdirSync(raw,{recursive:true});
if(refresh){const r=spawnSync(process.env.PYTHON??(process.platform==='win32'?'python':'python3'),['scripts/select-stac.py'],{cwd:root,stdio:'inherit'});if(r.error)throw r.error;if(r.status!==0)throw new Error('STAC selection failed.');}
for(const file of fs.readdirSync(path.join(root,'data/raw')))if(/\.(parquet|geojson)$/.test(file))fs.copyFileSync(path.join(root,'data/raw',file),path.join(raw,file));
fs.copyFileSync(path.join(root,'data/sources.json'),path.join(raw,'../stac-files.json'));
const require=createRequire(path.join(pipe,'package.json'));
const {DuckDBInstance}=require('@duckdb/node-api'),db=await DuckDBInstance.create(':memory:'),conn=await db.connect();
for(const extension of refresh?['spatial','httpfs']:['spatial']){
  try{await conn.run(`LOAD ${extension}`);}catch{console.log(`Installing DuckDB ${extension} extension for this platform…`);await conn.run(`INSTALL ${extension}; LOAD ${extension};`);}
}
const providerRows=(await conn.runAndReadAll(`SELECT DISTINCT to_json(sources) FROM '${path.join(raw,'place.parquet').replaceAll('\\','/').replaceAll("'","''")}'`)).getRows().flatMap(row=>JSON.parse(row[0]));
const byProvider={};for(const entry of providerRows){const key=entry.dataset;(byProvider[key]??=new Set()).add(entry.license);}
fs.writeFileSync(path.join(root,'data/place-providers.json'),JSON.stringify({release:JSON.parse(fs.readFileSync(path.join(root,'data/sources.json'),'utf8')).release,source:'data/raw/place.parquet sources column',by_provider:Object.fromEntries(Object.entries(byProvider).sort().map(([provider,licenses])=>[provider,[...licenses].sort()]))},null,2)+'\n');
conn.closeSync();
compile();if(refresh)cli(['fetch','--force']);
runNode('inspect-hkust.mjs');runNode('prepare-hkust.mjs');compile();
for(const view of ['north','grid']){
  const flags=view==='grid'?['--view','grid']:[],out=view==='grid'?'../../web/data/tinyhkust/grid':'../../web/data/tinyhkust';
  cli([...flags,'scene']);cli([...flags,'render','--out',out,'--workers','4']);cli([...flags,'index','--out',out]);
}
cli(['walk','--out','../../web/data/tinyhkust']);runNode('complete-indexes.mjs');runNode('export-hkust.mjs');
cli(['preview','--at','114.2633,22.3372','--size','1400,900','--out','../../web/hkust-academic-detail.png']);
if(refresh){for(const file of fs.readdirSync(raw))if(/\.(parquet|geojson)$/.test(file))fs.copyFileSync(path.join(raw,file),path.join(root,'data/raw',file));}
fs.copyFileSync(path.join(root,'data/sources.json'),path.join(root,'web/SOURCES.json'));
const files={};for(const file of fs.readdirSync(path.join(root,'data/raw')).sort()){
  const bytes=fs.readFileSync(path.join(root,'data/raw',file));files[file]={bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')};
}
fs.writeFileSync(path.join(root,'data/checksums.json'),JSON.stringify({algorithm:'sha256',files},null,2)+'\n');
runNode(path.join(root,'scripts/check.mjs'),[],root);
console.log('HKUST map regenerated. Start the viewer with npm run dev.');
