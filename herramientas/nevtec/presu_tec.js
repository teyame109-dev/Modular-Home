// Presupuesto técnico modular de Névola sobre el proyecto de ejecución (BC3 julio 2026)
const ExcelJS = require('exceljs');
const rows = require('./clasif.json');
const OUT = process.argv[2];
const NV = 16;
const wb = new ExcelJS.Workbook();
wb.creator = 'Iván Montero'; wb.calcProperties.fullCalcOnLoad = true;
const F = { name: 'Arial', size: 10 };
const HEAD = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F2A36' } };
const INPUT = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };
const CAPF = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE3E8EE' } };
const EUR = '#,##0.00 €;-#,##0.00 €;-', EUR0 = '#,##0 €;-#,##0 €;-', PCT = '0.0%;-0.0%;-', N2 = '#,##0.00;-#,##0.00;-';
const blue = { ...F, color: { argb: 'FF0000FF' } }, green = { ...F, color: { argb: 'FF008000' } }, bold = { ...F, bold: true };
const hdr = (ws, r) => { ws.getRow(r).eachCell(c => { c.font = { ...F, bold: true, color: { argb: 'FFFFFFFF' } }; c.fill = HEAD; c.alignment = { vertical: 'middle', wrapText: true }; }); ws.getRow(r).height = 30; };
const Z = wb.addWorksheet('Resumen', { properties: { tabColor: { argb: 'FF1F2A36' } } });

