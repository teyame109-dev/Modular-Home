// Estudio de costes del piloto Névola (Excel con fórmulas)
const ExcelJS = require('exceljs');
const { mods, acero, kgTot, area, env } = require('./piloto_calc');
const rows = require('./clasif.json');
const OUT = process.argv[2];
const wb = new ExcelJS.Workbook(); wb.creator = 'Iván Montero'; wb.calcProperties.fullCalcOnLoad = true;
const F = { name: 'Arial', size: 10 }, bold = { ...F, bold: true };
const HEAD = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF141414' } }, INPUT = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF6DDD4' } }, CAPF = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE7E8E3' } };
const EUR = '#,##0.00 €;-#,##0.00 €;-', EUR0 = '#,##0 €;-#,##0 €;-', PCT = '0.0%;-0.0%;-', N2 = '#,##0.00;-#,##0.00;-';
const blue = { ...F, bold: true, color: { argb: 'FF9C2E18' } };
const hdr = (ws, r) => { ws.getRow(r).eachCell(c => { c.font = { ...F, bold: true, color: { argb: 'FFE7E8E3' } }; c.fill = HEAD; c.alignment = { vertical: 'middle', wrapText: true }; c.border = { bottom: { style: 'thick', color: { argb: 'FFC8381F' } } }; }); ws.getRow(r).height = 30; };
const title = (ws, t, s) => { ws.getCell('A1').value = t; ws.getCell('A1').font = { ...F, bold: true, size: 15, color: { argb: 'FF141414' } }; ws.getRow(1).height = 24; if (s) { ws.getCell('A2').value = s; ws.getCell('A2').font = { ...F, size: 9.5, color: { argb: 'FF5E6064' } }; } };
const Z = wb.addWorksheet('Resumen piloto', { properties: { tabColor: { argb: 'FF1F2A36' } } });

// ---------- Supuestos ----------
const S = wb.addWorksheet('Supuestos', { properties: { tabColor: { argb: 'FFFFC000' } } });
[62, 14, 82].forEach((w, i) => S.getColumn(i + 1).width = w);
title(S, 'SUPUESTOS DEL ESTUDIO DEL PILOTO', 'Celdas rosadas con cifra en rojo minio = editables. Costes reales de fábrica de 2026; el margen se aplica una vez en el Resumen.');
S.getRow(4).values = ['Concepto', 'Valor', 'Origen']; hdr(S, 4);
const sup = [
  ['ipc', 'Actualización de costes 2024→2026', 0.12, PCT, 'ACR 2025 +5,46 %; Banco de España abril 2026 +3,5 %'],
  ['ckg', 'Coste del acero fabricado (€/kg): material, corte, soldadura, imprimación y pintura', 2.60, EUR, 'Material 0,80 €/kg en 2024 (Mahón) + soldadura propia'],
  ['mo', 'Mano de obra de fábrica (€/h)', 23, EUR, 'Nóminas DWHAI sep–nov 2024'],
  ['hpan', 'Horas de montaje de panel por m²', 0.5, N2, 'Estimado'],
  ['merma', 'Merma de panel', 0.05, PCT, ''],
  ['p66', 'Panel Tabihaus 8+50+8 (coste 2024 €/m²)', 42, EUR, 'Resumen Mahón 21/11/2024'],
  ['p81', 'Panel Tabihaus 8+65+8 (coste 2024 €/m²)', 52, EUR, 'Resumen Mahón 21/11/2024'],
  ['p136', 'Panel Tabihaus 8+120+8 (coste 2024 €/m²)', 64, EUR, 'Resumen Mahón 21/11/2024'],
  ['tras', 'Trasdosado interior con aislamiento (€/m²)', 31.85, EUR, 'Precio del proyecto (Knauf W625)'],
  ['supl', 'Suplemento de aislamiento para U = 0,20 en fachada (€/m²)', 10, EUR, 'PET 40 mm'],
  ['acab', 'Acabado exterior sobre panel (€/m²)', 45, EUR, 'ESTIMADO: placa de cemento + monocapa / aplacado. Pedir precio'],
  ['scub', 'Sistema de cubierta no transitable sobre panel (€/m²)', 88.80, EUR, 'Precio del proyecto (D08PD002)'],
  ['ster', 'Sistema de cubierta transitable sobre panel (€/m²)', 97.54, EUR, 'Precio del proyecto (QAB010b)'],
  ['junt', 'Sellado y tapajuntas entre módulos (€/m)', 25, EUR, 'Estimado'],
  ['col', 'Colectores suspendidos bajo planta baja (€)', 941.45, EUR, 'Proyecto / 16'],
  ['efi', 'Ahorro de fábrica sobre las partidas que se hacen igual', 0, PCT, 'Prudente en el piloto: 0 %'],
  ['apr', 'Sobrecoste de primera unidad sobre mano de obra de fábrica', 0.15, PCT, 'Curva de aprendizaje del prototipo'],
  ['tmod', 'Transporte por módulo (coste 2024 €)', 900, EUR0, 'Sotopinilla 2024: 780 €'],
  ['tesp', 'Transporte de la pieza de vuelo lateral (0,60 × 8,47 m)', 600, EUR0, 'Estimado: viaje aparte en camión pluma'],
  ['gru', 'Grúa: jornada completa (coste 2024 €)', 3120, EUR0, 'Sotopinilla 2024 (Moreno)'],
  ['hmon', 'Horas de montaje en parcela', 192, '0', '3 operarios × 8 días (primera unidad)'],
  ['diet', 'Dietas y desplazamientos sobre montaje', 0.15, PCT, ''],
  ['ing', 'Ingeniería: cálculo modular y proyecto de fabricación (€)', 25000, EUR0, 'Estimado, para toda la serie'],
  ['gfij', 'Gastos fijos de fábrica sin mano de obra (€/mes)', 20430, EUR0, 'Nave, oficina técnica, gestión, suministros, seguros'],
  ['ritmo', 'Viviendas al mes en serie', 2, N2, ''],
  ['mesp', 'Meses de fábrica imputados al piloto si se fabrica aislado', 1.5, N2, 'Primera unidad sin otras obras en la nave'],
  ['mg', 'Margen RG21 (GG + beneficio)', 0.10, PCT, ''],
  ['ggbi', 'GG + BI de una contrata tradicional sobre PEM', 0.19, PCT, ''],
];
const R = {}; sup.forEach(([k, l, v, f, c], i) => { const r = 5 + i; R[k] = `Supuestos!$B$${r}`; S.getRow(r).values = [l, v, c]; S.getCell(r, 2).numFmt = f; S.getCell(r, 2).fill = INPUT; S.getCell(r, 2).font = blue; });
const $ = k => R[k];

