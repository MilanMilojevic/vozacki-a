import fs from 'node:fs';
let a = fs.readFileSync('../../app.js', 'utf8');
let h = fs.readFileSync('../../index.html', 'utf8');
let v = fs.readFileSync('../../version.js', 'utf8');
let b = fs.readFileSync('../bump-version.mjs', 'utf8');
let s = fs.readFileSync('../../serve.mjs', 'utf8');
let fails = 0;
function rep(src, o, n, label) {
  const cnt = src.split(o).length - 1;
  if (cnt !== 1) { console.log('FAIL [' + label + '] count=' + cnt); fails++; return src; }
  console.log('ok  [' + label + ']');
  return src.split(o).join(n);
}

// version.js: self umesto window (isti efekat u stranici, a radi i u service worker-u)
v = v.replace(/^window\.APP_V/, 'self.APP_V');
if (!v.startsWith('self.APP_V')) { console.log('FAIL version'); fails++; }
else console.log('ok  [version self]');

// bump-version: piše novi format
b = rep(b, "window.APP_V = ", "self.APP_V = ", 'bump-template');

// serve.mjs: mime za manifest
s = rep(s, "  '.ico': 'image/x-icon',", "  '.ico': 'image/x-icon',\n  '.webmanifest': 'application/manifest+json; charset=utf-8',", 'mime');

// index.html: manifest + boja teme + ikona za iOS
h = rep(h, '<link rel="stylesheet" href="style.css?v=48">',
`<link rel="stylesheet" href="style.css?v=48">
  <link rel="manifest" href="manifest.webmanifest">
  <meta name="theme-color" content="#2c6aa0">
  <link rel="apple-touch-icon" href="icon-192.png">`, 'html-head');

// app.js: registracija service worker-a (samo preko http/https, nikad na file://)
a = rep(a, `  setInterval(checkVersion, 5 * 60 * 1000);`,
`  setInterval(checkVersion, 5 * 60 * 1000);

  // ---------- Instalacija kao aplikacija (PWA) ----------
  // Service worker daje rad bez interneta i mogućnost "Dodaj na početni ekran".
  // updateViaCache: 'none' — worker i version.js se uvek proveravaju sveži, da
  // ažuriranja nikad ne zaglave u kešu.
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }).catch(() => { /* nije presudno */ });
  }`, 'sw-register');

if (fails) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync('../../app.js', a);
fs.writeFileSync('../../index.html', h);
fs.writeFileSync('../../version.js', v);
fs.writeFileSync('../bump-version.mjs', b);
fs.writeFileSync('../../serve.mjs', s);
console.log('pwa osnova ugrađena');
