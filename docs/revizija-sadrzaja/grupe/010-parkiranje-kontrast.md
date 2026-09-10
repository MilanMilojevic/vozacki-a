# 010 — kontrast postojećih crteža parkiranja

Datum: 2026-09-10, v164. Autor: Codex /root/learning_visual_second_review; integracija i pregled svih izmena: /root; nezavisan pregled: /root/a0_sanitize.

Izmenjeno je 18 od 19 SVG-ova kartice `parkiranje`. Tamnija podloga kolovoza razdvaja bele oznake; tekst van kolovoza prati temu; siluete vozila i šine imaju jasne ivice. Crveni i zeleni simboli zadržavaju značenje i boju, uz belu obodnu liniju. Originalni znak II-41.1 ostaje identičan. Tri male korekcije natpisa sprečavaju da linija prelazi preko slova: kraća pokazna linija uz biciklistkinju, pomeren natpis nizbrdice i podloga ispod „TI”.

Obe verzije svih reči, ARIA opisa, tabela, veličina fontova i viewBox okvira su iste. Svih 1.327 pojedinačnih objašnjenja, uključujući 17 ispravljenih u grupi 009, i ostalih 38 kartica ostaju nepromenjeni. Nema izmene zvaničnih pitanja, opcija, ključeva, poena ili 704 originalne slike.

## Provera

- Tekst: ranije 236 neuspešnih uzoraka; sada **728/728**, minimum **4,83449:1**. Meri se boja teksta prema stvarno sastavljenoj SVG pozadini ispod slova.
- Važni oblici: ranije 72 neuspešna uzorka; sada **120/120**, uz **216/216** provera vidljivog obruba obojenih oznaka.
- Oba pisma, obe teme, 320 px i najveće podešavanje teksta u aplikaciji; direktna kartica i prikaz uz pitanje. Root je ponovio obe trajne browser provere nad integrisanom v164; nema pageerror grešaka. Autor i nezavisni recenzent pregledali su sve izmenjene crteže, root sve izvorne razlike i pet kritičnih mobilnih snimaka.
- Tačna inverzija 18 zamena vraća prethodne bajtove generatorskog izvora. Četiri NUL separatora i ispravka putanja generatora su očuvani. Poređenje parsiranog izlaza potvrđuje navedeni obim; ponovljena generacija je identična.

Trajne provere: `tools/tests/parkiranje-text-contrast.browser.js` i `parkiranje-shape-contrast.browser.js`. Pokreću se Playwright CLI-jem nad zasebnom localhost kopijom i prave nove sintetičke kontekste. Svaka prekida proveru pri nalazu, gubitku očekivanog obuhvata ili grešci stranice. Za ovu promenu boja nije ponavljana matrica svih 216 tokova pitanja.

Generatorski SHA-256: `4e0a232e894ace554e26fd738b68d72dff29b07bd76e57dc4894d180b3d2a176`; generisani izlaz: `e1c2706b62bdcfa972962cbdd4029aba29483b19064c391c191880023f20e89c`.

Pragovi su zasnovani na W3C objašnjenjima za [tekstualni kontrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) i [kontrast važnih grafičkih oblika](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html). Ovo je ograničena regresiona provera crteža, ne potvrda potpune WCAG usklađenosti aplikacije.

## Šta ostaje otvoreno

Kartica ostaje `in-progress`, sa `image: unreviewed`: oznake u osnovnom mobilnom prikazu i dalje padaju na približno 9,27 px; veličina i prelom su paket 011. Popravka zajedničkog uvećanja proverava se zasebno. Svih 27 pitanja parkiranja zadržava otvoren `cardLinks`; pitanje 10061 dodatno čeka karticu `oznake-kolovoz`. Ponovo su potvrđene samo ranije sadržajne provere delova čija je nepromenjenost dokazana; istorija pregleda je sačuvana. Nema novih pitanja označenih kao potpuno pregledana.
