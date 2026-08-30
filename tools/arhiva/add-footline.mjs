import fs from 'node:fs';
let a = fs.readFileSync('../../app.js', 'utf8');
const o = `        <input type="file" id="fileImport" accept=".json" style="display:none">
      </div>\`;`;
const n = `        <input type="file" id="fileImport" accept=".json" style="display:none">
      </div>
      <div class="mut" style="margin-top:10px;font-size:.82rem">\${L('bazaProverena')} ·
        <a href="https://github.com/MilanMilojevic/vozacki-a/issues" target="_blank" rel="noopener">\${L('feedback')}</a></div>\`;`;
const cnt = a.split(o).length - 1;
if (cnt !== 1) { console.log('FAIL count=' + cnt); process.exit(1); }
fs.writeFileSync('../../app.js', a.split(o).join(n));
console.log('linija sa bazom i prijavom dodata');
