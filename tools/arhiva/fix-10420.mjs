import fs from 'node:fs';
let s = fs.readFileSync('build-explanations.mjs', 'utf8');
const anchor = 'X[10420] = ';
const i = s.indexOf(anchor);
if (i < 0 || s.indexOf(anchor, i + 1) >= 0) { console.log('FAIL anchor'); process.exit(1); }
const end = s.indexOf(';\n', i);
if (end < 0) { console.log('FAIL end'); process.exit(1); }
const txt = 'Znaci policijskog službenika daju se: RUKAMA i položajem tela, UREĐAJIMA za svetlosne i zvučne znakove i "stop tablicom" (Pravilnik o znacima policijskih službenika čl. 1; ZOBS čl. 166). Zamke: usmeno se po ZOBS čl. 166 daju naredbe, zastavice koriste RADNICI na radovima na putu, a znakovi sa izmenjivim sadržajem poruka su saobraćajna signalizacija, ne znaci policijskog službenika.';
s = s.slice(0, i) + 'X[10420] = { x: ' + JSON.stringify(txt) + ' }' + s.slice(end);
fs.writeFileSync('build-explanations.mjs', s);
console.log('10420 dopunjen');
