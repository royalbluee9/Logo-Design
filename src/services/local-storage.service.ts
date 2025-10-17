import { effect, Injectable, signal } from '@angular/core';
import { GeneratedLogo } from '../models/logo.model';

const LOCAL_STORAGE_KEY = 'ai-logo-designer-pro-saved-logos';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  savedLogos = signal<GeneratedLogo[]>([]);

  constructor() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        try {
          this.savedLogos.set(JSON.parse(saved));
        } catch (e) {
          console.error('Could not parse saved logos from localStorage', e);
          this.savedLogos.set([]);
        }
      }
    }

    effect(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.savedLogos()));
        }
    });
  }

  saveLogo(logo: GeneratedLogo): void {
    if (!this.isLogoSaved(logo)) {
      this.savedLogos.update(logos => [...logos, logo]);
    }
  }

  deleteLogo(logoToDelete: GeneratedLogo): void {
    this.savedLogos.update(logos => logos.filter(logo => logo.prompt !== logoToDelete.prompt));
  }
  
  isLogoSaved(logo: GeneratedLogo): boolean {
    return this.savedLogos().some(savedLogo => savedLogo.prompt === logo.prompt);
  }
}
