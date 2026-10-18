const fs = require('fs'); let s = fs.readFileSync('piloto_xlsx.js', 'utf8');
const r = (a, b) => { if (!s.includes(a)) throw new Error('no: ' + a.slice(0, 60)); s = s.split(a).join(b); };
r("fgColor: { argb: 'FF1F2A36' } }, INPUT", "fgColor: { argb: 'FF141414' } }, INPUT");
r("fgColor: { argb: 'FFFFFF00' } }", "fgColor: { argb: 'FFF6DDD4' } }");
r("fgColor: { argb: 'FFE3E8EE' } }", "fgColor: { argb: 'FFE7E8E3' } }");
r("const blue = { ...F, color: { argb: 'FF0000FF' } };", "const blue = { ...F, bold: true, color: { argb: 'FF9C2E18' } };");
r("c.font = { ...F, bold: true, color: { argb: 'FFFFFFFF' } }; c.fill = HEAD; c.alignment = { vertical: 'middle', wrapText: true };",
  "c.font = { ...F, bold: true, color: { argb: 'FFE7E8E3' } }; c.fill = HEAD; c.alignment = { vertical: 'middle', wrapText: true }; c.border = { bottom: { style: 'thick', color: { argb: 'FFC8381F' } } };");
r("ws.getCell('A1').font = { ...F, bold: true, size: 13 }; if (s) { ws.getCell('A2').value = s; ws.getCell('A2').font = { ...F, italic: true }; }",
  "ws.getCell('A1').font = { ...F, bold: true, size: 15, color: { argb: 'FF141414' } }; ws.getRow(1).height = 24; if (s) { ws.getCell('A2').value = s; ws.getCell('A2').font = { ...F, size: 9.5, color: { argb: 'FF5E6064' } }; }");
s = s.split('Amarillo = editable.').join('Celdas rosadas con cifra en rojo minio = editables.');
r("for (const ws of wb.worksheets) ws.eachRow(row => row.eachCell(c => { if (!c.font || !c.font.name) c.font = { ...F, ...(c.font || {}) }; }));",
  `for (const ws of wb.worksheets) ws.eachRow(row => row.eachCell(c => { if (!c.font || !c.font.name) c.font = { ...F, ...(c.font || {}) }; if (c.fill === CAPF || (c.fill && c.fill.fgColor && c.fill.fgColor.argb === 'FFE7E8E3')) c.border = { top: { style: 'medium', color: { argb: 'FF141414' } } }; }));
// estilo Plano de taller: sin cuadrícula, pestañas en tinta y minio, cajetín de impresión
for (const ws of wb.worksheets) {
  ws.views = [{ showGridLines: false, state: 'frozen', ySplit: 0 }];
  ws.properties.tabColor = { argb: ['Resumen piloto', 'Escenarios de margen'].includes(ws.name) ? 'FFC8381F' : 'FF141414' };
  ws.headerFooter = { oddHeader: '&L&"Arial,Bold"&12rg21&"Arial,Regular"&8  CAPITAL&R&"Arial,Regular"&8NÉVOLA · PILOTO MODULAR', oddFooter: '&L&"Arial,Regular"&8USO INTERNO · NO ENVIAR AL PROMOTOR&R&"Arial,Regular"&8Página &P de &N' };
  ws.pageSetup = { ...ws.pageSetup, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, paperSize: 9 };
}`);
fs.writeFileSync('piloto_xlsx.js', s); console.log('ok');
