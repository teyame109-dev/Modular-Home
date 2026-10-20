// Presupuesto de cimentación del piloto que pasó el equipo de Iván a mano (20/10/2026), pasado a Excel con fórmulas,
// con lo que no aparece en el manuscrito y la comparación con nuestra estimación A (herramientas/cimentacion/cimentacion.js).
// Uso (desde la raíz del repo): node herramientas/cimentacion/presupuesto_equipo.js [salida.xlsx]
const path = require('path');
const ExcelJS = require(path.join(__dirname, '..', 'node_modules', 'exceljs'));
const out = process.argv[2] || path.join(__dirname, '..', '..', 'costes', 'Nevola_cimentacion_presupuesto_equipo.xlsx');

const INK = 'FF141414', ACC = 'FFC8381F', PAPER = 'FFEFF0EB', RULE = 'FFC3C5BF', INPUT = 'FFFFF4C2';
const EUR = '#,##0.00 "€"', NUM = '#,##0.00', INT = '#,##0';
const wb = new ExcelJS.Workbook();
wb.creator = 'RG21 Capital';

function head(ws, title, sub) {
  ws.getCell('A1').value = title; ws.getCell('A1').font = { name: 'Arial', size: 15, bold: true, color: { argb: INK } };
  ws.getCell('A2').value = sub; ws.getCell('A2').font = { name: 'Arial', size: 10, color: { argb: 'FF5E6064' } };
}
function th(row) {
  row.eachCell(c => { c.font = { name: 'Arial', bold: true, size: 10, color: { argb: 'FFFFFFFF' } }; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: INK } }; c.alignment = { vertical: 'middle', wrapText: true }; });
  row.height = 20;
}
const body = (row, n) => { for (let i = 1; i <= n; i++) { const c = row.getCell(i); c.font = c.font && c.font.bold ? c.font : { name: 'Arial', size: 10 }; c.border = { bottom: { style: 'thin', color: { argb: RULE } } }; c.alignment = { vertical: 'top', wrapText: true }; } };
const input = c => { c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: INPUT } }; };

// ---------- Hoja 1: presupuesto tal como viene ----------
const ws = wb.addWorksheet('Presupuesto equipo', { views: [{ showGridLines: false }] });
ws.columns = [{ width: 5 }, { width: 46 }, { width: 30 }, { width: 6 }, { width: 11 }, { width: 11 }, { width: 13 }];
head(ws, 'Névola · Cimentación del piloto · Presupuesto del equipo', 'Pasado del manuscrito del 20/10/2026 (foto en ofertas-proveedores/). Importes sin IVA. Celdas amarillas: editables.');
let r = 4;
th(ws.getRow(r)); ws.getRow(r).values = ['Nº', 'Partida', 'Medición (como en el manuscrito)', 'Ud', 'Cantidad', 'Precio', 'Importe']; th(ws.getRow(r));
const partidas = [
  ['Muro a dos caras: muros longitudinales', '4 muros × 9,50 m × 2 caras', 'ml', '=4*9.5*2', 36],
  ['Muro a dos caras: muretes transversales', '2 muretes × 7,95 m × 2 caras', 'ml', '=2*7.95*2', 36],
  ['Vertido de hormigón: muros', 'Según el equipo', 'm³', 11, 16.5],
  ['Vertido de hormigón: zapatas', 'Según el equipo', 'm³', 26, 16.5],
  ['Hierro elaborado y armado', 'Según el equipo', 'kg', 3000, 0.67],
  ['Placas de anclaje', '3 por muro × 4 muros', 'ud', 12, 32],
  ['Solera de limpieza (mano de obra)', 'Superficie de zapatas del croquis. Añadida por Iván (20/10/2026)', 'm²', '=10*(0.75+0.9+0.9+0.75)+2*8.5*0.75', 11],
];
const first = r + 1;
for (const [i, [d, m, u, q, p]] of partidas.entries()) {
  r++; const row = ws.getRow(r);
  row.values = [i + 1, d, m, u, typeof q === 'string' ? { formula: q.slice(1) } : q, p, { formula: `E${r}*F${r}` }];
  body(row, 7); row.getCell(5).numFmt = NUM; row.getCell(6).numFmt = EUR; row.getCell(7).numFmt = EUR; input(row.getCell(5)); input(row.getCell(6));
}
const last = r;
r++; const tot = ws.getRow(r); tot.values = ['', 'Total del presupuesto del equipo', '', '', '', '', { formula: `SUM(G${first}:G${last})` }];
tot.font = { name: 'Arial', bold: true, size: 11 }; tot.getCell(7).numFmt = EUR; tot.getCell(7).font = { name: 'Arial', bold: true, size: 11, color: { argb: ACC } };
tot.getCell(2).border = tot.getCell(7).border = { top: { style: 'medium', color: { argb: INK } } };
const TOT = r;
r++; ws.getCell(`B${r}`).value = 'En el manuscrito: 6.885,00 €, sin la solera de limpieza, que se añadió después. Los céntimos son redondeos del papel (1.144,80 → 1.145 y 610,50 → 610).';
ws.getCell(`B${r}`).font = { name: 'Arial', size: 9, italic: true, color: { argb: 'FF5E6064' } };