// ---------- Módulos ----------
const Mo = wb.addWorksheet('Módulos');
[8, 8, 12, 12, 12, 12, 58].forEach((w, i) => Mo.getColumn(i + 1).width = w);
title(Mo, 'MODULACIÓN DE LA VIVIENDA PAREADA (piloto)', 'Seis módulos de acero, tres por planta, sin cambiar la distribución: anchos de 3,20 / 2,30 / 2,35 m (juntas a 3,20 y 5,50 m en planta baja). La planta primera vuela 0,60 m en frente y lateral; el vuelo lateral es una pieza aparte (V) que se atornilla al M4 en parcela. La junta a 3,20 m cruza el dormitorio 1 y se oculta en suelo y techo.');
Mo.getRow(4).values = ['Módulo', 'Planta', 'Ancho (m)', 'Largo (m)', 'Alto (m)', 'Superficie (m²)', 'Qué contiene']; hdr(Mo, 4);
[...mods, { id: 'V', planta: 'P1', ancho: 0.60, largo: 8.47, alto: 0.30, uso: 'Pieza de vuelo lateral, se monta en parcela (no es módulo volumétrico)' }].forEach((m, i) => { const r = 5 + i; Mo.getRow(r).values = [m.id, m.planta, m.ancho, m.largo, m.alto, null, m.uso]; Mo.getCell(r, 6).value = { formula: `C${r}*D${r}` }; [3, 4, 5].forEach(c => { Mo.getCell(r, c).numFmt = N2; Mo.getCell(r, c).font = blue; }); Mo.getCell(r, 6).numFmt = N2; });
Mo.getCell(12, 1).value = 'TOTAL'; Mo.getCell(12, 1).font = bold; Mo.getCell(12, 6).value = { formula: 'SUM(F5:F11)' }; Mo.getCell(12, 6).numFmt = N2; Mo.getCell(12, 6).font = bold;
Mo.getCell(14, 1).value = 'Transporte: el módulo más alto mide unos 3,05 m; en góndola rebajada (0,85 m) queda en ≈ 3,90 m, dentro del límite de 4,00 m. Ningún módulo pasa de 3,20 m de ancho: todos viajan sin transporte especial. La pieza de vuelo va aparte.';
Mo.mergeCells('A14:G14'); Mo.getCell('A14').alignment = { wrapText: true }; Mo.getRow(14).height = 30;

// ---------- Acero ----------
const A = wb.addWorksheet('Acero');
[10, 66, 12, 12, 14].forEach((w, i) => A.getColumn(i + 1).width = w);
title(A, 'MEDICIÓN DE ACERO POR ELEMENTO (tipología del proyecto de Mahón 182)', 'Mismos perfiles y cuantías de correas y secundaria que Mahón; marcos, pilares y vuelos medidos sobre la modulación de Névola.');
A.getRow(4).values = ['Módulo', 'Elemento', 'Medición (m)', 'kg/m', 'kg']; hdr(A, 4);
let ar = 5; for (const [m, el, q, k] of acero) { A.getRow(ar).values = [m, el, +q.toFixed(2), k, null]; A.getCell(ar, 5).value = { formula: `C${ar}*D${ar}` }; A.getCell(ar, 3).numFmt = N2; A.getCell(ar, 4).numFmt = N2; A.getCell(ar, 5).numFmt = '#,##0'; A.getCell(ar, 3).font = blue; ar++; }
const aEnd = ar - 1;
A.getCell(ar, 2).value = 'TOTAL ACERO'; A.getCell(ar, 2).font = bold; A.getCell(ar, 5).value = { formula: `SUM(E5:E${aEnd})` }; A.getCell(ar, 5).numFmt = '#,##0'; A.getCell(ar, 5).font = bold;
const KG = `Acero!$E$${ar}`;
A.getCell(ar + 1, 2).value = 'kg por m² construido (148,30 m²)'; A.getCell(ar + 1, 5).value = { formula: `E${ar}/148.3` }; A.getCell(ar + 1, 5).numFmt = '0.0';
A.getCell(ar + 2, 2).value = 'Referencia Mahón (proyecto 182): 13.516 kg / 151,2 m² = 89 kg/m²';

