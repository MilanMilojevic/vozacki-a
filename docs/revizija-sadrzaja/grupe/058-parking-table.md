# A6-058 — dopunske table za parkiranje

Datum: 2026-09-14. Verzija: v194. **10 pitanja /30 opcija /10 originalnih JPEG**, cela kartica oba pisma i9 postojećih SVG. Nema atlasa ni situacija. Nijedno individualno objašnjenje, pitanje, opcija, ključ, bod, redosled, slika ili veza nije promenjena.

## Ispravke

Kartica je šeme odozgo opisivala kao doslovan izgled dopunskih tabli. Na stvarnim znakovima vidi se viši trotoar/niži kolovoz i prednji, bočni ili kosi izgled automobila. Uvod sada jasno razdvaja ta dva pogleda. Dopunjen je uslov slobodnog prolaza najmanje1,60m, koji ne sme biti uz ivicu kolovoza. Jedna kratka rečenica objašnjava rezervisano mesto9235, čija ranija veza nije imala odgovarajuće objašnjenje u kartici.

Svih9 scena ima isti crtež/boje/geometriju; dodat je konkretan pristupačni opis svakog položaja, i preveden kroz postojeću ograničenu ARIA petlju. To su13 lokalnih fragmenata u kartici i ukupno dve operacije u generatoru, bez opšteg novog prevodioca ili promene grupisanja. Kartica nije u PO_TEMAMA; capCells/uklanjanje komentara i oba pisma reprodukovani su tačno. Četiri NUL bajta ostaju.

Nezavisna browser provera otkrila je i prethodno postojeće prelivanje pri320px/ćirilici/200% osnovnog fonta: reč u naslovu „Паркиралиште” nije mogla da se prelomi. Izolovano poređenje staro/kandidat/kandidat+pravilo potvrđuje322→320px. Jedina CSS izmena je #browseList > h3 { overflow-wrap: anywhere; }. Ne smanjuje slova niti menja crteže. App.js i simulacija nisu menjani.

## Dokazi i granice

- [Pravilnik/PIS](https://reg.pravno-informacioni-sistem.rs/api/viewdoc?doctype=reg&regactid=440491&uuid=2bd446cf-0965-4141-8323-d207a4216ed1) i [ZOBS/PIS](https://reg.pravno-informacioni-sistem.rs/api/viewAct/8b57d1e9-9b34-4fa0-9693-7ceb6da65486?lawActId=438311). Sveži14.9 HTTP200 odgovori iz nezavisnih059/060 provera identični su sačuvanim primarnim bajtovima; nema novih kopija celih zakona. Root pročitao ceo66, odredbe55(10–15) i neposredno pogledao svih10 službenih tabli iz primary-plates.png.
- Prvi započeti058 pripremio je predloge; root je preuzeo nedovršen paket posle prekida korišćenja, pročitao svih10 pitanja/30 opcija i ceoEX L/C, pojedinačno svih10 originalnih JPEG, celu staru/novu karticuL/C i svih9L+9C crteža. Završni nezavisni pregled062 odvojeno beleži svoje nalaze; nedovršen prvi browser prolaz nije predstavljen kao završena potvrda.
- Root kandidat i integrisani Chromium po16/16 kartičnih konteksta:320/1280,L/C,obe teme,100/200% osnovnog fonta;40/40 prikaza pitanja. Tačni podaci/EX/veze i9ARIA; bez grešaka, pageoverflow ili sintetičkih storage upisa. SVG nemaju tekstualne elemente, pa se ne izmišlja minimum SVG fonta. Crno-bela geometrija je bajtovski ista; HTML natpisi nisu smanjeni.
- Potpuna source rekonstrukcija iz dve evidentirane operacije,9 nepromenjenih geometrija posle uklanjanja ARIA, svi ostali EX/byQ identični. Dokazi:058/root-approved.json,root-source-operations.json,root-integration-proof.json,root-title-wrap-proof.json,root-browser-result.json; nezavisni062. Automatska provera: node tools/verify.mjs, ignored058/root-verify-v194.log.
- Ovo nije fizički telefon ili opšta WCAG sertifikacija. Nema novog needs-expert nalaza ove grupe.

| ID | Nezavisno pročitan znak i izbor |
|---:|---|
|9214|Niži deo, prednji izgled: kolovoz/paralelno; IV-17. Svi ostali ponuđeni položaji provereni; ključ očuvan.|
|9215|Viši deo, prednji izgled: trotoar/paralelno; IV-11. Svi ostali ponuđeni položaji provereni; ključ očuvan.|
|9226|Viši deo, kosi izgled: trotoar/pod uglom; IV-10. Svi ostali ponuđeni položaji provereni; ključ očuvan.|
|9227|Viši deo, bočni profil: trotoar/upravno; IV-12. Svi ostali ponuđeni položaji provereni; ključ očuvan.|
|9228|Točkovi na oba nivoa, kosi izgled: oba dela/pod uglom; IV-13. Svi ostali ponuđeni položaji provereni; ključ očuvan.|
|9229|Oba nivoa, nagnut prednji izgled: oba dela/paralelno; IV-14. Svi ostali ponuđeni položaji provereni; ključ očuvan.|
|9230|Oba nivoa, bočni profil: oba dela/upravno; IV-15. Svi ostali ponuđeni položaji provereni; ključ očuvan.|
|9234|Niži deo, kosi izgled: kolovoz/pod uglom; IV-16. Svi ostali ponuđeni položaji provereni; ključ očuvan.|
|9235|Simbol invalidskih kolica uz P rezerviše parkiranje, ne garažu/prolaz; IV-21. Nova kratka rečenica opravdava postojeću konkretnu vezu. Svi ostali ponuđeni položaji provereni; ključ očuvan.|
|10614|Niži deo, bočni profil: kolovoz/upravno; IV-18. Svi ostali ponuđeni položaji provereni; ključ očuvan.|
