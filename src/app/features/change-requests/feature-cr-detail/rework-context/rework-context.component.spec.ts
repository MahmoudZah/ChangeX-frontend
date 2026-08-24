import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  isValidReworkContext,
  ReworkContext,
  ReworkContextComponent,
} from '@/features/change-requests/feature-cr-detail/rework-context/rework-context.component';

describe('ReworkContextComponent', () => {
  let fixture: ComponentFixture<ReworkContextComponent>;
  let component: ReworkContextComponent;
  let submitted: jasmine.Spy<(context: ReworkContext) => void>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ReworkContextComponent] }).compileComponents();
    fixture = TestBed.createComponent(ReworkContextComponent);
    component = fixture.componentInstance;
    submitted = jasmine.createSpy('submitted');
    component.submitted.subscribe(submitted);
    fixture.detectChanges();
  });

  it('blocks an empty message with no file', () => {
    component.submit();

    expect(submitted).not.toHaveBeenCalled();
    expect(component.error()).toBe('Please add a message or attach at least one file.');
  });

  it('blocks a whitespace-only message with no file and preserves it', () => {
    component.message = '   \n  ';

    component.submit();

    expect(submitted).not.toHaveBeenCalled();
    expect(component.message).toBe('   \n  ');
  });

  it('allows a trimmed message without a file', () => {
    component.message = '  Please revise the mobile layout.  ';

    component.submit();

    expect(submitted).toHaveBeenCalledOnceWith({
      message: 'Please revise the mobile layout.',
      files: [],
    });
  });

  it('clears the combined validation error when a valid message is entered', () => {
    component.submit();
    expect(component.error()).toBe('Please add a message or attach at least one file.');

    component.messageChanged('Please revise the mobile layout.');

    expect(component.error()).toBe('');
    expect(component.message).toBe('Please revise the mobile layout.');
  });

  it('allows a file without a message', () => {
    const file = supportingFile();
    component.files.set([file]);

    component.submit();

    expect(submitted).toHaveBeenCalledOnceWith({ message: '', files: [file] });
  });

  it('allows both a message and files', () => {
    const files = [supportingFile('first.png'), supportingFile('second.png')];
    component.message = 'Match the attached references.';
    component.files.set(files);

    component.submit();

    expect(submitted).toHaveBeenCalledOnceWith({
      message: 'Match the attached references.',
      files,
    });
  });
});

describe('isValidReworkContext', () => {
  it('implements message OR files validation', () => {
    expect(isValidReworkContext('', [])).toBeFalse();
    expect(isValidReworkContext('   ', [])).toBeFalse();
    expect(isValidReworkContext('Reason', [])).toBeTrue();
    expect(isValidReworkContext('', [supportingFile()])).toBeTrue();
    expect(isValidReworkContext('Reason', [supportingFile()])).toBeTrue();
  });
});

function supportingFile(name = 'support.png'): File {
  return new File(['image'], name, { type: 'image/png', lastModified: 1 });
}
