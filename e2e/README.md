# E2E Tests con Playwright

Este directorio contiene los tests end-to-end (E2E) de RecruitSpace usando [Playwright](https://playwright.dev/).

## Estructura

```
e2e/
├── auth/                       # Tests de autenticacion
│   ├── login.spec.ts          # Login de usuarios
│   ├── register.spec.ts       # Registro de organizaciones
│   └── password-reset.spec.ts # Recuperacion de contraseña
├── offers/                     # Tests de ofertas
│   ├── create-offer.spec.ts   # Creacion de ofertas
│   └── manage-candidates.spec.ts # Gestion de candidatos en pipeline
├── candidates/                 # Tests del portal de candidatos
│   └── candidate-portal.spec.ts
├── fixtures/                   # Datos de prueba
│   └── test-data.ts           # Users, offers, selectors
├── auth.setup.ts              # Setup de autenticacion
├── playwright.config.ts       # Configuracion de Playwright
└── README.md                  # Este archivo
```

## Requisitos

- Node.js 18+
- El frontend debe poder ejecutarse en `http://localhost:5173`
- El backend debe estar corriendo en la URL configurada en `.env`

## Instalacion

Las dependencias ya estan instaladas. Si necesitas reinstalar:

```bash
# Instalar dependencia de Playwright
npm install -D @playwright/test

# Instalar browsers (solo Chromium por defecto)
npx playwright install chromium

# Para instalar todos los browsers
npx playwright install
```

## Ejecutar Tests

### Todos los tests

```bash
# Ejecutar todos los tests (headless)
npx playwright test

# Ejecutar con interfaz visual
npx playwright test --ui

# Ejecutar mostrando el browser
npx playwright test --headed
```

### Tests especificos

```bash
# Solo tests de auth
npx playwright test e2e/auth/

# Solo test de login
npx playwright test e2e/auth/login.spec.ts

# Tests que contengan "login" en el nombre
npx playwright test -g "login"
```

### Por browser

```bash
# Solo en Chromium
npx playwright test --project=chromium

# Solo en Firefox
npx playwright test --project=firefox

# Solo en mobile
npx playwright test --project=mobile-chrome
```

## Modos de Ejecucion

### Modo Debug

```bash
# Debug con Playwright Inspector
npx playwright test --debug

# Debug un test especifico
npx playwright test e2e/auth/login.spec.ts --debug
```

### Modo UI (Recomendado para desarrollo)

```bash
npx playwright test --ui
```

Abre una interfaz visual donde puedes:
- Ver todos los tests
- Ejecutar tests individuales
- Ver timeline de ejecucion
- Inspeccionar selectores
- Ver screenshots y videos

### Modo Watch

```bash
# Re-ejecutar tests al cambiar archivos
npx playwright test --watch
```

## Ver Reportes

```bash
# Abrir ultimo reporte HTML
npx playwright show-report

# El reporte se genera en playwright-report/
```

## Configuracion

### Variables de Entorno

```bash
# URL base del frontend (default: http://localhost:5173)
PLAYWRIGHT_BASE_URL=http://localhost:5173

# Modo CI (activa retries, reporters especiales)
CI=true
```

### Archivos de Configuracion

- `playwright.config.ts` - Configuracion principal
- `fixtures/test-data.ts` - Datos de prueba y selectores

## Escribir Nuevos Tests

### Estructura basica

```typescript
import { test, expect } from "@playwright/test";
import { testUsers, urls, selectors } from "../fixtures/test-data";

test.describe("Mi Feature", () => {
  test.beforeEach(async ({ page }) => {
    // Setup antes de cada test
    await page.goto(urls.login);
  });

  test("should do something", async ({ page }) => {
    // Acciones
    await page.fill(selectors.usernameInput, "user@test.com");
    await page.click(selectors.loginButton);

    // Assertions
    await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
  });
});
```

### Selectores

Usamos `data-testid` para selectores estables:

```typescript
// En el componente React
<button data-testid="login-button">Login</button>

// En el test
await page.click('[data-testid="login-button"]');
```

### Datos de prueba

Añadir nuevos datos en `fixtures/test-data.ts`:

```typescript
export const myTestData = {
  field1: "value1",
  field2: "value2",
};
```

## Troubleshooting

### El test falla por timeout

```bash
# Aumentar timeout global
npx playwright test --timeout=60000

# O en el test especifico
test("my test", async ({ page }) => {
  test.setTimeout(60000);
  // ...
});
```

### No encuentra el elemento

1. Verifica que el `data-testid` existe en el componente
2. Usa el modo debug para inspeccionar: `npx playwright test --debug`
3. Añade espera explicita:
   ```typescript
   await page.waitForSelector('[data-testid="my-element"]');
   ```

### El browser no se instala

```bash
# Instalar dependencias del sistema (Linux)
npx playwright install-deps chromium

# Reinstalar browsers
npx playwright install --force
```

### Tests fallan en CI pero pasan local

- Verifica que `CI=true` esta configurado
- Los retries estan activados en CI (2 intentos)
- Revisa los screenshots/videos en los artifacts

## CI/CD

Los tests se ejecutan automaticamente en CI. Configuracion recomendada:

```yaml
# .github/workflows/e2e.yml
- name: Run E2E tests
  run: npx playwright test
  env:
    CI: true

- name: Upload report
  uses: actions/upload-artifact@v3
  if: failure()
  with:
    name: playwright-report
    path: playwright-report/
```

## Recursos

- [Documentacion de Playwright](https://playwright.dev/docs/intro)
- [Locators](https://playwright.dev/docs/locators)
- [Assertions](https://playwright.dev/docs/test-assertions)
- [Best Practices](https://playwright.dev/docs/best-practices)
