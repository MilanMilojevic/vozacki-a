import fs from 'node:fs';
let s = fs.readFileSync('build-explanations.mjs', 'utf8');
let fails = 0;

// 1) premesti carG/arr helpere na vrh (pre const CARDS) da budu dostupni svim karticama
const helpStart = s.indexOf('// crtež automobila iz ptičje perspektive');
const helpEnd = s.indexOf("CARDS['slicni-pojmovi'] = {");
if (helpStart < 0 || helpEnd < 0) { console.log('FAIL helpers'); process.exit(1); }
const helpers = s.slice(helpStart, helpEnd);
s = s.slice(0, helpStart) + s.slice(helpEnd);
const cardsAt = s.indexOf('const CARDS = {');
if (cardsAt < 0) { console.log('FAIL CARDS'); process.exit(1); }
s = s.slice(0, cardsAt) + helpers + s.slice(cardsAt);
console.log('ok  [helperi premešteni na vrh]');

// 2) zameni oba panela (uzdužne + poprečne) novim, sa HTML natpisima i kontekstom
const p1 = s.indexOf('<p style="margin-top:10px"><b>Uzdužne linije');
const p2 = s.indexOf('<p><b>Boje (Pravilnik o signalizaciji čl. 59):</b>');
if (p1 < 0 || p2 < 0 || p2 < p1) { console.log('FAIL paneli', p1, p2); process.exit(1); }

const road = (w, h) => `<rect x="0" y="0" width="${w}" height="${h}" fill="#9aa7b4"/>`;
const noSign = (x, y) => `<g transform="translate(${x} ${y})"><circle r="11" fill="#fff" stroke="#c0392b" stroke-width="3"/><path d="M-5 -5 L5 5 M5 -5 L-5 5" stroke="#c0392b" stroke-width="3" stroke-linecap="round"/></g>`;
const yesSign = (x, y) => `<g transform="translate(${x} ${y})"><circle r="11" fill="#fff" stroke="#1f7a3f" stroke-width="3"/><path d="M-5 0 L-1 5 L5 -5" stroke="#1f7a3f" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;

const panel = `<p style="margin-top:12px"><b>Uzdužne linije (Pravilnik čl. 63-64)</b> — šta smeš, a šta ne:</p>
<div class="signRow lineRow">
  <div class="signCell">
    <svg viewBox="0 0 120 150">\${road(120, 150)}<line x1="60" y1="4" x2="60" y2="146" stroke="#fff" stroke-width="4" stroke-dasharray="16 12"/>
      \${carG(34, 112, '#2c6aa0')}<path d="M34 92 Q34 66 86 56" stroke="#2c6aa0" stroke-width="3" fill="none" stroke-dasharray="6 5"/>\${carG(86, 36, '#2c6aa0')}
      \${yesSign(100, 128)}</svg>
    <b>ISPREKIDANA</b><span>sme da se prelazi (uz ostala pravila)</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 120 150">\${road(120, 150)}<line x1="60" y1="4" x2="60" y2="146" stroke="#fff" stroke-width="4"/>
      \${carG(34, 100, '#2c6aa0')}<path d="M34 80 Q34 58 66 50" stroke="#c0392b" stroke-width="3" fill="none" stroke-dasharray="6 5"/>
      \${noSign(78, 44)}</svg>
    <b>NEISPREKIDANA</b><span>ne sme se prelaziti ni voziti po njoj</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 120 150">\${road(120, 150)}<line x1="54" y1="4" x2="54" y2="146" stroke="#fff" stroke-width="4"/><line x1="66" y1="4" x2="66" y2="146" stroke="#fff" stroke-width="4"/>
      \${carG(30, 104, '#2c6aa0')}\${carG(92, 46, '#5f6d7a', 180)}\${noSign(60, 128)}</svg>
    <b>UDVOJENA NEISPREKIDANA</b><span>zabrana važi za oba smera</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 120 150">\${road(120, 150)}<line x1="54" y1="6" x2="54" y2="144" stroke="#fff" stroke-width="4" stroke-dasharray="16 12"/><line x1="66" y1="6" x2="66" y2="144" stroke="#fff" stroke-width="4" stroke-dasharray="16 12"/>
      <rect x="26" y="6" width="68" height="26" rx="6" fill="#2a333d"/><path d="M42 12 L56 26 M56 12 L42 26" stroke="#c0392b" stroke-width="4" stroke-linecap="round"/>
      <path d="M74 12 L74 26 M74 26 L68 20 M74 26 L80 20" stroke="#1f9d55" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      \${carG(88, 100, '#2c6aa0')}</svg>
    <b>UDVOJENA ISPREKIDANA</b><span>traka sa izmenljivim smerom — važi semafor iznad trake</span>
  </div>
