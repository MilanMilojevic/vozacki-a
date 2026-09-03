// Milanove konkretne stavke (2026-09-03), bez navigacije (nju daje panel):
// 1) dugmad u podešavanjima u jednoj mreži jednakih ćelija; 2) istorija simulacija: poslednjih 5 +
// „Starije simulacije (N)" na otklapanje; 3) „Izmešaj redosled" je dugme-prekidač, ne kvačica-link;
// 4) „Sačuvaj sliku rezultata" → „Podeli rezultat" + potvrda kad se slika preuzme; 5) napomena o
// starijoj simulaciji jasnija i tiša.
import fs from 'node:fs';
const P = new URL('../../app.js', import.meta.url), C = new URL('../../style.css', import.meta.url);
let a = fs.readFileSync(P, 'utf8'), s = fs.readFileSync(C, 'utf8');
let pao = 0;
const mk = (get, set, tag) => (o, n, ime, br = 1) => { const txt = get(); const c = txt.split(o).length - 1; if (c !== br) { console.log('FAIL ' + tag + ' [' + ime + '] ' + c + '/' + br); pao++; return; } set(txt.split(o).join(n)); console.log('ok ' + tag + ' [' + ime + ']'); };
const rep = mk(() => a, (v) => { a = v; }, 'js');
const repS = mk(() => s, (v) => { s = v; }, 'css');

// ---- tekstovi ----
rep(`    shareBtn: { l: '📷 Sačuvaj sliku rezultata', c: '📷 Сачувај слику резултата' },`,
`    shareBtn: { l: '📤 Podeli rezultat', c: '📤 Подели резултат' },   // pravi karticu za deljenje; nije snimak ekrana
    shareDone: { l: 'Slika rezultata je preuzeta.', c: 'Слика резултата је преузета.' },
    historyOlder: { l: 'Starije simulacije (@1)', c: 'Старије симулације (@1)' },`, 'shareBtn/shareDone/historyOlder');
rep(`    reviewOldNote: { l: 'Starija simulacija — tvoji odgovori nisu bili sačuvani, prikazana su samo pogrešna pitanja sa tačnim odgovorima.', c: 'Старија симулација — твоји одговори нису били сачувани, приказана су само погрешна питања са тачним одговорима.' },`,
`    reviewOldNote: { l: 'Ova simulacija je iz starije verzije aplikacije (pre 27.08.2026), kad se tvoji odgovori još nisu čuvali — prikazana su samo pogrešna pitanja sa tačnim odgovorima.', c: 'Ова симулација је из старије верзије апликације (пре 27.08.2026), кад се твоји одговори још нису чували — приказана су само погрешна питања са тачним одговорима.' },`, 'reviewOldNote');
rep('`<p class="mut">${L(\'reviewOldNote\')}</p>`', '`<p class="mut napomena">${L(\'reviewOldNote\')}</p>`', 'reviewOldNote razred');

// ---- 3) prekidač umesto kvačice ----
rep('    return `<label class="markBox uSpisku" title="${escapeHtml(L(\'shufTip\'))}"><input type="checkbox" id="shufBox"${shuffleOn ? \' checked\' : \'\'}> 🎲 ${L(\'shuffleLbl\')}</label>`;',
'    // dugme-prekidač (aria-pressed), isto kao ostala dugmad u redu — kvačica sa narandžastim natpisom je izgledala kao link\n    return `<button type="button" class="secondary prekidac" id="shufBox" aria-pressed="${shuffleOn ? \'true\' : \'false\'}" title="${escapeHtml(L(\'shufTip\'))}">🎲 ${L(\'shuffleLbl\')}</button>`;', 'shuffleBoxHtml');
rep(`    if (sb) sb.addEventListener('change', () => { shuffleOn = sb.checked; current.redraw(); });`,
`    if (sb) sb.addEventListener('click', () => { shuffleOn = !shuffleOn; current.redraw(); });`, 'bindShuffleBox');
repS(`.markBox.uSpisku { margin-left: 0; }`,
`/* dugme-prekidač: uključeno stanje se vidi kao plavi okvir, ne kao „link" */
.prekidac[aria-pressed="true"] { box-shadow: inset 0 0 0 2px var(--blue); background: var(--optSel); color: var(--blue-d); }`, 'prekidac css');

// ---- 2) istorija simulacija: poslednjih 5 + starije na otklapanje ----
rep(`      sh.innerHTML = \`<h3>\${L('history')}</h3><p class="mut napomena">\${L('historyTip')}</p>\`
        + S.sims.slice().reverse().map((s, ri) => {
          const brGresaka = (s.wrong || []).length;
          return \`<button class="histRow histBtn" data-sim="\${S.sims.length - 1 - ri}">
            <span class="histDate mut">\${fmtDatum(s.d, true)}</span>
            <b class="histScore">\${s.score} / \${s.total}</b>
            <span class="histPill"><span class="pill \${s.passed ? 'pass' : 'fail'}">\${s.passed ? L('passed') : L('failed')}</span></span>
            <span class="histWrong mut">\${brGresaka ? brGresaka + ' ✗' : ''}</span>
            <span class="histArrow mut">›</span></button>\`;
        }).join('');
      sh.querySelectorAll('.histBtn').forEach((b) => b.addEventListener('click', () => renderSimReview(S.sims[+b.dataset.sim], false)));`,
`      // kartica ne raste beskonačno: poslednjih 5 je uvek vidljivo, starije se otklapaju na zahtev
      const NOVIJIH = 5;
      const redovi = S.sims.slice().reverse().map((s, ri) => {
        const brGresaka = (s.wrong || []).length;
        return \`<button class="histRow histBtn" data-sim="\${S.sims.length - 1 - ri}">
            <span class="histDate mut">\${fmtDatum(s.d, true)}</span>
            <b class="histScore">\${s.score} / \${s.total}</b>
            <span class="histPill"><span class="pill \${s.passed ? 'pass' : 'fail'}">\${s.passed ? L('passed') : L('failed')}</span></span>
            <span class="histWrong mut">\${brGresaka ? brGresaka + ' ✗' : ''}</span>
            <span class="histArrow mut">›</span></button>\`;
      });
      sh.innerHTML = \`<h3>\${L('history')}</h3><p class="mut napomena">\${L('historyTip')}</p>\` + redovi.slice(0, NOVIJIH).join('')
        + (redovi.length > NOVIJIH ? \`<div><button type="button" class="pojBtn" id="btnHistOlder">\${L('historyOlder').split('@1').join(redovi.length - NOVIJIH)}</button><div id="histOlder" style="display:none">\${redovi.slice(NOVIJIH).join('')}</div></div>\` : '');
      const bho = el('btnHistOlder'); if (bho) sklopivo(bho);
      sh.querySelectorAll('.histBtn').forEach((b) => b.addEventListener('click', () => renderSimReview(S.sims[+b.dataset.sim], false)));`, 'istorija');

