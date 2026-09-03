// Dopuna navigacije: „nazad" se pojavljuje SAMO kad roditelj nije početna (podoblast → oblast,
// pitanje → njegov spisak). Za sve ostalo početnu pokrivaju brend na sredini i donja traka —
// četvrti ulaz na početnu bio bi tačno ono što je pregled zamerio. Uz to: poziv u „Sva pitanja"
// je stajao PRE show(), koji ga briše.
import fs from 'node:fs';
const A = new URL('../../app.js', import.meta.url);
let a = fs.readFileSync(A, 'utf8');
let pao = 0;
const rep = (o, n, ime) => { const c = a.split(o).length - 1; if (c !== 1) { console.log('FAIL [' + ime + '] ' + c); pao++; return; } a = a.split(o).join(n); console.log('ok [' + ime + ']'); };

rep(`    show('stats');
    postaviNazad(L('home'), () => renderHome());`, `    show('stats');`, 'stats bez nazad');
rep(`    // podoblast se vraća u svoju oblast, oblast na početnu — uvek isto mesto, isti oblik
    if (type === 's') postaviNazad(catOf(catQ), () => browse('c' + catQ.cat));
    else postaviNazad(L('home'), () => renderHome());`,
`    // podoblast se vraća u svoju oblast; oblast nema „nazad" — početna je brend na sredini
    if (type === 's') postaviNazad(catOf(catQ), () => browse('c' + catQ.cat));`, 'oblast bez nazad');
rep(`    list.appendChild(prazno);   // unutar kartice, ispod redova — tu korisnik i gleda
    postaviNazad(L('home'), () => renderHome());`,
`    list.appendChild(prazno);   // unutar kartice, ispod redova — tu korisnik i gleda`, 'sva bez nazad');

if (pao) { console.log('*** NE PIŠEM ***'); process.exit(1); }
fs.writeFileSync(A, a);
console.log('--- upisano: app.js ---');
