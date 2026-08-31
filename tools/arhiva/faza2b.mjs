import fs from 'node:fs';
let a = fs.readFileSync('../../app.js', 'utf8');
let h = fs.readFileSync('../../index.html', 'utf8');
let c = fs.readFileSync('../../style.css', 'utf8');
let fails = 0;
function rep(src, o, n, label) {
  const cnt = src.split(o).length - 1;
  if (cnt !== 1) { console.log('FAIL [' + label + '] count=' + cnt); fails++; return src; }
  console.log('ok  [' + label + ']');
  return src.split(o).join(n);
}

// niz + odbrojavanje u pregledu na početnoj
a = rep(a, "el('homeSummary').innerHTML = `<b>${answeredCnt}</b> / ${Q.length} ${L('answered')} · <span title=\"${escapeHtml(L('queueTip'))}\" style=\"cursor:help\"><b>${ready.length}</b> ${L('ready')} + ${waiting.length} ${L('waiting')}</span> · 🔖 ${mk}${dayLine}${lastChip}`;",
"el('homeSummary').innerHTML = `<b>${answeredCnt}</b> / ${Q.length} ${L('answered')} · <span title=\"${escapeHtml(L('queueTip'))}\" style=\"cursor:help\"><b>${ready.length}</b> ${L('ready')} + ${waiting.length} ${L('waiting')}</span> · 🔖 ${mk}${dayLine}${lastChip}` + homeExtras();", 'home-summary');

// datum ispita: polje u alatima podataka
a = rep(a, `      <div class="mut" style="margin-top:10px;font-size:.82rem">\${L('bazaProverena')} ·`,
`      <div style="margin-top:10px;font-size:.86rem"><label>\${L('examDateLabel')}
        <input type="date" id="examDate" value="\${S.examDate || ''}" style="margin-left:6px"></label></div>
      <div class="mut" style="margin-top:10px;font-size:.82rem">\${L('bazaProverena')} ·`, 'exam-input');
a = rep(a, `    el('btnTourReplay').addEventListener('click', tourStart);`,
`    el('btnTourReplay').addEventListener('click', tourStart);
    el('examDate').addEventListener('change', () => {
      const v = el('examDate').value;
      S.examDate = /^\\d{4}-\\d{2}-\\d{2}$/.test(v) ? v : null;
      save(); renderHome();
    });`, 'exam-veza');

// offline nagoveštaj: traka ispod vrha, samo dok nema mreže (navigator.onLine je nagoveštaj, ne garancija)
h = rep(h, `<div class="card small" id="dataTools"></div>`, `<div class="card small" id="dataTools"></div>`, 'html-proba');
h = rep(h, `<body>`, `<body>
<div id="offlineStrip" hidden></div>`, 'offline-html');
a = rep(a, `  // ---------- Ponuda instalacije ----------`,
`  // ---------- Nagoveštaj rada bez interneta ----------
  {
    const strip = el('offlineStrip');
    if (strip) {
      strip.textContent = L('offline');
      const osveziStrip = () => { strip.hidden = navigator.onLine !== false; };
      window.addEventListener('online', osveziStrip);
      window.addEventListener('offline', osveziStrip);
      osveziStrip();
    }
  }

  // ---------- Ponuda instalacije ----------`, 'offline-js');

c += `
/* Pregled na početnoj: niz i odbrojavanje */
.homeExtras { margin-top: 6px; color: var(--mut); font-size: .92rem; }

/* Nagoveštaj rada bez interneta */
#offlineStrip { background: var(--mark, #fff3d6); color: var(--ink, #1c2733); border-bottom: 1px solid var(--line);
  padding: 8px 14px; font-size: .9rem; text-align: center; }
body.dark #offlineStrip { background: #3d3420; color: #e8e0cc; }
`;

if (fails) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync('../../app.js', a);
fs.writeFileSync('../../index.html', h);
fs.writeFileSync('../../style.css', c);
console.log('faza2b primenjena');