</div>
<div class="signRow lineRow">
  <div class="signCell wide">
    <svg viewBox="0 0 200 150">\${road(200, 150)}<line x1="94" y1="4" x2="94" y2="146" stroke="#fff" stroke-width="4"/><line x1="106" y1="6" x2="106" y2="144" stroke="#fff" stroke-width="4" stroke-dasharray="16 12"/>
      \${carG(58, 104, '#2c6aa0')}<path d="M58 84 Q58 62 84 54" stroke="#c0392b" stroke-width="3" fill="none" stroke-dasharray="6 5"/>\${noSign(76, 40)}
      \${carG(146, 46, '#1f7a3f', 180)}<path d="M146 66 Q146 92 120 102" stroke="#1f7a3f" stroke-width="3" fill="none" stroke-dasharray="6 5"/>\${yesSign(126, 118)}</svg>
    <b>KOMBINOVANA</b><span>gledaš liniju bliže SVOJOJ traci: <b>puna uz tebe = ne smeš</b> (levo vozilo) · <b>isprekidana uz tebe = smeš</b> (desno vozilo)</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 120 150">\${road(120, 150)}
      <line x1="60" y1="4" x2="60" y2="86" stroke="#fff" stroke-width="4" stroke-dasharray="26 8"/><line x1="60" y1="90" x2="60" y2="146" stroke="#fff" stroke-width="4"/>
      \${carG(34, 118, '#2c6aa0')}<text x="60" y="80" text-anchor="middle" font-size="13" fill="#fff" font-weight="bold">▲</text></svg>
    <b>LINIJA UPOZORENJA</b><span>duže crte = puna linija samo što nije počela; završi preticanje</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 120 150"><rect x="0" y="0" width="120" height="150" fill="#6b7f5e"/><rect x="16" y="0" width="104" height="150" fill="#9aa7b4"/>
      <line x1="22" y1="4" x2="22" y2="146" stroke="#fff" stroke-width="4"/><line x1="70" y1="6" x2="70" y2="144" stroke="#fff" stroke-width="3" stroke-dasharray="16 12"/>
      \${carG(46, 92, '#2c6aa0')}</svg>
    <b>IVIČNA LINIJA</b><span>označava gde se kolovoz završava (dalje je bankina)</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 120 150">\${road(120, 150)}<rect x="0" y="52" width="120" height="46" fill="#9aa7b4"/>
      <line x1="60" y1="4" x2="60" y2="48" stroke="#fff" stroke-width="4"/><line x1="60" y1="102" x2="60" y2="146" stroke="#fff" stroke-width="4"/>
      <line x1="36" y1="52" x2="36" y2="98" stroke="#fff" stroke-width="3" stroke-dasharray="6 6"/>
      <path d="M60 100 Q60 74 96 74" stroke="#fff" stroke-width="3" fill="none" stroke-dasharray="6 6"/>
      \${carG(60, 130, '#2c6aa0')}</svg>
    <b>LINIJA VODILJA</b><span>kratka isprekidana — vodi te kroz raskrsnicu</span>
  </div>
</div>
<p style="margin-top:12px"><b>Poprečne oznake (čl. 65-66)</b> — pružaju se popreko kolovoza:</p>
<div class="signRow lineRow">
  <div class="signCell">
    <svg viewBox="0 0 120 150">\${road(120, 150)}<rect x="6" y="60" width="108" height="10" fill="#fff"/>
      <text x="60" y="96" text-anchor="middle" font-size="20" fill="#fff" font-weight="bold">STOP</text>\${carG(60, 122, '#2c6aa0')}</svg>
    <b>LINIJA ZAUSTAVLJANJA</b><span>mesto ispred koga se staje (uz znak ili crveno svetlo)</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 120 150">\${road(120, 150)}<path d="M10 146 L58 20 M32 146 L80 20 M54 146 L102 20" stroke="#fff" stroke-width="7"/>
      \${carG(30, 120, '#2c6aa0')}<path d="M30 100 Q30 74 78 66" stroke="#2c6aa0" stroke-width="3" fill="none" stroke-dasharray="6 5"/></svg>
    <b>KOSNIK</b><span>traka se zatvara — pređi u susednu</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 120 150">\${road(120, 150)}
      <path d="M14 132 L106 132 M22 116 L98 116 M30 100 L90 100 M38 84 L82 84 M46 68 L74 68" stroke="#fff" stroke-width="6"/>
      <path d="M104 40 Q84 52 70 62" stroke="#fff" stroke-width="3" fill="none" stroke-dasharray="6 5"/></svg>
    <b>GRANIČNIK</b><span>deo kolovoza na kome je saobraćaj zabranjen (ulivanje sa prilaza)</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 120 150">\${road(120, 150)}<path d="M18 142 L60 24 L102 142 Z" fill="none" stroke="#fff" stroke-width="5"/>
      <path d="M40 142 L60 86 L80 142" fill="none" stroke="#fff" stroke-width="5"/>
      \${carG(28, 96, '#2c6aa0')}\${carG(92, 96, '#5f6d7a')}</svg>
    <b>POLJE ZA USMERAVANJE</b><span>razdvaja tokove — po njemu se ne vozi ni ne parkira</span>
  </div>
</div>
`;
s = s.slice(0, p1) + panel + s.slice(p2);
if (fails) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync('build-explanations.mjs', s);
console.log('ok  [paneli linija prerađeni sa kontekstom i HTML natpisima]');
