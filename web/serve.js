// Servidor estático mínimo para previsualizar la web de Névola
const http = require('http'), fs = require('fs'), path = require('path');
const dir = __dirname, port = +process.argv[2] || 8792;
http.createServer((req, res) => {
  let f = decodeURIComponent(req.url.split('?')[0]); if (f === '/') f = '/nevola_web.html';
  const p = path.join(dir, path.normalize(f).replace(/^(\.\.[\/\\])+/, ''));
  if (!p.startsWith(dir)) { res.writeHead(403); return res.end(); }
  fs.readFile(p, (e, d) => {
    if (e) { res.writeHead(404); return res.end('no'); }
    let body = d;
    if (p.endsWith('.html')) body = '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"></head><body>' + d + '</body></html>';
    res.writeHead(200, { 'Content-Type': p.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream' }); res.end(body);
  });
}).listen(port, '127.0.0.1', () => console.log('http://127.0.0.1:' + port));
