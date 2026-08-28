import fs from 'node:fs';
let a = fs.readFileSync('../app.js', 'utf8');
let fails = 0;
const o = `      const row = document.createElement('button'); row.type = 'button'; row.className = 'catRow catTotal';
      row.innerHTML = \`<span class="catName"><b>\${L('ukupno')}</b></span>
        <span class="catBar"><span class="seen" style="width:\${100 * seenAll / Q.length}%"></span><span class="good" style="width:\${100 * goodAll / Q.length}%"></span></span>
        <span class="catCnt"><b>\${seenAll}/\${Q.length}</b></span>\`;
      row.addEventListener('click', () => browseAll());`;
const n = `      const row = document.createElement('div'); row.className = 'catRow catTotal';
      row.innerHTML = \`<span class="catChevSpacer"></span>
        <button type="button" class="catMain"><span class="catName"><b>\${L('ukupno')}</b></span>
        <span class="catBar"><span class="seen" style="width:\${100 * seenAll / Q.length}%"></span><span class="good" style="width:\${100 * goodAll / Q.length}%"></span></span>
        <span class="catCnt"><b>\${seenAll}/\${Q.length}</b></span></button>\`;
      row.querySelector('.catMain').addEventListener('click', () => browseAll());`;
const cnt = a.split(o).length - 1;
if (cnt !== 1) { console.log('FAIL count=' + cnt); process.exit(1); }
a = a.split(o).join(n);
fs.writeFileSync('../app.js', a);
console.log('red Ukupno poravnat');
