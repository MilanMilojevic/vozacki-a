# Grupa 006 — tačnost sedam odgovora u Čestim pitanjima

Datum: 2026-09-10. Izvršilac: Codex `/root`; nezavisni pregled: `/root/a0_sanitize`.

Promenjena je samo kartica `faq`: šest odgovora na postojeća pitanja, na oba pisma. Svih sedam naslova, redosled i odgovor o ponavljanju ostali su isti. FAQ se prikazuje na početnoj unutar „O vežbaonici”; nema vezanih pitanja, slika ili SVG-ova.

| Postojeće pitanje | Potvrđeni nalaz i ispravka |
| --- | --- |
| Gde se čuva napredak? | Uklonjena neutemeljena pretpostavka da je nestali napredak najverovatnije na drugoj adresi. Navedeni profil/adresa i mogućnost odvojenog skladišta; sačuvano uputstvo za izvoz/uvoz. |
| Da li restart briše napredak? | Uklonjena apsolutna tvrdnja da ga brišu samo alati za čišćenje i da povezivanje fajla garantuje svaki upis. Uobičajen restart razdvojen od privatne sesije, brisanja i greške skladišta; uspešna rezerva zahteva dovršen upis. |
| Zašto je simulacija jednostavnija? | Sačuvani svetla tema, odsustvo pomoći i objašnjenja posle predaje. Tvrdnja o vernoj kopiji svakog pravog ispita ograničena na šest posmatranih izvlačenja. |
| Kako radi Ponavljanje? | Ceo postojeći odgovor pregledan prema `record`, `inQueue`, `dueOf` i dnevnim brojačima; ostaje nepromenjen. |
| Šta je broj pitanja? | Identifikator u uvezenoj bazi za poređenje i prijavu; nema tvrdnje o novoj proveri portala. |
| Mala slova i km/h | Opisan zadržani zapis konkretne baze i ista oznaka km/h na oba pisma; uklonjena garancija budućeg izgleda ispita i preširoka tvrdnja o svim SI simbolima. |
| Da li su objašnjenja zvanična? | Jasno piše da su dodata za učenje i da revizija traje; poreklo pitanja i oznaka tačnih odgovora ostaje razdvojeno. |

Izvor za ponašanje je pregledani `app.js` kroz v150: `load`/`save`, faze automatske rezerve, `record`/`inQueue`/`dueOf`, svetla simulacija i `trustBody` sa šest posmatranih izvlačenja; README/RAZVOJ su upoređeni sa kodom. Dopunski su pročitani [MDN localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) (origin, privatna sesija, nedefinisano ponašanje file adresa) i [Chrome File System Access](https://developer.chrome.com/docs/capabilities/web-apis/file-system-access) (pisanje i zatvaranje toka). Nema nove pravne saobraćajne tvrdnje, pa je `legalSource` opravdano `not-applicable`, kao i `image`.

Root i nezavisni recenzent pročitali su svih sedam novih odgovora na oba pisma. Inverzija šest tačnih zamena vraća prethodni generatorski izvor; sva četiri NUL bajta su očuvana. Parsiranje potvrđuje **1.327 nepromenjenih byQ**, **38 nepromenjenih drugih kartica**, iste druge mape, datum, `data.js` i slike. Naslovi i odgovor o ponavljanju su isti i u generisanom izlazu.

Root je proverio 16 novih browser konteksta (320/1280 px, oba pisma/teme, 100/200% osnovnog teksta) na zamrznutom v148 runtime-u sa novim FAQ. U svih 16 su vidljivi svi odgovori, tačan redosled, otvaranje/zatvaranje i nepromenjen zapis napretka, bez JS grešaka. Ukupna provera rasporeda ima **12/16 PASS**: pri 320 px i 30 px tekstu duga postojeća GitHub adresa u odvojenom `trustBody` širi stranicu na 527 px. Nezavisno poređenje starog/novog FAQ i zatvorene kartice potvrđuje da je prelivanje prethodno postojalo; nije izazvano novim odgovorima i ostaje zaseban CSS paket. Ne skrivati taj nalaz promenom testa. Nezavisni recenzent dodatno proverio četiri normalna prikaza oba pisma na 320/1280, bez nalaza.

Kartica FAQ ima završen sadržajni i dvojezični pregled. Ovo nije potvrda pune pristupačnosti/200% rasporeda aplikacije; CSS i runtime nisu deo otiska kartice. Status ostalih pitanja/kartica se ovim paketom ne zatvara.

Dopuna v152: odvojeno pravilo `.trustList a` ispravlja prelivanje i kontrast postojeće adrese, bez promene FAQ sadržaja. Root je ponovio istih 16 konteksta na integrisanom runtime-u: **16/16 PASS**, uz nepromenjen zapis napretka. Cela mobilna provera prolazi **410/410**. Prethodni nalaz o širini stranice je zatvoren; ograničenje u pogledu pune provere pristupačnosti ostaje.
