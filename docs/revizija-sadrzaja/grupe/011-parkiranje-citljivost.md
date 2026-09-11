# A6-011 — čitljivost crteža parkiranja

11. septembar 2026, v170. Autor i puni vizuelni pregled: Codex learning_visual_second_review; nezavisna provera izvora, integrisanog prikaza i tokova: root. Sadržaj je prethodno pravno pregledan u grupama 008/009, a kontrast u 010. Ovo je završetak konkretnih otvorenih vizuelnih provera.

Na 320 px osnovni crtež širok je258px, pa su izvorni natpisi11/12px padali na9,27/10,12 stvarnih piksela. Sada su obični natpisi15 izvornih piksela, najmanje **12,65 stvarnih px**. Veličina teksta aplikacije sama ne povećava font unutar SVG-a.

## Obuhvat

Promenjeno je90 oznaka u18 postojećih SVG. Gde duži natpis ne staje, prelomljen je u dva reda ili pomeren u slobodan prostor; dve crvene podloge i podloga „TI” prilagođene su tekstu. SVG1 dobija malo viši donji okvir, a SVG10 kraću pomoćnu vodeću liniju. Putanje puteva, strelice, obojeni simboli, službeno slovo P i SVG13 ostaju isti. Napomene SVG17 stoje iznad putanje animiranog vozila.

Sve reči i pristupačni opisi na oba pisma, pravni tekst i tabele ostaju identični. Nema promene svih1.327 individualnih objašnjenja, drugih38 kartica, javne banke ili704 originalne slike. Root proverio tačnu inverziju18 zamena i četiri NUL razdvajača izvora. Pojedinačna objašnjenja nisu dopisivana radi ove promene.

## Provere

- Autor i root, zasebno: **48 postavki /912 SVG**, oba pisma/teme, 320/390/1280, pojmovnik i prikaz uz pitanje, osnovni/povećani font, dodatno200% korenskog teksta. Nema izlaska SVG-a ili natpisa, sudara tekstova ni prekrivanja crteža kontrolama. Root minimum12,6455966px.
- Autor je ponovio postojeće tekstualne provere **728/728**, najmanji kontrast4,834; grafičke **120/120** i obrise **216/216**. Svi38 završnih snimaka neposredno pregledani. Root zasebno pogledao12 kandidatskih ičetiri nova integrisana crteža.
- Root nad v170: **54/54** stvarna toka svih27 pitanja na oba pisma; čuvaju se uvezeni ključevi, tačan broj odgovora, slike i tekstovi. Svaka postojeća veza otvara koristan odgovarajući odeljak.
- Root i autor: **24/24** uvećanja za šest pomeranih/prelomljenih crteža; **8/8** položaja animiranog vozila. Ceo crtež staje u okvir, kontrole ga ne prekrivaju, Escape vraća fokus, sintetički S/SIM i profil ostaju isti.

## Zatvaranje i granice

Kartica dobija `reviewed`, kao i **26 pitanja**: 10052,10054,10055,10057,10058,10060,10065,10066,10068,10071,10073,10090,10091,10092,10101,10111,10113,10117,10118,10120,10141,10142,10499,10500,10507,10528. Njihov raniji pregled pitanja/objašnjenja/slika/izvora ostaje potvrđen dokazom nepromenjenosti i ponovljenim tokovima. **10061 ostaje in-progress** zbog dodatne nezavršene kartice `oznake-kolovoz`.

Poboljšanje nije potvrda potpune WCAG usaglašenosti niti tvrdnja da WCAG propisuje minimum12px. Pri200% korenskog teksta na320px latinični pasus van SVG-a ima poznato horizontalno prelivanje; to je zasebna minimalna ispravka A4-020. Osnovno i aplikacijsko povećanje fonta ovde nemaju prelivanje stranice. Izvori ostaju isti PIS ZOBS/signalizacija registrovani u008/010, sveže provereni istim otiscima. Nema nove instruktorske potvrde.

Lokalni dokazi i reprodukcija: `output/revizija-20260911/011/root-integration-proof.json`, `root-measure.browser.js`, `root-links.browser.js`, `root-motion-zoom.browser.js` i odgovarajući logovi. Izvorni SHA-256: `824d139d6bdfde31cbd253182faefa586859ff8c31f2b394dd43bc74e77f2f46`.