// Lo que no aparece
r += 2; ws.getCell(`A${r}`).value = 'Lo que no aparece en el manuscrito (a confirmar con el equipo)'; ws.getCell(`A${r}`).font = { name: 'Arial', bold: true, size: 12 };
r++; ws.getCell(`A${r}`).value = 'Los precios del manuscrito son de mano de obra: encofrado por metro, vertido (no suministro) a 16,50 €/m³ y armado por kg. El hormigón (95 €/m³) y el acero (0,95 €/kg) se suministran aparte. Precios en blanco: rellenar cuando estén confirmados.';
ws.mergeCells(`A${r}:G${r}`); ws.getCell(`A${r}`).alignment = { wrapText: true, vertical: 'top' }; ws.getCell(`A${r}`).font = { name: 'Arial', size: 10, color: { argb: 'FF5E6064' } }; ws.getRow(r).height = 42;
r++; ws.getRow(r).values = ['', 'Partida', 'De dónde sale la cantidad', 'Ud', 'Cantidad', 'Precio', 'Importe']; th(ws.getRow(r));
const pend = [
  ['Suministro de hormigón HA-25', 'Los 37 m³ vertidos. Precio de Iván (20/10/2026)', 'm³', `=E${first + 2}+E${first + 3}`, 115],
  ['Suministro de acero B500S', 'Los 3.000 kg, aparte de los 0,67 €/kg de elaboración y armado. Precio de Iván (20/10/2026)', 'kg', `=E${first + 4}`, 0.95],
  ['Suministro de placas de anclaje', 'Las 12 placas del presupuesto; la colocación va en mano de obra. Precio de Iván (20/10/2026)', 'ud', `=E${first + 5}`, 220],
  ['Hormigón de limpieza bajo zapatas', 'Superficie de zapatas del croquis: 10,00 × (0,75 + 0,90 + 0,90 + 0,75) + 2 × 8,50 × 0,75. Precio: 10 cm de espesor al precio del hormigón', 'm²', '=10*(0.75+0.9+0.9+0.75)+2*8.5*0.75', '=0.1*F{HORM}'],
  ['Excavación de zanjas y retirada de tierras', 'Superficie de zapatas (45,75 m²) × 1,30 m de fondo, como en la estimación A (coronación a −0,05, muro, zapata y limpieza). Sin descontar cruces. Precio de Iván (20/10/2026)', 'm³', '=(10*(0.75+0.9+0.9+0.75)+2*8.5*0.75)*1.3', 18],
  ['Grava en la cámara sanitaria', 'Huella de planta baja: 7,85 × 9,50 m, sin descontar muros, como en la estimación A. Precio de Iván (20/10/2026)', 'm²', '=7.85*9.5', 12],
  ['Bombeo de hormigón', 'Una partida por vivienda. Precio de Iván (20/10/2026)', 'ud', '=1', 250],
  ['Replanteo topográfico', 'Ejes de muros y placas', 'ud', null],
];
const pf = r + 1;
for (const [d, m, u, q, p] of pend) {
  r++; const row = ws.getRow(r);
  const pv = typeof p === 'string' ? { formula: p.slice(1).replace('{HORM}', pf) } : p;
  row.values = ['', d, m, u, q ? { formula: q.slice(1) } : null, pv ?? null, { formula: `IF(F${r}="","",E${r}*F${r})` }];
  body(row, 7); row.getCell(5).numFmt = NUM; row.getCell(6).numFmt = EUR; row.getCell(7).numFmt = EUR; input(row.getCell(5)); input(row.getCell(6));
}
const pl = r;
r++; const sub = ws.getRow(r); sub.values = ['', 'Subtotal de lo pendiente (solo lo que tenga precio)', '', '', '', '', { formula: `SUM(G${pf}:G${pl})` }];
sub.font = { name: 'Arial', bold: true, size: 10 }; sub.getCell(7).numFmt = EUR;
r++; const gt = ws.getRow(r); gt.values = ['', 'Total cimentación con lo pendiente', '', '', '', '', { formula: `G${TOT}+G${r - 1}` }];
gt.font = { name: 'Arial', bold: true, size: 11 }; gt.getCell(7).numFmt = EUR; gt.getCell(7).font = { name: 'Arial', bold: true, size: 11, color: { argb: ACC } };
gt.getCell(2).border = gt.getCell(7).border = { top: { style: 'medium', color: { argb: INK } } };
ws.pageSetup = { paperSize: 9, orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0 };