// ===================== SUPUESTOS =====================
const S = wb.addWorksheet('Supuestos', { properties: { tabColor: { argb: 'FFFFC000' } } });
[58, 14, 80].forEach((w, i) => S.getColumn(i + 1).width = w);
S.getCell('A1').value = 'SUPUESTOS DEL PRESUPUESTO TÉCNICO MODULAR (vivienda pareada tipo)'; S.getCell('A1').font = { ...F, bold: true, size: 13 };
S.getCell('A2').value = 'Amarillo = dato que se puede cambiar. Costes reales de fábrica, no precios de venta. El margen se aplica una sola vez, en el Resumen.'; S.getCell('A2').font = { ...F, italic: true };
S.getRow(4).values = ['Concepto', 'Valor', 'Origen']; hdr(S, 4);
const sup = [
  ['ipc', 'Actualización de costes 2024→2026', 0.12, PCT, 'Costes de construcción +5,46 % en 2025 (ACR) y +3,5 % interanual en abril de 2026 (Banco de España)'],
  ['kgm2', 'Acero estructural por m² construido (kg/m²)', 90, '0', 'Dato real: Mahón (proyecto 182, dos plantas) 13.516 kg / 151,2 m² = 89 kg/m². Bajar exige rediseñar el módulo con cálculo'],
  ['ckg', 'Coste del acero fabricado (€/kg): material, corte, soldadura, imprimación y pintura', 2.60, EUR, 'Material 0,80 €/kg en 2024 (Mahón) + soldadura propia. En 2024 el kg soldado costó 3,0–4,9 € subcontratado'],
  ['sc', 'Superficie construida de la vivienda pareada (m²)', 148.30, N2, 'Proyecto de ejecución, cuadro de superficies'],
  ['env', 'Envolvente vertical opaca, fachadas + medianera (m²)', 166.54, N2, 'Proyecto: XPS 100 mm en fachadas 2.664,64 m² / 16 viviendas'],
  ['aext', 'Fachada con acabado exterior (m²)', 140.0, N2, 'Envolvente opaca sin medianera, con los petos'],
  ['med', 'Medianera de la pareada (m²)', 26.94, N2, 'Proyecto, justificación del DB HE1'],
  ['cub', 'Cubierta (m²)', 74.70, N2, 'Proyecto: cubierta no transitable 1.195,45 m² / 16'],
  ['spb', 'Suelo de planta baja (m²)', 74.58, N2, 'Superficie construida de planta baja'],
  ['sp1', 'Forjado entre plantas (m²)', 73.72, N2, 'Superficie construida de planta primera'],
  ['mo', 'Mano de obra de fábrica (€/h, nómina + S.S.)', 23.0, EUR, 'Nóminas DWHAI sep–nov 2024'],
  ['hpan', 'Horas de montaje de panel por m²', 0.5, N2, 'Estimado: cuadrilla de 2 personas a 4 m²/h'],
  ['merma', 'Merma y cortes de panel', 0.05, PCT, 'Estimado'],
  ['pfach', 'Panel Tabihaus 8+50+8 (coste 2024, €/m²)', 42, EUR, 'Resumen Mahón 21/11/2024 (precio de material)'],
  ['pcub', 'Panel Tabihaus 8+65+8 (coste 2024, €/m²)', 52, EUR, 'Resumen Mahón 21/11/2024'],
  ['psue', 'Panel Tabihaus 8+120+8 (coste 2024, €/m²)', 64, EUR, 'Resumen Mahón 21/11/2024'],
  ['tras', 'Trasdosado interior de fachada con aislamiento (€/m²)', 31.85, EUR, 'Precio del proyecto: Knauf W625 (partida 507)'],
  ['supl', 'Suplemento de aislamiento para llegar a U = 0,20 (€/m²)', 10, EUR, 'PET 40 mm o reflexivo. El proyecto exige U = 0,20 en fachada'],
  ['acab', 'Acabado exterior sobre panel (€/m²)', 45, EUR, 'ESTIMADO: placa de cemento + monocapa. El proyecto pone monocapa a 22,36 €/m² sobre ladrillo'],
  ['scub', 'Sistema de cubierta sobre panel: pendientes, impermeabilización y grava (€/m²)', 88.80, EUR, 'Precio del proyecto (partida D08PD002), sin su XPS'],
  ['esc', 'Escalera metálica con peldaños (coste €/ud)', 2500, EUR0, 'Estimado. El proyecto pone losa + peldañeado: 822 €/vivienda'],
  ['junt', 'Juntas, sellados y remates entre módulos (€/vivienda)', 1500, EUR0, 'Estimado'],
  ['col', 'Colectores suspendidos bajo planta baja (€/vivienda)', 941.45, EUR, 'Partidas ISS010 del proyecto / 16: se mantienen'],
  ['nmod', 'Módulos por vivienda', 6, '0', '3 por planta, de unos 2,67 × 9,40 m'],
  ['tmod', 'Transporte por módulo (coste 2024, €)', 900, EUR0, 'Sotopinilla 2024: 780 €/módulo'],
  ['gru', 'Grúa por vivienda (€)', 1750, EUR0, 'Una grúa de 3.120 € por jornada montando 2 viviendas al día'],
  ['hmon', 'Horas de montaje en parcela por vivienda', 144, '0', '3 operarios × 6 días'],
  ['diet', 'Dietas y desplazamiento sobre el montaje', 0.15, PCT, 'Guadalix está a < 100 km de la fábrica'],
  ['ing', 'Ingeniería: cálculo modular y proyecto de fabricación (total)', 25000, EUR0, 'Estimado, una vez para toda la serie'],
  ['nv', 'Viviendas de la serie', 16, '0', ''],
  ['gfij', 'Gastos fijos de fábrica sin mano de obra (€/mes)', 20430, EUR0, 'Nave 8.500 + oficina técnica 6.100 + gestión 3.830 + suministros 1.600 + seguros 400'],
  ['ritmo', 'Viviendas fabricadas al mes con la cadena llena', 2, N2, 'Supuesto. Con 9 operarios: ≈ 520 h/vivienda de estructura y panel'],
  ['efi', 'Ahorro en fábrica sobre los precios del proyecto (partidas que se hacen igual)', 0.0, PCT, 'Prudente: 0 %. En fábrica es razonable un 8–12 %, porque no hay ayudas, andamios ni esperas'],
  ['mg', 'Margen RG21: gastos generales + beneficio', 0.10, PCT, 'Sobre el coste total'],
  ['ggbi', 'GG + BI de una contrata tradicional sobre PEM', 0.19, PCT, '13 % de gastos generales + 6 % de beneficio industrial (habitual)'],
];
const R = {};
sup.forEach(([k, l, v, f, c], i) => { const r = 5 + i; R[k] = `Supuestos!$B$${r}`; S.getCell(r, 1).value = l; S.getCell(r, 2).value = v; S.getCell(r, 2).numFmt = f; S.getCell(r, 2).fill = INPUT; S.getCell(r, 2).font = blue; S.getCell(r, 3).value = c; });
const $ = k => R[k];

