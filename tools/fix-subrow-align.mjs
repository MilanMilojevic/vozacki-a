import fs from 'node:fs';
let a = fs.readFileSync('../app.js', 'utf8');
let c = fs.readFileSync('../style.css', 'utf8');
let fails = 0;
function rep(src, o, n, label) {
  const cnt = src.split(o).length - 1;
  if (cnt !== 1) { console.log('FAIL [' + label + '] count=' + cnt); fails++; return src; }
  console.log('ok  [' + label + ']');
  return src.split(o).join(n);
}

// podred dobija ISTU strukturu kao glavni red (prazno mesto tamo gde je strelica + .catMain)
a = rep(a, `        const addSub = (labelHtml, key, sSeen, sTot, sGood, title) => {
          const sr = document.createElement('button'); sr.type = 'button';
          sr.className = 'catRow catSubRow' + (sTot === null ? ' catAllRow' : (zi++ % 2 ? ' zebra' : ''));
          if (title) sr.title = title;
          sr.innerHTML = sTot === null
            ? \`<span class="catName">\${labelHtml}</span>\`
            : \`<span class="catName">\${labelHtml}</span>
            <span class="catBar"><span class="seen" style="width:\${sTot ? 100 * sSeen / sTot : 0}%"></span><span class="good" style="width:\${sTot ? 100 * sGood / sTot : 0}%"></span></span>
            <span class="catCnt">\${sSeen}/\${sTot}</span>\`;
          sr.addEventListener('click', () => browse(key));
          ref.after(sr); ref = sr;
        };`,
`        const addSub = (labelHtml, key, sSeen, sTot, sGood, title) => {
          const sr = document.createElement('div');
          sr.className = 'catRow catSubRow' + (zi++ % 2 ? ' zebra' : '');
          if (title) sr.title = title;
          sr.innerHTML = \`<span class="catChevSpacer"></span>
            <button type="button" class="catMain"><span class="catName">\${labelHtml}</span>
            <span class="catBar"><span class="seen" style="width:\${sTot ? 100 * sSeen / sTot : 0}%"></span><span class="good" style="width:\${sTot ? 100 * sGood / sTot : 0}%"></span></span>
            <span class="catCnt">\${sSeen}/\${sTot}</span></button>\`;
          sr.querySelector('.catMain').addEventListener('click', () => browse(key));
          ref.after(sr); ref = sr;
        };`, 'addSub');

// strelica i prazno mesto imaju istu širinu → kolone se poklapaju
c = rep(c, `.catChevBtn { background: none; border: none; color: var(--mut); font-size: .8rem; padding: 4px 6px; border-radius: 6px; cursor: pointer; line-height: 1; }`,
`.catChevBtn, .catChevSpacer { flex: 0 0 22px; width: 22px; box-sizing: border-box; }
.catChevBtn { background: none; border: none; color: var(--mut); font-size: .8rem; padding: 4px 3px; border-radius: 6px; cursor: pointer; line-height: 1; text-align: center; }`, 'css-width');

if (fails) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync('../app.js', a);
fs.writeFileSync('../style.css', c);
console.log('podredovi poravnati sa glavnim redovima');
