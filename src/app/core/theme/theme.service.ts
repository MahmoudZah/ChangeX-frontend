import { Injectable, signal } from '@angular/core';
import { STORAGE_KEYS } from '@/shared/util/constants';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly mode = signal<'light' | 'dark'>('light');

  constructor() {
    const saved = localStorage.getItem(STORAGE_KEYS.theme) as 'light' | 'dark' | null;
    this.apply(saved ?? 'light');
  }

  toggle(mode: 'light' | 'dark'): void {
    this.apply(mode);
  }

  private apply(mode: 'light' | 'dark'): void {
    this.mode.set(mode);
    localStorage.setItem(STORAGE_KEYS.theme, mode);
    document.documentElement.classList.toggle('dark', mode === 'dark');
  }
}
