import { Injectable, signal } from '@angular/core';
import { STORAGE_KEYS } from '@/shared/util/constants';

export type ThemeMode = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly mode = signal<ThemeMode>('light');

  constructor() {
    const saved = typeof localStorage !== 'undefined' ? (localStorage.getItem(STORAGE_KEYS.theme) as ThemeMode | null) : null;
    if (saved === 'light' || saved === 'dark') {
      this.apply(saved, false);
    } else {
      const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.apply(prefersDark ? 'dark' : 'light', false);
    }
  }

  toggle(mode?: ThemeMode): void {
    const target = mode ?? (this.mode() === 'light' ? 'dark' : 'light');
    this.apply(target, true);
  }

  private apply(mode: ThemeMode, withTransition = true): void {
    this.mode.set(mode);
    try {
      localStorage.setItem(STORAGE_KEYS.theme, mode);
    } catch {
      // Storage unavailable in private mode
    }

    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (withTransition) {
        root.classList.add('theme-transition');
        window.setTimeout(() => root.classList.remove('theme-transition'), 300);
      }
      root.classList.toggle('dark', mode === 'dark');
    }
  }
}