// ===================== PROYECTO POR ALCANCE =====================
const P = wb.addWorksheet('Proyecto por alcance', { views: [{ state: 'frozen', ySplit: 4 }] });
[10, 8, 16, 62, 6, 13, 12, 12, 14, 13].forEach((w, i) => P.getColumn(i + 1).width = w);
P.getCell('A1').value = 'PROYECTO DE EJECUCIÓN NÉVOLA (BC3 julio 2026): 309 PARTIDAS CLASIFICADAS POR ALCANCE'; P.getCell('A1').font = { ...F, bold: true, size: 13 };
P.getCell('A2').value = 'FUERA = lo ejecuta el promotor u otra contrata (urbanización, cimentación, piscina, acometidas). SUSTITUYE = lo cambia el sistema modular. IGUAL = se ejecuta igual en fábrica que en obra.';
P.getCell('A2').font = { ...F, italic: true };
P.getRow(4).values = ['Alcance', 'Capítulo', 'Código', 'Descripción', 'Ud', 'Cantidad total', 'Cant./vivienda', 'Precio proyecto', 'Importe total', 'Importe/vivienda']; hdr(P, 4);
const order = { SUST: 1, IGUAL: 2, FUERA: 3 };
const lbl = { SUST: 'SUSTITUYE', IGUAL: 'IGUAL', FUERA: 'FUERA' };
const sorted = rows.slice().sort((a, b) => order[a.g] - order[b.g] || a.cap0.localeCompare(b.cap0));
let r = 5;
for (const o of sorted) {
  P.getRow(r).values = [lbl[o.g], o.cap0, o.code, o.name, o.u, o.qty, null, o.price, null, null];
  P.getCell(r, 7).value = { formula: `F${r}/${$('nv')}` }; P.getCell(r, 9).value = { formula: `F${r}*H${r}` }; P.getCell(r, 10).value = { formula: `I${r}/${$('nv')}` };
  [6, 8].forEach(c => P.getCell(r, c).font = blue);
  P.getCell(r, 6).numFmt = N2; P.getCell(r, 7).numFmt = N2; P.getCell(r, 8).numFmt = EUR; P.getCell(r, 9).numFmt = EUR0; P.getCell(r, 10).numFmt = EUR0;
  if (o.g === 'FUERA') P.getRow(r).eachCell(c => c.font = { ...(c.font || F), color: { argb: 'FF8A8A8A' } });
  r++;
}
const PL = r - 1;
const pSum = g => `SUMIF('Proyecto por alcance'!$A$5:$A$${PL},"${g}",'Proyecto por alcance'!$J$5:$J$${PL})`;
r++;
P.getCell(r, 4).value = 'TOTAL PEM DEL PROYECTO'; P.getCell(r, 4).font = bold; P.getCell(r, 9).value = { formula: `SUM(I5:I${PL})` }; P.getCell(r, 9).numFmt = EUR0; P.getCell(r, 9).font = bold;
P.getCell(r + 1, 4).value = 'Comprobación: PEM del BC3'; P.getCell(r + 1, 9).value = 2915671.71; P.getCell(r + 1, 9).numFmt = EUR0; P.getCell(r + 1, 9).font = blue;
P.autoFilter = { from: 'A4', to: `J${PL}` };

