// Restore original provider metadata omitted by upstream's compact download, using the same pinned extract.
import fs from 'node:fs';
import { DuckDBInstance } from '@duckdb/node-api';
const source=JSON.parse(fs.readFileSync('../../data/sources.json','utf8'));
const [w,s,e,n]=source.bbox,url=source.layers.place.urls[0].replaceAll("'","''");
const db=await DuckDBInstance.create(':memory:'),c=await db.connect();await c.run('LOAD spatial; LOAD httpfs; SET http_timeout=45;');
const file='../../data/raw/place.parquet',temp=file+'.provenance.part';
await c.run(`COPY (SELECT * FROM read_parquet('${url}') WHERE bbox.xmin < ${e} AND bbox.xmax > ${w} AND bbox.ymin < ${n} AND bbox.ymax > ${s} AND confidence >= 0.6) TO '${temp}' (FORMAT parquet, COMPRESSION zstd)`);
const delta=(await c.runAndReadAll(`SELECT count(*) FROM ((SELECT id,ST_AsWKB(geometry) FROM '${file}' EXCEPT SELECT id,ST_AsWKB(geometry) FROM read_parquet('${temp}')) UNION ALL (SELECT id,ST_AsWKB(geometry) FROM read_parquet('${temp}') EXCEPT SELECT id,ST_AsWKB(geometry) FROM '${file}'))`)).getRows()[0][0];
if(Number(delta)!==0)throw new Error('Pinned place extraction geometry differs from the map source.');
const providers=(await c.runAndReadAll(`SELECT DISTINCT to_json(sources) FROM read_parquet('${temp}')`)).getRows().map(r=>JSON.parse(r[0]));
const records=providers.flat();const datasets=[...new Set(records.map(r=>r.dataset))].sort();
console.log('Place provider datasets:',JSON.stringify(datasets));console.log('Provider metadata example:',JSON.stringify(records.slice(0,3)));
fs.renameSync(temp,file);
fs.writeFileSync('../../data/place-providers.json',JSON.stringify({release:source.release,datasets,source:'data/raw/place.parquet sources column'},null,2)+'\n');
c.closeSync();
