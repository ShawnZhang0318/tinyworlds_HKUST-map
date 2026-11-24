import fs from 'node:fs';
import { DuckDBInstance } from '@duckdb/node-api';
const db = await DuckDBInstance.create(':memory:');
const c = await db.connect();
await c.run('LOAD spatial;');
const rows = (await c.runAndReadAll(`SELECT id,names."primary",height,num_floors,class,
 ST_X(ST_PointOnSurface(geometry)),ST_Y(ST_PointOnSurface(geometry)),ST_Area(geometry)
 FROM 'data/tinyhkust/raw/building.parquet' WHERE names."primary" IS NOT NULL ORDER BY ST_Area(geometry) DESC`)).getRows();
const data=rows.map(([id,name,height,floors,cls,lon,lat,area])=>({id,name,height,floors,cls,lon,lat,area}));
fs.writeFileSync('data/tinyhkust/building-summary.json',JSON.stringify(data,null,2));
console.log(`${data.length} named building records inspected; saved data/tinyhkust/building-summary.json`);
c.closeSync();