// ---------- Envolvente ----------
const E = wb.addWorksheet('Sistema modular');
[64, 7, 12, 14, 14, 52].forEach((w, i) => E.getColumn(i + 1).width = w);
title(E, 'COSTE DEL SISTEMA MODULAR DEL PILOTO (estructura, envolvente y forjados)', 'Mediciones sobre la modulación. Sustituye estructura de hormigón, solera Cáviti, cubiertas, ladrillo, enfoscados, monocapa y aislamientos del proyecto.');
E.getRow(4).values = ['Partida', 'Ud', 'Medición', 'Coste unitario', 'Importe', 'Medición / precio']; hdr(E, 4);
const pan = k => `(${$(k)}*(1+${$('ipc')})*(1+${$('merma')})+${$('hpan')}*${$('mo')})`;
const sis = [
  ['Estructura de acero de los 6 módulos (hoja Acero)', 'kg', KG, $('ckg'), ''],
  ['Panel 8+50+8 en fachadas opacas (con petos)', 'm²', env.fach_opaca, pan('p66'), 'Fachada bruta 188,2 m² − 22 m² de huecos (proyecto: 166,5 m²)'],
  ['Panel 8+50+8 en medianera (cada vivienda cierra sus módulos)', 'm²', env.medianera, pan('p66'), 'Planta baja 29,9 + planta primera 38,4 m²'],
  ['Panel 8+50+8 en la cara inferior de los vuelos', 'm²', env.sofito, pan('p66'), 'Vuelo de 0,60 m en frente y lateral'],
  ['Trasdosado interior con aislamiento (fachada y medianera)', 'm²', env.fach_opaca + env.medianera, $('tras'), 'Precio del proyecto'],
  ['Suplemento de aislamiento para U = 0,20', 'm²', env.fach_opaca, $('supl'), ''],
  ['Acabado exterior sobre panel (fachadas y vuelos)', 'm²', env.fach_opaca + env.sofito, $('acab'), 'ESTIMADO'],
  ['Panel 8+65+8 de cubierta (planta primera + terraza)', 'm²', env.cubierta + env.terraza, pan('p81'), ''],
  ['Sistema de cubierta no transitable sobre panel', 'm²', env.cubierta, $('scub'), 'Precio del proyecto'],
  ['Sistema de cubierta transitable en terraza', 'm²', env.terraza, $('ster'), 'Precio del proyecto'],
  ['Panel 8+120+8 en suelo de planta baja', 'm²', env.suelo_pb, pan('p136'), 'Sustituye a la solera Cáviti'],
  ['Panel 8+65+8 en suelo de planta primera', 'm²', env.suelo_p1, pan('p81'), 'Sustituye al forjado unidireccional'],
  ['Sellado y tapajuntas entre módulos', 'm', env.juntas_ml, $('junt'), 'Juntas verticales y perímetro entre plantas'],
  ['Colectores suspendidos bajo planta baja', 'ud', 1, $('col'), 'Como el proyecto'],
];
let er = 5;
for (const [a, u, q, p, c] of sis) { E.getCell(er, 1).value = a; E.getCell(er, 2).value = u; E.getCell(er, 3).value = typeof q === 'number' ? +q.toFixed(2) : { formula: q }; if (typeof q === 'number') E.getCell(er, 3).font = blue; E.getCell(er, 4).value = { formula: p }; E.getCell(er, 5).value = { formula: `C${er}*D${er}` }; E.getCell(er, 6).value = c; E.getCell(er, 3).numFmt = N2; E.getCell(er, 4).numFmt = EUR; E.getCell(er, 5).numFmt = EUR0; er++; }
E.getCell(er, 1).value = 'TOTAL SISTEMA MODULAR'; E.getCell(er, 1).font = bold; E.getCell(er, 5).value = { formula: `SUM(E5:E${er - 1})` }; E.getCell(er, 5).numFmt = EUR0; E.getCell(er, 5).font = bold;
const SIS = `'Sistema modular'!$E$${er}`;
// mano de obra de fábrica contenida (para el sobrecoste de primera unidad): acero (coste kg − material 0,90 − pintura 0,24) + horas de panel
const panelM2 = env.fach_opaca + env.medianera + env.sofito + env.cubierta + env.terraza + env.suelo_pb + env.suelo_p1;
const MOFAB = `(${KG}*(${$('ckg')}-0.90-0.24)+${panelM2.toFixed(2)}*${$('hpan')}*${$('mo')})`;

