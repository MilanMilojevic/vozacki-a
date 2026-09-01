import fs from 'node:fs';
const SCRATCH = 'C:/Users/milan/AppData/Local/Temp/claude/C--Users-milan-Desktop-zborapp/8990dfb3-e1f0-4953-85bf-4d493f56dfe2/scratchpad';
const nacrti = JSON.parse(fs.readFileSync(SCRATCH + '/tura56-nacrti.json', 'utf8'));
let s = fs.readFileSync('../build-explanations.mjs', 'utf8');
let fails = 0;

for (const n of nacrti) {
  if (n.html.includes('`') || n.html.includes('${')) { console.log('FAIL: opasan znak u ' + n.key); process.exit(1); }
  if (/[А-Яа-яЁёЂђЉљЊњЋћЏџ]/.test(n.html)) { console.log('FAIL: ćirilica u ' + n.key); process.exit(1); }
  n.html = n.html.replace(/<!--\s*SVG:[\s\S]*?-->\s*/g, '');
}
console.log('ok  [provere sadržaja]');

function dopuni(key, html, label) {
  const poc = s.indexOf("CARDS['" + key + "']");
  if (poc < 0) { console.log('FAIL [' + label + '] nema kartice'); fails++; return; }
  const htmlPoc = s.indexOf('html: `', poc);
  const kraj = s.indexOf('`,', htmlPoc + 7);
  if (htmlPoc < 0 || kraj < 0) { console.log('FAIL [' + label + '] nema granica'); fails++; return; }
  s = s.slice(0, kraj) + '\n' + html + '\n' + s.slice(kraj);
  console.log('ok  [' + label + ']');
}
for (const n of nacrti) dopuni(n.key, n.html, 'dopuna-' + n.key);

// premapiranja iz plana: 94 na slicni-pojmovi, 115 ostaje put-pojmovi, 139 na pokazivace
function rep(o, n, label) {
  const cnt = s.split(o).length - 1;
  if (cnt !== 1) { console.log('FAIL [' + label + '] count=' + cnt); fails++; return; }
  s = s.split(o).join(n);
  console.log('ok  [' + label + ']');
}
rep("BYSUB[161] = 'oznake-kolovoz';",
`BYSUB[94] = 'slicni-pojmovi';         // opšti pojmovnik (vozač, pešak, kolona, mase...)
BYSUB[139] = 'pokazivaci';            // zvučni i svetlosni znak upozorenja
BYSUB[161] = 'oznake-kolovoz';`, 'mapiranja');

if (fails) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync('../build-explanations.mjs', s);
console.log('ture 5 i 6 integrisane');
