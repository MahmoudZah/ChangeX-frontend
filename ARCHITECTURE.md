# CRMS Angular Architecture Guide

This document describes the feature-based architecture used in the **changeX** (CRMS) app. Read it before adding any new file — every folder belongs to exactly one **layer**, and layers may only depend downward, never sideways into another feature's private code.

---

## Tech stack

| Choice | Version / tool |
|---|---|
| Framework | Angular 18+, standalone components (no NgModules) |
| State | Angular Signals (no NgRx at this scale) |
| Styling | Tailwind CSS v4 + design tokens in `src/styles.css` |
| UI library | [ZardUI](https://zardui.com) — shadcn/ui-style, generated into the repo via CLI |
| Boundary enforcement | `eslint-plugin-boundaries` in `eslint.config.js` |

---

## The core rule

**No feature module should ever import another feature's internal components, routes, or page files.**

The only cross-feature sharing allowed is through another feature's **`data-access`** folder (services + models). UI stays encapsulated inside each feature.

### Layer dependency table

| Layer | Path pattern | Contains | May import from |
|---|---|---|---|
| **core** | `src/app/core/*` | App-wide singletons: auth, HTTP, shell layout | `shared` only |
| **shared/ui** | `src/app/shared/ui/*` | ZardUI primitives + our composite components | `shared` only (leaf) |
| **shared/util** | `src/app/shared/util/*` | Pure functions, formatters, constants | nothing (leaf) |
| **data-access** | `src/app/features/*/data-access/*` | HTTP calls, Signal state, models | `core`, `shared`, other features' `data-access` |
| **feature** | `src/app/features/*/feature-*/*` | Smart page components, routes, modals | own feature's `data-access`, `shared`, other features' `data-access` |

### Dependency flow (visual)

```
┌─────────────────────────────────────────────────────────┐
│  feature-*  (pages, modals, tabs)                       │
│  e.g. feature-client-list, feature-cr-detail            │
└────────────┬──────────────────────────────┬─────────────┘
             │                              │
             ▼                              ▼
┌────────────────────────┐    ┌─────────────────────────────┐
│  data-access           │◄───│  other feature data-access  │
│  (own feature)         │    │  (cross-feature, allowed)   │
└────────────┬───────────┘    └─────────────────────────────┘
             │
             ▼
┌────────────────────────┐    ┌─────────────────────────────┐
│  core                  │    │  shared/ui + shared/util    │
│  auth, http, layout    │───►│  (leaf — no feature code)   │
└────────────────────────┘    └─────────────────────────────┘
```

---

## Full folder structure

```
changeX/
├── components.json              # ZardUI CLI config — where generated components land
├── eslint.config.js             # Layer boundary rules
├── src/
│   ├── styles.css               # Tailwind v4 + CRMS design tokens
│   └── app/
│       ├── app.config.ts        # App providers (include provideZard())
│       ├── app.routes.ts        # Root routes — lazy-loads every feature
│       │
│       ├── core/                # App-wide infrastructure (not feature-specific)
│       │   ├── auth/
│       │   │   ├── auth.service.ts       # Current user Signal, login/logout, token
│       │   │   ├── auth.guard.ts         # Must be logged in
│       │   │   └── role.guard.ts         # Role check: Admin | Client
│       │   ├── http/
│       │   │   ├── api.service.ts        # Thin HttpClient wrapper (get/post/put/delete)
│       │   │   ├── auth.interceptor.ts   # Attaches auth token
│       │   │   └── error.interceptor.ts  # Centralized error / toast handling
│       │   └── layout/
│       │       ├── shell/                # Sidebar + topbar wrapper around router-outlet
│       │       ├── sidebar/
│       │       └── topbar/
│       │
│       ├── shared/              # Reusable, feature-agnostic code
│       │   ├── ui/
│       │   │   ├── button/               # ZardUI-generated (zard-cli add button)
│       │   │   ├── badge/                # ZardUI-generated
│       │   │   ├── table/                # ZardUI-generated
│       │   │   ├── dialog/               # ZardUI-generated
│       │   │   ├── tabs/                 # ZardUI-generated
│       │   │   ├── ...                     # Other ZardUI primitives (see § ZardUI)
│       │   │   ├── status-badge/         # OUR composite — CR/Invoice status → color
│       │   │   ├── priority-badge/       # OUR composite — wraps Badge
│       │   │   ├── data-table/           # OUR composite — Table + Pagination API
│       │   │   ├── stepper/              # OUR composite — CR lifecycle (no ZardUI stepper)
│       │   │   └── form-field/           # OUR composite — label + input + error layout
│       │   └── util/
│       │       ├── formatters.ts         # Currency, date formatting
│       │       └── constants.ts          # App-wide constants
│       │
│       └── features/            # Business modules — one folder per domain
│           ├── auth/
│           │   └── feature-login/
│           │       ├── login.component.ts
│           │       └── login.routes.ts
│           │
│           ├── clients/
│           │   ├── data-access/
│           │   │   ├── clients.service.ts
│           │   │   └── client.model.ts
│           │   ├── feature-client-list/
│           │   ├── feature-client-detail/    # Injects users + projects data-access
│           │   ├── feature-client-form/
│           │   └── clients.routes.ts
│           │
│           ├── projects/
│           │   ├── data-access/
│           │   │   ├── projects.service.ts
│           │   │   └── project.model.ts
│           │   ├── feature-project-list/
│           │   ├── feature-project-detail/   # Injects change-requests data-access
│           │   ├── feature-project-form/
│           │   └── projects.routes.ts
│           │
│           ├── change-requests/
│           │   ├── data-access/
│           │   │   ├── crs.service.ts
│           │   │   ├── cr.model.ts
│           │   │   ├── statuses.service.ts
│           │   │   ├── status.model.ts
│           │   │   ├── details.service.ts
│           │   │   ├── detail.model.ts
│           │   │   ├── invoices.service.ts
│           │   │   └── invoice.model.ts
│           │   ├── feature-cr-list/
│           │   ├── feature-cr-detail/
│           │   │   └── tabs/
│           │   │       ├── overview/
│           │   │       ├── estimation/
│           │   │       ├── status-timeline/
│           │   │       ├── attachments-comments/
│           │   │       └── invoice/
│           │   ├── feature-cr-form/
│           │   ├── feature-status-change-modal/
│           │   ├── feature-estimate-modal/
│           │   └── change-requests.routes.ts
│           │
│           └── users/
│               ├── data-access/
│               │   ├── users.service.ts
│               │   └── user.model.ts
│               ├── feature-user-list/
│               ├── feature-user-form/
│               └── users.routes.ts
```

---

## Where to put everything — decision guide

Use this when you're unsure where a new file belongs.

| You're building… | Put it in… | Example |
|---|---|---|
| Login, logout, current user, JWT token | `core/auth/` | `auth.service.ts` |
| Route guard (logged in?) | `core/auth/` | `auth.guard.ts` |
| Route guard (Admin only?) | `core/auth/` | `role.guard.ts` |
| Base HTTP wrapper, interceptors | `core/http/` | `api.service.ts` |
| App shell, sidebar, topbar | `core/layout/` | `shell/shell.component.ts` |
| A button, table, dialog used everywhere | `shared/ui/<name>/` via ZardUI CLI | `shared/ui/button/` |
| A reusable badge/table wrapper with our API | `shared/ui/<composite>/` | `shared/ui/status-badge/` |
| Date/currency formatting, constants | `shared/util/` | `formatters.ts` |
| API calls + Signal state for one domain | `features/<domain>/data-access/` | `clients.service.ts` |
| TypeScript interface for an entity | `features/<domain>/data-access/` | `client.model.ts` |
| A routable page (list, detail, form) | `features/<domain>/feature-<name>/` | `feature-client-list/` |
| A modal used only inside one feature | `features/<domain>/feature-<modal>/` | `feature-status-change-modal/` |
| A tab panel used only on one page | Inside that page's folder | `feature-cr-detail/tabs/overview/` |
| A sub-component used only on one page | `feature-*/components/` (nested) | `feature-cr-detail/components/` |
| Feature route definitions | `features/<domain>/<domain>.routes.ts` | `clients.routes.ts` |
| Root lazy-loaded routes | `app.routes.ts` | — |

### Quick rules of thumb

1. **If it talks to the API or holds feature state** → `data-access`
2. **If it has a route and composes UI** → `feature-*`
3. **If two or more features need the same visual component** → `shared/ui`
4. **If it's used on one page only** → keep it inside that `feature-*` folder (or a `components/` subfolder there)
5. **If it's app infrastructure (auth, layout, HTTP)** → `core`

---

## Layer details

### `core/` — app infrastructure

Everything here is a singleton used across the whole app. **Never put feature-specific business logic here.**

| Folder | Responsibility |
|---|---|
| `core/auth/` | Session management, guards, role checks |
| `core/http/` | HTTP plumbing — not domain API calls (those live in `data-access`) |
| `core/layout/` | Persistent shell UI wrapping authenticated routes |

`core` may import from `shared` (e.g. a Button in the topbar) but **must not** import from any `features/` folder.

---

### `shared/` — reusable, feature-agnostic code

Split into two sub-layers:

#### `shared/ui/`

Two kinds of components live here:

1. **ZardUI primitives** — generated by CLI, used as-is. Do not hand-edit unless restyling globally. Do not regenerate copies inside feature folders.

2. **Our composites** — wrappers that add CRMS-specific behavior on top of ZardUI:

| Composite | Wraps | Purpose |
|---|---|---|
| `status-badge` | Badge | Maps CR/Invoice status → `bg-status-*` color token |
| `priority-badge` | Badge | Priority label + color |
| `data-table` | Table + Pagination | Unified column/filter/sort API for all list pages |
| `stepper` | Separator + Badge | CR lifecycle visualization (no native ZardUI stepper) |
| `form-field` | Field + Input/Select | Consistent label + control + error message layout |

**Rules for `shared/ui`:**
- Inputs/outputs only — **no HttpClient**, no injected feature services
- May import other `shared/ui` and `shared/util` files only
- If a feature needs a variant, extend via a new composite here — don't fork inside the feature

#### `shared/util/`

Pure functions and constants with zero Angular dependencies:

- `formatters.ts` — `formatCurrency()`, `formatDate()`, etc.
- `constants.ts` — role names, pagination defaults, etc.

---

### `features/<domain>/data-access/` — state and API

**This is the only place a feature's state lives.**

Each service follows the same Signal pattern:

```ts
@Injectable({ providedIn: 'root' })
export class ClientsService {
  private api = inject(ApiService);
  private _clients = signal<Client[]>([]);
  readonly clients = this._clients.asReadonly();

  async loadAll(): Promise<void> { /* ... */ }
  async create(payload: Partial<Client>): Promise<void> { /* ... */ }
  // update, delete, getById — same shape
}
```

| File type | Naming | Example |
|---|---|---|
| Service | `<plural>.service.ts` | `clients.service.ts` |
| Model | `<singular>.model.ts` | `client.model.ts` — exports interface `Client` |

Models are **interfaces**, not classes. No barrel `index.ts` files — import directly so cross-feature deps are grep-able:

```ts
import { ProjectsService } from '@/features/projects/data-access/projects.service';
```

#### Change Requests — multiple data-access services

The `change-requests` feature is the largest. Its `data-access/` folder holds separate services per sub-entity:

| Service | Model | Domain |
|---|---|---|
| `crs.service.ts` | `cr.model.ts` | Change requests |
| `statuses.service.ts` | `status.model.ts` | Status transitions |
| `details.service.ts` | `detail.model.ts` | Attachments & comments |
| `invoices.service.ts` | `invoice.model.ts` | Invoices |

All four stay in the same feature's `data-access/` — they are not separate features.

---

### `features/<domain>/feature-*/` — smart pages and modals

Every `feature-*` folder is a **routable page** or a **modal/dialog** owned by that feature.

| Convention | Detail |
|---|---|
| Folder name | `feature-<kebab-case-name>/` |
| Component files | `<name>.component.ts`, `.html`, `.css` |
| Page-only sub-components | Nested `components/` folder inside the feature folder |
| Tab panels | Nested `tabs/<tab-name>/` (see CR detail) |

**What feature pages do:**
1. Inject their own feature's `data-access` services
2. Optionally inject **other features'** `data-access` services (never their UI)
3. Compose `shared/ui` components
4. Define no HTTP calls directly — delegate to services

---

## Cross-feature data sharing

### Allowed

A feature page or service may import another feature's **`data-access`**:

```ts
// feature-client-detail injects foreign data-access — OK
import { ProjectsService } from '@/features/projects/data-access/projects.service';
import { UsersService } from '@/features/users/data-access/users.service';
```

```ts
// feature-project-detail — OK
import { CrsService } from '@/features/change-requests/data-access/crs.service';
```

### Forbidden

```ts
// NEVER — importing another feature's page/component
import { ProjectListComponent } from '@/features/projects/feature-project-list/...';
```

### Preferred pattern for related lists

When a detail page needs to show a full list from another module, **route to that feature's list page with a query param** instead of embedding its component:

```
/change-requests?projectId=12     ← from Project Detail
/projects?clientId=5              ← from Client Detail
/users?clientId=5                 ← from Client Detail
```

Only inject a foreign `data-access` service directly when you need **inline summary data** on the same page (a count, a small table, a dropdown).

---

## Routing

### Root routes (`app.routes.ts`)

Every feature is lazy-loaded — this physically enforces the module boundary at build time.

| Path | Loads | Guard |
|---|---|---|
| `/login` | `features/auth/feature-login` | — |
| `/clients` | `features/clients/clients.routes` | Admin |
| `/projects` | `features/projects/projects.routes` | authenticated |
| `/change-requests` | `features/change-requests/change-requests.routes` | authenticated (default) |
| `/users` | `features/users/users.routes` | Admin |

Authenticated routes render inside `ShellComponent` from `core/layout/shell/`.

Client role users never download the Clients or Users feature chunks (blocked by `roleGuard`).

### Feature route files

Each feature exports a named `Routes` constant:

| Feature | File | Export name |
|---|---|---|
| Clients | `clients.routes.ts` | `CLIENTS_ROUTES` |
| Projects | `projects.routes.ts` | `PROJECTS_ROUTES` |
| Change Requests | `change-requests.routes.ts` | `CR_ROUTES` |
| Users | `users.routes.ts` | `USERS_ROUTES` |

---

## Design tokens

All brand colors and status pill colors live in `src/styles.css` as CSS custom properties, exposed to Tailwind via `@theme inline`.

CRMS-specific status tokens (used by `status-badge`):

| Token | Background | Foreground | Use |
|---|---|---|---|
| `status-pending` | `#FFFBEB` | `#92400E` | Pending |
| `status-progress` | `#EFF6FF` | `#1D4ED8` | In progress |
| `status-rework` | `#FFF7ED` | `#C2410C` | Rework |
| `status-accepted` | `#ECFDF5` | `#047857` | Accepted |
| `status-rejected` | `#FEF2F2` | `#B91C1C` | Rejected |
| `status-delivered` | `#F5F3FF` | `#6D28D9` | Delivered |
| `status-completed` | `#F1F5F9` | `#334155` | Completed |

Tailwind utilities: `bg-status-pending`, `text-status-pending-foreground`, etc.

**Rule:** every feature renders status through `shared/ui/status-badge` — never hard-code status colors inside a feature page.

---

## ZardUI integration

ZardUI components are generated into `shared/ui/` via CLI — they are source you own, not an opaque npm package.

### Setup (once)

```bash
npx zard-cli@latest init
```

Then add `provideZard()` to `app.config.ts`.

`components.json` at the project root tells the CLI where to generate files:

| Alias | Resolves to |
|---|---|
| `@/shared/ui` | ZardUI components |
| `@/shared/util` | Utility functions |
| `@/core/zard` | ZardUI core helpers |
| `@/core/services` | ZardUI services |

### Batch-generate all primitives

```bash
npx zard-cli add button button-group badge table pagination select input combobox toggle-group dialog alert-dialog tabs separator empty field textarea date-picker checkbox radio-group sonner skeleton spinner layout navigation-menu breadcrumb avatar card
```

### Which primitive for what

| UI need | ZardUI command | Notes |
|---|---|---|
| Buttons | `add button`, `add button-group` | Use directly |
| Status / priority pills | `add badge` | Wrap in our composites |
| Data tables | `add table`, `add pagination` | Wrap in `data-table` |
| Filters | `add select`, `add input`, `add combobox` | Combobox for searchable pickers |
| Forms / modals | `add dialog`, `add alert-dialog` | Alert dialog for destructive confirms |
| CR detail tabs | `add tabs` | One tab component per panel |
| CR lifecycle stepper | `add separator`, `add badge` | Compose in `shared/ui/stepper` |
| Empty states | `add empty` | Use directly |
| Form fields | `add field`, `add input`, etc. | Compose in `form-field` |
| File upload | `add input` (type=file) + `add field` | No native upload — build custom |
| Toasts | `add sonner` | All create/update/delete feedback |
| Loading | `add skeleton`, `add spinner` | Skeleton for pages, spinner for buttons |
| App shell nav | `add layout`, `add navigation-menu`, `add breadcrumb`, `add avatar` | Used in `core/layout/` |

---

## Naming conventions

| Item | Convention | Example |
|---|---|---|
| Folders & files | kebab-case | `feature-client-list/` |
| Components | One per folder, co-located template/styles | `client-list.component.ts` |
| Models | Singular interface name | `client.model.ts` → `export interface Client` |
| Route files | `<feature>.routes.ts` | `clients.routes.ts` |
| Route exports | `SCREAMING_SNAKE_ROUTES` | `CLIENTS_ROUTES` |
| CSS | Tailwind utilities in template; component `.css` only when Tailwind can't express it | — |
| Imports | Direct paths, no barrel `index.ts` | `@/features/clients/data-access/clients.service` |

---

## ESLint boundary enforcement

Configured in `eslint.config.js`. A forbidden import fails at lint/CI time.

Run:

```bash
npm run lint
```

**Test it works:** temporarily add an import from `features/projects/feature-project-list` inside `features/clients` — lint should error, then remove it.

---

## Feature reference

### Clients (`features/clients/`)

| Piece | Location | Notes |
|---|---|---|
| API + state | `data-access/clients.service.ts` | Signal-based client list |
| Model | `data-access/client.model.ts` | `{ id, name, email, contactInfo }` |
| List page | `feature-client-list/` | Admin only |
| Detail page | `feature-client-detail/` | Shows users + projects for client |
| Form page | `feature-client-form/` | Create / edit |
| Routes | `clients.routes.ts` | Lazy-loaded from root |

### Projects (`features/projects/`)

| Piece | Location | Notes |
|---|---|---|
| API + state | `data-access/projects.service.ts` | |
| Model | `data-access/project.model.ts` | `{ id, name, description, scope, userId, state }` |
| Detail page | `feature-project-detail/` | Injects CR data-access for inline CR summary |
| Routes | `projects.routes.ts` | |

### Change Requests (`features/change-requests/`)

| Piece | Location | Notes |
|---|---|---|
| CR service | `data-access/crs.service.ts` | Main CR entity |
| Status service | `data-access/statuses.service.ts` | Valid transitions |
| Details service | `data-access/details.service.ts` | Attachments & comments |
| Invoices service | `data-access/invoices.service.ts` | |
| List page | `feature-cr-list/` | Default landing route |
| Detail page | `feature-cr-detail/` | 5 tabs (see below) |
| Form | `feature-cr-form/` | Create / edit CR |
| Status modal | `feature-status-change-modal/` | Dialog for status transitions |
| Estimate modal | `feature-estimate-modal/` | Dialog for estimation |
| Routes | `change-requests.routes.ts` | |

**CR Detail tabs:**

| Tab folder | Content |
|---|---|
| `tabs/overview/` | Summary, key fields |
| `tabs/estimation/` | Man hours, rate |
| `tabs/status-timeline/` | Status history stepper |
| `tabs/attachments-comments/` | Files + comments |
| `tabs/invoice/` | Invoice list / actions |

### Users (`features/users/`)

| Piece | Location | Notes |
|---|---|---|
| API + state | `data-access/users.service.ts` | |
| Model | `data-access/user.model.ts` | `{ id, name, email, role, clientId }` |
| List / Form | `feature-user-list/`, `feature-user-form/` | Admin only |
| Routes | `users.routes.ts` | |

### Auth (`features/auth/`)

| Piece | Location | Notes |
|---|---|---|
| Login page | `feature-login/login.component.ts` | Public route, no shell |
| Session logic | `core/auth/auth.service.ts` | Not in the feature folder |

---

## Recommended implementation order

1. Run `npx zard-cli@latest init` and install Tailwind v4
2. Replace / verify `src/styles.css` tokens
3. Batch-add ZardUI primitives into `shared/ui/`
4. Build composite components in `shared/ui/` (status-badge, data-table, form-field, stepper)
5. Implement `core/` (auth service, guards, HTTP, shell layout)
6. Implement `features/auth/feature-login`
7. Implement `features/clients`, `features/projects`, `features/users`
8. Implement `features/change-requests` last (most sub-entities)
9. Wire `app.routes.ts` with lazy loading and guards
10. Run `npm run lint` and verify boundary rules fire

---

## Adding a new feature (checklist)

When adding a new business domain (e.g. `reports`):

1. Create `features/reports/data-access/` with service + model
2. Create `features/reports/feature-report-list/` (and other pages)
3. Create `features/reports/reports.routes.ts` exporting `REPORTS_ROUTES`
4. Add lazy route in `app.routes.ts`
5. Add nav link in `core/layout/sidebar/` (if needed)
6. Do **not** create barrel exports — import data-access paths directly
7. Run lint to confirm no forbidden cross-feature UI imports

---

## Path aliases

Configured in `tsconfig.json`:

```json
"paths": {
  "@/*": ["src/app/*"]
}
```

Examples:

```ts
import { ApiService } from '@/core/http/api.service';
import { StatusBadgeComponent } from '@/shared/ui/status-badge/status-badge.component';
import { Client } from '@/features/clients/data-access/client.model';
```
