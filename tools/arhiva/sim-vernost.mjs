// Simulacija doslovno kao zvanična strana eUprave (KioskHtml/ExamPractice — sačuvana kopija
// strane i njenog JS-a: scratchpad/mysim.html + ep.js). Menja se SAMO ono što se iz zvanične
// strane vidi; nijedna olakšica se ne dodaje. Izvor svakog teksta: hidden input message_* i
// funkcije GoToQuestion / GenerateQuestionsFrame / SaveUserInput / AskUserForConfirmation /
// displayTime / DisplayExamResults u ep.js.
import fs from 'node:fs';
const P = new URL('../../app.js', import.meta.url);
const C = new URL('../../style.css', import.meta.url);
let a = fs.readFileSync(P, 'utf8');
let s = fs.readFileSync(C, 'utf8');
let pao = 0;
const rep = (o, n, ime, br = 1) => { const c = a.split(o).length - 1; if (c !== br) { console.log('FAIL [' + ime + '] ' + c + '/' + br); pao++; return; } a = a.split(o).join(n); console.log('ok [' + ime + ']'); };
const repS = (o, n, ime) => { const c = s.split(o).length - 1; if (c !== 1) { console.log('FAIL css [' + ime + '] ' + c); pao++; return; } s = s.split(o).join(n); console.log('ok css [' + ime + ']'); };

// ---- tekstovi (svi doslovno sa zvanične strane; latinica = preslovljeno) ----
rep(`    chooseN: { l: 'Izaberite odgovora:', c: 'Изаберите одговора:' },   // SAMO simulacija — oblik sa ispita se ne dira`,
`    // Simulacija: tekstovi DOSLOVNO sa zvanične strane eUprave (message_* u ep.js) — ne menjati po ukusu
    chooseN: { l: 'Broj potrebnih odgovora:', c: 'Број потребних одговора:' },   // message_ChoicesRequired
    brojPoena: { l: 'Broj poena', c: 'Број поена' },                              // message_NumberOfPoints
    markSim: { l: 'Obeležite pitanje', c: 'Обележите питање' },                  // #questionMarking
    simBrojOdgovora: { l: 'Niste označili potreban broj odgovora.', c: 'Нисте означили потребан број одговора.' },   // message_IncorrectNumberOfAnswers
    simKraj: { l: 'Ispit je završen!', c: 'Испит је завршен!' },
    simPolozio: { l: 'Čestitamo, položili ste teorijski ispit.', c: 'Честитамо, положили сте теоријски испит.' },   // message_Passed
    simPao: { l: 'Nažalost, niste položili teorijski ispit.', c: 'Нажалост, нисте положили теоријски испит.' },     // message_Failed`, 'chooseN');
rep(`    finishSim: { l: 'Završi ispit', c: 'Заврши испит' },`, `    finishSim: { l: 'Kraj ispita', c: 'Крај испита' },   // #btnFinishExam`, 'finishSim');
rep(`    simConfirm0: { l: 'Predati test?', c: 'Предати тест?' },
    simConfirmN: { l: 'Predati test? Neodgovorenih: # (nose 0 poena).', c: 'Предати тест? Неодговорених: # (носе 0 поена).' },`,
`    // message_ConfirmExamFinish — bez brojanja neodgovorenih: toga na ispitu nema
    simConfirm: { l: 'Da li sigurno želite završiti teorijski ispit? Nakon potvrde više nećete moći uneti bilo koju izmenu u date odgovore.', c: 'Да ли сигурно желите завршити теоријски испит? Након потврде више нећете моћи унети било коју измену у дате одговоре.' },`, 'simConfirm');
rep(`    backToTest: { l: 'Nazad na test', c: 'Назад на тест' },`, `    backToTest: { l: 'Nazad', c: 'Назад' },   // #btnBack`, 'backToTest');

