import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Question } from '../../models/logo.model';

@Component({
  selector: 'app-questionnaire',
  templateUrl: './questionnaire.component.html',
  // FIX: Make component standalone as it is used within a standalone component's template.
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class QuestionnaireComponent {
  questions = input.required<Question[]>();
  submit = output<string[]>();

  currentQuestionIndex = signal(0);
  answers = signal<string[]>([]);
  currentAnswer = signal('');

  currentQuestion = computed(() => this.questions()[this.currentQuestionIndex()]);
  progress = computed(() => ((this.currentQuestionIndex()) / this.questions().length) * 100);

  isLastQuestion = computed(() => this.currentQuestionIndex() === this.questions().length - 1);

  constructor() {
    this.answers.set(new Array(5).fill(''));
  }

  nextQuestion(): void {
    // FIX: Update signal state immutably.
    this.answers.update(currentAnswers => {
        const newAnswers = [...currentAnswers];
        newAnswers[this.currentQuestionIndex()] = this.currentAnswer();
        return newAnswers;
    });
    
    if (this.isLastQuestion()) {
      this.submit.emit(this.answers());
    } else {
      this.currentQuestionIndex.update(i => i + 1);
      this.currentAnswer.set(this.answers()[this.currentQuestionIndex()]);
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex() > 0) {
        this.currentQuestionIndex.update(i => i - 1);
        this.currentAnswer.set(this.answers()[this.currentQuestionIndex()]);
    }
  }

  updateAnswer(event: Event): void {
      const target = event.target as HTMLInputElement;
      this.currentAnswer.set(target.value);
  }
}
