// Podigni verziju aplikacije: version.js + ?v= markice u index.html (pozvati posle svake
// izmene bilo kog fajla koji index.html učitava sa ?v=).
//
// REDOSLED NIJE SLUČAJAN: version.js se upisuje POSLEDNJI. Ranije je išao prvi, pa bi pad
// provere markica ostavio podignut version.js uz stari index.html — a to je stanje u kome
// service worker traži fajlove sa brojem koji u index.html nigde ne stoji.
import fs from 'node:fs';
const vjs = fs.readFileSync('../version.js', 'utf8');
const m = vjs.match(/APP_V = (\d+)/);
if (!m) { console.log('FAIL: version.js bez broja'); process.exit(1); }
const oldV = +m[1], newV = oldV + 1;
let h = fs.readFileSync('../index.html', 'utf8');
const cnt = h.split('?v=' + oldV).length - 1;
if (cnt !== 5) { console.log('FAIL: očekivano 5 markica ?v=' + oldV + ', nađeno ' + cnt); process.exit(1); }
h = h.split('?v=' + oldV).join('?v=' + newV);
fs.writeFileSync('../index.html', h);
fs.writeFileSync('../version.js', 'self.APP_V = ' + newV + ';\n');
console.log('verzija ' + oldV + ' → ' + newV);
