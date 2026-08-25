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
import { PAGE_SIZE, STORAGE_KEYS } from '@/shared/util/constants';
import { CR_STATUS_IDS } from '@/shared/util/cr-status-workflow';

describe('CrListComponent views', () => {
  let fixture: ComponentFixture<CrListComponent>;
  let component: CrListComponent;
  let crsService: jasmine.SpyObj<CrsService>;
  let projectsService: jasmine.SpyObj<ProjectsService>;
  const crs = signal<ChangeRequest[]>([changeRequest()]);
  const loading = signal(false);
  const apiError = signal('');

  beforeEach(async () => {
    localStorage.clear();
    crs.set([changeRequest()]);
    loading.set(false);
    apiError.set('');

    crsService = jasmine.createSpyObj<CrsService>('CrsService', ['loadAll'], {
      crs, loading, error: apiError,
    });
    crsService.loadAll.and.resolveTo(crs());
    projectsService = jasmine.createSpyObj<ProjectsService>('ProjectsService', ['loadAll'], {
      projects: signal([]), loading: signal(false), error: signal(''),
    });
    projectsService.loadAll.and.resolveTo([]);

    await TestBed.configureTestingModule({
      imports: [CrListComponent],
      providers: [
        provideRouter([]),
        { provide: CrsService, useValue: crsService },
        { provide: ProjectsService, useValue: projectsService },
        {
          provide: AuthService,
          useValue: {
            isAdmin: () => false,
            user: () => ({ clientId: 'client-id', company: 'Client workspace' }),
          },
        },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: () => null } } } },
      ],
    }).compileComponents();

    await createComponent();
  });

  afterEach(() => localStorage.clear());

  it('shows the shared Board/List switch and user-only create action', () => {
    const root = fixture.nativeElement as HTMLElement;
    const board = button('Board');
    const list = button('List');

    expect(root.querySelector('[role="group"][aria-label="Change Request view"]')).not.toBeNull();
    expect(board.getAttribute('aria-pressed')).toBe('true');
    expect(list.getAttribute('aria-pressed')).toBe('false');
    expect(root.querySelector<HTMLAnchorElement>('a[href="/change-requests/new"]')?.textContent).toContain('New CR');
    expect(root.textContent).not.toContain('Manage requests across client delivery stages');
    expect(root.textContent).not.toContain('Sensitive admin client');
  });

  it('switches from Board to List and back without reloading data', () => {
    expect(boardElement()).not.toBeNull();
    expect(tableElement()).toBeNull();

    button('List').click();
    fixture.detectChanges();

    expect(component.view()).toBe('list');
    expect(boardElement()).toBeNull();
    expect(tableElement()).not.toBeNull();
    expect(button('List').getAttribute('aria-pressed')).toBe('true');

    button('Board').click();
    fixture.detectChanges();

    expect(component.view()).toBe('board');
    expect(boardElement()).not.toBeNull();
    expect(tableElement()).toBeNull();
    expect(crsService.loadAll).toHaveBeenCalledTimes(1);
    expect(projectsService.loadAll).toHaveBeenCalledTimes(1);
  });

  it('keeps search filters applied while switching views', () => {
    crs.set([
      changeRequest({ id: 'matching', title: 'Responsive table update', name: 'Responsive table update' }),
      changeRequest({ id: 'other', title: 'Unrelated request', name: 'Unrelated request' }),
    ]);
    fixture.detectChanges();
    const search = fixture.nativeElement.querySelector('input[type="search"]') as HTMLInputElement;
    search.value = 'responsive';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.filtered().map((cr) => cr.id)).toEqual(['matching']);
    expect(boardElement()?.textContent).toContain('Responsive table update');
    expect(boardElement()?.textContent).not.toContain('Unrelated request');

    component.setView('list');
    fixture.detectChanges();

    expect(search.value).toBe('responsive');
    expect(tableElement()?.textContent).toContain('Responsive table update');
    expect(tableElement()?.textContent).not.toContain('Unrelated request');

    component.setView('board');
    fixture.detectChanges();
    expect(component.search()).toBe('responsive');
  });

  it('keeps list pagination state when visiting Board and returning to List', () => {
    crs.set(Array.from({ length: PAGE_SIZE + 1 }, (_, index) => changeRequest({ id: `cr-${index}` })));
    component.setView('list');
    component.setPage(2);
    fixture.detectChanges();

    component.setView('board');
    fixture.detectChanges();
    component.setView('list');
    fixture.detectChanges();

    expect(component.page()).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('2 / 2');
  });

  it('persists and restores the selected view', async () => {
    component.setView('list');
    fixture.detectChanges();
    expect(localStorage.getItem(STORAGE_KEYS.crListView)).toBe('list');

    fixture.destroy();
    await createComponent();

    expect(component.view()).toBe('list');
    expect(tableElement()).not.toBeNull();
  });

  it('shows loading and error states in both views', () => {
    for (const view of ['board', 'list'] as const) {
      component.setView(view);
      loading.set(true);
      apiError.set('Change requests could not be loaded.');
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('Loading change requests…');
      expect(fixture.nativeElement.textContent).toContain('Change requests could not be loaded.');
      expect(boardElement()).toBeNull();
      expect(tableElement()).toBeNull();
    }
  });

  it('shows empty and no-results states in both views', () => {
    crs.set([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('[aria-label="Change Request board"] section')).toHaveSize(5);
    expect(fixture.nativeElement.textContent).toContain('No requests here');

    component.setView('list');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No change requests match these filters.');

    crs.set([changeRequest()]);
    component.search.set('does-not-match');
    component.setView('board');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No requests here');
  });

  it('renders headers and body cells in the exact same column order in List view', () => {
    component.setView('list');
    fixture.detectChanges();
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

  it('keeps the List no-data cell spanning every declared column', () => {
    crs.set([]);
    component.setView('list');
    fixture.detectChanges();

    const emptyCell = (fixture.nativeElement as HTMLElement).querySelector<HTMLTableCellElement>('tbody td[colspan]');
    expect(Number(emptyCell?.colSpan)).toBe(CR_TABLE_COLUMNS.length);
  });

  it('groups statuses by backend ID without losing, duplicating, or hiding an unknown status', () => {
    crs.set([
      changeRequest({ id: 'analysis', title: 'Analysis CR', currentStatusID: CR_STATUS_IDS.analysis, status: 'Analysis' }),
      changeRequest({ id: 'signoff', title: 'Signoff CR', currentStatusID: CR_STATUS_IDS.pendingCustomerApproval, status: 'Pending Customer Approval' }),
      changeRequest({ id: 'closed', title: 'Delivered CR', currentStatusID: CR_STATUS_IDS.delivered, status: 'Delivered' }),
      changeRequest({ id: 'future', title: 'Future CR', currentStatusID: 'future-status-id', status: 'Future Backend State' }),
    ]);
    fixture.detectChanges();

    const groupedIds = component.boardColumns().flatMap((column) => column.items.map((cr) => cr.id));
    expect(groupedIds).toEqual(['analysis', 'signoff', 'closed', 'future']);
    expect(new Set(groupedIds).size).toBe(crs().length);
    expect(component.boardColumns().find((column) => column.key === 'other')?.items[0].status)
      .toBe('Future Backend State');
  });

  it('builds ordered filter options and filters List and Board by status ID', () => {
    crs.set([
      changeRequest({ id: 'approval', title: 'Approval CR', currentStatusID: CR_STATUS_IDS.pendingCustomerApproval, status: 'Pending Customer Approval' }),
      changeRequest({ id: 'analysis', title: 'Analysis CR', currentStatusID: CR_STATUS_IDS.analysis, status: 'Analysis' }),
    ]);
    component.statusFilter.set(CR_STATUS_IDS.analysis.toUpperCase());
    fixture.detectChanges();

    expect(component.statuses().map((status) => status.id)).toEqual([
      CR_STATUS_IDS.analysis,
      CR_STATUS_IDS.pendingCustomerApproval,
    ]);
    expect(component.filtered().map((cr) => cr.id)).toEqual(['analysis']);
    expect(component.boardColumns().flatMap((column) => column.items).map((cr) => cr.id)).toEqual(['analysis']);
    component.setView('list');
    fixture.detectChanges();
    expect(tableElement()?.textContent).toContain('Analysis CR');
    expect(tableElement()?.textContent).not.toContain('Approval CR');
  });

  async function createComponent(): Promise<void> {
    fixture = TestBed.createComponent(CrListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  function button(label: string): HTMLButtonElement {
    return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'))
      .find((candidate) => candidate.textContent?.trim() === label) as HTMLButtonElement;
  }

  function boardElement(): HTMLElement | null {
    return (fixture.nativeElement as HTMLElement).querySelector('[aria-label="Change Request board"]');
  }

  function tableElement(): HTMLTableElement | null {
    return (fixture.nativeElement as HTMLElement).querySelector('table');
  }
});

function changeRequest(overrides: Partial<ChangeRequest> = {}): ChangeRequest {
  return {
    id: 'cr-id', name: 'A very long change request title for responsive table testing',
    title: 'A very long change request title for responsive table testing', code: 'CR-12345678',
    priority: 'High', scope: ['Scope'], description: 'Description', estimatedManHour: 8,
    estimatedHours: 8, hourlyRate: 50, manHourRate: 50, totalCost: 400, estimatedCost: 400,
    startDate: '2026-09-10', finishDate: '2026-09-11', expectedStart: '2026-09-10',
    expectedDelivery: '2026-09-11', currentStatusID: CR_STATUS_IDS.analysis, currentStatusName: 'Analysis',
    status: 'Analysis', stage: 'Implementation', projectID: 'project-id', projectId: 'project-id',
    projectName: 'A project with a long name', clientId: 'client-id', clientName: 'Sensitive admin client',
    daysOpen: 1,
    ...overrides,
  };
}
