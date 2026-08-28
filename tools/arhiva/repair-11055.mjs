import fs from 'node:fs';
let s = fs.readFileSync('build-explanations.mjs', 'utf8');
let fails = 0;
function rep(o, n, label) {
  const c = s.split(o).length - 1;
  if (c !== 1) { console.log('FAIL [' + label + '] count=' + c); fails++; return; }
  s = s.split(o).join(n); console.log('ok  [' + label + ']');
}
const tail = "zabrana je položena crta. Crta pokazuje smer u kome je prolaz dozvoljen, a ne pravac pružanja šina.' };";
// 1) ukloni siroče (rep presečene linije koji stoji iza batch16 bloka)
rep('\n\n' + tail, '', 'orphan-removed');
// 2) vrati celu X[11055] liniju (glava je presečena posle "čl. 147); ")
rep("(ZOBS čl. 147); \n// --- Oznake na kolovozu",
    "(ZOBS čl. 147); " + tail + "\n\n// --- Oznake na kolovozu", 'head-restored');
if (fails) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync('build-explanations.mjs', s);
console.log('X[11055] popravljen');
