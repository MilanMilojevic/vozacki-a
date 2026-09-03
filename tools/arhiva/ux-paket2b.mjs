// Dopuna paketa 2: potvrde i za brisanje, uvoz, povezivanje fajla i proveru verzije (do sada su
// dve od njih ćutale, a dve dizale sistemski prozor). Ime fajla se ne prevodi na ćirilicu, pa se
// izvlači iz teksta u čuvar @1 — inače skener pisma s pravom prijavlja latinicu u ćiriličnom paru.
import fs from 'node:fs';
const A = new URL('../../app.js', import.meta.url);
let a = fs.readFileSync(A, 'utf8');
let pao = 0;
const rep = (o, n, ime) => { const c = a.split(o).length - 1; if (c !== 1) { console.log('FAIL [' + ime + '] ' + c); pao++; return; } a = a.split(o).join(n); console.log('ok [' + ime + ']'); };

rep(`    porExport: { l: 'Napredak je sačuvan u fajl vozacki-a-napredak.json', c: 'Напредак је сачуван у фајл vozacki-a-napredak.json' },`,
`    porExport: { l: 'Napredak je sačuvan u fajl @1', c: 'Напредак је сачуван у фајл @1' },`, 'porExport čuvar');
rep(`      poruci(L('porExport'));`, `      poruci(L('porExport').split('@1').join('vozacki-a-napredak.json'));`, 'porExport upotreba');
rep(`      if (confirm(L('resetConfirm'))) { S = normalizeState({ q: {}, script: S.script, theme: S.theme, fs: S.fs }); save(); renderHome(); }`,
`      if (confirm(L('resetConfirm'))) { S = normalizeState({ q: {}, script: S.script, theme: S.theme, fs: S.fs }); save(); renderHome(); poruci(L('porReset')); }`, 'poruka reset');
rep(`        if (bilo > ostalo) alert(L('importDeo').split('#').join(ostalo).split('@').join(bilo));`,
`        if (bilo > ostalo) alert(L('importDeo').split('#').join(ostalo).split('@').join(bilo));
        else poruci(L('porUvoz'));`, 'poruka uvoz');
rep(`    slovaLbl: { l: 'Veličina slova', c: 'Величина слова' },`,
`    slovaLbl: { l: 'Veličina slova', c: 'Величина слова' },
    porVerzijaOK: { l: 'Imaš najnoviju verziju (@1).', c: 'Имаш најновију верзију (@1).' },`, 'porVerzijaOK');

if (pao) { console.log('*** NE PIŠEM ***'); process.exit(1); }
fs.writeFileSync(A, a);
console.log('--- upisano: app.js ---');
