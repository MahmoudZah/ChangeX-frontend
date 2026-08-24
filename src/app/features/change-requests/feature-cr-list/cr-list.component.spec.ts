import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { AuthService } from '@/core/auth/auth.service';
import { ChangeRequest } from '@/features/change-requests/data-access/cr.model';
import { CrsService } from '@/features/change-requests/data-access/crs.service';
import {
  CR_TABLE_COLUMNS,
  CrListComponent,
} from '@/features/change-requests/feature-cr-list/cr-list.component';
import { ProjectsService } from '@/features/projects/data-access/projects.service';

describe('CrListComponent table', () => {
  let fixture: ComponentFixture<CrListComponent>;
  const crs = signal<ChangeRequest[]>([changeRequest()]);

  beforeEach(async () => {
    const crsService = jasmine.createSpyObj<CrsService>('CrsService', ['loadAll'], {
      crs, loading: signal(false), error: signal(''),
    });
    crsService.loadAll.and.resolveTo(crs());
    const projectsService = jasmine.createSpyObj<ProjectsService>('ProjectsService', ['loadAll'], {
      projects: signal([]), loading: signal(false), error: signal(''),
    });
    projectsService.loadAll.and.resolveTo([]);

    await TestBed.configureTestingModule({
      imports: [CrListComponent],
      providers: [
        provideRouter([]),
        { provide: CrsService, useValue: crsService },
        { provide: ProjectsService, useValue: projectsService },
        { provide: AuthService, useValue: { isAdmin: () => false, user: () => ({ clientId: 'client-id' }) } },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: () => null } } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CrListComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => crs.set([changeRequest()]));

  it('renders headers and body cells in the exact same column order', () => {
    const root = fixture.nativeElement as HTMLElement;
    const headerColumns = Array.from(root.querySelectorAll<HTMLTableCellElement>('thead th[data-column]'))
      .map((cell) => cell.dataset['column']);
    const bodyColumns = Array.from(root.querySelectorAll<HTMLTableCellElement>('tbody tr:first-child td[data-column]'))
      .map((cell) => cell.dataset['column']);
    const expected = CR_TABLE_COLUMNS.map((column) => column.key);

    expect(headerColumns).toEqual(expected);
    expect(bodyColumns).toEqual(expected);
    expect(root.querySelector('thead tr tr')).toBeNull();
    expect(root.querySelector('[data-column="actions"]')?.textContent?.trim()).toBe('Actions');
  });

  it('keeps the no-data cell spanning every declared column', () => {
    crs.set([]);
    fixture.detectChanges();

    const emptyCell = (fixture.nativeElement as HTMLElement).querySelector<HTMLTableCellElement>('tbody td[colspan]');
    expect(Number(emptyCell?.colSpan)).toBe(CR_TABLE_COLUMNS.length);
  });
});

function changeRequest(): ChangeRequest {
  return {
    id: 'cr-id', name: 'A very long change request title for responsive table testing',
    title: 'A very long change request title for responsive table testing', code: 'CR-12345678',
    priority: 'High', scope: ['Scope'], description: 'Description', estimatedManHour: 8,
    estimatedHours: 8, hourlyRate: 50, manHourRate: 50, totalCost: 400, estimatedCost: 400,
    startDate: '2026-09-10', finishDate: '2026-09-11', expectedStart: '2026-09-10',
    expectedDelivery: '2026-09-11', currentStatusID: 'status-id', currentStatusName: 'Analysis',
    status: 'Analysis', stage: 'Analysis', projectID: 'project-id', projectId: 'project-id',
    projectName: 'A project with a long name', clientId: 'client-id', clientName: 'Client', daysOpen: 1,
  };
}
