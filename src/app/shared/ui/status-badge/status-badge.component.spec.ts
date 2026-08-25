import { TestBed } from '@angular/core/testing';
import { StatusBadgeComponent } from '@/shared/ui/status-badge/status-badge.component';
import { CR_STATUS_IDS } from '@/shared/util/cr-status-workflow';

describe('StatusBadgeComponent Change Request identity', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [StatusBadgeComponent] });
  });

  it('uses the centralized tone for a current backend status while displaying the API label', () => {
    const fixture = TestBed.createComponent(StatusBadgeComponent);
    fixture.componentRef.setInput('statusId', CR_STATUS_IDS.pendingVendorReworkFeedback);
    fixture.componentRef.setInput('status', 'Pending Vendor Rework Feedback');
    fixture.detectChanges();

    const badge = fixture.nativeElement.querySelector('span') as HTMLElement;
    expect(badge.textContent).toContain('Pending Vendor Rework Feedback');
    expect(badge.className).toContain('text-amber-600');
  });

  it('renders an unknown backend status with the safe neutral fallback', () => {
    const fixture = TestBed.createComponent(StatusBadgeComponent);
    fixture.componentRef.setInput('statusId', 'future-status-id');
    fixture.componentRef.setInput('status', 'Future Backend State');
    fixture.detectChanges();

    const badge = fixture.nativeElement.querySelector('span') as HTMLElement;
    expect(badge.textContent).toContain('Future Backend State');
    expect(badge.className).toContain('text-muted-foreground');
  });
});
