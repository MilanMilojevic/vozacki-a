# Ugrađeni kviz: provera v214

14. septembar 2026, razvojna grana `codex/stabilizacija`.

Posle netačnog odgovora boja je ranije bila jedini način prepoznavanja tačne opcije. Sada tačna opcija dobija „✓ Тачан одговор.”, izabrana pogrešna „✗ Нетачан избор.”, a postojeća poruka rezultata ima `role="status"`. Tri promene u `embed.html` čuvaju originalni tekst opcije, bodovni ključ, slike, linkove, nasumični izbor i postojeći ćirilični interfejs. Nema novog skladišta ili komunikacije sa roditeljskim sajtom.

Oznaka uz boju odgovara pristupu iz [W3C SC 1.4.1](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html); status uloga omogućava programatsko prepoznavanje poruke prema [SC 4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html). Ovo je otklanjanje dva konkretna nalaza, ne potvrda usaglašenosti celog sajta.

## Dokazi

- Nezavisni predlog096: 48 iframe slučajeva i8 direktnih prikaza kandidata prolazi; stari kod i byte-revert reprodukuju nedostatak. Tri stvarna pitanja, devet opcija, dva originalna JPEG-a;320/1280, obe teme,100/200% teksta. Unutrašnja širina dokumentovanog iframe-a na desktopu jeste560, ne1280.
- Root je proverio svih18 grupa zamrznutog dokaza i pregledao reprezentativne snimke. Pri prvom pokretanju verifier-a root je svoj izlaz greškom smestio među zamrznute fajlove; zato je provera kompletnog spiska opravdano pala. Log je sačuvan u zasebnom `096-root`, a neizmenjeni verifier zatim prolazi18/18.
- Root na stvarno posluženoj v214:12 direktnih slučajeva sa native Tab/Enter/Space, dostupnim originalnim tekstom, učitanim slikama, odgovarajućim statusom i praznim skladištem. Nema horizontalnog prelivanja ni JavaScript grešaka. Stvarno su uvećani i root i body font; ovo nije test fizičkog telefona ili browser pinch zoom-a.
- Postojeća trajna provera `tools/tests/image-hashes.browser.js` sada uz adresu embed slike proverava i tačan/pogrešan izbor, tekstualne oznake, status i onemogućene opcije. Root je izvršio upravo taj promenjeni blok protiv v214. Ostatak prethodne provere slike nije izmenjen.
- `node tools/verify.mjs`:249/249. Glasovni izlaz stvarnog čitača ekrana nije proveren.

Lokalni detalji: `output/revizija-20260911/096/` (zamrznuti predlog) i `096-root/` (integracija, stvarna proba v214 i logovi). To su ignored razvojni dokazi, nisu javni resursi aplikacije. Provera koristi prazne kontekste; korisnikov Chrome i napredak nisu otvarani.
