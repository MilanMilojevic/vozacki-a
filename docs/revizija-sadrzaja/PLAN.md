# Evidencija sadržajne revizije — plan alata

Ovaj mali paket sprovodi evidenciju iz A6 [plana stabilizacije](../superpowers/plans/2026-09-10-stabilizacija-i-revizija.md) i [drugog pregleda kvaliteta](../superpowers/plans/2026-09-10-drugi-pregled-kvaliteta.md). Ne sprovodi semantičku proveru 1.327 pitanja i ne menja aplikaciju.

**Ulaz:** isključivo javni `data.js`, `explanations.js`, slike `img/<ID>.jpg` i lokalni registar javnih pravnih/stručnih izvora. JS omotači se parsiraju kao JSON; ne izvršavaju se. Sirovi harvest, Git istorija, profil pregledača i privatni metapodaci nisu ulazi.

**Izlaz:** `pitanja.jsonl` sa tačno jednim zapisom za svaki ID, `kartice.jsonl` za sve kartice, `manifest.json` sa poreklom javnih ulaza i brojevima statusa. `izvori.json` počinje prazan: nijedan pravni izvor nije ovom infrastrukturom proveren.

Oditak SHA-256 obuhvata tekst i odgovore na oba pisma, njihove ID-jeve, redosled, tačnost, bodove, broj traženih odgovora, sliku i stvarno povezane kartice. Kartice uključuju HTML/SVG na oba pisma, slike u HTML-u, atlas i situacije sa zavisnim pitanjima i slikama. Zamke se takođe povezuju sa svojim pitanjima. Hash celog sadržaja kartice je namerno konzervativan: njena izmena ponovo otvara sva pitanja koja je koriste, uključujući trenutno sklopljene odeljke.

Svaki zapis ima odvojene statuse provere. Početni status je `unreviewed`; odsustvo slike može biti strukturno `not-applicable` uz razlog. `reviewed` se unosi samo posle stvarnog pregleda, sa autorom, datumom i beleškom o dokazu. Promena otiska poništava aktuelni pregled, čuva prethodni rad u istoriji i vraća status na `unreviewed`. Promena registrovanog izvora ponovo otvara zapise koji ga koriste.

Redosled rada:

1. Testovi za oba pisma, izmenjenu karticu/sliku/izvor, nepromenjen nepovezan ID, determinističan izlaz i odbijanje nebezbednih/nepotpunih ulaza.
2. `tools/audit-content.mjs`: čiste funkcije za otiske/evidenciju i CLI čije putanje zavise od lokacije skripte. Podrazumevani `--check` samo čita; `--write` osvežava evidenciju tek nakon svih provera. `--require-reviewed` dodatno zahteva završen pregled svih zapisa.
3. Generisanje početne evidencije, ponovljeno generisanje bez razlike i provera tačno 1.327 pitanja. Sačuvani pregled se ne pretpostavlja na osnovu ranijih radnih spiskova.
4. Kratka metodologija za naredne grupe od 25–50 pitanja, izvore i zatvaranje nalaza. Commit i integraciju vodi glavni zadatak.

Komande provere: `node --test tools/tests/content-audit.test.mjs`, `node tools/audit-content.mjs --write`, `node tools/audit-content.mjs --check`. Prolazak poslednje komande znači aktuelnu i potpunu evidenciju, ne potvrđenu tačnost sadržaja.
