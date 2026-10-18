# Modular Home

Proyecto de vivienda modular (piloto Névola · RG21). El contexto completo está en `CLAUDE.md`.

## Agentes del proyecto (`.claude/agents/`)
Adaptados a España a partir de [agency-agents](https://github.com/msitarzewski/agency-agents) (licencia MIT):

| Agente | Para qué |
|---|---|
| `revisor-realidad` | Revisar propuestas y decisiones antes de enviarlas |
| `analista-precios` | Precio y margen por casa y por proyecto, escenarios |
| `analista-financiero` | Viabilidad, caja, punto de equilibrio, real vs previsto |
| `jefe-proyecto` | Plan de fabricación y obra, medición del piloto |

Uso: "Que el analista-precios calcule… y después el revisor-realidad lo revise".
