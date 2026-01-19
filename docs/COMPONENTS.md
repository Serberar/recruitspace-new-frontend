# Componentes

## Estructura

```
components/
├── ui/           # Componentes base de UI
├── form/         # Componentes de formulario
├── menu/         # Navegacion
├── error/        # Manejo de errores
├── feedback/     # Retroalimentacion
├── pipeline/     # Pipeline de candidatos
├── logo/         # Branding
├── footer/       # Pie de pagina
├── seo/          # SEO
├── public/       # Componentes publicos
├── sysadmin/     # Componentes admin
└── a11y/         # Accesibilidad
```

## UI Components

### Button

```typescript
interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

// Uso
<Button variant="primary" loading={isSubmitting}>
  Guardar
</Button>
```

### Input

```typescript
interface InputProps {
  label?: string;
  error?: string;
  hint?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

// Uso
<Input
  label="Email"
  type="email"
  error={errors.email?.message}
  {...register('email')}
/>
```

### Modal

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Uso
<Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Crear Oferta">
  <OfferForm onSubmit={handleSubmit} />
  <Modal.Footer>
    <Button onClick={() => setShowModal(false)}>Cancelar</Button>
    <Button variant="primary" type="submit">Guardar</Button>
  </Modal.Footer>
</Modal>
```

### Card

```typescript
interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

// Uso
<Card title="Metricas" actions={<Button size="sm">Ver todo</Button>}>
  <MetricsContent />
</Card>
```

### Badge

```typescript
interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
}

// Uso
<Badge variant="success">Activo</Badge>
<Badge variant="danger">Rechazado</Badge>
```

### Skeleton

```typescript
interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'wave';
}

// Uso
<Skeleton variant="text" width="100%" />
<Skeleton variant="circular" width={40} height={40} />
```

### Toast / Notifications

```typescript
interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

// Hook
const { showToast } = useToast();

// Uso
showToast({ type: 'success', message: 'Guardado correctamente' });
showToast({ type: 'error', message: 'Error al guardar' });
```

### VirtualList

```typescript
// Para listas largas con virtualizacion
interface VirtualListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => ReactNode;
}

// Uso
<VirtualList
  items={candidates}
  height={600}
  itemHeight={80}
  renderItem={(candidate) => <CandidateRow candidate={candidate} />}
/>
```

## Form Components

### Form

Wrapper con React Hook Form.

```typescript
interface FormProps<T> {
  onSubmit: (data: T) => void;
  defaultValues?: Partial<T>;
  schema: ZodSchema<T>;
  children: ReactNode;
}

// Uso
<Form schema={loginSchema} onSubmit={handleLogin}>
  <FormInput name="email" label="Email" />
  <FormInput name="password" label="Password" type="password" />
  <Button type="submit">Login</Button>
</Form>
```

### FormInput

```typescript
interface FormInputProps {
  name: string;
  label?: string;
  type?: string;
  placeholder?: string;
  hint?: string;
}

// Uso (dentro de Form)
<FormInput name="email" label="Email" type="email" />
```

### FormTextarea

```typescript
interface FormTextareaProps {
  name: string;
  label?: string;
  rows?: number;
  maxLength?: number;
}

// Uso
<FormTextarea name="description" label="Descripcion" rows={4} />
```

### FormSelect

```typescript
interface FormSelectProps {
  name: string;
  label?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

// Uso
<FormSelect
  name="clientId"
  label="Cliente"
  options={clients.map(c => ({ value: c.id, label: c.name }))}
/>
```

### FormCheckbox

```typescript
interface FormCheckboxProps {
  name: string;
  label: string;
}

// Uso
<FormCheckbox name="isPublic" label="Publicar en portal publico" />
```

### FormFileInput

```typescript
interface FormFileInputProps {
  name: string;
  label?: string;
  accept?: string;
  maxSize?: number; // bytes
}

// Uso
<FormFileInput
  name="cv"
  label="Curriculum"
  accept=".pdf,.doc,.docx"
  maxSize={5 * 1024 * 1024}
/>
```

## Layout Components

### DashboardLayout

```typescript
// Layout principal para recruiters
<DashboardLayout>
  <DashboardLayout.Sidebar>
    <Navigation />
  </DashboardLayout.Sidebar>
  <DashboardLayout.Main>
    <Outlet />
  </DashboardLayout.Main>
</DashboardLayout>
```

### SysadminLayout

```typescript
// Layout para panel de administracion
<SysadminLayout>
  <SysadminLayout.Header />
  <SysadminLayout.Content>
    <Outlet />
  </SysadminLayout.Content>
</SysadminLayout>
```

### CandidatePortalLayout

```typescript
// Layout para portal del candidato
<CandidatePortalLayout>
  <CandidatePortalLayout.Header />
  <CandidatePortalLayout.Main>
    <Outlet />
  </CandidatePortalLayout.Main>
</CandidatePortalLayout>
```

## Error Components

### ErrorBoundary

```typescript
// Captura errores de React
<ErrorBoundary fallback={<ErrorFallback />}>
  <App />
</ErrorBoundary>
```

### ErrorFallback

```typescript
interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary?: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="error-page">
      <h1>Algo salio mal</h1>
      <p>{error.message}</p>
      <Button onClick={resetErrorBoundary}>Reintentar</Button>
    </div>
  );
}
```

## Pipeline Components

### PipelineBoard

```typescript
// Vista Kanban del pipeline
<PipelineBoard
  processes={processes}
  statuses={statuses}
  onStatusChange={handleStatusChange}
  onCardClick={handleCardClick}