// ---------- Partidas iguales ----------
const I = wb.addWorksheet('Partidas iguales');
[10, 60, 16].forEach((w, i) => I.getColumn(i + 1).width = w);
title(I, 'PARTIDAS QUE SE EJECUTAN IGUAL (mediciones y precios del proyecto, por vivienda)', 'Instalaciones, carpinterías, acabados, sanitarios y pruebas. Importe del proyecto / 16 viviendas.');
I.getRow(4).values = ['Capítulo', 'Descripción', 'PEM por vivienda']; hdr(I, 4);
const capName = { 'C.03': 'Saneamiento interior (bajantes)', 'C.07': 'Impermeabilización de zonas húmedas y aislamiento acústico', 'C.08': 'Tabiquería, falsos techos y mampara', 'C.09': 'Alicatados, solados, peldaños, vierteaguas y albardillas', 'C.10': 'Carpintería interior y armarios', 'C.11': 'Carpintería exterior, recercados y barandillas', 'C.12': 'Pintura', 'C.13': 'Electricidad y telecomunicaciones', 'C.14': 'Fontanería y aparatos sanitarios', 'C.15': 'Climatización, ACS y ventilación', 'C.19': 'Pruebas de servicio y de estanqueidad' };
const caps = [...new Set(rows.filter(r => r.g === 'IGUAL').map(r => r.cap0))].sort();
let ir = 5; for (const c of caps) { const v = rows.filter(r => r.g === 'IGUAL' && r.cap0 === c).reduce((a, b) => a + b.imp, 0) / 16; I.getRow(ir).values = [c, capName[c] || c, +v.toFixed(2)]; I.getCell(ir, 3).numFmt = EUR0; I.getCell(ir, 3).font = blue; ir++; }
I.getCell(ir, 2).value = 'TOTAL'; I.getCell(ir, 2).font = bold; I.getCell(ir, 3).value = { formula: `SUM(C5:C${ir - 1})` }; I.getCell(ir, 3).numFmt = EUR0; I.getCell(ir, 3).font = bold;
const IG = `'Partidas iguales'!$C$${ir}`;
const sust = rows.filter(r => r.g === 'SUST').reduce((a, b) => a + b.imp, 0) / 16;

// ---------- Resumen ----------
[66, 18, 18].forEach((w, i) => Z.getColumn(i + 1).width = w);
title(Z, 'NÉVOLA · VIVIENDA PILOTO EN SISTEMA MODULAR · ESTUDIO DE COSTES', 'Pareada tipo de 148,30 m². Proyecto de ejecución de julio de 2026. Sin IVA. Dos escenarios: piloto como primera unidad de la serie, o piloto aislado.');
Z.getRow(4).values = ['Concepto', 'Piloto dentro de la serie', 'Piloto aislado']; hdr(Z, 4);
const L = [
  ['Estructura y envolvente modular (hoja Sistema modular)', SIS, SIS],
  ['Partidas que se ejecutan igual (proyecto)', `${IG}*(1-${$('efi')})`, `${IG}*(1-${$('efi')})`],
  ['Sobrecoste de primera unidad en mano de obra de fábrica', `${MOFAB}*${$('apr')}`, `${MOFAB}*${$('apr')}`],
  ['Transporte de 6 módulos + pieza de vuelo', `6*${$('tmod')}*(1+${$('ipc')})+${$('tesp')}`, `6*${$('tmod')}*(1+${$('ipc')})+${$('tesp')}`],
  ['Grúa (jornada completa)', `${$('gru')}*(1+${$('ipc')})`, `${$('gru')}*(1+${$('ipc')})`],
  ['Montaje en parcela', `${$('hmon')}*${$('mo')}*(1+${$('diet')})`, `${$('hmon')}*${$('mo')}*(1+${$('diet')})`],
  ['Ingeniería: cálculo modular y proyecto de fabricación', `${$('ing')}/16`, `${$('ing')}`],
  ['Gastos fijos de fábrica imputados', `${$('gfij')}/${$('ritmo')}`, `${$('gfij')}*${$('mesp')}`],
];
L.forEach(([t, a, b], i) => { const r = 5 + i; Z.getCell(r, 1).value = t; Z.getCell(r, 2).value = { formula: a }; Z.getCell(r, 3).value = { formula: b }; [2, 3].forEach(c => Z.getCell(r, c).numFmt = EUR0); });
const tail = [
  ['COSTE DEL PILOTO', 'SUM(B5:B12)', 'SUM(C5:C12)', true],
  ['Margen RG21', `B13*${$('mg')}`, `C13*${$('mg')}`],
  ['PRECIO DEL PILOTO (sin IVA)', 'B13+B14', 'C13+C14', true],
  ['€/m² construido', 'B15/148.3', 'C15/148.3'],
  ['', null, null],
  ['Referencia: contrata tradicional del mismo alcance (PEM del proyecto × 1,19)', `(${sust.toFixed(2)}+${IG})*(1+${$('ggbi')})`, `(${sust.toFixed(2)}+${IG})*(1+${$('ggbi')})`],
  ['Diferencia con la contrata tradicional', 'B15-B18', 'C15-C18'],
  ['Precio del piloto en la propuesta integral', '225400', '273600'],
];
tail.forEach(([t, a, b, bo], i) => { const r = 13 + i; Z.getCell(r, 1).value = t; if (a) { Z.getCell(r, 2).value = { formula: a }; Z.getCell(r, 3).value = { formula: b }; [2, 3].forEach(c => Z.getCell(r, c).numFmt = EUR0); } if (bo) { [1, 2, 3].forEach(c => { Z.getCell(r, c).font = bold; Z.getCell(r, c).fill = CAPF; }); } });
const n0 = 23;
['LECTURA',
 '1. El acero medido sobre la modulación sale a 13.216 kg (89,1 kg/m²), en línea con Mahón (89 kg/m²). Es el 30 % del coste del sistema modular.',
 '2. La fachada medida (166,2 m² opacos) coincide con la del proyecto (166,5 m²). En pareadas, cada vivienda cierra sus módulos: 68,3 m² de medianera con panel.',
 '3. «Piloto dentro de la serie» reparte la ingeniería entre 16 y carga los gastos fijos al ritmo de 2 viviendas/mes. «Piloto aislado» carga toda la ingeniería y 1,5 meses de fábrica: es el coste real si después no hay serie.',
 '4. Ahorros posibles que no están aplicados: rediseño del módulo (cada 10 kg/m² ≈ 3.900 €), un 8–12 % en las partidas iguales por fabricar en taller, y medianera compartida entre las dos viviendas del pareado.',
].forEach((t, i) => { const c = Z.getCell(n0 + i, 1); c.value = t; c.font = i ? F : bold; Z.mergeCells(n0 + i, 1, n0 + i, 3); c.alignment = { wrapText: true, vertical: 'top' }; if (i) Z.getRow(n0 + i).height = 30; });

