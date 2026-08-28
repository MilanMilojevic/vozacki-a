import fs from 'node:fs';
let a = fs.readFileSync('../app.js', 'utf8');
let c = fs.readFileSync('../style.css', 'utf8');
let h = fs.readFileSync('../index.html', 'utf8');
let fails = 0;
function rep(src, o, n, label) {
  const cnt = src.split(o).length - 1;
  if (cnt !== 1) { console.log('FAIL [' + label + '] count=' + cnt); fails++; return src; }
  console.log('ok  [' + label + ']');
  return src.split(o).join(n);
}

// 1) vidljiv izveštaj o grešci — nikad više nema prazna stranica
a = rep(a, `(function () {
  'use strict';`,
`(function () {
  'use strict';

  // Svaka neuhvaćena greška se prikazuje u crvenoj traci na vrhu — umesto neme prazne stranice.
  window.addEventListener('error', (e) => {
    try {
      let b = document.getElementById('errStrip');
      if (!b) {
        b = document.createElement('div');
        b.id = 'errStrip';
        b.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9999;background:#b91c1c;color:#fff;padding:8px 14px;font:13px monospace;white-space:pre-wrap';
        document.documentElement.appendChild(b);
      }
      b.textContent = 'Greška: ' + (e.message || e.type) + (e.filename ? '  @ ' + e.filename.split('/').pop() + ':' + e.lineno : '');
    } catch (ignore) { /* ništa */ }
  });`, 'err-strip');

// 2) tura ne sme da guta klikove: dim propušta klikove, napuštanje stranice je gasi
a = rep(a, "    dim.addEventListener('click', next);\n    document.addEventListener('keydown', onKey);",
"    window.addEventListener('hashchange', end, { once: true });\n    document.addEventListener('keydown', onKey);", 'tour-dim');
c = rep(c, '#tourDim { position: fixed; inset: 0; background: rgba(0,0,0,.55); z-index: 999; cursor: pointer; }',
'#tourDim { position: fixed; inset: 0; background: rgba(0,0,0,.55); z-index: 999; pointer-events: none; }', 'tour-css');

// 3) boot: ako ruta pukne, ISCRTAJ početnu (ne samo promeni hash)
a = rep(a, 'try { routeTo(curHash); } catch (err) { goHomeReplace(); }',
'try { routeTo(curHash); } catch (err) { try { goHomeReplace(); renderHome(); } catch (e2) { /* errStrip će prikazati */ } }', 'boot-catch');

// 4) keš-markice na skriptama i stilu (protiv mešanja starih i novih verzija)
h = rep(h, '<link rel="stylesheet" href="style.css">', '<link rel="stylesheet" href="style.css?v=17">', 'v-css');
h = rep(h, '<script src="data.js"></script>', '<script src="data.js?v=17"></script>', 'v-data');
h = rep(h, '<script src="explanations.js"></script>', '<script src="explanations.js?v=17"></script>', 'v-expl');
h = rep(h, '<script src="app.js"></script>', '<script src="app.js?v=17"></script>', 'v-app');

if (fails) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync('../app.js', a);
fs.writeFileSync('../style.css', c);
fs.writeFileSync('../index.html', h);
console.log('robusnost primenjena');
