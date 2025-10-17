import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, signal } from '@angular/core';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  // FIX: Make component standalone as it's used in a standalone component.
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingComponent implements OnInit, OnDestroy {
  loadingMessages = [
    'Consulting with our virtual design expert...',
    'Sketching initial concepts...',
    'Applying advanced color theory...',
    'Rendering high-resolution previews...',
    'Perfecting the final details...',
    'Finalizing your brand identity...'
  ];
  currentMessage = signal(this.loadingMessages[0]);
  private intervalId: any;

  ngOnInit(): void {
    let index = 0;
    this.intervalId = setInterval(() => {
      index = (index + 1) % this.loadingMessages.length;
      this.currentMessage.set(this.loadingMessages[index]);
    }, 2500);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
