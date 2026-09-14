# A6-085/091 — porodice znakova

Datum: 2026-09-14. Verzija: v211. Dva potpuna pregleda cele kartice znakovi-porodice,28 pitanja/90 opcija/21 originalnog JPEG i svih starih/novih EX oba pisma. Kartica ima12 svojih implicitno povezanih pitanja i16 kontekstnih,10 postojećih SVG,17 atlas i4 situacione slike,0 tabela i4 runtime odeljka. U ledger se knjiži samo12 svojih:6 ispravljenih i6 neizmenjenih, bez novih needs-expert.

## Ispravke

Oblik i boja predstavljeni su kao pomoć u prepoznavanju uz zakonske izuzetke, ne kao bezuslovni ključ za klasifikaciju. Pojašnjena je potpuna podela izričitih naredbi i obaveznost označenog režima. Šest EX uklanja preširoke zaključke o najavi, obaveštenjima i dopunskim tablama; sat na parking-znaku ne dokazuje naplatu, a izuzimajući tekst može menjati obim obaveze.

Dva postojeća crteža zone30 ispravljena su prema primarnom prikazu: crni spoljašnji okvir, ZONA iznad kruga, završetak sa crno-belim umetnutim znakom i crnim paralelnim dijagonalama. Ranija crvena dijagonala bila je sadržinska greška. Tri plava simbola dobijaju belu konturu radi razlikovanja od tamne pozadine. Dva postojeća reda koriste wrapRow; svi10SVG imaju precizne opise oba pisma. Nema novih dijagrama, globalnog CSS ili promene ispitnih slika.

Prihvaćeno28 lokalnih kartičnih operacija, jedna ARIA dopuna i6 EX; root ih spaja u8 jednoznačnih izvornih zahvata. Drugi pregled ne dodaje ništa preko zamrznutog085. Ključevi, pitanja, opcije, veze i simulacija su očuvani.

Puni relevantni [SIGNAL76/2026](https://reg.pravno-informacioni-sistem.rs/api/viewdoc?doctype=reg&regactid=440491&uuid=2bd446cf-0965-4141-8323-d207a4216ed1)6,18–26,28–29,34–35,43–45,49–52,55–57 i odvojene prelazne odredbe; [ZOBS19/2025](https://reg.pravno-informacioni-sistem.rs/api/viewAct/8b57d1e9-9b34-4fa0-9693-7ceb6da65486?lawActId=438311)20,47,132–135,166. Sveži HTTP14Sep potvrđuju primarne bajtove; III-27/27.1 pregledani neposredno. Nije stručna pravna potvrda.

## Dokazi i provera

Nezavisni091:224 stvarna odgovaranja,720 prikaza opcija,168 učitavanja originalnih slika;16 celih kartica,160 SVG prikaza i80 stvarnih SVG uvećanja tastaturom, dodatno uvećanje/pomeranje, Escape i povratak fokusa. Sopstveni pre/posle/vrati dokaz daje L351→320→351px, C320→320→320px i u oba pisma5→0→5 unutrašnjih prekoračenja. SVG najmanji stvarni font16,575px, tekstualni kontrast5,43840:1 i bitne grafičke granice3,42937:1. Namerni crni potezi poništavanja nisu tretirani kao slučajno preklapanje teksta.

Root na integrisanom v211 bez injekcije kandidata potvrđuje16 celih kartica/160 SVG/80 SVGzoom i224 stvarna odgovaranja/720 opcija, oba pisma/teme320/1280; odgovori pri tačnih200%. Ceo autorski tekst, kartica i EX jednaki očekivanju, slike učitane, sve sekcije otvorene, dostupni završeci odgovora, nema prelivanja ili pageerror. SVG se meri preko CTM, ne tvrdi se da root200% udvostručuje njegov fiksni font.

Četiri spoljna084 objašnjenja9221/9236/10988/10989 u ranijem091 browser snimku još su stara; jasno su odvojena u zapisniku, a pri završnom pregledu pročitane su tačne084 dopune. Root v211 koristi i proverava već integrisane v210 vrednosti tih četiri EX. Ovih16 kontekstnih pitanja nije ponovo brojano kao nova revizija.

Pre integracije091 read-only verifier prolazi na v210; root dodatno potvrđuje svih460 zamrznutih fajlova085/091, ceo OLD==v210 runtime, samo odobrenu karticu/6EX, originalni SUB, četiri NUL i tačnu obrnutu primenu. Source SHA8cd837eb62645cdacc797944f469181b48025ff00ed0b038aeb2ff7ae4cde3df. Korisnikov Chrome/napredak i8137/18980 nisu korišćeni; root19171 sa odbačenim praznim kontekstima.

Dokazi: output/revizija-20260911/085/{report.md,root-approved.json,root-integration-proof.json,root-scope-v211.json,root-integrated-browser-result.json,root-verify-v211.log};091/{report.md,individual-records.json,card-operation-review.json,verification.json,cards-browser-result.json}. Lokalna Chromium provera nije fizički telefon ili WCAG sertifikat. Rezultat celog projektnog verifikatora beleži IZVRSAVANJE-PLANA.md.
