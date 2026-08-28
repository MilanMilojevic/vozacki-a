import fs from 'node:fs';
let s = fs.readFileSync('build-explanations.mjs', 'utf8');
const anchor = '<p><b>Boje (Pravilnik o signalizaciji čl. 59):</b>';
if (s.split(anchor).length - 1 !== 1) { console.log('FAIL anchor'); process.exit(1); }
const panel = `<p style="margin-top:10px"><b>Uzdužne linije (Pravilnik čl. 63-64)</b> — kako izgledaju:</p>
<svg viewBox="0 0 470 148" role="img" style="max-width:470px;width:100%;display:block;margin:4px auto">
  <g font-size="9.5" text-anchor="middle" fill="#334">
    <rect x="8" y="4" width="46" height="112" fill="#9aa7b4"/><line x1="31" y1="8" x2="31" y2="112" stroke="#fff" stroke-width="3" stroke-dasharray="14 10"/>
    <text x="31" y="128">isprekidana</text><text x="31" y="139" fill="#667">sme preko</text>
    <rect x="74" y="4" width="46" height="112" fill="#9aa7b4"/><line x1="97" y1="6" x2="97" y2="114" stroke="#fff" stroke-width="3"/>
    <text x="97" y="128">neisprekidana</text><text x="97" y="139" fill="#667">ne sme preko</text>
    <rect x="140" y="4" width="46" height="112" fill="#9aa7b4"/><line x1="158" y1="6" x2="158" y2="114" stroke="#fff" stroke-width="3"/><line x1="168" y1="6" x2="168" y2="114" stroke="#fff" stroke-width="3"/>
    <text x="163" y="128">udvojena puna</text><text x="163" y="139" fill="#667">ne sme niko</text>
    <rect x="206" y="4" width="46" height="112" fill="#9aa7b4"/><line x1="224" y1="8" x2="224" y2="112" stroke="#fff" stroke-width="3" stroke-dasharray="14 10"/><line x1="234" y1="8" x2="234" y2="112" stroke="#fff" stroke-width="3" stroke-dasharray="14 10"/>
    <text x="229" y="128">udvojena isprekidana</text><text x="229" y="139" fill="#667">izmenljiv smer</text>
    <rect x="272" y="4" width="46" height="112" fill="#9aa7b4"/><line x1="290" y1="6" x2="290" y2="114" stroke="#fff" stroke-width="3"/><line x1="300" y1="8" x2="300" y2="112" stroke="#fff" stroke-width="3" stroke-dasharray="14 10"/>
    <text x="295" y="128">kombinovana</text><text x="295" y="139" fill="#667">važi bliža tebi</text>
    <rect x="338" y="4" width="46" height="112" fill="#9aa7b4"/><line x1="361" y1="6" x2="361" y2="114" stroke="#fff" stroke-width="3" stroke-dasharray="22 6"/>
    <text x="361" y="128">upozorenja</text><text x="361" y="139" fill="#667">najava pune</text>
    <rect x="404" y="4" width="58" height="112" fill="#9aa7b4"/><line x1="411" y1="6" x2="411" y2="114" stroke="#fff" stroke-width="3"/><line x1="433" y1="8" x2="433" y2="112" stroke="#fff" stroke-width="2.5" stroke-dasharray="14 10"/>
    <text x="433" y="128">ivična</text><text x="433" y="139" fill="#667">ivica kolovoza</text>
  </g>
</svg>
<p style="margin-top:10px"><b>Poprečne i ostale oznake (čl. 65-67)</b>:</p>
<svg viewBox="0 0 470 128" role="img" style="max-width:470px;width:100%;display:block;margin:4px auto">
  <g font-size="9.5" text-anchor="middle" fill="#334">
    <rect x="8" y="4" width="86" height="96" fill="#9aa7b4"/><rect x="14" y="24" width="74" height="9" fill="#fff"/>
    <text x="51" y="60" fill="#fff" font-size="11" font-weight="bold">STOP</text>
    <text x="51" y="114">linija zaustavljanja</text>
    <rect x="122" y="4" width="86" height="96" fill="#9aa7b4"/>
    <path d="M130 96 L170 12 M143 96 L183 12 M156 96 L196 12" stroke="#fff" stroke-width="5"/>
    <text x="165" y="114">kosnik (zatvaranje trake)</text>
    <rect x="236" y="4" width="86" height="96" fill="#9aa7b4"/>
    <path d="M244 90 L314 90 M250 78 L308 78 M258 66 L300 66 M266 54 L292 54" stroke="#fff" stroke-width="4"/>
    <text x="279" y="114">graničnik (zabranjen deo)</text>
    <rect x="350" y="4" width="110" height="96" fill="#9aa7b4"/>
    <path d="M362 92 L405 16 L448 92 Z" fill="none" stroke="#fff" stroke-width="4"/>
    <path d="M382 92 L405 52 L428 92" fill="none" stroke="#fff" stroke-width="4"/>
    <text x="405" y="114">polje za usmeravanje</text>
  </g>
</svg>
` + anchor;
s = s.split(anchor).join(panel);
fs.writeFileSync('build-explanations.mjs', s);
console.log('oznake paneli ubačeni');
