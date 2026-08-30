import fs from 'node:fs';
let a = fs.readFileSync('../../app.js', 'utf8');
let c = fs.readFileSync('../../style.css', 'utf8');
let fails = 0;
function rep(src, o, n, label) {
  const cnt = src.split(o).length - 1;
  if (cnt !== 1) { console.log('FAIL [' + label + '] count=' + cnt); fails++; return src; }
  console.log('ok  [' + label + ']');
  return src.split(o).join(n);
}

// 1) Podoblasti: iz nabacanih "pilula" u uredne poravnate redove (kratko ime + brojevi u kolonama)
a = rep(a, `      for (const sid of subIds) {
        const sq = Q.filter((q) => q.sub === sid);
        const sSeen = sq.filter((q) => S.q[q.id] && S.q[q.id].a > 0).length;
        let sAtt = 0, sWr = 0;
        for (const q of sq) { const r = S.q[q.id]; if (r) { sAtt += r.a; sWr += r.w; } }
        const sAcc = sAtt ? Math.round(100 * (sAtt - sWr) / sAtt) : null;
        const b = document.createElement('button'); b.className = 'subRow';
        b.innerHTML = \`\${escapeHtml(T({ l: D.subs[sid].l, c: D.subs[sid].c }))}
          <span class="mut">&nbsp;\${sSeen}/\${sq.length}\${sAcc !== null ? \` · \${sAcc}%\` : ''}</span>\`;
        b.addEventListener('click', () => browse('s' + sid));
        list.appendChild(b);
      }`,
`      for (const sid of subIds) {
        const sq = Q.filter((q) => q.sub === sid);
        const sSeen = sq.filter((q) => S.q[q.id] && S.q[q.id].a > 0).length;
        let sAtt = 0, sWr = 0;
        for (const q of sq) { const r = S.q[q.id]; if (r) { sAtt += r.a; sWr += r.w; } }
        const sAcc = sAtt ? Math.round(100 * (sAtt - sWr) / sAtt) : null;
        const b = document.createElement('button'); b.className = 'subRow';
        b.title = T({ l: D.subs[sid].l, c: D.subs[sid].c });
        b.innerHTML = \`<span class="subName">\${escapeHtml(subShortName(sid))}</span>
          <span class="subCnt">\${sSeen}/\${sq.length}</span>
          <span class="subAcc">\${sAcc !== null ? sAcc + '%' : ''}</span>\`;
        b.addEventListener('click', () => browse('s' + sid));
        list.appendChild(b);
      }`, 'subrows');

// 2) Razdelnici u listi pitanja cele oblasti: naslov podoblasti gde počinje nova
a = rep(a, `    const qh = document.createElement('h3'); qh.textContent = L('allQuestions'); qh.style.marginTop = '12px'; list.appendChild(qh);
    list.insertAdjacentHTML('beforeend', legendHtml());
    ids.forEach((qid, idx) => {
      const q = byId.get(qid);`,
`    const qh = document.createElement('h3'); qh.textContent = L('allQuestions'); qh.style.marginTop = '12px'; list.appendChild(qh);
    list.insertAdjacentHTML('beforeend', legendHtml());
    let lastSub = null;
    ids.forEach((qid, idx) => {
      const q = byId.get(qid);
      if (type === 'c' && q.sub !== lastSub) {
        lastSub = q.sub;
        const d = document.createElement('div');
        d.className = 'qDivider';
        d.title = T({ l: D.subs[q.sub].l, c: D.subs[q.sub].c });
        d.textContent = subShortName(q.sub);
        list.appendChild(d);
      }`, 'dividers-c');

// 3) Razdelnici i na strani "Sva pitanja": naslov OBLASTI gde počinje nova
a = rep(a, `    const allIds = Q.map((q) => q.id);
    Q.forEach((q, idx) => {
      const r = S.q[q.id];`,
`    const allIds = Q.map((q) => q.id);
    let lastCat = null;
    Q.forEach((q, idx) => {
      if (q.cat !== lastCat) {
        lastCat = q.cat;
        const cat = D.cats.find((x) => x.id === q.cat);
        const d = document.createElement('div');
        d.className = 'qDivider';
        d.textContent = cat ? T({ l: cat.l, c: cat.c }) : '';
        d._search = '';
        list.appendChild(d);
      }
      const r = S.q[q.id];`, 'dividers-all');

// CSS: redovi podoblasti + razdelnici
c = rep(c, `.subRow { text-align: left; background: var(--opt); border: 1px solid var(--line); border-radius: 8px; padding: 8px 12px; font-size: .88rem; }
.subRow:hover { border-color: var(--blue); background: var(--optHover); }`,
`.subRow { display: grid; grid-template-columns: 1fr 5.5em 4em; gap: 10px; align-items: center;
  width: 100%; text-align: left; background: none; border: none; border-bottom: 1px dashed var(--line);
  border-radius: 0; padding: 7px 4px; font-size: .88rem; cursor: pointer; }
.subRow .subName { color: var(--blue); }
.subRow .subCnt, .subRow .subAcc { text-align: right; color: var(--mut); font-variant-numeric: tabular-nums; white-space: nowrap; }
.subRow:hover { background: var(--optHover); }
.qDivider { margin: 16px 0 4px; padding-bottom: 4px; border-bottom: 2px solid var(--line);
  font-size: .78rem; font-weight: 700; letter-spacing: .05em; text-transform: uppercase; color: var(--mut); }`, 'css');

if (fails) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync('../../app.js', a);
fs.writeFileSync('../../style.css', c);
console.log('podoblasti i razdelnici sređeni');
