import { Injectable, signal } from '@angular/core';

export interface ConfirmDialogOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
}

export interface AlertDialogOptions {
  title?: string;
  message: string;
  buttonText?: string;
  variant?: 'info' | 'success' | 'warning' | 'danger';
}

interface DialogState {
  isOpen: boolean;
  type: 'confirm' | 'alert';
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  variant: 'danger' | 'warning' | 'primary' | 'info' | 'success';
  resolve?: (value: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  readonly state = signal<DialogState>({
    isOpen: false,
    type: 'confirm',
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'danger',
  });

  confirm(options: ConfirmDialogOptions): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.state.set({
        isOpen: true,
        type: 'confirm',
        title: options.title ?? 'Are you sure?',
        message: options.message,
        confirmText: options.confirmText ?? 'Confirm',
        cancelText: options.cancelText ?? 'Cancel',
        variant: options.variant ?? 'danger',
        resolve,
      });
    });
  }

  alert(options: AlertDialogOptions): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.state.set({
        isOpen: true,
        type: 'alert',
        title: options.title ?? 'Notice',
        message: options.message,
        confirmText: options.buttonText ?? 'OK',
        cancelText: '',
        variant: options.variant ?? 'info',
        resolve,
      });
    });
  }

  handleConfirm(): void {
    const current = this.state();
    current.resolve?.(true);
    this.close();
  }

  handleCancel(): void {
    const current = this.state();
    current.resolve?.(false);
    this.close();
  }

  close(): void {
    this.state.update((s) => ({ ...s, isOpen: false, resolve: undefined }));
  }
}
