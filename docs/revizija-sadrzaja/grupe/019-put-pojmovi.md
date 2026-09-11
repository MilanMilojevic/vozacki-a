# A6-019 — Put, kolovoz, trake

Datum 2026-09-11, v175. A1 je pregledao celu karticu na oba pisma, jedini SVG i svih deset stvarnih situacija; A0 je nezavisno proverio 27 predloženih fragmenata i generisane odeljke. Root je primenio samo odobrene izmene, pročitao završni tekst oba pisma i proverio produkcioni prikaz.

Tekst sada precizno razlikuje pojmove puta i trake, uslove motoputa, prvenstvo pri uključivanju sa zemljanog puta, zaustavljanje i parkiranje. Vraćeni su uslovi zona, vremensko važenje školskog ograničenja, nezavisna obaveza gašenja motora posle propisanog roka i tačan domet zabrane odlaganja otpada. Podsetnik o netačnim brojevima odnosi se izričito na 12 pregledanih pitanja, bez obećanja svih poena. U tabeli gašenja motora nema nedokazanog uzročnog objašnjenja niti ponavljanja cele susedne ćelije.

U šemi jedne saobraćajne trake sada je jedan simbol automobila, umesto tri uporedna. Okviri, njihova geometrija i osnovne boje ostaju isti. Sitni natpisi povećani su na 15 izvornih px; šest osnovica malo pomereno radi razmaka. Smanjena neprozirnost tri složene sive podloge daje dovoljan kontrast svetlom tekstu u tamnoj temi. Postojeći mehanizam lokalnog prevoda dobio je jedan pristupačni opis. Nema novih funkcija ili promene simulacije.

Primarni izvori: [ZOBS kroz 19/2025](https://reg.pravno-informacioni-sistem.rs/api/viewAct/8b57d1e9-9b34-4fa0-9693-7ceb6da65486?lawActId=438311), član 7 tačke 5–6, 9–12, 21, 30, 71–72 i članovi 47, 160–164; [signalizacija kroz 76/2026](https://reg.pravno-informacioni-sistem.rs/api/viewdoc?doctype=reg&regactid=440491&uuid=2bd446cf-0965-4141-8323-d207a4216ed1), član 35 tačke 21–22. Kriterijum tekstualnog kontrasta je [WCAG 2.2, 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html); 12 px je praktični cilj čitljivosti, ne WCAG propisana veličina.

Root provera u stvarnom Chromium-u: 12/12 prikaza pojmovnika na 320/390/1280 px, oba pisma i teme. Svih deset slika je učitano, svaki natpis i tačan odgovor odgovara bazi, redosled je očuvan. Nema prelivanja stranice ili preklapanja natpisa; najmanji prikazani font je 12,09375 px, najniži kontrast 4,795246648:1. Dodatnih 8/8 prikaza uz pitanje imaju najmanji font 13,5 px. Provereni su mobilno uvećanje, fit i Escape; sintetički napredak nije izmenjen. Neposredno pregledani završni SVG oba pisma.

Izvorna inverzija potvrđuje samo odobrene fragmente, četiri NUL bajta i nepromenjenost svih ostalih EX podataka. Obe sekcije i svih sedam podnaslova ostaju potpuni. `node tools/verify.mjs`: 249/249. Cela kartica i njena 24 prethodno pojedinačno pregledana pitanja sada se zatvaraju. To ne zatvara druga stručna pitanja ili ostale kartice.

Radni dokazi: `output/revizija-20260911/019/records.json`, `root-integration-proof.json`, `root-browser-result.json`, `root-inline-result.json`, `root-verify.log` i nezavisni pregled `../023/review.md`.