// ---- 1) podešavanja: jedna mreža dugmadi ----
rep(`        <div class="mut napomena">\${L('persistNote')}</div>
        <div id="backupLine" class="razmakG"></div>
        <div class="qActions">
          <button type="button" class="secondary" id="btnExport">\${L('export')}</button>
          <button type="button" class="secondary" id="btnImport">\${L('import')}</button>
          <input type="file" id="fileImport" accept=".json" style="display:none">
        </div>`,
`        <div class="mut napomena">\${L('persistNote')}</div>
        <div class="podDugmad">
          <span id="backupSlot" style="display:none"></span>
          <button type="button" class="secondary" id="btnExport">\${L('export')}</button>
          <button type="button" class="secondary" id="btnImport">\${L('import')}</button>
          <input type="file" id="fileImport" accept=".json" style="display:none">
        </div>
        <div id="backupLine" class="mut napomena razmakG"></div>`, 'napredak mreža');
rep(`        <div class="grupaNaslov">\${L('grupaAplikacija')}</div>
        <div class="qActions">`,
`        <div class="grupaNaslov">\${L('grupaAplikacija')}</div>
        <div class="podDugmad">`, 'aplikacija mreža');
rep(`  function renderBackupLine() {
    const s = el('backupLine');
    if (!s) return;
    if (!FSA) { s.innerHTML = \`<span class="mut">\${L('backupNA')}</span>\`; return; }
    if (fsHandle) { s.innerHTML = \`✅ \${L('backupOn')}: <b>\${escapeHtml(fsHandle.name)}</b>\`; return; }
    if (fsPending) {
      s.innerHTML = \`<button class="secondary" id="btnResumeBackup">🔗 \${L('backupResume')} (\${escapeHtml(fsPending.name)})</button>\`;
      el('btnResumeBackup').addEventListener('click', resumeBackup);
      return;
    }
    s.innerHTML = \`<button class="secondary" id="btnConnectBackup">\${L('backupConnect')}</button>\`;
    el('btnConnectBackup').addEventListener('click', connectBackup);
  }`,
`  // Dugme za povezivanje stoji u ISTOJ mreži kao „Sačuvaj/Učitaj" (jednake ćelije), a stanje
  // (povezano / nije podržano) ide kao napomena ispod — ranije je dugme bilo samo u svom redu.
  function renderBackupLine() {
    const s = el('backupLine'), slot = el('backupSlot');
    if (!s || !slot) return;
    s.innerHTML = ''; slot.innerHTML = ''; slot.style.display = 'none';
    if (!FSA) { s.textContent = L('backupNA'); return; }
    if (fsHandle) { s.innerHTML = \`✅ \${L('backupOn')}: <b>\${escapeHtml(fsHandle.name)}</b>\`; return; }
    slot.style.display = 'contents';
    if (fsPending) {
      slot.innerHTML = \`<button type="button" class="secondary" id="btnResumeBackup">🔗 \${L('backupResume')} (\${escapeHtml(fsPending.name)})</button>\`;
      el('btnResumeBackup').addEventListener('click', resumeBackup);
      return;
    }
    slot.innerHTML = \`<button type="button" class="secondary" id="btnConnectBackup">\${L('backupConnect')}</button>\`;
    el('btnConnectBackup').addEventListener('click', connectBackup);
  }`, 'renderBackupLine');
repS(`.podGrupa .grupaNaslov { margin-top: 0; border-bottom: none; padding-bottom: 0; }`,
`.podGrupa .grupaNaslov { margin-top: 0; border-bottom: none; padding-bottom: 0; }
/* dugmad u podešavanjima: mreža jednakih ćelija — na telefonu jedno ispod drugog, na širokom dva u redu */
.podDugmad { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 8px; margin-top: 8px; }
.podDugmad button { width: 100%; }`, 'podDugmad css');

// ---- 4) deljenje: potvrda kad se slika preuzme (bez Web Share) ----
rep(`      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);`,
`      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      // bez sistemskog prozora za deljenje slika se tiho preuzme — dugme kaže šta se desilo
      if (dugme) { const staro = dugme.textContent; dugme.textContent = L('shareDone'); setTimeout(() => { dugme.textContent = staro; }, 2500); }`, 'shareDone potvrda');

if (pao) { console.log('*** NE PIŠEM (' + pao + ') ***'); process.exit(1); }
fs.writeFileSync(P, a); fs.writeFileSync(C, s);
console.log('--- upisano: app.js, style.css ---');