// ---- tajmer: zvanični displayTime — minuti bez vodeće nule (45:00 → 9:59 → 0:07) ----
rep(`    const mm = String(Math.floor(left / 60)).padStart(2, '0');
    const ss = String(left % 60).padStart(2, '0');`,
`    // isti oblik kao zvanični tajmer (displayTime): minuti bez vodeće nule — 45:00, 9:59, 0:07
    const mm = String(Math.floor(left / 60));
    const ss = String(left % 60).padStart(2, '0');`, 'tajmer');

// ---- zaglavlje pitanja + oznaka broja odgovora ispod teksta (GoToQuestion + GenerateQuestionsFrame) ----
rep(`    meta.innerHTML = \`<span>\${L('question')} \${sim.i + 1} / \${SIM_N}</span><span>\${poeni(q.pts)}\${q.req > 1 ? \` · \${L('chooseN')} \${q.req}\` : ''}</span>\`;
    c.appendChild(meta);
    const txt = document.createElement('div'); txt.className = 'qText'; txt.textContent = T(q.t); c.appendChild(txt);
    if (q.img) c.appendChild(slikaPitanja(q));`,
`    // zvanično zaglavlje: „Питање: 3/41" i „Број поена: 2" (GoToQuestion u ep.js)
    meta.innerHTML = \`<span>\${L('question')}: \${sim.i + 1}/\${SIM_N}</span><span>\${L('brojPoena')}: \${q.pts}</span>\`;
    c.appendChild(meta);
    const txt = document.createElement('div'); txt.className = 'qText'; txt.textContent = T(q.t); c.appendChild(txt);
    if (q.req > 1) {
      // kao na ispitu: kurzivna plava oznaka ISPOD teksta pitanja (GenerateQuestionsFrame u ep.js)
      const rq = document.createElement('div'); rq.className = 'simReq';
      rq.textContent = \`\${L('chooseN')} \${q.req}\`;
      c.appendChild(rq);
    }
    if (q.img) c.appendChild(slikaPitanja(q));`, 'zaglavlje');

// ---- napuštanje pitanja sa nepotpunim brojem odgovora: ispit ne pušta dalje (SaveUserInput) ----
rep(`    const actions = document.createElement('div'); actions.className = 'qActions';
    if (sim.i > 0) { const p = document.createElement('button'); p.className = 'secondary'; p.textContent = '‹ ' + L('prevQ'); p.addEventListener('click', () => { sim.i--; renderSimQ(); }); actions.appendChild(p); }
    if (sim.i < SIM_N - 1) { const n = document.createElement('button'); n.className = 'primary'; n.textContent = L('nextQ') + ' ›'; n.addEventListener('click', () => { sim.i++; renderSimQ(); }); actions.appendChild(n); }`,
`    const actions = document.createElement('div'); actions.className = 'qActions';
    if (sim.i > 0) { const p = document.createElement('button'); p.className = 'secondary'; p.textContent = '‹ ' + L('prevQ'); p.addEventListener('click', () => { if (!simSmeDalje()) return; sim.i--; renderSimQ(); }); actions.appendChild(p); }
    if (sim.i < SIM_N - 1) { const n = document.createElement('button'); n.className = 'primary'; n.textContent = L('nextQ') + ' ›'; n.addEventListener('click', () => { if (!simSmeDalje()) return; sim.i++; renderSimQ(); }); actions.appendChild(n); }`, 'prev/next čuvar');
rep(`    markWrap.appendChild(cb); markWrap.appendChild(document.createTextNode(' ' + L('mark')));
    actions.appendChild(markWrap);
    c.appendChild(actions);
  }
  // "Izveštaj" — kao na ispitu: tabela Pitanje / Odgovoreno / Obeleženo, klik vodi na pitanje`,
`    markWrap.appendChild(cb); markWrap.appendChild(document.createTextNode(' ' + L('markSim')));
    actions.appendChild(markWrap);
    c.appendChild(actions);
  }
  // Kao na ispitu (SaveUserInput u ep.js): pitanje sa VIŠE odgovora ne može da se napusti dok
  // nije označen ni jedan ili tačno traženi broj — pola odgovora zaustavlja i poruči.
  function simSmeDalje() {
    if (!sim || sim.showReport) return true;
    const sq = sim.qs[sim.i];
    if (sq.chosen.size > 0 && sq.chosen.size !== sq.q.req) { alert(L('simBrojOdgovora')); return false; }
    return true;
  }
  // "Izveštaj" — kao na ispitu: tabela Pitanje / Broj poena / Odgovoreno / Obeleženo, klik vodi na pitanje`, 'mark + simSmeDalje');
