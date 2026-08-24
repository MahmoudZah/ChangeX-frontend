import { TestBed } from '@angular/core/testing';
import { ApiService } from '@/core/http/api.service';
import { DetailsService } from '@/features/change-requests/data-access/details.service';

describe('DetailsService', () => {
  let api: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    api = jasmine.createSpyObj<ApiService>('ApiService', ['get', 'post', 'put', 'delete']);
    TestBed.configureTestingModule({
      providers: [DetailsService, { provide: ApiService, useValue: api }],
    });
  });

  it('caches a successful empty load so opening the comments tab does not duplicate the request', async () => {
    api.get.and.resolveTo({ message: 'ok', data: [] });
    const service = TestBed.inject(DetailsService);

    await service.loadFor('cr-id');
    await service.loadFor('cr-id');

    expect(api.get).toHaveBeenCalledOnceWith('/Detail/GetDetails', { crId: 'cr-id' });
  });

  it('sends the exact multipart field names required by DetailDto', async () => {
    api.post.and.callFake(((_path: string, body: unknown) => {
      const form = body as FormData;
      expect(form.get('CRID')).toBe('cr-id');
      expect(form.get('Comment')).toBe('A note');
      expect(form.get('Attachment')).toEqual(jasmine.any(File));
      return Promise.resolve({
        message: 'created',
        data: {
          id: 'detail-id', crid: 'cr-id', attachment: '/attachments/details/file.pdf',
          comment: 'A note', state: 'Analysis', uploadedTime: '2026-08-24T10:00:00',
        },
      });
    }) as ApiService['post']);
    const service = TestBed.inject(DetailsService);

    const created = await service.create(
      'cr-id',
      'A note',
      new File(['fixture'], 'fixture.pdf', { type: 'application/pdf' }),
    );

    expect(created.crId).toBe('cr-id');
    expect(created.fileType).toBe('pdf');
  });

  it('uses the backend update route and allows keeping the existing attachment', async () => {
    api.put.and.callFake(((path: string, body: unknown, params: unknown) => {
      expect(path).toBe('/Detail/Update%20Details');
      expect(params).toEqual({ ID: 'message-id' });
      const form = body as FormData;
      expect(form.get('Comment')).toBe('Please clarify the requested scope.');
      expect(form.has('Attachment')).toBeFalse();
      return Promise.resolve({
        message: 'created',
        data: {
          id: 'message-id', crid: 'cr-id', attachment: '',
          comment: 'Please clarify the requested scope.', state: 'Pending Client Clarification',
          uploadedTime: '2026-08-25T10:00:00',
        },
      });
    }) as ApiService['put']);

    const updated = await TestBed.inject(DetailsService).update(
      'message-id',
      'cr-id',
      'Please clarify the requested scope.',
    );

    expect(updated.fileName).toBe('');
  });

  it('builds a message-only Rework request without inventing an attachment', async () => {
    api.post.and.callFake(((_path: string, body: unknown) => {
      const form = body as FormData;
      expect(form.get('Comment')).toBe('Please revise the layout.');
      expect(form.has('Attachment')).toBeFalse();
      return Promise.resolve({
        message: 'created',
        data: {
          id: 'detail-id', crid: 'cr-id', attachment: '', comment: 'Please revise the layout.',
          state: 'Pending Customer Approval', uploadedTime: '2026-08-25T10:00:00',
        },
      });
    }) as ApiService['post']);

    const created = await TestBed.inject(DetailsService).createReworkContext(
      'cr-id',
      '  Please revise the layout.  ',
      [],
    );

    expect(created.length).toBe(1);
    expect(api.post).toHaveBeenCalledTimes(1);
  });

  it('creates one backend Detail per Rework file and keeps the message on the first', async () => {
    const comments: string[] = [];
    api.post.and.callFake(((_path: string, body: unknown) => {
      const form = body as FormData;
      const file = form.get('Attachment') as File;
      comments.push(String(form.get('Comment') ?? ''));
      return Promise.resolve({
        message: 'created',
        data: {
          id: `detail-${comments.length}`, crid: 'cr-id', attachment: `/attachments/details/${file.name}`,
          comment: comments.at(-1) ?? '', state: 'Pending Customer Approval',
          uploadedTime: '2026-08-25T10:00:00',
        },
      });
    }) as ApiService['post']);
    const files = [
      new File(['one'], 'one.png', { type: 'image/png' }),
      new File(['two'], 'two.png', { type: 'image/png' }),
    ];

    await TestBed.inject(DetailsService).createReworkContext('cr-id', 'Reason', files);

    expect(api.post).toHaveBeenCalledTimes(2);
    expect(comments).toEqual(['Reason', '']);
  });
});
