// Preserve tinyworlds' localized sight/quiz contracts for future use of its native viewer.
import fs from 'node:fs';
import path from 'node:path';
process.env.TINY_CITY='tinyhkust';
const {writeQuiz}=await import('./dist/index/write-quiz.js');
const {CURATED}=await import('./dist/cities/tinyhkust.places.js');
const buildings=JSON.parse(fs.readFileSync('data/tinyhkust/building-summary.json','utf8'));
const catalog=JSON.parse(fs.readFileSync('data/tinyhkust/stac-files.json','utf8'));
for(const view of ['north','grid']) {
  const out=path.resolve('../../web/data/tinyhkust',view==='grid'?'grid':'');
  const {sights}=JSON.parse(fs.readFileSync(path.join(out,'sights.json'),'utf8'));
  const texts={'en-US':{},'pt-BR':{},'es-ES':{}},zh={};
  for(const s of sights) {
    const b=buildings.find(b=>b.name===s.n),curated=CURATED.find(p=>p.n===s.n);
    const lat=s.lat.toFixed(5),lon=s.lon.toFixed(5),f=b?.floors;
    const fallback={
      en:`${s.n} is shown on the Clear Water Bay campus map at ${lat} degrees north and ${lon} degrees east. ${f?`The open building record lists ${f} above-ground storeys.`:'The open building record does not specify a height.'} The pixel facade is a procedural interpretation of the mapped footprint.`,
      pt:`${s.n} aparece no mapa do campus de Clear Water Bay a ${lat} graus norte e ${lon} graus este. ${f?`O registo aberto indica ${f} pisos acima do solo.`:'O registo aberto não especifica uma altura.'} A fachada em pixels é uma interpretação do contorno cartografado.`,
      es:`${s.n} aparece en el mapa del campus de Clear Water Bay a ${lat} grados norte y ${lon} grados este. ${f?`El registro abierto indica ${f} plantas sobre el suelo.`:'El registro abierto no especifica una altura.'} La fachada de píxeles es una interpretación del contorno cartografiado.`
    };
    for(const [locale,lang] of [['en-US','en'],['pt-BR','pt'],['es-ES','es']])texts[locale][s.id]={title:s.n,url:curated?.reference?.url??catalog.layers.building.catalog,text:curated?.reference?.[lang]??fallback[lang],lang,reference:true};
    zh[s.id]={title:s.n,text:`${s.n}位于清水湾校园，地图坐标为北纬 ${lat}、东经 ${lon}。${f?`公开建筑记录标注 ${f} 层。`:'公开记录未标注建筑高度。'}像素外观为程序化演绎。`,url:curated?.reference?.url??catalog.layers.building.catalog,reference:true};
  }
  for(const [locale,data] of Object.entries(texts))fs.writeFileSync(path.join(out,`sights.${locale}.json`),JSON.stringify(data));
  fs.writeFileSync(path.join(out,'sights.zh-CN.json'),JSON.stringify(zh));
  await writeQuiz({out,views:Object.fromEntries(sights.map(s=>[s.id,0])),districtAt:()=> 'HKUST · 清水湾',log:m=>console.log(view+': '+m)});
}