rep(`      <table class="stats"><thead><tr><th>\${L('question')}</th><th class="num">\${L('repAnswered')}</th><th class="num">\${L('repMarked')}</th></tr></thead>
      <tbody>\${sim.qs.map((sq, idx) =>
        \`<tr class="repRow" tabindex="0" data-i="\${idx}"><td>\${idx + 1}</td><td class="num">\${sq.chosen.size ? '✓' : '—'}</td><td class="num">\${sq.marked ? '🔖' : '—'}</td></tr>\`).join('')}`,
`      <table class="stats"><thead><tr><th>\${L('question')}</th><th class="num">\${L('brojPoena')}</th><th class="num">\${L('repAnswered')}</th><th class="num">\${L('repMarked')}</th></tr></thead>
      <tbody>\${sim.qs.map((sq, idx) =>
        \`<tr class="repRow" tabindex="0" data-i="\${idx}"><td>\${L('question')} \${idx + 1}</td><td class="num">\${sq.q.pts}</td><td class="num">\${sq.chosen.size === sq.q.req ? '✓' : '—'}</td><td class="num">\${sq.marked ? '🔖' : '—'}</td></tr>\`).join('')}`, 'izveštaj tabela');
// izveštaj i kraj ispita prolaze isti čuvar (GoToList / FinishExam zovu SaveUserInput)
rep(`  el('btnSimReport').addEventListener('click', () => { if (sim) (sim.showReport ? renderSimQ() : renderSimReport()); });`,
`  el('btnSimReport').addEventListener('click', () => { if (!sim) return; if (sim.showReport) renderSimQ(); else if (simSmeDalje()) renderSimReport(); });`, 'report čuvar');
rep(`    if (!auto) {
      const unanswered = sim.qs.filter((sq) => !sq.chosen.size).length;
      const msg = unanswered === 0 ? L('simConfirm0') : L('simConfirmN').replace('#', unanswered);
      if (!confirm(msg)) return;
    }`,
`    if (!auto) {
      if (!simSmeDalje()) return;
      if (!confirm(L('simConfirm'))) return;   // doslovno pitanje sa ispita, bez brojanja neodgovorenih
    }`, 'finish potvrda');
// ---- rezultat: zvanična rečenica ishoda (DisplayExamResults) iznad našeg pregleda ----
rep(`      <p><span class="pill \${rec.passed ? 'pass' : 'fail'}">\${rec.passed ? L('passed') : L('failed')}</span>
      &nbsp; <span class="mut">\${pragTekst(rec.total)}</span></p>`,
`      <p><span class="pill \${rec.passed ? 'pass' : 'fail'}">\${rec.passed ? L('passed') : L('failed')}</span>
      &nbsp; <span class="mut">\${pragTekst(rec.total)}</span></p>
      <p><b>\${L('simKraj')}</b> \${rec.passed ? L('simPolozio') : L('simPao')}</p>`, 'rezultat rečenica');

// ---- CSS: oznaka broja odgovora kao na ispitu (kurziv, plava) ----
repS(`.simTop { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }`,
`.simTop { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
/* „Broj potrebnih odgovora: 2" — kurziv i plavo, ispod teksta pitanja, kao na zvaničnoj strani */
.simReq { font-style: italic; color: var(--blue); margin: -6px 0 10px; }`, 'simReq');

if (pao) { console.log('*** NE PIŠEM ***'); process.exit(1); }
fs.writeFileSync(P, a);
fs.writeFileSync(C, s);
console.log('--- upisano: app.js + style.css ---');
