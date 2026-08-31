import fs from 'node:fs';
let a = fs.readFileSync('../../app.js', 'utf8');
let c = fs.readFileSync('../../style.css', 'utf8');
let fails = 0;
function rep(o, n, label) {
  const cnt = a.split(o).length - 1;
  if (cnt !== 1) { console.log('FAIL [' + label + '] count=' + cnt); fails++; return; }
  a = a.split(o).join(n);
  console.log('ok  [' + label + ']');
}

// ---------- TEKSTOVI ----------
rep(`    planSimNedelja: { l: 'poslednja nedelja — po jedna simulacija dnevno', c: 'последња недеља — по једна симулација дневно' },`,
`    planSimNedelja: { l: 'poslednja nedelja — po jedna simulacija dnevno', c: 'последња недеља — по једна симулација дневно' },
    endTitle: { l: 'Kraj spiska — prošao si # pitanja.', c: 'Крај списка — прошао си # питања.' },
    endWrongBtn: { l: '🔁 Ponovi pogrešna iz ovog spiska (#)', c: '🔁 Понови погрешна из овог списка (#)' },
    endNextSub: { l: 'Sledeća podoblast: #', c: 'Следећа подобласт: #' },
    endNextCat: { l: 'Sledeća oblast: #', c: 'Следећа област: #' },
    endQueue: { l: 'Ponavljanje čeka: # spremno', c: 'Понављање чека: # спремно' },
    endAllClear: { l: 'Red za ponavljanje je potpuno prazan — sve što si učio je utvrđeno. 🎉', c: 'Ред за понављање је потпуно празан — све што си учио је утврђено. 🎉' },
    endSimBtn: { l: '🏁 Simulacija ispita', c: '🏁 Симулација испита' },`, 'str');

// ---------- POMOĆNIK: sledeća podoblast/oblast po redosledu pitanja ----------
rep(`  function endScreen(msgHtml, origin, extraHtml) {`,
`  // Redosled podoblasti prati redosled pitanja u bazi; vraća sledeću podoblast (ili prvu iz sledeće oblasti).
  function sledecaSekcija(secKey) {
    if (!secKey || secKey[0] !== 's') return null;
    const sada = +secKey.slice(1);
    const redosled = [];
    for (const q of Q) if (!redosled.includes(q.sub)) redosled.push(q.sub);
    const i = redosled.indexOf(sada);
    if (i < 0 || i + 1 >= redosled.length) return null;
    const sledeci = redosled[i + 1];
    const istaOblast = Q.find((q) => q.sub === sada).cat === Q.find((q) => q.sub === sledeci).cat;
    return { key: 's' + sledeci, ime: subShortName(sledeci), istaOblast };
  }

  // Bogat kraj spiska: pogrešna iz OVOG spiska → sledeća podoblast → red ponavljanja → simulacija.
  function krajSpiska(m) {
    const pogresna = m.ids.filter((id) => inQueue(id) && S.q[id] && S.q[id].w > 0);
    const dalje = sledecaSekcija(m.secKey);
    const spremno = queueSplit().ready.length;
    const dugmad = [];
    if (pogresna.length) dugmad.push('<button class="primary" id="bEndWrong">' + L('endWrongBtn').replace('#', pogresna.length) + '</button>');
    if (dalje) dugmad.push('<button class="' + (pogresna.length ? 'secondary' : 'primary') + '" id="bEndNext">' + (dalje.istaOblast ? L('endNextSub') : L('endNextCat')).replace('#', escapeHtml(dalje.ime)) + ' ›</button>');
    if (spremno) dugmad.push('<button class="secondary" data-nav="drill">' + L('endQueue').replace('#', spremno) + '</button>');
    dugmad.push('<button class="secondary" data-nav="sim">' + L('endSimBtn') + '</button>');
    endScreen('✅ ' + L('endTitle').replace('#', m.ids.length), m.origin, dugmad.join(''));
    const bw = el('bEndWrong');
    if (bw) bw.addEventListener('click', () => startList(pogresna, () => m.titleFn() + ' — 🔁', null, 'filter', { origin: m.origin }));
    const bn = el('bEndNext');
    if (bn) bn.addEventListener('click', () => startList(Q.filter((q) => 's' + q.sub === dalje.key).map((q) => q.id), secTitleFn(dalje.key), null, 'section', { secKey: dalje.key, origin: () => browse(dalje.key) }));
  }

  function endScreen(msgHtml, origin, extraHtml) {`, 'pomocnici');

// ---------- kraj sekcijskog/filter spiska koristi bogat ekran ----------
rep(`      if (m.secKey) { S.secPos[m.secKey] = 0; save(); }
      endScreen(\`✅ \${L('listDone')}\`, m.origin);
      return;`,
`      if (m.secKey) { S.secPos[m.secKey] = 0; save(); }
      krajSpiska(m);
      return;`, 'kraj-sekcije');

// ---------- prazan red ponavljanja: slavlje + predlozi umesto suve poruke ----------
rep(`        } else {
          endScreen(L('drillEmpty'), m.origin);
        }`,
`        } else {
          endScreen('🎉 ' + L('endAllClear'), m.origin,
            '<button class="secondary" data-nav="sim">' + L('endSimBtn') + '</button>');
        }`, 'prazan-red');

// ---------- kraj učenja redom (svih 1327) ----------
rep("      endScreen(`🎉 ${L('learnDone')}`, browseAll);",
`      krajSpiska({ ids: Q.map((q) => q.id), titleFn: () => L('learn'), secKey: null, origin: browseAll });`, 'kraj-ucenja');

// ---------- CSS: dugmad kraja spiska u koloni na uskom ----------
c += '\n/* Kraj spiska: dugmad se lepo slažu i na telefonu */\n#qCard .qActions { flex-wrap: wrap; }\n';

if (fails) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync('../../app.js', a);
fs.writeFileSync('../../style.css', c);
console.log('kraj spiska obogaćen');
