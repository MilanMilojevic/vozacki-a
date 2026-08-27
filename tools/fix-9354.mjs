import fs from 'node:fs';
let s = fs.readFileSync('build-explanations.mjs', 'utf8');
const anchor = 'X[9354] = ';
const i = s.indexOf(anchor);
if (i < 0 || s.indexOf(anchor, i + 1) >= 0) { console.log('FAIL anchor'); process.exit(1); }
const end = s.indexOf(';\n', i);
if (end < 0) { console.log('FAIL end'); process.exit(1); }
const txt = 'Zeleno svetlo sa strelicom (direkcioni semafor, ZOBS čl. 138) znači dozvoljen prolaz SAMO u smeru strelice (čl. 142 t. 3), inače važi kao obično zeleno. Mamac o "povećanoj opreznosti" je značenje trepćućeg ŽUTOG (čl. 142 t. 5), a mamac o propuštanju meša dva pravila: obavezu uz DODATNU zelenu strelicu (uslovni znak, čl. 143 — propuštaš vozila na putu na koji ulaziš i pešake, dok gori crveno ili žuto) i propuštanje vozila iz suprotnog smera pri skretanju ulevo (čl. 47) — nijedno nije značenje ovog znaka.';
s = s.slice(0, i) + 'X[9354] = { x: ' + JSON.stringify(txt) + ' }' + s.slice(end);
fs.writeFileSync('build-explanations.mjs', s);
console.log('9354 dopunjen');
