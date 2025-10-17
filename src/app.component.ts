import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GeminiService } from './services/gemini.service';
import { GeneratedLogo, Question } from './models/logo.model';

import { WelcomeComponent } from './components/welcome/welcome.component';
import { QuestionnaireComponent } from './components/questionnaire/questionnaire.component';
import { LoadingComponent } from './components/loading/loading.component';
import { ResultsComponent } from './components/results/results.component';

type AppState = 'welcome' | 'questionnaire' | 'loading' | 'results' | 'error';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    WelcomeComponent,
    QuestionnaireComponent,
    LoadingComponent,
    ResultsComponent
  ]
})
export class AppComponent {
  private geminiService = inject(GeminiService);

  appState = signal<AppState>('welcome');
  generatedLogos = signal<GeneratedLogo[]>([]);
  
  readonly questions = signal<Question[]>([
    { id: 1, text: "What is your company's name?", placeholder: 'e.g., Nova Solutions', type: 'text' },
    { id: 2, text: "Describe your business in one sentence.", placeholder: 'e.g., We build innovative software for startups.', type: 'textarea' },
    { id: 3, text: "Who is your target audience?", placeholder: 'e.g., Tech-savvy entrepreneurs and small businesses', type: 'text' },
    { id: 4, text: "What are your core brand values?", placeholder: 'e.g., Innovation, reliability, customer-centric', type: 'textarea' },
    { id: 5, text: "Any desired styles or concepts?", placeholder: 'e.g., Minimalist, modern, geometric, using a star symbol', type: 'text' },
  ]);

  get geminiServiceError() {
    return this.geminiService.error;
  }

  startDesigning(): void {
    this.appState.set('questionnaire');
  }

  async handleQuestionnaireSubmit(answers: string[]): Promise<void> {
    this.appState.set('loading');
    this.generatedLogos.set([]);
    
    const prompts = await this.geminiService.generateLogoPrompts(answers);

    if(this.geminiService.error()) {
        this.appState.set('error');
        return;
    }

    if (prompts.length > 0) {
      const logos = await this.geminiService.generateImagesFromPrompts(prompts);
      this.generatedLogos.set(logos);
    }
    
    if(this.geminiService.error() && this.generatedLogos().length === 0) {
        this.appState.set('error');
        return;
    }

    this.appState.set('results');
  }

  async handleRefinementSubmit({ logo, feedback }: { logo: GeneratedLogo, feedback: string }): Promise<void> {
    this.appState.set('loading');

    const refinedPrompt = await this.geminiService.refineLogoPrompt(logo.prompt, feedback);

    if (!refinedPrompt) {
      this.appState.set('error');
      return;
    }

    const newLogos = await this.geminiService.generateImagesFromPrompts([refinedPrompt]);
    
    if (newLogos.length === 0) {
      this.appState.set('error');
      return;
    }

    const newLogo = newLogos[0];
    
    this.generatedLogos.update(logos => {
        const index = logos.findIndex(l => l.prompt === logo.prompt);
        if (index > -1) {
            const updatedLogos = [...logos];
            updatedLogos[index] = newLogo;
            return updatedLogos;
        }
        return logos; 
    });

    this.appState.set('results');
  }

  reset(): void {
    this.generatedLogos.set([]);
    this.geminiService.error.set(null);
    this.appState.set('welcome');
  }
}