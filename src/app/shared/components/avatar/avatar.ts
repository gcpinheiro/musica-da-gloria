import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

@Component({
  selector: 'app-avatar',
  template: `
    <span class="avatar" [style.--avatar-size.px]="size()" aria-hidden="true">
      @if (showPhoto()) {
        <img [src]="photoUrl()" alt="" (error)="photoFailed.set(true)" />
      } @else {
        <span>{{ initials() }}</span>
      }
    </span>
  `,
  styleUrl: './avatar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Avatar {
  readonly initials = input.required<string>();
  readonly photoUrl = input<string>();
  readonly size = input(40);
  protected readonly photoFailed = signal(false);
  protected readonly showPhoto = computed(() => Boolean(this.photoUrl()) && !this.photoFailed());
}
