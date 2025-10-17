import { ChangeDetectionStrategy, Component, output } from '@angular/core';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  // FIX: Make component standalone as it's used in a standalone component.
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WelcomeComponent {
  start = output<void>();
  viewSaved = output<void>();

  onStart(): void {
    this.start.emit();
  }

  onViewSaved(): void {
    this.viewSaved.emit();
  }
}