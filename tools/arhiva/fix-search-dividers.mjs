import fs from 'node:fs';
let a = fs.readFileSync('../../app.js', 'utf8');
const o = `      list.querySelectorAll('.qRow').forEach((row) => {
        row.style.display = !v || row._search.includes(v) ? '' : 'none';
      });`;
const n = `      list.querySelectorAll('.qRow').forEach((row) => {
        row.style.display = !v || row._search.includes(v) ? '' : 'none';
      });
      // dok traje pretraga, naslovi oblasti se sklanjaju (rezultati su izmešani)
      list.querySelectorAll('.qDivider').forEach((d) => { d.style.display = v ? 'none' : ''; });`;
const cnt = a.split(o).length - 1;
if (cnt !== 1) { console.log('FAIL count=' + cnt); process.exit(1); }
fs.writeFileSync('../../app.js', a.split(o).join(n));
console.log('razdelnici se kriju pri pretrazi');