// ---------- Hoja 2: comprobaciones y comparación ----------
const wc = wb.addWorksheet('Comprobaciones', { views: [{ showGridLines: false }] });
wc.columns = [{ width: 44 }, { width: 16 }, { width: 16 }, { width: 16 }, { width: 46 }];
head(wc, 'Comprobaciones del presupuesto del equipo', 'Geometría leída del croquis y comparación con nuestra estimación A (web /cimentacion/).');
let k = 4;
wc.getRow(k).values = ['Concepto', 'Equipo', 'Estimación A', 'Diferencia', 'Comentario']; th(wc.getRow(k));
const P = "'Presupuesto equipo'!";
const cmp = [
  ['Hormigón en muros (m³)', { formula: `${P}E${first + 2}` }, 8.58, 'Equipo: muros de 0,70 m de alto; nosotros 0,65 m.'],
  ['Hormigón en zapatas (m³)', { formula: `${P}E${first + 3}` }, 20.48, 'Croquis: zapatas de 0,75 y 0,90 m de ancho. Nosotros 0,80 y 1,00 m, y zapata común de 1,20 m en la medianera.'],
  ['Hormigón total (m³)', { formula: `B5+B6` }, { formula: 'C5+C6' }, ''],
  ['Acero (kg)', { formula: `${P}E${first + 4}` }, 1667, 'Nosotros: 50 kg/m³ en zapatas y 75 kg/m³ en muros.'],
  ['Cuantía de acero (kg/m³)', { formula: 'B8/B7' }, { formula: 'C8/C7' }, 'Razonable en los dos casos para cimentación corrida.'],
  ['Placas de anclaje (ud)', { formula: `${P}E${first + 5}` }, 18, 'Nosotros ponemos 2 placas en cada eje de los muros interiores (una por módulo): 18. El croquis tiene 3 por muro: 12.'],
  ['Altura de muro (m)', 0.70, 0.65, ''],
  ['Longitud de muretes transversales (m)', 7.95, 6.90, 'En el croquis pone 7,85 y en el cálculo 7,95. Nosotros medimos el murete entre muros.'],
];
for (const [c, a, b, nota] of cmp) {
  k++; const row = wc.getRow(k);
  row.values = [c, a, b, { formula: `B${k}-C${k}` }, nota]; body(row, 5);
  for (const i of [2, 3, 4]) row.getCell(i).numFmt = /kg\)$|ud\)$/.test(c) ? INT : NUM;
}
k += 2; wc.getCell(`A${k}`).value = 'Geometría leída del croquis'; wc.getCell(`A${k}`).font = { name: 'Arial', bold: true, size: 12 };
const geo = [
  ['Muros longitudinales', '4 × 9,50 m × 0,70 m de alto; espesores 0,25 · 0,30 · 0,30 · 0,25 m'],
  ['Muretes transversales', '2 × 7,85 m (7,95 en el cálculo)'],
  ['Zapatas longitudinales', '10,00 m de largo; anchos 0,75 · 0,90 · 0,90 · 0,75 m'],
  ['Zapatas laterales', '2 × 8,50 × 0,75 m'],
  ['Canto de zapata implícito', { formula: `B6/(10*(0.75+0.9+0.9+0.75)+2*8.5*0.75)` }],
];
for (const [a, b] of geo) { k++; const row = wc.getRow(k); row.values = [a, b]; body(row, 5); wc.mergeCells(`B${k}:E${k}`); }
wc.getCell(`B${k}`).numFmt = '0.00 "m (26 m³ / superficie de zapatas)"';

