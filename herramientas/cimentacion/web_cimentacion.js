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
const doc = '<!doctype html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<meta name="robots" content="noindex, nofollow">\n' + h.replace('</style>', '</style>\n</head>\n<body>') + '\n</body>\n</html>\n';
fs.mkdirSync(path.join(site, 'cimentacion'), { recursive: true });
fs.writeFileSync(path.join(site, 'cimentacion', 'index.html'), doc);
console.log('ok', path.join(site, 'cimentacion', 'index.html'));
