# A6-012 — osnovna načela

Pregled 11. septembra 2026: Codex A0; nezavisan pregled ispravki root. Pročitano svih osam pitanja podoblasti 91: **7921, 7922, 7923, 7924, 7925, 7927, 7928, 7929**, svih 29 ponuđenih odgovora i sva objašnjenja na oba pisma. Sva pitanja su bez slike. Ključevi, bodovi i potreban broj odgovora ostaju isti; nije izvršeno poređenje sa privatnom ispitnom bazom niti potvrda instruktora.

Primarni izvori: [PIS ZOBS kroz 19/2025](https://reg.pravno-informacioni-sistem.rs/api/viewAct/8b57d1e9-9b34-4fa0-9693-7ceb6da65486?lawActId=438311), članovi 2, 3, 5, 6 i 166; [Pravilnik o kontroli i neposrednom regulisanju, 11/2024](https://pravno-informacioni-sistem.rs/eli/rep/sgrs/ministarstva/pravilnik/2024/11/5/reg), član 2. A0 je neposredno otvorio pravilnik, root proverio zakonske odredbe i sve predložene tekstove. PIS ZOBS SHA-256 `8796f6a1718bea08ea4fe1dedb3c9a71001b1c6c5245a93526f365a61e668d5d`.

| ID | Rezultat |
| --- | --- |
| 7921 | Uniforma kod neposrednog regulisanja potkrepljena odgovarajućim pravilnikom; uklonjen pogrešan uzročni prečac preko tehničkog regulisanja. |
| 7922 | Kontrola je po pravilu u uniformi, a izuzetno vozača/vozila u građanskom odelu. |
| 7924 | Za radnike dodati prepreka koja se ne može odmah ukloniti i najmanje dva određena radnika. |
| 7925 | Vraćen uslov da izbegavanje/otklanjanje opasnosti ne ugrozi samog učesnika ili drugoga. |
| 7929 | Programi i patrole pripisani odgovarajućim nadležnim organima, bez nepreciznog zbirnog pripisivanja ustanovama/školama. |
| 7923, 7927, 7928 | Individualna objašnjenja prihvaćena bez izmene. |

Promenjeno je samo pet `byQ.x` na oba pisma. Ostala 1.322 objašnjenja, 39 kartica i svi zvanični podaci identični su osnovi pre ovog paketa. Potvrđeni su tačna inverzija izvornih zamena, četiri NUL razdvajača i jednakost oba generisana pisma odobrenim predlozima.

Svih osam zapisa ostaje `in-progress`: zajednički naziv podoblasti na ćirilici počinje latiničnim `O`, što se po metodologiji računa u proveru pisma. Pokušaj regenerisanja za slovnu ispravku otkrio je da se redosled ponuđenih odgovora u javnim ulaznim fajlovima razlikuje od sadašnjeg runtime-a; pokušaj je povučen i vodi se zasebno. Ovde nije promenjeno nijedno slovo ili redosled zvanične baze.

Za 7924 je otvorena cela povezana kartica `razno-pravila`, a za 7925 i `zamke-odgovori`. Šest ostalih pitanja ima eksplicitni `nocard`; njihovo odsustvo kartice nije greška. Zatvaranje preostalih slojeva ne pretpostavlja da su te dve velike kartice već proverene.
