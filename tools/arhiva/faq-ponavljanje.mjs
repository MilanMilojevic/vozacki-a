// FAQ: pravilo ponavljanja je bilo objašnjeno na pet mesta sa različitim sadržajem, a FAQ
// verzija je izostavljala dva pravila koja aplikacija stvarno primenjuje (potvrda za tačna iz
// prve; odgovor pre roka ne pomera raspored). Ovde FAQ dobija ISTI tekst kao STR.queueTip u
// app.js — jedno pravilo, jednako svuda. Datoteka ima NUL bajtove: sečenje po sidru, ne regeks.
import fs from 'node:fs';
const P = new URL('../build-explanations.mjs', import.meta.url);
let t = fs.readFileSync(P, 'utf8');
const od = t.indexOf('<p><b>Kako radi "Ponovi pogrešna"?</b><br>');
const doK = t.indexOf('</p>', od) + 4;
if (od === -1 || doK < od) { console.log('FAIL: sidro FAQ nije nađeno'); process.exit(1); }
const novo = `<p><b>Kako radi Ponavljanje?</b><br>
Razmaknuto ponavljanje: pogrešiš → pitanje je odmah na redu; pogodiš ga → vraća se sutra; opet pogodiš →
za 3 dana; treći pogodak zaredom → utvrđeno je i izlazi iz reda. I pitanje koje si pogodio iz prve vraća se
jednom, za 3 dana, da se potvrdi — pa izlazi. Tačan odgovor PRE roka je vežbanje i ne pomera raspored;
pogrešan važi uvek. U dnevni cilj isto pitanje ulazi najviše jednom dnevno.</p>`;
t = t.slice(0, od) + novo + t.slice(doK);
fs.writeFileSync(P, t);
console.log('ok: FAQ pasus zamenjen (' + (doK - od) + ' → ' + novo.length + ' znakova)');
