// Aplica la dirección A (Plano de taller) al informe técnico del piloto
const fs = require('fs'); let h = fs.readFileSync('piloto_nevola.html', 'utf8');
const r = (a, b) => { if (!h.includes(a)) throw new Error('no: ' + a.slice(0, 60)); h = h.split(a).join(b); };
const head = `<title>Piloto modular Névola</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@400..900&family=Archivo+Narrow:wght@500..700&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
/* Layout: plano de taller RG21. Papel gris frío, tinta, un único rojo minio; columna de lectura con láminas a ancho completo y cajetín al pie. */
:root{
  --bg:#E7E8E3; --paper:#EFF0EB; --ink:#141414; --muted:#4F5256; --rule:#C3C5BF; --accent:#C8381F;
  --pb:#D5D7D1; --pbline:#141414; --p1:#F2D3C8; --p1line:#9C2E18; --med:#C8381F; --hatch:#8E9093; --col:#141414;
  --display:'Archivo', Arial, sans-serif; --figure:'Archivo Narrow', 'Arial Narrow', Arial, sans-serif; --body:'Archivo', Arial, sans-serif; --mono:'IBM Plex Mono', 'Courier New', monospace;
  color-scheme:light;
}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){
  --bg:#141414; --paper:#1C1E20; --ink:#ECEDE8; --muted:#A9ABA6; --rule:#34363A; --accent:#EE6A4E;
  --pb:#2A2D30; --pbline:#C9CBC5; --p1:#40241D; --p1line:#EE6A4E; --med:#EE6A4E; --hatch:#6A6D70; --col:#ECEDE8; color-scheme:dark}}
:root[data-theme="dark"]{
  --bg:#141414; --paper:#1C1E20; --ink:#ECEDE8; --muted:#A9ABA6; --rule:#34363A; --accent:#EE6A4E;
  --pb:#2A2D30; --pbline:#C9CBC5; --p1:#40241D; --p1line:#EE6A4E; --med:#EE6A4E; --hatch:#6A6D70; --col:#ECEDE8; color-scheme:dark}
*{box-sizing:border-box}
body{background:var(--bg);color:var(--ink);font-family:var(--body);font-size:15.5px;line-height:1.55;padding-inline:16px;padding-block:28px 48px}
.wrap{max-width:1080px;margin-inline:auto;display:flex;flex-direction:column;gap:44px}
.topbar{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap}
.lg{display:inline-grid;grid-template-columns:auto auto;column-gap:.5em;align-items:end;font-family:var(--display);font-size:34px;line-height:1;color:var(--ink)}
.lg .sq{width:.62em;height:.62em;border-top:.13em solid currentColor;border-left:.13em solid currentColor;position:relative;align-self:start;margin-top:.02em}
.lg .sq::after{content:"";position:absolute;left:0;top:0;width:.13em;height:.13em;background:var(--accent)}
.lg b{font-weight:900;letter-spacing:-.05em}
.lg i{grid-column:2;font-style:normal;font-family:var(--mono);font-weight:500;font-size:.3em;letter-spacing:.42em;text-transform:uppercase;margin-top:.5em;padding-left:.1em}
.stamp{font-family:var(--mono);font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);text-align:right;line-height:1.7}
header{display:flex;flex-direction:column;gap:16px;border-bottom:2px solid var(--ink);padding-bottom:24px}
.eyebrow{font-family:var(--mono);font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--accent)}
h1{font-family:var(--display);font-weight:800;font-size:clamp(32px,5.4vw,54px);line-height:1;letter-spacing:-.035em;margin:0;text-wrap:balance}
h2{font-family:var(--display);font-weight:800;font-size:24px;letter-spacing:-.02em;margin:0 0 6px;text-wrap:balance}
h3{font-family:var(--display);font-weight:700;font-size:16px;margin:0}
p{margin:0;max-width:68ch}
.lede{color:var(--muted);max-width:72ch}
.figs{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:1px;background:var(--ink);border:1px solid var(--ink)}
.fig{background:var(--paper);padding:14px 16px;display:flex;flex-direction:column;gap:4px;min-width:0}
.fig b{font-family:var(--figure);font-weight:700;font-size:30px;line-height:1.05;letter-spacing:-.01em;font-variant-numeric:tabular-nums}
.fig span{font-family:var(--mono);font-size:11.5px;letter-spacing:.03em;color:var(--muted)}
section{display:flex;flex-direction:column;gap:14px}
ul.steps{margin:0;padding-left:20px;display:flex;flex-direction:column;gap:6px;max-width:80ch}
ul.steps li::marker{color:var(--accent)}
.sheet{background:var(--paper);border:1px solid var(--ink);padding:18px;display:flex;flex-direction:column;gap:10px;min-width:0}
.sheet .cap{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;font-family:var(--mono);font-size:12px;color:var(--muted);letter-spacing:.04em;text-transform:uppercase;border-bottom:1px solid var(--rule);padding-bottom:8px}
.plates{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,460px),1fr));gap:18px}
.scroll{overflow-x:auto}
svg{display:block;width:100%;height:auto}
svg text{font-family:var(--mono);fill:var(--ink)}
.legend{display:flex;flex-wrap:wrap;gap:14px;font-size:13px;color:var(--muted)}
.legend i{display:inline-block;width:14px;height:14px;vertical-align:-2px;margin-right:6px;border:1px solid var(--ink)}
table{border-collapse:collapse;width:100%;font-size:14.5px;font-variant-numeric:tabular-nums}
th,td{text-align:left;padding:7px 10px;border-bottom:1px solid var(--rule);vertical-align:top}
th{font-family:var(--mono);font-weight:500;font-size:11.5px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);border-bottom:2px solid var(--ink)}
td.n,th.n{text-align:right;font-family:var(--mono);white-space:nowrap}
tr.sub td{font-weight:700;border-top:1px solid var(--ink)}
tr.tot td{font-weight:800;font-size:16px;border-top:2px solid var(--ink);border-bottom:2px solid var(--ink)}
tr.tot td.n{color:var(--accent)}
tr.grp td{font-family:var(--mono);font-size:11.5px;text-transform:uppercase;letter-spacing:.06em;color:var(--accent);padding-top:16px}
.two{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));gap:18px}
.note{font-size:13px;color:var(--muted)}
.risk{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:1px;background:var(--ink);border:1px solid var(--ink)}
.risk div{background:var(--paper);padding:14px 16px;display:flex;flex-direction:column;gap:4px;min-width:0}
.risk b{font-family:var(--display);font-weight:800}
.risk span{font-size:14px;color:var(--muted)}
footer{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;border-top:2px solid var(--ink);padding-top:12px;font-family:var(--mono);font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
</style>`;
const i = h.indexOf('</style>') + '</style>'.length;
h = head + h.slice(i);
r('<div class="wrap">\n<header>', '<div class="wrap">\n<div class="topbar"><span class="lg" aria-label="RG21 Capital"><span class="sq"></span><b>rg21</b><i>capital</i></span><p class="stamp">Estudio técnico interno<br>Octubre 2026</p></div>\n<header>');
r('<div class="eyebrow">RG21 Capital · Estudio técnico interno · Octubre 2026</div>', '<div class="eyebrow">Névola · Vivienda piloto</div>');
const j = h.lastIndexOf('</div>');
h = h.slice(0, j) + '<footer><span>RG21 Capital · Piloto modular Névola</span><span>Uso interno · No enviar al promotor</span></footer>\n' + h.slice(j);
fs.writeFileSync('piloto_nevola.html', h); console.log('ok');
