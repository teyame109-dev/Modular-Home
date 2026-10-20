// Versión web de la cimentación, con la marca RG21, para nevola-rg21.vercel.app/cimentacion/
// Uso: node web_cimentacion.js <carpeta site>   (escribe <site>/cimentacion/index.html)
const fs = require('fs'), path = require('path');
const site = process.argv[2]; if (!site) throw new Error('falta la carpeta site');
let h = fs.readFileSync(path.join(__dirname, 'cimentacion_nevola.html'), 'utf8');
const rep = (a, b) => { if (!h.includes(a)) throw new Error('no: ' + a.slice(0, 60)); h = h.replace(a, b); };
const CSS = `
/* Encabezado fijo arriba al hacer scroll */
.top{position:sticky;top:0;z-index:20;background:var(--bg);margin-top:-28px;padding-top:20px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;border-bottom:1px solid var(--rule);padding-bottom:16px}
.logo{display:inline-grid;grid-template-columns:auto auto;column-gap:.14em;align-items:end;font-family:var(--display);font-size:34px;line-height:1;color:var(--ink);text-decoration:none}
.logo .sq{width:.5em;height:.5em;border-top:.12em solid currentColor;border-left:.12em solid currentColor;position:relative;align-self:start;margin-top:.1em}
.logo .sq::after{content:"";position:absolute;left:0;top:0;width:.12em;height:.12em;background:var(--accent)}
.logo b{font-weight:900;letter-spacing:-.05em}
.logo i{grid-column:2;font-style:normal;font-family:var(--mono);font-weight:500;font-size:.3em;letter-spacing:.42em;text-transform:uppercase;margin-top:.5em;padding-left:.1em}
.back{font-family:var(--mono);font-size:12.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--ink);text-decoration:none;border:1px solid var(--ink);border-radius:2px;padding:9px 12px;transition:transform 160ms cubic-bezier(0.23,1,0.32,1),background-color 160ms ease,color 160ms ease}
.back:active{transform:scale(.97)}
@media (hover:hover) and (pointer:fine){.back:hover{background:var(--ink);color:var(--paper)}}
.back:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
`;
rep('</style>', CSS + '</style>');
rep('<div class="wrap">\n<header>', '<div class="wrap">\n<div class="top"><a class="logo" href="/" aria-label="RG21 Capital, volver a la propuesta"><span class="sq"></span><b>rg21</b><i>capital</i></a><a class="back" href="/">Volver a la propuesta</a></div>\n<header>');
rep('<p class="eyebrow">Névola · Vivienda piloto pareada · Estimación</p>', '<p class="eyebrow">Névola · Vivienda piloto pareada · Cimentación</p>');
rep('<footer><span>Névola · Cimentación del piloto · Estimación A</span>', '<footer><span>RG21 Capital · Névola · Cimentación del piloto · Estimación A</span>');
// ---------- Presupuesto de la cimentación (extra a la promoción, la ejecuta Knubo) ----------
// Importes leídos de costes/Nevola_cimentacion_presupuesto_equipo.xlsx (con los resultados guardados).
// Son los precios de Knubo, sin margen añadido: el margen ya va en la mano de obra.
const ExcelJS = require(path.join(__dirname, '..', 'node_modules', 'exceljs'));
const XLSX = path.join(__dirname, '..', '..', 'costes', 'Nevola_cimentacion_presupuesto_equipo.xlsx');
const eur = n => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: 'always' }) + ' €';
const num = (n, d = 2) => n.toLocaleString('es-ES', { maximumFractionDigits: d, useGrouping: 'always' });
// Nombre y medición que se publican para cada partida del Excel
const PUB = {
  'Muro a dos caras: muros longitudinales': ['Muros a dos caras, longitudinales', '4 muros × 9,50 m × 2 caras'],
  'Muro a dos caras: muretes transversales': ['Muros a dos caras, muretes transversales', '2 muretes × 7,95 m × 2 caras'],
  'Vertido de hormigón: muros': ['Vertido de hormigón en muros', 'Medición de Knubo'],
  'Vertido de hormigón: zapatas': ['Vertido de hormigón en zapatas', 'Medición de Knubo'],
  'Hierro elaborado y armado': ['Elaboración y armado del acero', 'Medición de Knubo'],
  'Placas de anclaje': ['Placas de anclaje', '3 por muro × 4 muros'],
  'Solera de limpieza (mano de obra)': ['Solera de limpieza', 'Superficie de zapatas'],
  'Suministro de hormigón HA-25': ['Suministro de hormigón HA-25', 'Los m³ de muros y zapatas'],
  'Suministro de acero B500S': ['Suministro de acero B 500 S', 'Medición de Knubo'],
  'Hormigón de limpieza bajo zapatas': ['Hormigón de limpieza bajo zapatas', 'Superficie de zapatas'],
  'Excavación de zanjas y retirada de tierras': ['Excavación de zanjas y retirada de tierras', 'Superficie de zapatas × 1,30 m'],
  'Grava en la cámara sanitaria': ['Grava en la cámara sanitaria', 'Huella de planta baja, 7,85 × 9,50 m'],
};
const val = c => (c && typeof c === 'object' && 'result' in c) ? c.result : c;
async function presupuesto() {
  const wb = new ExcelJS.Workbook(); await wb.xlsx.readFile(XLSX);
  const ws = wb.getWorksheet('Presupuesto equipo');
  const ejec = [], mat = [], fuera = []; let grupo = null, total = null;
  ws.eachRow(row => {
    const b = val(row.getCell(2).value), ud = val(row.getCell(4).value), q = val(row.getCell(5).value), p = val(row.getCell(6).value), imp = val(row.getCell(7).value);
    if (val(row.getCell(1).value) === 'Nº') { grupo = ejec; return; }
    if (b === 'Partida') { grupo = mat; return; }
    if (typeof b !== 'string') return;
    if (b.startsWith('Total del presupuesto') || b.startsWith('Subtotal')) { grupo = null; return; }
    if (b.startsWith('Total cimentación')) { total = imp; return; }
    if (!grupo) return;
    if (typeof imp !== 'number' || typeof p !== 'number') { fuera.push(b); return; }
    if (typeof q !== 'number') throw new Error('sin cantidad calculada en el Excel: ' + b + ' (abrir y guardar el Excel, o pasarlo por soffice)');
    const [n, m] = PUB[b] || [b, ''];
    grupo.push({ n, m, ud, q, p, imp });
  });
  if (typeof total !== 'number') throw new Error('el Excel no tiene el total calculado: abrirlo y guardarlo, o pasarlo por soffice');
  const rows = g => g.map(x => `<tr><td>${x.n}<span class="sub">${x.m}</span></td><td class="n">${num(x.q)} ${x.ud}<span class="pu">${eur(x.p)}/${x.ud}</span></td><td class="n pc">${eur(x.p)}/${x.ud}</td><td class="n">${eur(x.imp)}</td></tr>`).join('');
  const sum = g => g.reduce((a, x) => a + x.imp, 0);
  const sinPrecio = fuera.map(f => f.replace(/ de hormigón$/, '').toLowerCase()).join(' y ');
  return `<section class="presu" style="display:flex;flex-direction:column;gap:14px">
  <h2>Presupuesto de la cimentación</h2>
  <p class="lede">Es un extra a la promoción: no está en el precio de las viviendas. La ejecuta Knubo. Importes por vivienda, sin IVA.</p>
  <div style="overflow-x:auto"><table class="presu-t"><thead><tr><th>Partida</th><th class="n">Medición</th><th class="n pc">Precio</th><th class="n">Importe</th></tr></thead><tbody>
    <tr class="grp"><td colspan="3">Ejecución</td><td class="pc"></td></tr>${rows(ejec)}<tr class="tot"><td colspan="2">Ejecución</td><td class="pc"></td><td class="n">${eur(sum(ejec))}</td></tr>
    <tr class="grp"><td colspan="3">Materiales y trabajos previos</td><td class="pc"></td></tr>${rows(mat)}<tr class="tot"><td colspan="2">Materiales y trabajos previos</td><td class="pc"></td><td class="n">${eur(sum(mat))}</td></tr>
    <tr class="gran"><td colspan="2">Total cimentación por vivienda</td><td class="pc"></td><td class="n">${eur(total)}</td></tr>
  </tbody></table></div>
  <div class="notes">
    <div><b>Medición de Knubo</b><span>Muros de 0,70 m de alto y zapatas de 0,75 y 0,90 m de ancho: 37 m³ de hormigón y 3.000 kg de acero. La estimación A de esta página da 29 m³ y 1.670 kg. La medición final saldrá del cálculo de estructura y del geotécnico.</span></div>
    <div><b>Placas de anclaje</b><span>El presupuesto lleva 12, tres por muro. En los muros interiores apoyan dos módulos y cada uno lleva su pilar, así que pueden ser 18. Las 6 de más serían 192 €.</span></div>
    <div><b>Mediciones estimadas</b><span>Limpieza: superficie de zapatas, 45,75 m², con 10 cm de hormigón al precio del HA-25. Excavación: esa superficie por 1,30 m de fondo, sin descontar los cruces de zapatas (unos 6 m³). Grava: toda la huella de planta baja, sin descontar los muros (unos 10 m²).</span></div>
    ${sinPrecio ? `<div><b>No incluido</b><span>${sinPrecio.charAt(0).toUpperCase() + sinPrecio.slice(1)}, si hacen falta en la parcela.</span></div>` : ''}
  </div>
</section>
`;
}
const CSS2 = `
.presu-t td .sub{display:block;font-size:12.5px;color:var(--soft)}
.presu-t tr.grp td{font-family:var(--mono);font-size:11.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--accent);padding-top:16px}
.presu-t tr.tot td{font-weight:700}
.presu-t tr.gran td{font-weight:800;font-size:17px;border-top:2px solid var(--ink);border-bottom:0}
.presu-t tr.gran td.n{color:var(--accent)}
.presu .notes{grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr))}
.presu-t td .pu{display:none}
@media (max-width:600px){.presu-t .pc{display:none}.presu-t td .pu{display:block;font-size:12px;color:var(--soft)}.presu-t td,.presu-t th{padding-inline:6px}}
`;
rep('</style>', CSS2 + '</style>');
rep('La cimentación la ejecuta el promotor; RG21 entrega la posición de placas y pernos.', 'La cimentación es un extra a la promoción y la ejecuta Knubo; RG21 entrega la posición de placas y pernos.');
(async () => {
rep('<section style="display:flex;flex-direction:column;gap:10px">\n  <h2>Qué falta para darlo por bueno</h2>', (await presupuesto()) + '\n<section style="display:flex;flex-direction:column;gap:10px">\n  <h2>Qué falta para darlo por bueno</h2>');
const doc = '<!doctype html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<meta name="robots" content="noindex, nofollow">\n' + h.replace('</style>', '</style>\n</head>\n<body>') + '\n</body>\n</html>\n';
fs.mkdirSync(path.join(site, 'cimentacion'), { recursive: true });
fs.writeFileSync(path.join(site, 'cimentacion', 'index.html'), doc);
console.log('ok', path.join(site, 'cimentacion', 'index.html'));
})();
