import { HttpErrorResponse } from '@angular/common/http';
import { apiErrorMessage } from '@/core/http/api-contract';

describe('apiErrorMessage', () => {
  it('returns the first backend validation message', () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: { errors: { Name: ['Name is required.'] } },
    });

    expect(apiErrorMessage(error, 'Request failed.')).toBe('Name is required.');
  });

  it('distinguishes forbidden responses from generic failures', () => {
    const error = new HttpErrorResponse({ status: 403, error: {} });

    expect(apiErrorMessage(error, 'Request failed.')).toBe(
      'Your account is not permitted to perform this action.',
    );
  });

  it('reports when the API cannot be reached', () => {
    const error = new HttpErrorResponse({ status: 0 });

    expect(apiErrorMessage(error, 'Request failed.')).toContain('Cannot connect');
  });

  it('treats a development proxy gateway error as an unavailable API', () => {
    const error = new HttpErrorResponse({ status: 504 });

    expect(apiErrorMessage(error, 'Request failed.')).toContain('Cannot connect');
  });
});
