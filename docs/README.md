# RecruitSpace Frontend

Aplicacion web SPA para el sistema de tracking de candidatos (ATS) RecruitSpace.

## Stack Tecnologico

| Tecnologia | Version | Proposito |
|------------|---------|-----------|
| React | 19.1 | Framework UI |
| TypeScript | 5.8 | Tipado estatico |
| Vite | 7.1 | Build tool |
| Redux Toolkit | 2.9 | Estado global |
| React Router | 7.9 | Enrutamiento |
| React Hook Form | 7.68 | Formularios |
| Zod | 4.2 | Validacion |
| Axios | 1.12 | HTTP client |
| i18next | 25.7 | Internacionalizacion |
| Vitest | 4.0 | Testing |

## Inicio Rapido

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Iniciar en desarrollo
npm run dev

# Ejecutar tests
npm test

# Build de produccion
npm run build
```

## Documentacion

| Documento | Descripcion |
|-----------|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Arquitectura y patrones |
| [FEATURES.md](./FEATURES.md) | Features implementadas |
| [COMPONENTS.md](./COMPONENTS.md) | Componentes reutilizables |
| [STATE.md](./STATE.md) | Gestion de estado |
| [TESTING.md](./TESTING.md) | Guia de testing |

## Estructura del Proyecto

```
src/
├── app/            # Configuracion Redux
├── api/            # Cliente HTTP
├── components/     # Componentes compartidos
├── config/         # Configuracion global
├── features/       # Modulos de features
├── hooks/          # Custom hooks
├── layouts/        # Layouts de pagina
├── lib/            # Utilidades
├── locales/        # i18n
├── pages/          # Componentes de pagina
├── routes/         # Configuracion de rutas
├── test/           # Utilidades de testing
├── types/          # Tipos TypeScript
└── utils/          # Helpers
```

## Scripts Disponibles

```bash
npm run dev          # Desarrollo con HMR
npm run build        # Build de produccion
npm run preview      # Preview del build
npm test             # Tests en modo watch
npm run test:run     # Tests una vez
npm run test:coverage # Cobertura de tests
npm run lint         # Linter
```

## Variables de Entorno

```env
VITE_API_URL=http://localhost:3000/api
```

## Licencia

Propietario - Todos los derechos reservados.
