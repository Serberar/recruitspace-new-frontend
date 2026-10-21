# RecruitSpace · Frontend

Frontend de **RecruitSpace**, un SaaS de gestión de procesos de selección, organizado como monorepo con tres aplicaciones:

| App | Qué es |
|---|---|
| `apps/ats` | El ATS para los equipos de selección: ofertas, candidatos con su CV y perfil, comentarios e instrucciones. |
| `apps/jobs` | Portal del candidato: ofertas públicas, registro, inscripción y seguimiento de su proceso. |
| `apps/landing` | Web comercial del producto. |

Trabaja contra [recruitspace-backend](https://github.com/Serberar/recruitspace-backend).

## Tecnologías

React, TypeScript, Vite, Redux Toolkit, React Router, i18next (varios idiomas) y CSS Modules.

## Cómo arrancarlo

```bash
npm install
npm run dev:ats       # o dev:jobs / dev:landing
npm run build:all
```

## Autor

Sergio Bernabé
