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

// 1) STR ključevi
a = rep(a, "statExpand: { l: 'Klikni za raspis po podoblastima', c: 'Кликни за распис по подобластима' },",
  "statExpand: { l: 'Klikni za raspis po podoblastima', c: 'Кликни за распис по подобластима' },\n    catExpand: { l: 'Klikni za podoblasti', c: 'Кликни за подобласти' },\n    wholeCat: { l: 'Sva pitanja oblasti', c: 'Сва питања области' },", 'str');

// 2) renderHome: red oblasti otklapa podoblasti
const oldRow = `      const row = document.createElement('button'); row.type = 'button'; row.className = 'catRow';
      row.innerHTML = \`<span class="catName">\${escapeHtml(T(c))}</span>
        <span class="catBar"><span class="seen" style="width:\${100 * seen / qq.length}%"></span><span class="good" style="width:\${100 * good / qq.length}%"></span></span>
        <span class="catCnt">\${seen}/\${qq.length}</span>\`;
      row.addEventListener('click', () => browse('c' + c.id));
      cb.appendChild(row);
    }`;
const newRow = `      const row = document.createElement('button'); row.type = 'button'; row.className = 'catRow';
      row.title = L('catExpand');
      row.innerHTML = \`<span class="catName"><span class="catChev">▸</span>\${escapeHtml(T(c))}</span>
        <span class="catBar"><span class="seen" style="width:\${100 * seen / qq.length}%"></span><span class="good" style="width:\${100 * good / qq.length}%"></span></span>
        <span class="catCnt">\${seen}/\${qq.length}</span>\`;
      row.addEventListener('click', () => {
        const open = row.classList.toggle('open');
        row.querySelector('.catChev').textContent = open ? '▾' : '▸';
        let next = row.nextElementSibling;
        while (next && next.classList.contains('catSubRow')) { const rm = next; next = next.nextElementSibling; rm.remove(); }
        if (!open) return;
        let ref = row;
        const addSub = (labelHtml, key, sSeen, sTot, sGood) => {
          const sr = document.createElement('button'); sr.type = 'button'; sr.className = 'catRow catSubRow';
          sr.innerHTML = \`<span class="catName">\${labelHtml}</span>
            <span class="catBar"><span class="seen" style="width:\${sTot ? 100 * sSeen / sTot : 0}%"></span><span class="good" style="width:\${sTot ? 100 * sGood / sTot : 0}%"></span></span>
            <span class="catCnt">\${sSeen}/\${sTot}</span>\`;
          sr.addEventListener('click', () => browse(key));
          ref.after(sr); ref = sr;
        };
        addSub(\`<b>\${escapeHtml(L('wholeCat'))} ›</b>\`, 'c' + c.id, seen, qq.length, good);
        for (const sid of [...new Set(qq.map((q) => q.sub))]) {
          const sq = qq.filter((q) => q.sub === sid);
          const sSeen = sq.filter((q) => S.q[q.id] && S.q[q.id].a > 0).length;
          const sGood = sq.filter((q) => S.q[q.id] && S.q[q.id].a > 0 && S.q[q.id].streak >= 1).length;
          addSub(escapeHtml(T({ l: D.subs[sid].l, c: D.subs[sid].c })), 's' + sid, sSeen, sq.length, sGood);
        }
      });
      cb.appendChild(row);
    }`;
a = rep(a, oldRow, newRow, 'home-rows');

// 3) CSS
c = rep(c, `.catCnt { flex: 0 0 90px; text-align: right; font-size: .8rem; color: var(--mut); }`,
`.catCnt { flex: 0 0 90px; text-align: right; font-size: .8rem; color: var(--mut); }
.catSubRow { margin: 3px 0 3px 10px; padding-left: 12px; border-left: 3px solid var(--line); }
.catSubRow .catName { font-size: .84rem; color: var(--mut); }
.catSubRow:hover .catName { color: var(--blue); }
.catChev { display: inline-block; width: 15px; color: var(--mut); }`, 'css');

if (fails) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync('../app.js', a);
fs.writeFileSync('../style.css', c);
console.log('home podoblasti primenjeno');