// ===================== SISTEMA MODULAR =====================
const M = wb.addWorksheet('Sistema modular');
[60, 7, 12, 14, 14, 60].forEach((w, i) => M.getColumn(i + 1).width = w);
M.getCell('A1').value = 'COSTE DEL SISTEMA MODULAR QUE SUSTITUYE ESTRUCTURA Y ENVOLVENTE (por vivienda pareada)'; M.getCell('A1').font = { ...F, bold: true, size: 13 };
M.getCell('A2').value = 'Sustituye a forjados, solera ventilada, losa de escalera, cubiertas, fábrica de ladrillo, enfoscados, monocapa, aislamientos y trasdosado del proyecto.'; M.getCell('A2').font = { ...F, italic: true };
M.getRow(4).values = ['Partida', 'Ud', 'Cantidad', 'Coste unitario', 'Importe', 'Cómo se calcula']; hdr(M, 4);
const panel = k => `(${$(k)}*(1+${$('ipc')})*(1+${$('merma')})+${$('hpan')}*${$('mo')})`;
const mod = [
  ['Estructura de acero de los 6 módulos (pilares, vigas, correas, arriostramientos)', 'kg', `${$('kgm2')}*${$('sc')}`, $('ckg'), 'kg/m² × m² construidos × coste del kg fabricado'],
  ['Panel sándwich 8+50+8 en fachadas y medianera, colocado', 'm²', $('env'), panel('pfach'), 'Panel con IPC y merma + horas de montaje'],
  ['Trasdosado interior con aislamiento (como el proyecto)', 'm²', $('env'), $('tras'), 'Precio del proyecto'],
  ['Suplemento de aislamiento para U = 0,20', 'm²', $('env'), $('supl'), ''],
  ['Acabado exterior sobre panel', 'm²', $('aext'), $('acab'), 'ESTIMADO: pedir precio'],
  ['Doble placa de protección contra incendios en medianera', 'm²', $('med'), `13.56*(1+${$('ipc')})`, 'Placa 13 mm del banco de precios'],
  ['Panel sándwich 8+65+8 de cubierta, colocado', 'm²', $('cub'), panel('pcub'), ''],
  ['Sistema de cubierta sobre panel: pendientes, impermeabilización y grava', 'm²', $('cub'), $('scub'), 'Precio del proyecto, sin su XPS'],
  ['Panel sándwich 8+120+8 en suelo de planta baja, colocado', 'm²', $('spb'), panel('psue'), 'Sustituye a la solera ventilada Cáviti'],
  ['Panel sándwich 8+65+8 en suelo de planta primera, colocado', 'm²', $('sp1'), panel('pcub'), 'Sustituye al forjado unidireccional'],
  ['Escalera metálica con peldaños', 'ud', '1', $('esc'), 'Sustituye a losa + peldañeado'],
  ['Juntas, sellados y remates entre módulos', 'ud', '1', $('junt'), ''],
  ['Colectores suspendidos bajo planta baja (como el proyecto)', 'ud', '1', $('col'), ''],
];
let mr = 5;
for (const [a, u, q, p, c] of mod) { M.getCell(mr, 1).value = a; M.getCell(mr, 2).value = u; M.getCell(mr, 3).value = { formula: q }; M.getCell(mr, 4).value = { formula: p }; M.getCell(mr, 5).value = { formula: `C${mr}*D${mr}` }; M.getCell(mr, 6).value = c; M.getCell(mr, 3).numFmt = N2; M.getCell(mr, 4).numFmt = EUR; M.getCell(mr, 5).numFmt = EUR0; mr++; }
const mEnd = mr - 1;
M.getCell(mr, 1).value = 'COSTE SISTEMA MODULAR (sustituye)'; M.getCell(mr, 1).font = bold; M.getCell(mr, 5).value = { formula: `SUM(E5:E${mEnd})` }; M.getCell(mr, 5).numFmt = EUR0; M.getCell(mr, 5).font = bold;
const mTot = `'Sistema modular'!$E$${mr}`;
const mSteel = `'Sistema modular'!$E$5`;
mr += 2;
M.getCell(mr, 1).value = 'ESPECÍFICOS DE LA CONSTRUCCIÓN MODULAR'; M.getCell(mr, 1).font = bold; mr++;
M.getRow(mr).values = ['Partida', 'Ud', 'Cantidad', 'Coste unitario', 'Importe', 'Cómo se calcula']; hdr(M, mr); mr++;
const esp = [
  ['Transporte de módulos Seseña – Guadalix', 'ud', $('nmod'), `${$('tmod')}*(1+${$('ipc')})`, ''],
  ['Grúa de colocación', 'ud', '1', $('gru'), 'Compartida: 2 viviendas por jornada'],
  ['Montaje en parcela: uniones, conexión de instalaciones y remates', 'h', $('hmon'), `${$('mo')}*(1+${$('diet')})`, ''],
  ['Ingeniería: cálculo modular y proyecto de fabricación', 'ud', '1', `${$('ing')}/${$('nv')}`, 'Repartida entre las 16 viviendas'],
  ['Gastos fijos de fábrica (nave, oficina técnica, gestión)', 'ud', '1', `${$('gfij')}/${$('ritmo')}`, 'Gasto mensual / viviendas al mes'],
];
const e0 = mr;
for (const [a, u, q, p, c] of esp) { M.getCell(mr, 1).value = a; M.getCell(mr, 2).value = u; M.getCell(mr, 3).value = { formula: q }; M.getCell(mr, 4).value = { formula: p }; M.getCell(mr, 5).value = { formula: `C${mr}*D${mr}` }; M.getCell(mr, 6).value = c; M.getCell(mr, 3).numFmt = N2; M.getCell(mr, 4).numFmt = EUR; M.getCell(mr, 5).numFmt = EUR0; mr++; }
M.getCell(mr, 1).value = 'COSTE ESPECÍFICOS MODULARES'; M.getCell(mr, 1).font = bold; M.getCell(mr, 5).value = { formula: `SUM(E${e0}:E${mr - 1})` }; M.getCell(mr, 5).numFmt = EUR0; M.getCell(mr, 5).font = bold;
const eTot = `'Sistema modular'!$E$${mr}`;

