import {
  CR_BOARD_COLUMNS,
  CR_INITIAL_STATUS_ID,
  CR_STATUS_DEFINITIONS,
  CR_STATUS_IDS,
  crBoardColumn,
  crStatusDefinition,
  crStatusLabel,
  crStatusOrder,
  crTransitionKind,
  isTerminalStatusId,
} from '@/shared/util/cr-status-workflow';

describe('Change Request backend workflow model', () => {
  it('contains the 17 current backend statuses in seed order with no former Completed status', () => {
    expect(CR_STATUS_DEFINITIONS).toHaveSize(17);
    expect(CR_STATUS_DEFINITIONS.map((status) => status.order)).toEqual(
      Array.from({ length: 17 }, (_, index) => index),
    );
    expect(CR_STATUS_DEFINITIONS.some((status) => status.name === 'Completed')).toBeFalse();
    expect(crStatusDefinition(CR_STATUS_IDS.pendingVendorReworkFeedback)?.name)
      .toBe('Pending Vendor Rework Feedback');
  });

  it('models the backend root, terminal statuses, and changed customer-approval children', () => {
    expect(CR_INITIAL_STATUS_ID).toBe(CR_STATUS_IDS.pendingVendorFeedback);
    expect(crStatusDefinition(CR_STATUS_IDS.pendingCustomerApproval)?.transitionIds).toEqual([
      CR_STATUS_IDS.acceptedTest,
      CR_STATUS_IDS.reworkRequired,
    ]);
    expect(crStatusDefinition(CR_STATUS_IDS.pendingCustomerApproval)?.transitionIds)
      .not.toContain(CR_STATUS_IDS.rejected);
    expect(isTerminalStatusId(CR_STATUS_IDS.delivered)).toBeTrue();
    expect(isTerminalStatusId(CR_STATUS_IDS.rejected)).toBeTrue();
    expect(crStatusDefinition(CR_STATUS_IDS.delivered)?.transitionIds).toEqual([]);
  });

  it('preserves parent, child, sibling, and rework-loop relationships by ID', () => {
    expect(crStatusDefinition(CR_STATUS_IDS.pendingVendorFeedback)?.transitionIds).toEqual([
      CR_STATUS_IDS.acceptedCr,
      CR_STATUS_IDS.rejected,
      CR_STATUS_IDS.pendingClientClarification,
    ]);
    expect(crStatusDefinition(CR_STATUS_IDS.analysis)?.transitionIds).toEqual([
      CR_STATUS_IDS.design,
      CR_STATUS_IDS.pendingClientApproval,
    ]);
    expect(crStatusDefinition(CR_STATUS_IDS.reworkRequired)?.transitionIds).toEqual([
      CR_STATUS_IDS.pendingVendorReworkFeedback,
    ]);
    expect(crStatusDefinition(CR_STATUS_IDS.pendingVendorReworkFeedback)?.transitionIds).toEqual([
      CR_STATUS_IDS.analysis,
      CR_STATUS_IDS.pendingCustomerApproval,
    ]);
  });

  it('places every known status in exactly one ordered board column', () => {
    expect(CR_BOARD_COLUMNS.map((column) => column.key)).toEqual([
      'intake', 'estimation', 'implementation', 'signoff', 'closed',
    ]);
    CR_STATUS_DEFINITIONS.forEach((status) => {
      expect(crBoardColumn(status.id)?.key).toBe(status.boardColumn);
    });
    expect(new Set(CR_STATUS_DEFINITIONS.map((status) => status.id)).size)
      .toBe(CR_STATUS_DEFINITIONS.length);
  });

  it('uses IDs for action categories and handles unknown future statuses safely', () => {
    expect(crTransitionKind(CR_STATUS_IDS.reworkRequired)).toBe('rework');
    expect(crTransitionKind(CR_STATUS_IDS.pendingClientClarification)).toBe('clarification');
    expect(crTransitionKind(CR_STATUS_IDS.rejected)).toBe('reject');
    expect(crTransitionKind('future-id')).toBe('primary');
    expect(crStatusDefinition('future-id')).toBeUndefined();
    expect(crBoardColumn('future-id')).toBeUndefined();
    expect(crStatusOrder('future-id')).toBe(Number.MAX_SAFE_INTEGER);
    expect(crStatusLabel('future-id', 'Backend Future State')).toBe('Backend Future State');
  });
});