/>
```

### PipelineCard

```typescript
// Tarjeta de candidato en pipeline
<PipelineCard
  process={process}
  onClick={() => navigate(`/app/candidate/${process.id}`)}
/>
```

### PipelineColumn

```typescript
// Columna del pipeline (estado)
<PipelineColumn
  status={status}
  processes={filteredProcesses}
  onDrop={handleDrop}
/>
```

## Navigation Components

### Sidebar

```typescript
// Menu lateral
<Sidebar>
  <SidebarItem icon={<DashboardIcon />} to="/app/dashboard">
    Dashboard
  </SidebarItem>
  <SidebarItem icon={<OffersIcon />} to="/app/offers">
    Ofertas
  </SidebarItem>
  {/* ... mas items */}
</Sidebar>
```

### Header

```typescript
// Barra superior
<Header>
  <Header.Logo />
  <Header.Search />
  <Header.Actions>
    <NotificationsButton />
    <UserMenu />
  </Header.Actions>
</Header>
```

### Breadcrumbs

```typescript
<Breadcrumbs>
  <Breadcrumbs.Item to="/app/offers">Ofertas</Breadcrumbs.Item>
  <Breadcrumbs.Item>Developer Senior</Breadcrumbs.Item>
</Breadcrumbs>
```

## Feedback Components

### FeedbackWidget

```typescript
// Widget para enviar feedback
<FeedbackWidget onSubmit={handleFeedback} />
```

### LoadingOverlay

```typescript
// Overlay de carga
<LoadingOverlay visible={loading} message="Guardando..." />
```

### EmptyState

```typescript
// Estado vacio
<EmptyState
  icon={<EmptyIcon />}
  title="No hay ofertas"
  description="Crea tu primera oferta de empleo"
  action={<Button>Crear Oferta</Button>}
/>
```

## Public Components

### PublicHeader

```typescript
// Header para paginas publicas
<PublicHeader showAuth={true} />
```

### PublicFooter

```typescript
// Footer para paginas publicas
<PublicFooter />
```

### JobCard

```typescript
// Tarjeta de oferta en portal publico
<JobCard
  job={job}
  onClick={() => navigate(`/jobs/${job.id}`)}
/>
```

## SEO Components

### SEO

```typescript
// Componente para meta tags
<SEO
  title="Ofertas de Empleo | RecruitSpace"
  description="Encuentra tu proximo trabajo"
  image="/og-image.png"
/>
```

## Accesibilidad

### SkipLink

```typescript
// Saltar al contenido principal
<SkipLink target="#main-content">
  Saltar al contenido
</SkipLink>
```

### VisuallyHidden

```typescript
// Texto solo para lectores de pantalla
<VisuallyHidden>Abrir menu</VisuallyHidden>
```

## Patrones de Uso

### Composicion

```typescript
// Componentes compuestos
<Card>
  <Card.Header>
    <Card.Title>Titulo</Card.Title>
    <Card.Actions>
      <Button size="sm">Accion</Button>
    </Card.Actions>
  </Card.Header>
  <Card.Body>
    Contenido
  </Card.Body>
  <Card.Footer>
    Pie
  </Card.Footer>
</Card>
```

### Render Props

```typescript
// Para logica compartida
<DataTable
  data={users}
  columns={columns}
  renderRow={(user) => (
    <tr key={user.id}>
      <td>{user.name}</td>
      <td>{user.email}</td>
    </tr>
  )}
/>
```

### Controlled vs Uncontrolled

```typescript
// Controlled (estado externo)
<Input value={value} onChange={setValue} />

// Uncontrolled (estado interno)
<Input defaultValue="inicial" ref={inputRef} />
```