// ===================== RESUMEN =====================
[62, 17, 17, 17].forEach((w, i) => Z.getColumn(i + 1).width = w);
Z.getCell('A1').value = 'NÉVOLA: PRESUPUESTO TÉCNICO MODULAR SOBRE EL PROYECTO DE EJECUCIÓN'; Z.getCell('A1').font = { ...F, bold: true, size: 14 };
Z.getCell('A2').value = 'Base: BC3 «NEVOLA EJECUCIÓN_DEF julio 2026» (PEM 2.915.671,71 €, 16 viviendas). Importes por vivienda pareada (148,30 m²) y sin IVA.';
Z.getCell('A2').font = { ...F, italic: true };
Z.getRow(4).values = ['Concepto', 'Por vivienda', '€/m² construido', 'Serie de 16']; hdr(Z, 4);
const L = [
  ['PROYECTO TRADICIONAL (alcance vivienda: sin urbanización, cimentación, piscina ni acometidas)', null, true],
  ['  PEM de lo que sustituye el sistema modular (estructura, cubierta, fachada, aislamientos)', pSum('SUSTITUYE')],
  ['  PEM de lo que se ejecuta igual (instalaciones, carpinterías, acabados)', pSum('IGUAL')],
  ['  PEM alcance vivienda', 'SUM(B6:B7)', false, true],
  ['  Precio de contrata tradicional (PEM + GG + BI)', `B8*(1+${$('ggbi')})`, false, true],
  ['', null],
  ['RG21 MODULAR (coste real)', null, true],
  ['  Sistema modular (sustituye)', mTot],
  ['  Partidas iguales a precio de proyecto, con ahorro de fábrica', `B7*(1-${$('efi')})`],
  ['  Específicos modulares: transporte, grúa, montaje, ingeniería, fábrica', eTot],
  ['  COSTE RG21', 'SUM(B12:B14)', false, true],
  ['  Margen RG21 (GG + beneficio)', `B15*${$('mg')}`],
  ['  PRECIO RG21', 'B15+B16', false, true],
  ['', null],
  ['Diferencia del precio RG21 con la contrata tradicional', 'B17-B9', false, true],
  ['Diferencia en %', 'IF(B9=0,"",B19/B9)'],
  ['Precio de la oferta comercial de septiembre (pareada, serie)', '250600'],
  ['Bajada sobre la oferta comercial', 'B17-B21'],
];
L.forEach(([t, f, isHead, isBold], i) => {
  const rr = 5 + i; Z.getCell(rr, 1).value = t;
  if (isHead) { Z.getRow(rr).eachCell({ includeEmpty: true }, (c, n) => { if (n <= 4) { c.fill = CAPF; c.font = bold; } }); }
  if (f) {
    Z.getCell(rr, 2).value = { formula: f }; Z.getCell(rr, 2).numFmt = rr === 20 ? PCT : EUR0;
    if (rr !== 20) { Z.getCell(rr, 3).value = { formula: `B${rr}/${$('sc')}` }; Z.getCell(rr, 3).numFmt = EUR0; Z.getCell(rr, 4).value = { formula: `B${rr}*${$('nv')}` }; Z.getCell(rr, 4).numFmt = EUR0; }
    if (isBold) [1, 2, 3, 4].forEach(c => Z.getCell(rr, c).font = bold);
  }
});
Z.getCell(21, 2).font = blue;
// escenarios
const s0 = 25;
Z.getCell(s0, 1).value = 'ESCENARIOS: PRECIO RG21 POR VIVIENDA'; Z.getCell(s0, 1).font = { ...F, bold: true, size: 12 };
Z.getCell(s0 + 1, 1).value = 'Cambia el acero por m² (filas) y el ahorro de fábrica en partidas iguales (columnas). Resto de supuestos como en la hoja Supuestos.'; Z.getCell(s0 + 1, 1).font = { ...F, italic: true };
Z.getRow(s0 + 2).values = ['Acero (kg/m²)', 'Ahorro 0 %', 'Ahorro 8 %', 'Ahorro 12 %']; hdr(Z, s0 + 2);
const effs = [0, 0.08, 0.12]; const kgs = [90, 75, 65, 55, 45];
// resto = coste - acero - iguales ajustados
const resto = `(B15-${mSteel}-B13)`;
kgs.forEach((kg, i) => {
  const rr = s0 + 3 + i; Z.getCell(rr, 1).value = `${kg} kg/m²`;
  effs.forEach((ef, j) => { Z.getCell(rr, 2 + j).value = { formula: `(${resto}+${kg}*${$('sc')}*${$('ckg')}+$B$7*(1-${ef}))*(1+${$('mg')})` }; Z.getCell(rr, 2 + j).numFmt = EUR0; });
});
const sc2 = s0 + 3 + kgs.length;
Z.getCell(sc2, 1).value = 'Referencia: contrata tradicional del mismo alcance'; Z.getCell(sc2, 2).value = { formula: 'B9' }; Z.getCell(sc2, 2).numFmt = EUR0; Z.getCell(sc2, 1).font = bold; Z.getCell(sc2, 2).font = bold;
// notas
const n0 = sc2 + 2;
[
  'LECTURA',
  '1. La oferta comercial de septiembre salía cara porque sumaba márgenes: precios de venta de DWHAI a Tini de 2024, más IPC, más un 12 %. Aquí todo va a coste real y el margen se aplica una vez.',
  '2. Las partidas que se hacen igual (carpinterías, instalaciones, acabados, sanitarios) se valoran con las mediciones y los precios del propio proyecto. Son precios de mercado de 2026 y el promotor los reconoce.',
  '3. El acero va a 90 kg/m², el dato real de Mahón (dos plantas, 2024). Cada 10 kg/m² que el cálculo consiga bajar son unos 3.900 € menos por vivienda.',
  '4. Queda fuera lo que el proyecto pone en urbanización, cimentación, movimiento de tierras, saneamiento enterrado, acometidas, piscina, seguridad y salud, control de calidad y residuos: 51.368 €/vivienda de PEM que el promotor sigue teniendo.',
  '5. El modular ahorra al promotor la solera ventilada Cáviti, las ayudas de albañilería y buena parte del plazo de obra (costes financieros, seguridad y salud, gastos de obra). No está valorado aquí.',
].forEach((t, i) => { const c = Z.getCell(n0 + i, 1); c.value = t; c.font = i === 0 ? { ...F, bold: true } : F; Z.mergeCells(n0 + i, 1, n0 + i, 4); c.alignment = { wrapText: true, vertical: 'top' }; if (i) Z.getRow(n0 + i).height = 30; });

for (const ws of wb.worksheets) ws.eachRow(row => row.eachCell(c => { if (!c.font || !c.font.name) c.font = { ...F, ...(c.font || {}) }; }));
wb.xlsx.writeFile(OUT).then(() => console.log('OK', OUT, 'filas proyecto', PL - 4));
