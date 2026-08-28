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

// 1) "Sva pitanja oblasti" bez bara i brojeva (vitak red-link) + zebra preko rednog broja
a = rep(a, `        let ref = row;
        const addSub = (labelHtml, key, sSeen, sTot, sGood, title) => {
          const sr = document.createElement('button'); sr.type = 'button'; sr.className = 'catRow catSubRow';
          if (title) sr.title = title;
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
          addSub(escapeHtml(subShortName(sid)), 's' + sid, sSeen, sq.length, sGood, T({ l: D.subs[sid].l, c: D.subs[sid].c }));
        }`,
`        let ref = row, zi = 0;
        const addSub = (labelHtml, key, sSeen, sTot, sGood, title) => {
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
        };
        addSub(\`<b>\${escapeHtml(L('wholeCat'))} ›</b>\`, 'c' + c.id, 0, null, 0);
        for (const sid of [...new Set(qq.map((q) => q.sub))]) {
          const sq = qq.filter((q) => q.sub === sid);
          const sSeen = sq.filter((q) => S.q[q.id] && S.q[q.id].a > 0).length;
          const sGood = sq.filter((q) => S.q[q.id] && S.q[q.id].a > 0 && S.q[q.id].streak >= 1).length;
          addSub(escapeHtml(subShortName(sid)), 's' + sid, sSeen, sq.length, sGood, T({ l: D.subs[sid].l, c: D.subs[sid].c }));
        }`, 'home-allrow-zebra');

// 2) CSS: zebra pozadina + tanka isprekidana linija između podredova; vitak "sva pitanja" red
c = rep(c, `.catSubRow { margin: 3px 0; }`,
`.catSubRow { margin: 0; padding: 3px 0; border-bottom: 1px dashed var(--line); border-radius: 0; }
.catSubRow.zebra { background: var(--optHover); }
.catAllRow { border-bottom: 1px solid var(--line); padding: 4px 0; }
.catAllRow .catName { color: var(--blue); }`, 'css-zebra');

if (fails) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync('../app.js', a);
fs.writeFileSync('../style.css', c);
console.log('dorada primenjena');
