// FIX: Implement the ResultsComponent to display generated logos and handle user interactions.
import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeneratedLogo } from '../../models/logo.model';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container mx-auto p-4 md:p-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl md:text-4xl font-bold text-gray-800">Your Logo Concepts</h1>
        <button (click)="onStartOver()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
          Start Over
        </button>
      </div>

      @if (logos().length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          @for (logo of logos(); track logo.prompt) {
            <div class="bg-white rounded-xl shadow-lg overflow-hidden transition-shadow duration-300 hover:shadow-2xl">
              <div class="bg-gray-200 p-4 flex justify-center items-center h-80">
                <img [src]="logo.base64Image" alt="Generated logo with style {{ logo.style }}" class="max-h-full max-w-full object-contain">
              </div>
              <div class="p-6">
                <span class="inline-block bg-indigo-100 text-indigo-800 text-sm font-semibold mr-2 px-2.5 py-0.5 rounded-full mb-4">{{ logo.style }}</span>
                <p class="text-gray-600 text-sm mb-6 h-20 overflow-y-auto"><strong>Prompt:</strong> {{ logo.prompt }}</p>
                <div class="flex justify-end space-x-4">
                  <button (click)="selectLogoForRefinement(logo)" class="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors duration-300">
                    Refine
                  </button>
                  <button (click)="downloadLogo(logo.base64Image, logo.style)" class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
                    Download
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="text-center py-12">
          <p class="text-xl text-gray-500">No logos were generated. Please try starting over.</p>
        </div>
      }

      <!-- Refinement Modal -->
      @if (selectedLogoForRefinement(); as selectedLogo) {
        <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div class="bg-white rounded-lg shadow-2xl max-w-lg w-full transform transition-all sm:my-8 sm:align-middle">
            <div class="p-6 border-b">
              <h3 class="text-xl font-bold text-gray-800">Refine Your Logo</h3>
            </div>
            <div class="p-6">
              <div class="flex items-start space-x-4">
                <div class="w-1/3 bg-gray-100 p-2 rounded-md">
                  <img [src]="selectedLogo.base64Image" alt="Selected logo" class="w-full h-auto object-contain">
                </div>
                <div class="w-2/3">
                  <label for="feedback" class="block text-sm font-medium text-gray-700 mb-2">What would you like to change?</label>
                  <textarea 
                    id="feedback" 
                    rows="4" 
                    [value]="refinementFeedback()"
                    (input)="updateFeedback($event)"
                    class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md" 
                    placeholder="e.g., 'Make the star more prominent', 'Use a darker shade of blue'"></textarea>
                </div>
              </div>
            </div>
            <div class="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
              <button (click)="cancelRefinement()" type="button" class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Cancel
              </button>
              <button (click)="submitRefinement()" [disabled]="!refinementFeedback().trim()" type="button" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed">
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class ResultsComponent {
  logos = input.required<GeneratedLogo[]>();
  refine = output<{ logo: GeneratedLogo; feedback: string }>();
  startOver = output<void>();

  selectedLogoForRefinement = signal<GeneratedLogo | null>(null);
  refinementFeedback = signal('');

  selectLogoForRefinement(logo: GeneratedLogo): void {
    this.selectedLogoForRefinement.set(logo);
    this.refinementFeedback.set('');
  }

  cancelRefinement(): void {
    this.selectedLogoForRefinement.set(null);
  }

  submitRefinement(): void {
    const selectedLogo = this.selectedLogoForRefinement();
    if (selectedLogo && this.refinementFeedback().trim()) {
      this.refine.emit({ logo: selectedLogo, feedback: this.refinementFeedback() });
      this.selectedLogoForRefinement.set(null);
    }
  }

  onStartOver(): void {
    this.startOver.emit();
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
    this.refinementFeedback.set(target.value);
  }
}