k += 2; wc.getCell(`A${k}`).value = 'Contraste con Menorca Pino (banco de precios, 2024, precios de venta)'; wc.getCell(`A${k}`).font = { name: 'Arial', bold: true, size: 12 };
k++; wc.getRow(k).values = ['Partida', '€/m³ 2024', '€/m³ 2026 (+12 %)', 'Volumen equipo', 'Importe']; th(wc.getRow(k));
const p0 = k + 1;
for (const [d, p, ref] of [['Zapatas corridas, completas', 254.00, 'B6'], ['Muros de cimentación, completos', 251.99, 'B5']]) {
  k++; const row = wc.getRow(k); row.values = [d, p, { formula: `B${k}*1.12` }, { formula: ref }, { formula: `C${k}*D${k}` }]; body(row, 5);
  row.getCell(2).numFmt = EUR; row.getCell(3).numFmt = EUR; row.getCell(4).numFmt = NUM; row.getCell(5).numFmt = EUR;
}
k++; const pr = wc.getRow(k); pr.values = ['Cimentación con precios de Pino', '', '', '', { formula: `E${p0}+E${p0 + 1}` }]; pr.font = { name: 'Arial', bold: true, size: 10 }; pr.getCell(5).numFmt = EUR;
k++; const eq = wc.getRow(k); eq.values = ['Presupuesto del equipo, por m³', '', '', { formula: `${P}G${TOT}/B7` }, { formula: `${P}G${TOT}` }]; body(eq, 5); eq.getCell(4).numFmt = '#,##0.00 "€/m³"'; eq.getCell(5).numFmt = EUR;
k++; wc.getCell(`A${k}`).value = 'Las partidas de Pino incluyen hormigón, acero, encofrado y mano de obra. La diferencia con el equipo es del orden del suministro de hormigón: por eso creemos que el manuscrito es solo mano de obra.';
wc.mergeCells(`A${k}:E${k}`); wc.getCell(`A${k}`).alignment = { wrapText: true }; wc.getCell(`A${k}`).font = { name: 'Arial', size: 10, color: { argb: 'FF5E6064' } }; wc.getRow(k).height = 30;

// ---------- Hoja 3: preguntas al equipo ----------
const wq = wb.addWorksheet('Preguntas al equipo', { views: [{ showGridLines: false }] });
wq.columns = [{ width: 5 }, { width: 100 }];
head(wq, 'Preguntas para cerrar el presupuesto', 'Antes de darlo por bueno.');
[
  'Hormigón (95 €/m³) y acero (0,95 €/kg) van aparte. ¿Confirmáis que vuestro precio no incluye ningún material salvo las placas?',
  '¿Quién hace y paga la excavación de zanjas, la retirada de tierras, el hormigón de limpieza y la grava de la cámara sanitaria?',
  'Canto de las zapatas: con 26 m³ sale ≈ 0,57 m. ¿Qué canto han previsto?',
  'Placas: el croquis tiene 12 (3 por muro). En cada muro interior apoyan dos módulos y cada uno lleva su pilar, así que salen 2 placas por eje: 18 en total. Las 32 € son la colocación; la placa se compra aparte a 220 €. ¿Incluye los pernos?',
  'Muretes transversales: 7,85 m en el croquis y 7,95 m en el cálculo. ¿Cuál es la buena?',
  'Medianera: ¿zapata propia de 0,75 m o común con la vivienda vecina, como la planteamos nosotros (1,20 m, mitad por vivienda)?',
  'Cota de coronación: con el suelo a +0,20, el marco queda a −0,05. ¿Lo tienen en cuenta en la altura de 0,70 m?',
  '¿Incluye bombeo, desencofrado, curado y limpieza de obra? ¿Plazo de ejecución?',
].forEach((q, i) => { const row = wq.getRow(4 + i); row.values = [i + 1, q]; body(row, 2); });

wb.xlsx.writeFile(out).then(() => console.log('ok', out));
