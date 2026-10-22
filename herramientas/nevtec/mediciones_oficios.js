// Mediciones de toda la promoción (16 viviendas) por oficio, para pedir ofertas.
// Lee el BC3 del proyecto de ejecución (partidas, mediciones con su desglose y textos completos) y añade
// el acero y la envolvente del sistema modular calculados con piloto_calc.js para las 16 viviendas.
// Uso (desde la raíz del repo): node herramientas/nevtec/mediciones_oficios.js [salida.xlsx]
const fs = require('fs'), path = require('path');
const ExcelJS = require(path.join(__dirname, '..', 'node_modules', 'exceljs'));
const ROOT = path.join(__dirname, '..', '..');
const BC3 = path.join(ROOT, 'proyecto-tecnico', 'NEVOLA EJECUCIÓN_DEF julio 2026.bc3');
const out = process.argv[2] || path.join(ROOT, 'costes', 'Nevola_mediciones_por_oficio_16_viviendas.xlsx');
const NV = 16;

// ---------- BC3 ----------
const BS = String.fromCharCode(92);
const raw = fs.readFileSync(BC3).toString('latin1');
const clean = s => s.trim().replace(/#+$/, '');
const C = {}, T = {}, M = {}, D = {};
for (const r of raw.split('~')) {
  const t = r[0], f = r.slice(2).replace(/\r?\n/g, '').split('|');
  if (t === 'C') for (let c of f[0].split(BS)) { c = c.trim(); if (c) C[clean(c)] = { code: c, u: f[1], name: (f[2] || '').trim(), price: +f[3] || 0 }; }
  else if (t === 'T') T[clean(f[0])] = (f[1] || '').trim();
  else if (t === 'D') {
    const parts = (f[1] || '').split(BS), ch = [];
    for (let i = 0; i + 2 < parts.length; i += 3) if (parts[i].trim()) ch.push({ c: clean(parts[i]), k: (parts[i + 1] === '' ? 1 : +parts[i + 1]) * (parts[i + 2] === '' ? 1 : +parts[i + 2]) });
    D[clean(f[0])] = ch;
  } else if (t === 'M') {
    const [padre, hijo] = f[0].split(BS).map(clean);
    const v = (f[3] || '').split(BS), lines = [];
    for (let i = 0; i + 5 < v.length; i += 6) {
      const [, com, n, l, a, h] = v.slice(i, i + 6);
      if (!(com || n || l || a || h).trim()) continue;
      lines.push([com.trim(), n, l, a, h].map(x => (x || '').trim()));
    }
    M[padre + '|' + hijo] = lines;
  }
}
const root = Object.keys(C).find(k => C[k].code.endsWith('##'));
const items = [];
(function walk(code, chap) {
  for (const k of (D[code] || [])) {
    const cc = C[k.c] || { code: k.c, name: '?', u: '', price: 0 };
    if ((cc.code || '').endsWith('#')) walk(k.c, chap || k.c);
    else items.push({ chap, parent: code, code: k.c, u: cc.u, name: cc.name, qty: k.k, price: cc.price });
  }
})(root, null);
const clasif = Object.fromEntries(require('./clasif.json').map(r => [r.code + '|' + r.path[0], r.g]));

// ---------- datos clave del texto: medidas, color, marca ----------
const num = s => s.replace(',', '.');
function claves(txt) {
  const out = [];
  const dims = [...txt.matchAll(/(\d+(?:[.,]\d+)?)\s*x\s*(\d+(?:[.,]\d+)?)(?:\s*x\s*(\d+(?:[.,]\d+)?))?\s*(mm|cm|m)\b/g)].map(m => m[0].replace(/\s+/g, ''));
  if (dims.length) out.push('Medidas: ' + [...new Set(dims)].slice(0, 4).join(', '));
  const ral = [...txt.matchAll(/RAL\s*\d{4}/g)].map(m => m[0]);
  const col = [...txt.matchAll(/color\s+([A-Za-zÁÉÍÓÚáéíóúñ0-9]+(?:\s+[A-ZÁÉÍÓÚ][a-záéíóúñ]+)?)/g)].map(m => m[1].trim()).filter(c => !/^RAL$/i.test(c));
  if (ral.length || col.length) out.push('Color: ' + [...new Set([...ral, ...col])].slice(0, 3).join('; '));
  const marca = [...txt.matchAll(/["«“]([A-ZÁÉÍÓÚÑÖÜ0-9][^"»”]{1,40})["»”]/g)].map(m => m[1]);
  if (marca.length) out.push('Marca/serie: ' + [...new Set(marca)].slice(0, 3).join(', '));
  return out.join(' · ');
}
const fmtLine = ([com, n, l, a, h]) => {
  const f = [n, l, a, h].filter(x => x !== '').map(num).join(' × ');
  return (com ? com + (f ? ': ' : '') : '') + f;
};

// ---------- oficios (un capítulo del proyecto = un oficio) ----------
const OFICIO = {
  'C.01': 'Actuaciones previas', 'C.02': 'Movimiento de tierras', 'C.03': 'Saneamiento enterrado',
  'C.04': 'Cimentación y estructura', 'C.05': 'Cubiertas', 'C.06': 'Albañilería', 'C.07': 'Impermeabilización y aislamiento',
  'C.08': 'Pladur: trasdosados, tabiques y techos', 'C.09': 'Alicatados y solados', 'C.10': 'Carpintería interior',
  'C.11': 'Carpintería exterior y cerrajería', 'C.12': 'Pintura', 'C.13': 'Electricidad y telecomunicaciones',
  'C.14': 'Fontanería, saneamiento y sanitarios', 'C.15': 'Climatización, ACS y ventilación', 'C.16': 'Piscina',
  'C.17': 'Urbanización', 'C.18': 'Seguridad y salud', 'C.19': 'Control de calidad', 'C.20': 'Gestión de residuos',
};
const ALC = {
  IGUAL: 'Se pide igual (fábrica u obra)',
  SUST: 'Lo sustituye el módulo: no se pide así',
  FUERA: 'Fuera de la vivienda (promotor o Knubo)',
};

// ---------- Excel ----------
const INK = 'FF141414', ACC = 'FFC8381F', RULE = 'FFC3C5BF', SOFT = 'FF5E6064';
const EUR = '#,##0.00 "€"', Q = '#,##0.00';
const wb = new ExcelJS.Workbook(); wb.creator = 'RG21 Capital';
const font = (o = {}) => ({ name: 'Arial', size: 10, ...o });
function header(ws, title, sub) {
  ws.getCell('A1').value = title; ws.getCell('A1').font = font({ size: 14, bold: true });
  ws.getCell('A2').value = sub; ws.getCell('A2').font = font({ size: 9.5, color: { argb: SOFT } });
}
function th(ws, r, vals) {
  const row = ws.getRow(r); row.values = vals;
  row.eachCell(c => { c.font = font({ bold: true, color: { argb: 'FFFFFFFF' } }); c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: INK } }; c.alignment = { vertical: 'middle', wrapText: true }; });
  row.height = 30;
}
const cellStyle = (row, n) => { for (let i = 1; i <= n; i++) { const c = row.getCell(i); c.font = c.font && c.font.bold ? c.font : font(); c.alignment = { vertical: 'top', wrapText: true }; c.border = { bottom: { style: 'thin', color: { argb: RULE } } }; } };

const resumen = wb.addWorksheet('Resumen', { views: [{ showGridLines: false }] });
const sheets = [];
for (const [cap, oficio] of Object.entries(OFICIO)) {
  const list = items.filter(it => it.chap === cap);
  if (!list.length) continue;
  const name = (cap.replace('C.', '') + ' ' + oficio).replace(/[:\\/?*[\]]/g, '').slice(0, 31);
  const ws = wb.addWorksheet(name, { views: [{ showGridLines: false, state: 'frozen', ySplit: 4 }] });
  ws.columns = [{ width: 11 }, { width: 38 }, { width: 5 }, { width: 11 }, { width: 10 }, { width: 36 }, { width: 40 }, { width: 70 }, { width: 10 }, { width: 12 }, { width: 24 }];
  header(ws, `Névola · ${oficio} · ${NV} viviendas`, `Capítulo ${cap} del proyecto de ejecución (BC3 de julio de 2026). Medición de toda la promoción y su desglose tal como viene en el proyecto. Precios del proyecto (CYPE, PEM, sin IVA), solo como referencia.`);
  th(ws, 4, ['Código', 'Partida', 'Ud', `Total ${NV} viv.`, 'Media por vivienda', 'Desglose de la medición (proyecto)', 'Datos clave (medidas, color, marca)', 'Descripción completa del proyecto', 'Precio proyecto', 'Importe PEM', 'Alcance en el sistema modular']);
  let r = 4;
  for (const it of list) {
    r++;
    const lines = (M[it.parent + '|' + it.code] || []).map(fmtLine).filter(Boolean);
    const txt = T[it.code] || '';
    const g = clasif[it.code + '|' + cap];
    const row = ws.getRow(r);
    row.values = [it.code, it.name, it.u, it.qty, { formula: `D${r}/${NV}` }, lines.join('\n'), claves(txt), txt, it.price, { formula: `D${r}*I${r}` }, ALC[g] || ''];
    cellStyle(row, 11);
    row.getCell(4).numFmt = Q; row.getCell(5).numFmt = Q; row.getCell(9).numFmt = EUR; row.getCell(10).numFmt = EUR;
    row.getCell(2).font = font({ bold: true });
    if (g === 'SUST') row.getCell(11).font = font({ color: { argb: SOFT }, italic: true });
    if (g === 'FUERA') row.getCell(11).font = font({ color: { argb: ACC } });
  }
  r++; const tot = ws.getRow(r);
  tot.values = ['', 'Total del capítulo (PEM del proyecto)', '', '', '', '', '', '', '', { formula: `SUM(J5:J${r - 1})` }, ''];
  tot.font = font({ bold: true }); tot.getCell(10).numFmt = EUR; tot.getCell(10).border = { top: { style: 'medium', color: { argb: INK } } };
  ws.autoFilter = { from: 'A4', to: `K${r - 1}` };
  ws.pageSetup = { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 };
  sheets.push({ cap, oficio, name, n: list.length, totRow: r,
    igual: list.filter(it => clasif[it.code + '|' + cap] === 'IGUAL').length,
    sust: list.filter(it => clasif[it.code + '|' + cap] === 'SUST').length,
    fuera: list.filter(it => clasif[it.code + '|' + cap] === 'FUERA').length });
}

// ---------- Acero y envolvente del sistema modular (piloto_calc × 16) ----------
const calc = require('./piloto_calc.js');
const wa = wb.addWorksheet('Acero modular 16 viv.', { views: [{ showGridLines: false }] });
wa.columns = [{ width: 46 }, { width: 12 }, { width: 12 }, { width: 14 }, { width: 14 }, { width: 16 }, { width: 40 }];
header(wa, `Névola · Acero de los módulos · ${NV} viviendas`, 'Cálculo del piloto (herramientas/nevtec/piloto_calc.js, M4 entero) multiplicado por 16. Las 2 aisladas se cuentan como la pareada tipo: confirmar con su modulación.');
th(wa, 4, ['Perfil / elemento', 'kg/m', 'm por vivienda', 'kg por vivienda', `m ${NV} viv.`, `kg ${NV} viv.`, 'Dónde va']);
const perfil = d => /IPE 220/.test(d) ? 'IPE 220' : /IPE 200/.test(d) ? 'IPE 200' : /IPE 160/.test(d) ? 'IPE 160' : /HEA 100/.test(d) ? 'HEA 100' : /SHS/.test(d) ? 'SHS 60.40.3' : /L 80/.test(d) ? 'L 80.8' : /Escalera/.test(d) ? 'Escalera metálica (HEA 140 y peldaño)' : 'Chapa, pletinas y refuerzos';
const USO = { 'IPE 200': 'Marcos de suelo y techo', 'IPE 220': 'Bordes en vuelo (M4 y frente de P1)', 'IPE 160': 'Pilares', 'HEA 100': 'Correas de suelo', 'SHS 60.40.3': 'Correas de techo', 'L 80.8': 'Angular de apoyo de panel', 'Escalera metálica (HEA 140 y peldaño)': 'Escalera', 'Chapa, pletinas y refuerzos': 'Refuerzos, remates y arriostramiento' };
const G = {};
for (const [, d, q, k] of calc.acero) { const p = perfil(d); G[p] = G[p] || { m: 0, kg: 0, kgm: null }; G[p].kg += q * k; if (!/Escalera|Refuerzos|Angular/.test(d)) { G[p].m += q; G[p].kgm = k; } }
let ra = 4;
for (const p of Object.keys(USO)) {
  if (!G[p]) continue; ra++;
  const g = G[p], row = wa.getRow(ra);
  row.values = [p, g.kgm, g.m ? +g.m.toFixed(2) : null, +g.kg.toFixed(1), g.m ? { formula: `C${ra}*${NV}` } : null, { formula: `D${ra}*${NV}` }, USO[p]];
  cellStyle(row, 7); for (const i of [2, 3, 4, 5, 6]) row.getCell(i).numFmt = '#,##0.0';
}
ra++; const at = wa.getRow(ra); at.values = ['Total acero', '', '', { formula: `SUM(D5:D${ra - 1})` }, '', { formula: `SUM(F5:F${ra - 1})` }, ''];
at.font = font({ bold: true }); at.getCell(4).numFmt = '#,##0'; at.getCell(6).numFmt = '#,##0';
ra += 2; wa.getCell(`A${ra}`).value = 'Para ArcelorMittal: pedir precio por perfil para los kg de la columna «kg 16 viv.», con corte a medida, y por separado para una vivienda (piloto). Los metros son de perfil colocado; añadir mermas de corte.';
wa.mergeCells(`A${ra}:G${ra}`); wa.getCell(`A${ra}`).alignment = { wrapText: true }; wa.getCell(`A${ra}`).font = font({ color: { argb: SOFT } }); wa.getRow(ra).height = 30;

const we = wb.addWorksheet('Envolvente modular 16 viv.', { views: [{ showGridLines: false }] });
we.columns = [{ width: 52 }, { width: 6 }, { width: 14 }, { width: 14 }, { width: 50 }];
header(we, `Névola · Panel y envolvente de los módulos · ${NV} viviendas`, 'Superficies del cálculo del piloto (piloto_calc.js) multiplicadas por 16, para pedir el panel sándwich (Tabihaus o equivalente). Las aisladas, como la pareada.');
th(we, 4, ['Superficie', 'Ud', 'Por vivienda', `${NV} viviendas`, 'Cómo se mide']);
const E = calc.env;
const envRows = [
  ['Fachada de planta baja (delantera, lateral y trasera)', E.pb_ext, 'Perímetro exterior × 3,15 m de panel'],
  ['Fachada de planta primera (con peto)', E.p1_ext, 'Perímetro exterior × 3,80 m (incluye peto de 0,75 m)'],
  ['Huecos de fachada a descontar', -E.huecos, 'Superficie de huecos del proyecto (DB HE1)'],
  ['Fachada opaca neta', E.fach_opaca, 'Fachada PB + P1 − huecos'],
  ['Medianera (las dos plantas)', E.medianera, 'Lado de la vivienda vecina'],
  ['Cubierta', E.cubierta, 'Superficie de los módulos de planta primera'],
  ['Terraza sobre planta baja', E.terraza, 'Cubierta transitable sobre M1 y M2'],
  ['Sofito de los vuelos', E.sofito, 'Panel inferior de los voladizos de 0,60 m'],
  ['Suelo de planta baja', E.suelo_pb, 'Sobre la cámara sanitaria'],
  ['Juntas entre módulos', E.juntas_ml, 'Metros lineales a sellar', 'm'],
];
let re = 4;
for (const [d, v, how, u] of envRows) { re++; const row = we.getRow(re); row.values = [d, u || 'm²', +v.toFixed(2), { formula: `C${re}*${NV}` }, how]; cellStyle(row, 5); row.getCell(3).numFmt = Q; row.getCell(4).numFmt = Q; if (/neta/.test(d)) row.font = font({ bold: true }); }

// ---------- Resumen ----------
resumen.columns = [{ width: 8 }, { width: 44 }, { width: 10 }, { width: 14 }, { width: 14 }, { width: 14 }, { width: 18 }];
header(resumen, `Névola · Mediciones por oficio para pedir ofertas · ${NV} viviendas`, 'Fuente: BC3 del proyecto de ejecución (julio de 2026), con medición, desglose y descripción completa de cada partida. Importes PEM del proyecto, sin IVA, solo como referencia.');
th(resumen, 4, ['Cap.', 'Oficio (pestaña)', 'Partidas', 'Se piden igual', 'Las sustituye el módulo', 'Fuera de la vivienda', 'PEM del proyecto']);
let rr = 4;
for (const s of sheets) {
  rr++; const row = resumen.getRow(rr);
  row.values = [s.cap, { text: s.oficio, hyperlink: `#'${s.name}'!A1` }, s.n, s.igual, s.sust, s.fuera, { formula: `'${s.name}'!J${s.totRow}` }];
  cellStyle(row, 7); row.getCell(2).font = font({ color: { argb: ACC }, underline: true }); row.getCell(7).numFmt = EUR;
}
rr++; const rt = resumen.getRow(rr); rt.values = ['', 'Total proyecto (PEM)', { formula: `SUM(C5:C${rr - 1})` }, '', '', '', { formula: `SUM(G5:G${rr - 1})` }];
rt.font = font({ bold: true }); rt.getCell(7).numFmt = EUR; rt.getCell(7).border = { top: { style: 'medium', color: { argb: INK } } };
rr += 2; resumen.getCell(`B${rr}`).value = { text: 'Acero de los módulos (16 viviendas)', hyperlink: "#'Acero modular 16 viv.'!A1" }; resumen.getCell(`B${rr}`).font = font({ color: { argb: ACC }, underline: true });
rr++; resumen.getCell(`B${rr}`).value = { text: 'Panel y envolvente de los módulos (16 viviendas)', hyperlink: "#'Envolvente modular 16 viv.'!A1" }; resumen.getCell(`B${rr}`).font = font({ color: { argb: ACC }, underline: true });
rr += 2;
for (const t of [
  '«Se piden igual»: partidas que se ejecutan como en el proyecto, en fábrica o en obra (carpinterías, instalaciones, acabados, sanitarios…). Son las que hay que pedir a cada oficio.',
  '«Las sustituye el módulo»: estructura, forjados, fábricas, cubierta y aislamientos del proyecto convencional. No se piden: los cubren el acero y el panel de las dos últimas pestañas.',
  '«Fuera de la vivienda»: movimiento de tierras, cimentación, acometidas, piscina, urbanización y gastos de obra. Solo entran en las opciones 2, 3 y 4 de NIDO.',
  'La columna «Desglose» reproduce las líneas de medición del proyecto (tipo, unidades y medidas). La de «Datos clave» resume medidas, colores y marcas sacados del texto; la descripción completa va al lado.',
]) { const c = resumen.getCell(`B${rr}`); c.value = t; resumen.mergeCells(`B${rr}:G${rr}`); c.alignment = { wrapText: true, vertical: 'top' }; c.font = font({ color: { argb: SOFT } }); resumen.getRow(rr).height = 30; rr++; }

wb.xlsx.writeFile(out).then(() => console.log('ok', out, '·', items.length, 'partidas ·', sheets.length, 'oficios · acero', calc.kgTot.toFixed(0), 'kg/viv'));
