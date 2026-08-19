import { Injectable, signal } from '@angular/core';
import { Project } from '@/features/projects/data-access/project.model';

const MOCK: Project[] = [
  {
    id: 'p1',
    name: 'E-Commerce Replatform',
    description: 'Migrate storefront, checkout, and catalog services to the new commerce stack.',
    scope: 'Storefront, checkout, HubSpot sync',
    userId: 'u-sarah',
    clientId: 'c1',
    state: 'Active',
    changeRequestCount: 8,
    lastUpdated: '2026-08-17T10:00:00Z',
  },
  {
    id: 'p2',
    name: 'Marketing Website Refresh',
    description: 'New brand system, landing pages, and CMS content model for campaign launches.',
    scope: 'CMS, design system, analytics',
    userId: 'u-sarah',
    clientId: 'c1',
    state: 'Active',
    changeRequestCount: 3,
    lastUpdated: '2026-08-15T14:00:00Z',
  },
  {
    id: 'p3',
    name: 'Internal Tools Portal',
    description: 'Unified ops portal for support, billing adjustments, and order lookups.',
    scope: 'Auth, tickets, reporting',
    userId: 'u-sarah',
    clientId: 'c1',
    state: 'Active',
    changeRequestCount: 5,
    lastUpdated: '2026-08-12T09:00:00Z',
  },
  {
    id: 'p4',
    name: 'Data Warehouse Migration',
    description: 'Move analytics pipelines off the legacy warehouse into the new lakehouse.',
    scope: 'ETL, dashboards, access control',
    userId: 'u-sarah',
    clientId: 'c1',
    state: 'Inactive',
    changeRequestCount: 2,
    lastUpdated: '2026-07-30T16:00:00Z',
  },
];

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private _projects = signal<Project[]>(MOCK);
  readonly projects = this._projects.asReadonly();

  async loadAll(): Promise<void> {
    this._projects.set(MOCK);
  }

  getById(id: string): Project | undefined {
    return this._projects().find((p) => p.id === id);
  }
}
