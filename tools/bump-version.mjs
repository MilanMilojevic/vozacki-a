// Podigni verziju aplikacije: version.js + ?v= markice u index.html (pozvati posle svake izmene fajlova)
import fs from 'node:fs';
const vjs = fs.readFileSync('../version.js', 'utf8');
const m = vjs.match(/APP_V = (\d+)/);
if (!m) { console.log('FAIL: version.js bez broja'); process.exit(1); }
const oldV = +m[1], newV = oldV + 1;
fs.writeFileSync('../version.js', 'window.APP_V = ' + newV + ';\n');
let h = fs.readFileSync('../index.html', 'utf8');
const cnt = h.split('?v=' + oldV).length - 1;
if (cnt !== 5) { console.log('FAIL: očekivano 5 markica ?v=' + oldV + ', nađeno ' + cnt); process.exit(1); }
h = h.split('?v=' + oldV).join('?v=' + newV);
fs.writeFileSync('../index.html', h);
console.log('verzija ' + oldV + ' → ' + newV);
