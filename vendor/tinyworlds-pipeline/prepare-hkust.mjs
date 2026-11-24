import fs from 'node:fs';
import { DuckDBInstance } from '@duckdb/node-api';
const db=await DuckDBInstance.create(':memory:'); const c=await db.connect(); await c.run('LOAD spatial;');
const area=(await c.runAndReadAll(`SELECT ST_AsGeoJSON(geometry) FROM 'data/tinyhkust/raw/land_use.parquet' WHERE class='university' AND names."primary" LIKE '%Hong Kong University of Science%'`)).getRows();
if(area.length!==1)throw new Error('Expected one mapped campus boundary');
const boundary={type:'FeatureCollection',features:[{type:'Feature',properties:{name:'HKUST Clear Water Bay campus',source:'Overture Maps / OpenStreetMap'},geometry:JSON.parse(area[0][0])}]};
fs.writeFileSync('data/tinyhkust/raw/campus-boundary.geojson',JSON.stringify(boundary));
const names=['學術大樓 Academic Building','逸夫演藝中心 Shaw Auditorium','李兆基商學大樓 Lee Shau Kee Business Building','鄭裕彤樓 Cheng Yu Tung Building','盧家驄大學中心 Lo Ka Chung University Center','海岸海洋實驗室 Coastal Marine Laboratory','賽馬會集賢樓 The Jockey Club Global Graduate Tower','圖書館新翼 Library Extension'];
const buildings=JSON.parse(fs.readFileSync('data/tinyhkust/building-summary.json','utf8'));
const places=names.map((n,i)=>{const b=buildings.find(b=>b.name===n);if(!b)throw new Error('Missing campus building: '+n);return {n,t:'landmark',lon:b.lon,lat:b.lat,b:'香港科技大學 · 清水湾',r:95-i,s:1,sight:true,reference:{url:'https://publish.ust.hk/univ/maps/campus_map_color.pdf',en:`This building is part of the Clear Water Bay campus of the Hong Kong University of Science and Technology. Its map position is ${b.lat.toFixed(5)} degrees north and ${b.lon.toFixed(5)} degrees east.`,pt:`Este edifício integra o campus de Clear Water Bay da Universidade de Ciência e Tecnologia de Hong Kong. A posição no mapa é ${b.lat.toFixed(5)} graus norte e ${b.lon.toFixed(5)} graus este.`,es:`Este edificio forma parte del campus de Clear Water Bay de la Universidad de Ciencia y Tecnología de Hong Kong. Su posición en el mapa es ${b.lat.toFixed(5)} grados norte y ${b.lon.toFixed(5)} grados este.`}}});
const infra=(await c.runAndReadAll(`SELECT names."primary",class,subtype,ST_AsGeoJSON(geometry) FROM 'data/tinyhkust/raw/infrastructure.parquet' WHERE names."primary" IS NOT NULL`)).getRows();
const redBird=infra.find(p=>p[0]==='火鳥 Red Bird');
if(redBird){const [lon,lat]=JSON.parse(redBird[3]).coordinates;places.unshift({n:redBird[0],t:'landmark',lon,lat,b:'科大廣場 · 清水湾',r:110,s:2,sight:true,reference:{url:'https://publish.ust.hk/univ/maps/campus_map_color.pdf',en:'A red sculpture at the campus piazza, west of the Academic Building. The map represents its silhouette schematically.',pt:'Uma escultura vermelha na praça do campus, a oeste do edifício académico. A silhueta é representada de forma esquemática.',es:'Una escultura roja en la plaza del campus, al oeste del edificio académico. La silueta se representa de forma esquemática.'}});}
fs.writeFileSync('src/cities/tinyhkust.places.ts','import type { Curated } from "./types.js";\nexport const CURATED: Curated[] = '+JSON.stringify(places,null,2)+';\n');
console.log(`Mapped campus boundary and ${places.length} curated locations prepared.`);
const poi=(await c.runAndReadAll(`SELECT names."primary",ST_X(geometry),ST_Y(geometry) FROM 'data/tinyhkust/raw/place.parquet' WHERE names."primary" IS NOT NULL`)).getRows();
fs.writeFileSync('data/tinyhkust/poi-summary.json',JSON.stringify(poi,null,2));
console.log('Landmark POIs:',JSON.stringify(poi.filter(p=>/日晷|sundial|library|圖書|piazza|atrium|sports|center|火鳥/i.test(p[0]))));
const academic=JSON.parse((await c.runAndReadAll(`SELECT ST_AsGeoJSON(geometry) FROM 'data/tinyhkust/raw/building.parquet' WHERE names."primary"='學術大樓 Academic Building'`)).getRows()[0][0]);
const rings=academic.type==='MultiPolygon'?academic.coordinates.flat():academic.coordinates;
const bins=Array(900).fill(0);for(const ring of rings)for(let i=1;i<ring.length;i++){const dx=(ring[i][0]-ring[i-1][0])*.9249,dy=ring[i][1]-ring[i-1][1],length=Math.hypot(dx,dy)*111195;if(length<8)continue;let b=((Math.atan2(dx,dy)*180/Math.PI)%90+90)%90;bins[Math.floor(b*10)]+=length;}
console.log('Main academic footprint axis:',bins.map((v,i)=>({deg:i/10,metres:Math.round(v)})).sort((a,b)=>b.metres-a.metres).slice(0,5));
c.closeSync();
