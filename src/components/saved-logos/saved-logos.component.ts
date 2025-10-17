import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeneratedLogo } from '../../models/logo.model';

@Component({
  selector: 'app-saved-logos',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container mx-auto p-4 md:p-8 text-slate-100">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl md:text-4xl font-bold">Your Saved Logos</h1>
        <button (click)="onBack()" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300">
          Back to Start
        </button>
      </div>

      @if (logos().length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          @for (logo of logos(); track logo.prompt) {
            <div class="bg-slate-800 rounded-xl shadow-lg overflow-hidden transition-shadow duration-300 hover:shadow-2xl border border-slate-700">
              <div class="bg-slate-900/50 p-4 flex justify-center items-center h-80">
                <img [src]="logo.base64Image" alt="Generated logo with style {{ logo.style }}" class="max-h-full max-w-full object-contain">
              </div>
              <div class="p-6">
                <span class="inline-block bg-sky-900/50 text-sky-300 text-sm font-semibold mr-2 px-2.5 py-0.5 rounded-full mb-4">{{ logo.style }}</span>
                <p class="text-slate-400 text-sm mb-6 h-20 overflow-y-auto"><strong>Prompt:</strong> {{ logo.prompt }}</p>
                <div class="flex justify-end items-center space-x-4">
                  <button (click)="onDelete(logo)" class="text-red-400 hover:text-red-300 font-semibold transition-colors duration-300">
                    Delete
                  </button>
                  <button (click)="selectLogoForEditing(logo)" class="text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-300">
                    Edit
                  </button>
                  <button (click)="downloadLogo(logo.base64Image, logo.style)" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
                    Download
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="text-center py-12 flex flex-col items-center">
          <svg class="w-16 h-16 text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <p class="text-xl text-slate-500">You haven't saved any logos yet.</p>
          <p class="text-slate-400 mt-2">Start designing to create and save your first logo!</p>
        </div>
      }

      <!-- Editing Modal -->
      @if (selectedLogoForEditing(); as selectedLogo) {
        <div class="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 animate-fade-in">
          <div class="bg-slate-800 rounded-lg shadow-2xl max-w-lg w-full transform transition-all sm:my-8 sm:align-middle border border-slate-700">
            <div class="p-6 border-b border-slate-700">
              <h3 class="text-xl font-bold text-slate-100">Edit Your Logo</h3>
            </div>
            <div class="p-6">
              <div class="flex items-start space-x-4">
                <div class="w-1/3 bg-slate-900 p-2 rounded-md">
                  <img [src]="selectedLogo.base64Image" alt="Selected logo" class="w-full h-auto object-contain">
                </div>
                <div class="w-2/3">
                  <label for="feedback" class="block text-sm font-medium text-slate-300 mb-2">What would you like to change?</label>
                  <textarea 
                    id="feedback" 
                    rows="4" 
                    [value]="editingFeedback()"
                    (input)="updateFeedback($event)"
                    class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-600 bg-slate-900 rounded-md text-white placeholder-slate-400" 
                    placeholder="e.g., 'Make the star more prominent', 'Use a darker shade of blue'"></textarea>
                </div>
              </div>
            </div>
            <div class="px-6 py-4 bg-slate-800/50 flex justify-end space-x-3">
              <button (click)="cancelEditing()" type="button" class="bg-slate-700 py-2 px-4 border border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-300 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Cancel
              </button>
              <button (click)="submitEditing()" [disabled]="!editingFeedback().trim()" type="button" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed">
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class SavedLogosComponent {
  logos = input.required<GeneratedLogo[]>();
  edit = output<{ logo: GeneratedLogo; feedback: string }>();
  back = output<void>();
  delete = output<GeneratedLogo>();

  selectedLogoForEditing = signal<GeneratedLogo | null>(null);
  editingFeedback = signal('');

  selectLogoForEditing(logo: GeneratedLogo): void {
    this.selectedLogoForEditing.set(logo);
    this.editingFeedback.set('');
  }

  cancelEditing(): void {
    this.selectedLogoForEditing.set(null);
  }

  submitEditing(): void {
    const selectedLogo = this.selectedLogoForEditing();
    if (selectedLogo && this.editingFeedback().trim()) {
      this.edit.emit({ logo: selectedLogo, feedback: this.editingFeedback() });
      this.selectedLogoForEditing.set(null);
    }
  }

  onBack(): void {
    this.back.emit();
  }
  
  onDelete(logo: GeneratedLogo): void {
    this.delete.emit(logo);
  }

  downloadLogo(base64Image: string, style: string): void {
    const link = document.createElement('a');
    link.href = base64Image;
    link.download = `logo-${style.toLowerCase().replace(/\s/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  updateFeedback(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.editingFeedback.set(target.value);
  }
}