// ---------- Ahorros por calidades ----------
const AH = require('./ahorros.js');
const H = wb.addWorksheet('Ahorros por calidades');
[22, 30, 48, 14, 60, 13, 12].forEach((w, i) => H.getColumn(i + 1).width = w);
title(H, 'MEMORIA DE CALIDADES DEL PROYECTO FRENTE A ALTERNATIVAS DE AHORRO (por vivienda pareada)', 'S = sistema modular o duplicidad (no cambia calidades) · M = marca o gama equivalente («o similar») · A = alcance de la memoria comercial. Ahorros estimados: confirmar con ofertas.');
H.getRow(4).values = ['Capítulo', 'Partida', 'Proyecto', '€/viv. proyecto', 'Alternativa', 'Ahorro €/viv.', 'Tipo']; hdr(H, 4);
let hr = 5; for (const a of AH) { H.getRow(hr).values = [a.cap, a.partida, a.proy, a.proyEur, a.alt, a.ahorro, a.tipo]; H.getCell(hr, 4).numFmt = EUR0; H.getCell(hr, 6).numFmt = EUR0; H.getCell(hr, 6).fill = INPUT; H.getCell(hr, 6).font = blue; [3, 5].forEach(c => H.getCell(hr, c).alignment = { wrapText: true, vertical: 'top' }); hr++; }
const hEnd = hr - 1;
[['Ahorro por sistema modular y duplicidades (S)', `SUMIF(G5:G${hEnd},"S",F5:F${hEnd})`], ['Ahorro por marca o gama equivalente (M)', `SUMIF(G5:G${hEnd},"M",F5:F${hEnd})`], ['Ahorro por alcance (A)', `SUMIF(G5:G${hEnd},"A",F5:F${hEnd})`], ['AHORRO TOTAL DE COSTE POR VIVIENDA', `SUM(F5:F${hEnd})`], ['Bajada de precio con margen', `F${hEnd + 4}*(1+${$('mg')})`], ['Precio del piloto (serie) con los ahorros', `'Resumen piloto'!B15-F${hEnd + 5}`]]
  .forEach(([t, f], i) => { const r = hEnd + 1 + i; H.getCell(r, 5).value = t; H.getCell(r, 6).value = { formula: f }; H.getCell(r, 6).numFmt = EUR0; if (i >= 3) { H.getCell(r, 5).font = bold; H.getCell(r, 6).font = bold; } });

