// Mali lokalni сервер за развој — покрени са:  node serve.mjs   па отвори http://localhost:8137
//
// Намерно слуша САМО на localhost-у: апликација и подаци не смеју бити доступни
// другима на мрежи (кафићи, отворени Wi-Fi, гостујући уређаји).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const HOST = '127.0.0.1';
const PORT = Number(process.env.PORT) || 8137;

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

http.createServer((req, res) => {
  // Свака грешка у обради захтева враћа одговор — сервер не сме да падне због једног лошег URL-а.
  try {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('405');
      return;
    }

    let p;
    try {
      p = decodeURIComponent(req.url.split('?')[0]);
    } catch {
      // неисправан проценат-запис (нпр. /%ZZ) — не сме да сруши сервер
      res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('400');
      return;
    }
    if (p === '/') p = '/index.html';

    const f = path.normalize(path.join(root, p));
    // Поређење са завршним раздвојником: без тога би и суседни фолдер чије име
    // почиње исто (нпр. "vozacki-a-backup") прошао проверу.
    const rootWithSep = root.endsWith(path.sep) ? root : root + path.sep;
    if (f !== root && !f.startsWith(rootWithSep)) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('403');
      return;
    }

    let st;
    try {
      st = fs.statSync(f);
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404');
      return;
    }
    if (!st.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404');
      return;
    }

    res.writeHead(200, {
      'Content-Type': mime[path.extname(f).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    });
    if (req.method === 'HEAD') { res.end(); return; }

    const stream = fs.createReadStream(f);
    stream.on('error', () => { res.destroy(); });
    stream.pipe(res);
  } catch {
    try { res.writeHead(500); res.end('500'); } catch { /* одговор је већ послат */ }
  }
}).listen(PORT, HOST, () => console.log(`Vozački A → http://localhost:${PORT}`));
