// Clasifica las partidas del BC3 de Névola según el alcance modular
// FUERA = lo ejecuta el promotor u otra contrata; SUST = lo sustituye el sistema modular; IGUAL = se ejecuta igual (fábrica u obra)
const { out } = require('./tree.json');
const capOf = o => (o.path[0] || '');
const FUERA_CAP = ['C.01', 'C.02', 'C.16', 'C.17', 'C.18', 'C.19', 'C.20'];
const set = s => new Set(s.split(/\s+/).filter(Boolean));
const FUERA = set(`
  UAP011 ASB020 ASB010b 0324SH0502 203b 208 209 210 0324SH0204 212 HRP060 ISD009 IVN110
  CMP010 301 CSZ020 CSZ030 CAV030 CAV030b CSL010 EHL010 CCS030b D04PS155
  NHB020 403 D17AA524
  UXC020 0604
  404 2001 LEL010 SEE010 RTC021 LFA010
  E17BCD010 E17AB030 E17AB040 E17BB020 E17BD030 E17BD070 E17BD020 E17CB0601925 E17CB0601919 E17CM040 E17CM010 E17CDP035
  ILA010 ILA020 ILE010 ILE021
  IFA010 IFB010 IFC010 IFC090 IFB020 0324FO0601 URE010b 0324FO0602 0324FO0603 0324FO0604 0324FO0606 0324FO0608 0324FO0609 0324FO0610 0324FO0611
`);
const SUST = set(`
  ISS010cc ISS010c ISS010cb
  ANS030 EHU030b EHU030 EHE010
  D08PD002 QAB010b QAB010bb
  504 504b 312 505 RQO020 HYO020 HEC030 HEC010 518 519 520 521
  2000b QAF030 QAF020 QAF020b D16ATA015 D16ATA025 NAD010 509b 510 509
  507
`);
// conservar dentro (IGUAL) aunque estén en capítulos de fuera
const IGUAL_FORZADO = set(`1604 1606 XRQ010`);
const rows = [];
for (const o of out) {
  if (o.cap) continue;
  let g;
  if (IGUAL_FORZADO.has(o.code)) g = 'IGUAL';
  else if (FUERA_CAP.includes(capOf(o))) g = 'FUERA';
  else if (FUERA.has(o.code)) g = 'FUERA';
  else if (SUST.has(o.code)) g = 'SUST';
  else g = 'IGUAL';
  rows.push({ ...o, g, cap0: capOf(o) });
}
// el gres exterior (D19DD004) en C.09: 749,65 m²; la terraza de planta primera (9 m² × 16 = 144 m²) es nuestra, el resto es exterior de parcela
const gres = rows.find(r => r.code === 'D19DD004' && r.cap0 === 'C.09');
if (gres) { const ours = 144; const ext = { ...gres, qty: gres.qty - ours, imp: (gres.qty - ours) * gres.price, g: 'FUERA' }; gres.qty = ours; gres.imp = ours * gres.price; rows.push(ext); }
const sum = (f) => rows.filter(f).reduce((a, b) => a + b.imp, 0);
const tot = sum(() => true);
console.log('TOTAL PEM', tot.toFixed(2));
for (const g of ['FUERA', 'SUST', 'IGUAL']) console.log(g, sum(r => r.g === g).toFixed(0), (sum(r => r.g === g) / 16).toFixed(0) + ' €/viv');
console.log('\nPor capítulo (€/vivienda):');
const caps = [...new Set(rows.map(r => r.cap0))];
for (const c of caps) { const f = g => (sum(r => r.cap0 === c && r.g === g) / 16).toFixed(0).padStart(7); console.log(c.padEnd(6), 'FUERA', f('FUERA'), ' SUST', f('SUST'), ' IGUAL', f('IGUAL')); }
require('fs').writeFileSync('clasif.json', JSON.stringify(rows));