// ---------- Escenarios de margen ----------
const EM = wb.addWorksheet('Escenarios de margen', { properties: { tabColor: { argb: 'FF00B050' } } });
[66, 17, 17, 17, 17, 52].forEach((w, i) => EM.getColumn(i + 1).width = w);
title(EM, 'ESCENARIOS DE MARGEN Y PARTIDAS QUE FALTAN EN EL COSTE', 'Celdas rosadas con cifra en rojo minio = editables. El coste del modelo ya incluye la mano de obra de fábrica y de montaje a coste empresa (nómina + Seguridad Social, 23 €/h de 2024).');
EM.getRow(4).values = ['Supuesto', 'Valor', null, null, null, 'Origen']; hdr(EM, 4);
const es = [
  ['ops', 'Operarios de fábrica al arrancar', 6, '0', 'Iván, 13/10/2026'],
  ['hop', 'Horas productivas por operario y mes', 146.7, N2, '1.760 h/año / 12'],
  ['nom9', 'Nómina + Seguridad Social con 9 operarios (€/mes, 2024)', 28250, EUR0, 'Nóminas DWHAI sep–nov 2024'],
  ['smo', 'Subida salarial 2024→2026 (convenio del metal y SMI)', 0.08, PCT, 'ESTIMADO: confirmar con el convenio aplicable'],
  ['estr', 'Estructura de RG21: dirección, comercial y administración, con SS (€/mes)', 8000, EUR0, 'Iván, 13/10/2026'],
  ['gar', 'Garantía y posventa (% del coste)', 0.01, PCT, 'Habitual 0,5–1,5 %'],
  ['imp', 'Imprevistos (% del coste)', 0.03, PCT, 'Primera serie: 3–5 %'],
  ['cpp', 'Coste de la pareada en serie (modelo, a 2 viviendas/mes)', 190091, EUR0, 'Presupuesto técnico a 90 kg/m²: 209.100 € / 1,10'],
  ['cpa', 'Coste de la aislada en serie (modelo, a 2 viviendas/mes)', 194636, EUR0, '214.100 € / 1,10'],
  ['opi', 'Precio ofertado del piloto (dentro de la serie)', 225400, EUR0, 'Propuesta integral, 14/10/2026: 10 % sobre el coste del modelo'],
  ['opa', 'Precio ofertado del piloto aislado', 273600, EUR0, 'Propuesta integral, 14/10/2026'],
  ['opp', 'Precio ofertado de la pareada en serie', 209100, EUR0, 'Propuesta integral, 14/10/2026'],
  ['opai', 'Precio ofertado de la aislada en serie', 214100, EUR0, 'Propuesta integral, 14/10/2026'],
];
const ER = {}; es.forEach(([k, l, v, f, c], i) => { const r = 5 + i; ER[k] = `$B$${r}`; EM.getCell(r, 1).value = l; EM.getCell(r, 2).value = v; EM.getCell(r, 2).numFmt = f; EM.getCell(r, 2).fill = INPUT; EM.getCell(r, 2).font = blue; EM.getCell(r, 6).value = c; });
const e = k => ER[k];
let q = 5 + es.length;
const MOT = `(${MOFAB}+${$('hmon')}*${$('mo')}*(1+${$('diet')}))`;
const calc = [
  ['hviv', 'Horas de fábrica por vivienda (acero y panel)', `${MOFAB}/${$('mo')}`, '#,##0', 'Sale del modelo'],
  ['rr', 'Viviendas al mes con esa plantilla', `${e('ops')}*${e('hop')}/${ER.hviv || '$B$' + (q + 1)}`, N2, 'El modelo supone 2 al mes'],
  ['mes16', 'Meses de fábrica para las 16 viviendas', null, '0.0', ''],
  ['nom', 'Nómina + SS de la plantilla de arranque (€/mes, 2024)', `${e('nom9')}*${e('ops')}/9`, EUR0, 'Proporcional a 9 operarios'],
];
calc.forEach(([k, l, f, nf, c]) => { q++; ER[k] = `$B$${q}`; EM.getCell(q, 1).value = l; EM.getCell(q, 6).value = c; EM.getCell(q, 2).numFmt = nf; });
// fórmulas (ya conocidas todas las referencias)
EM.getCell(+ER.hviv.slice(3), 2).value = { formula: `${MOFAB}/${$('mo')}` };
EM.getCell(+ER.rr.slice(3), 2).value = { formula: `${e('ops')}*${e('hop')}/${e('hviv')}` };
EM.getCell(+ER.mes16.slice(3), 2).value = { formula: `16/${e('rr')}` };
EM.getCell(+ER.nom.slice(3), 2).value = { formula: `${e('nom9')}*${e('ops')}/9` };
q += 2;
EM.getCell(q, 1).value = 'PARTIDAS QUE FALTAN O ESTÁN A PRECIO DE 2024 (por vivienda)'; EM.getCell(q, 1).font = bold; q++;
EM.getRow(q).values = ['Concepto', 'Piloto en serie', 'Piloto aislado', 'Pareada en serie', 'Aislada en serie', 'Comentario']; hdr(EM, q); q++;
const q0 = q;
const GF = `${$('gfij')}*(1+${$('ipc')})`;
const falt = [
  ['Mano de obra de fábrica y montaje a salarios de 2026', `${MOT}*${e('smo')}`, `${MOT}*${e('smo')}`, `${MOT}*${e('smo')}`, `${MOT}*${e('smo')}`, 'Los 23 €/h son de 2024 y no llevan IPC'],
  ['Gastos fijos de fábrica a precios de 2026', `${$('gfij')}*${$('ipc')}/${$('ritmo')}`, `${$('gfij')}*${$('ipc')}*${$('mesp')}`, `${$('gfij')}*${$('ipc')}/${$('ritmo')}`, `${$('gfij')}*${$('ipc')}/${$('ritmo')}`, 'Los 20.430 €/mes son de 2024'],
  ['Gastos fijos repartidos al ritmo real de la plantilla', `${GF}*(1/${e('rr')}-1/${$('ritmo')})`, '0', `${GF}*(1/${e('rr')}-1/${$('ritmo')})`, `${GF}*(1/${e('rr')}-1/${$('ritmo')})`, 'El modelo los reparte entre 2 viviendas al mes'],
  ['Plantilla parada en el piloto aislado', '0', `MAX(0,${e('nom')}*(1+${e('smo')})*${$('mesp')}-${MOT}*(1+${e('smo')}))`, '0', '0', 'Sin serie, la nómina se paga entera aunque haya pocas horas que cargar'],
  ['Estructura de RG21 (dirección, comercial, administración, con SS)', `${e('estr')}/${e('rr')}`, `${e('estr')}*${$('mesp')}`, `${e('estr')}/${e('rr')}`, `${e('estr')}/${e('rr')}`, 'No está en el modelo'],
];
falt.forEach(([t, a, b, c, d, m]) => { EM.getCell(q, 1).value = t; [a, b, c, d].forEach((f, j) => { EM.getCell(q, 2 + j).value = { formula: f }; EM.getCell(q, 2 + j).numFmt = EUR0; }); EM.getCell(q, 6).value = m; q++; });
const base = ["'Resumen piloto'!$B$13", "'Resumen piloto'!$C$13", e('cpp'), e('cpa')];
const L2 = ['B', 'C', 'D', 'E'];
const qa = q;
EM.getCell(q, 1).value = 'Garantía y posventa'; L2.forEach((c, j) => { EM.getCell(q, 2 + j).value = { formula: `(${base[j]}+SUM(${c}${q0}:${c}${qa - 1}))*${e('gar')}` }; EM.getCell(q, 2 + j).numFmt = EUR0; }); q++;
EM.getCell(q, 1).value = 'Imprevistos'; L2.forEach((c, j) => { EM.getCell(q, 2 + j).value = { formula: `(${base[j]}+SUM(${c}${q0}:${c}${qa - 1}))*${e('imp')}` }; EM.getCell(q, 2 + j).numFmt = EUR0; }); q++;
const qs = q;
EM.getCell(q, 1).value = 'Total de lo que falta'; L2.forEach((c, j) => { EM.getCell(q, 2 + j).value = { formula: `SUM(${c}${q0}:${c}${q - 1})` }; EM.getCell(q, 2 + j).numFmt = EUR0; }); EM.getCell(q, 1).font = bold; q++;
EM.getCell(q, 1).value = 'Coste del modelo'; L2.forEach((c, j) => { EM.getCell(q, 2 + j).value = { formula: base[j] }; EM.getCell(q, 2 + j).numFmt = EUR0; }); q++;
const qc = q;
EM.getCell(q, 1).value = 'COSTE COMPLETO'; L2.forEach((c, j) => { EM.getCell(q, 2 + j).value = { formula: `${c}${qs}+${c}${qs + 1}` }; EM.getCell(q, 2 + j).numFmt = EUR0; }); [1, 2, 3, 4, 5].forEach(c => { EM.getCell(q, c).font = bold; EM.getCell(q, c).fill = CAPF; }); q++;
const offers = [e('opi'), e('opa'), e('opp'), e('opai')];
EM.getCell(q, 1).value = 'Precio ofertado a NIDO'; offers.forEach((o, j) => { EM.getCell(q, 2 + j).value = { formula: o }; EM.getCell(q, 2 + j).numFmt = EUR0; }); q++;
EM.getCell(q, 1).value = 'Margen según el modelo (% sobre venta)'; L2.forEach((c, j) => { EM.getCell(q, 2 + j).value = { formula: `1-${c}${qs + 1}/${c}${q - 1}` }; EM.getCell(q, 2 + j).numFmt = PCT; }); q++;
EM.getCell(q, 1).value = 'MARGEN REAL con el precio ofertado (€)'; L2.forEach((c, j) => { EM.getCell(q, 2 + j).value = { formula: `${c}${q - 2}-${c}${qc}` }; EM.getCell(q, 2 + j).numFmt = EUR0; }); [1, 2, 3, 4, 5].forEach(c => { EM.getCell(q, c).font = bold; EM.getCell(q, c).fill = CAPF; }); q++;
EM.getCell(q, 1).value = 'MARGEN REAL (% sobre venta)'; L2.forEach((c, j) => { EM.getCell(q, 2 + j).value = { formula: `${c}${q - 1}/${c}${q - 3}` }; EM.getCell(q, 2 + j).numFmt = PCT; EM.getCell(q, 2 + j).font = bold; }); EM.getCell(q, 1).font = bold; q += 2;
// escenarios de margen
EM.getCell(q, 1).value = 'ESCENARIOS: PRECIO SEGÚN EL MARGEN SOBRE EL COSTE COMPLETO'; EM.getCell(q, 1).font = bold; q++;
EM.getRow(q).values = ['Margen sobre coste (y sobre venta)', 'Piloto en serie', 'Pareada en serie', '16 viviendas (14 + 2)', 'Margen de las 16', 'Frente a la oferta de las 16 (3.355.600 €)']; hdr(EM, q); q++;
for (const m of [0, 0.05, 0.08, 0.10, 0.12, 0.15, 0.18 / 0.82, 0.25]) {
  EM.getCell(q, 1).value = m === 0 ? '0 % (precio mínimo: solo coste)' : `${Math.round(m * 100)} % (${(m / (1 + m) * 100).toFixed(1).replace('.', ',')} % sobre venta)`;
  const fm = [`B${qc}*(1+${m})`, `D${qc}*(1+${m})`, `(14*D${qc}+2*E${qc})*(1+${m})`, `(14*D${qc}+2*E${qc})*${m}`, `D${q}-3355600`];
  fm.forEach((f, j) => { EM.getCell(q, 2 + j).value = { formula: f }; EM.getCell(q, 2 + j).numFmt = EUR0; });
  q++;
}
q++;
// sensibilidad a la plantilla
EM.getCell(q, 1).value = 'PAREADA EN SERIE SEGÚN LA PLANTILLA DE FÁBRICA (resto de supuestos como arriba)'; EM.getCell(q, 1).font = bold; q++;
EM.getRow(q).values = ['Operarios', 'Viviendas/mes', 'Meses para las 16', 'Coste completo', 'Margen al precio ofertado', 'Precio para un 18 % sobre venta']; hdr(EM, q); q++;
for (const n of [6, 9, 12, 15]) {
  const rN = `(${n}*${e('hop')}/${e('hviv')})`;
  const cN = `(${e('cpp')}-${$('gfij')}/${$('ritmo')}+${MOT}*${e('smo')}+(${GF}+${e('estr')})/${rN})*(1+${e('gar')}+${e('imp')})`;
  EM.getCell(q, 1).value = n;
  [[rN, N2], [`16/${rN}`, '0.0'], [cN, EUR0], [`${e('opp')}-D${q}`, EUR0], [`D${q}/0.82`, EUR0]].forEach(([f, nf], j) => { EM.getCell(q, 2 + j).value = { formula: f }; EM.getCell(q, 2 + j).numFmt = nf; });
  q++;
}
q++;
['LECTURA',
 '1. La mano de obra de fábrica y de montaje entra a coste empresa, con Seguridad Social: 23 €/h, de las nóminas de DWHAI. Es de 2024 y no lleva actualización.',
 '2. Instalaciones, carpinterías y acabados van a precio del proyecto, que ya incluye su mano de obra y sus cargas sociales.',
 '3. El ritmo lo marca la plantilla: cada vivienda lleva unas 1.080 h de fábrica de acero y panel. Con 6 operarios sale menos de una vivienda al mes, y la nave, la oficina técnica y la estructura se reparten entre muy pocas casas.',
 '4. Las horas son solo de acero y panel. Si la misma plantilla hace también pladur o instalaciones, el ritmo baja todavía más (esas horas las paga el precio de la partida).',
 '5. Acero a 2,60 €/kg fabricado: en 2024 la estructura soldada real salió entre 3 y 4,9 €/kg. Cada 0,40 €/kg más son unos 5.300 € por vivienda.',
 '6. Si los 8.000 €/mes de estructura incluyen la gestión (3.830) o la oficina técnica (6.100) de los gastos fijos de fábrica, hay que quitarlas de la hoja Supuestos para no contarlas dos veces.',
].forEach((t, i) => { const c = EM.getCell(q + i, 1); c.value = t; c.font = i ? F : bold; EM.mergeCells(q + i, 1, q + i, 6); c.alignment = { wrapText: true, vertical: 'top' }; if (i) EM.getRow(q + i).height = 30; });

