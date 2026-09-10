// Synthetic service-worker fixture. No user profile or application data is served.
// PORT=18765 node tools/fixtures/sw-server.mjs
import http from 'node:http';
import fs from 'node:fs';
import { createHash } from 'node:crypto';

const original = fs.readFileSync(new URL('../../sw.js', import.meta.url), 'utf8');
const imageOne='synthetic-image-one';
const imageOneHash=createHash('sha256').update(imageOne).digest('hex');
const releases = {public:{v:200,code:200,fail:false,baseline:'ok',image:imageOne},local:{v:200,code:200,fail:false,baseline:'ok',image:imageOne}};
http.createServer(async (req,res) => {
  const url=new URL(req.url,'http://localhost');
  const [,mode,file='']=url.pathname.split('/');
  if(!releases[mode]) {res.writeHead(404);res.end();return;}
  const release=releases[mode];
  if(file==='control' && req.method==='POST') {
    release.v=Number(url.searchParams.get('v'))||200;
    release.code=Number(url.searchParams.get('code'))||release.v;
    release.fail=url.searchParams.get('fail')==='1';
    release.baseline=url.searchParams.get('baseline')||'ok';
    if(url.searchParams.has('image')) release.image=url.searchParams.get('image');
    res.writeHead(200);res.end('ok');return;
  }
  if(req.method!=='GET') {res.writeHead(405);res.end();return;}
  if(release.fail && file==='explanations.js') {res.writeHead(503);res.end('synthetic interrupted release');return;}
  let body='',type='text/javascript';
  if(file==='sw.js') {
    // Execute the public branch in a secure localhost test origin. The production
    // file remains unchanged; no DNS/browser security override is necessary.
    body=mode==='public' ? original.replace(/const RAZVOJ = [^\n]+;/,'const RAZVOJ = false;') : original;
  } else if(file==='version.js') body=`self.APP_V = ${release.v};`;
  else if(file==='image-baseline.js') {
    if(release.baseline==='missing'){res.writeHead(404);res.end();return;}
    body=release.baseline==='malformed'?'self.VA_IMAGE_BASELINE = {"1":"bad"};':`self.VA_IMAGE_BASELINE = {"1":"${imageOneHash}"};`;
  }
  else if(file==='img' && url.pathname.endsWith('/img/1.jpg')) {type='image/jpeg';body=release.image;}
  else if(file==='app.js') body=`document.body.dataset.loaded='${release.code}'; navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'});`;
  else if(['data.js','explanations.js'].includes(file)) body='/* synthetic core */';
  else if(file==='style.css') {type='text/css';body='body{font-family:sans-serif}';}
  else if(file==='manifest.webmanifest') {type='application/manifest+json';body='{"name":"Synthetic SW fixture","start_url":"./"}';}
  else if(/^icon-\d+\.png$/.test(file)) {type='image/png';body='synthetic cache resource';}
  else if(file===''||file==='index.html') {
    type='text/html';body=`<!doctype html><html><head><link rel="stylesheet" href="style.css?v=${release.v}"></head><body>Service worker test`+
      ['version.js','data.js','explanations.js','app.js'].map(f=>`<script src="${f}?v=${release.v}"></script>`).join('')+'</body></html>';
  } else {res.writeHead(404);res.end();return;}
  res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'});res.end(body);
}).listen(Number(process.env.PORT)||18765,'127.0.0.1',()=>console.log('Synthetic SW fixture: http://localhost:'+(Number(process.env.PORT)||18765)));
