import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const TYPES = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.json':'application/json; charset=utf-8', '.md':'text/plain; charset=utf-8', '.txt':'text/plain; charset=utf-8', '.webp':'image/webp', '.png':'image/png', '.jpg':'image/jpeg', '.bin':'application/octet-stream' };

export async function startServer({port=5180,host='127.0.0.1',root=path.join(projectRoot,'web')}={}) {
  const resolvedRoot=await fs.realpath(root);
  const server=http.createServer(async (req,res)=>{
    if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'});return res.end();}
    let pathname;
    try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);return res.end('Bad request');}
    const file=path.resolve(resolvedRoot,'.'+(pathname==='/'?'/index.html':pathname));
    if(!file.startsWith(resolvedRoot+path.sep)||pathname.includes('\0')){res.writeHead(403);return res.end('Forbidden');}
    try{
      const actual=await fs.realpath(file);
      if(!actual.startsWith(resolvedRoot+path.sep)){res.writeHead(403);return res.end('Forbidden');}
      const stat=await fs.stat(actual);if(!stat.isFile()){res.writeHead(404);return res.end('Not found');}
      res.writeHead(200,{'Content-Type':TYPES[path.extname(actual)]??'application/octet-stream','Content-Length':stat.size,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
      if(req.method==='HEAD')return res.end();
      res.end(await fs.readFile(actual));
    }catch(error){if(!res.headersSent)res.writeHead(error.code==='ENOENT'||error.code==='ENOTDIR'?404:500);res.end('Not found');}
  });
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,host,resolve);});
  return server;
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const value=(flag)=>{const index=process.argv.indexOf(flag);return index<0?undefined:process.argv[index+1];};
  const port=Number(value('--port')??process.env.PORT??5180),host=value('--host')??'127.0.0.1';
  if(!Number.isInteger(port)||port<0||port>65535)throw new Error('Port must be an integer between 0 and 65535.');
  const server=await startServer({port,host});
  console.log(`HKUST map: http://${host}:${server.address().port}/`);
  for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close());
}
