# Estructura del Frontend - Monorepo

## Dominios

```
recruitspace.es         → apps/landing  (puerto 5173)
app.recruitspace.es     → apps/ats      (puerto 5174)
jobs.recruitspace.es    → apps/jobs     (puerto 5175)
```

## Estructura del Monorepo

```
recruitspace-frontend/
├── package.json              # Workspaces root
├── apps/
│   ├── landing/              # recruitspace.es - Landings y marketing
│   │   ├── package.json
│   │   ├── vite.config.ts    # Puerto 5173
│   │   └── src/
│   │       ├── pages/landing/
│   │       ├── pages/plans/
│   │       ├── pages/legal/
│   │       ├── pages/register/
│   │       ├── pages/login/
│   │       └── ...
│   │
│   ├── ats/                  # app.recruitspace.es - ATS para recruiters
│   │   ├── package.json
│   │   ├── vite.config.ts    # Puerto 5174
│   │   └── src/
│   │       ├── pages/dashboard/
│   │       ├── pages/offers/
│   │       ├── pages/candidates/
│   │       ├── pages/clients/
│   │       ├── pages/team/
│   │       ├── pages/settings/
│   │       ├── pages/analytics/
│   │       ├── pages/billing/
│   │       └── ...
│   │
│   └── jobs/                 # jobs.recruitspace.es - Portal de empleo
│       ├── package.json
│       ├── vite.config.ts    # Puerto 5175
│       └── src/
│           ├── pages/public/         # Portal publico de ofertas
│           ├── pages/candidatePortal/ # Portal del candidato (auth)
│           ├── pages/loginCandidate/
│           ├── pages/registerCandidate/
│           └── ...
│
└── src/                      # (legacy - se eliminara)
```

## Scripts

Desde la raiz del monorepo:

```bash
# Desarrollo
npm run dev:landing    # Inicia landing en puerto 5173
npm run dev:ats        # Inicia ATS en puerto 5174
npm run dev:jobs       # Inicia Jobs en puerto 5175

# Build
npm run build:landing  # Build de landing
npm run build:ats      # Build de ATS
npm run build:jobs     # Build de Jobs
npm run build:all      # Build de todas las apps

# Lint y test
npm run lint           # Lint de todas las apps
npm run test           # Tests de todas las apps
```

## Variables de Entorno

Cada app tiene su `.env.example`:

```bash
# Comun a todas
VITE_API_URL=http://localhost:3000/api

# URLs cruzadas (para redirecciones entre apps)
VITE_LANDING_URL=http://localhost:5173
VITE_ATS_URL=http://localhost:5174
VITE_JOBS_URL=http://localhost:5175
```

## Instalacion

```bash
cd recruitspace-frontend
npm install            # Instala dependencias de todas las apps

# O instalar app especifica
npm install -w apps/landing
npm install -w apps/ats
npm install -w apps/jobs
```