for (const ws of wb.worksheets) ws.eachRow(row => row.eachCell(c => { if (!c.font || !c.font.name) c.font = { ...F, ...(c.font || {}) }; if (c.fill === CAPF || (c.fill && c.fill.fgColor && c.fill.fgColor.argb === 'FFE7E8E3')) c.border = { top: { style: 'medium', color: { argb: 'FF141414' } } }; }));
// estilo Plano de taller: sin cuadrícula, pestañas en tinta y minio, cajetín de impresión
for (const ws of wb.worksheets) {
  ws.views = [{ showGridLines: false, state: 'frozen', ySplit: 0 }];
  ws.properties.tabColor = { argb: ['Resumen piloto', 'Escenarios de margen'].includes(ws.name) ? 'FFC8381F' : 'FF141414' };
  ws.headerFooter = { oddHeader: '&L&"Arial,Bold"&12rg21&"Arial,Regular"&8  CAPITAL&R&"Arial,Regular"&8NÉVOLA · PILOTO MODULAR', oddFooter: '&L&"Arial,Regular"&8USO INTERNO · NO ENVIAR AL PROMOTOR&R&"Arial,Regular"&8Página &P de &N' };
  ws.pageSetup = { ...ws.pageSetup, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, paperSize: 9 };
}
// ---- control en JS
const ipc = .12, mo = 23, hp = .5, me = .05, p = x => x * (1 + ipc) * (1 + me) + hp * mo;
const sisV = kgTot * 2.6 + env.fach_opaca * p(42) + env.medianera * p(42) + env.sofito * p(42) + (env.fach_opaca + env.medianera) * 31.85 + env.fach_opaca * 10 + (env.fach_opaca + env.sofito) * 45 + (env.cubierta + env.terraza) * p(52) + env.cubierta * 88.8 + env.terraza * 97.54 + env.suelo_pb * p(64) + env.suelo_p1 * p(52) + env.juntas_ml * 25 + 941.45;
const igV = rows.filter(r => r.g === 'IGUAL').reduce((a, b) => a + b.imp, 0) / 16;
const mof = kgTot * (2.6 - 1.14) + panelM2 * hp * mo;
const com = sisV + igV + mof * .15 + 6 * 900 * 1.12 + 600 + 3120 * 1.12 + 192 * 23 * 1.15;
const a = com + 25000 / 16 + 20430 / 2, b = com + 25000 + 20430 * 1.5;
console.log(JSON.stringify({ kg: Math.round(kgTot), sistema: Math.round(sisV), iguales: Math.round(igV), aprendizaje: Math.round(mof * .15), costeSerie: Math.round(a), precioSerie: Math.round(a * 1.1), m2Serie: Math.round(a * 1.1 / 148.3), costeAislado: Math.round(b), precioAislado: Math.round(b * 1.1), m2Aislado: Math.round(b * 1.1 / 148.3), tradicional: Math.round((sust + igV) * 1.19) }));
wb.xlsx.writeFile(OUT).then(() => console.log('OK', OUT));
