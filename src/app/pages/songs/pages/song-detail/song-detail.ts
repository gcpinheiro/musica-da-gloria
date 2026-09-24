import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, OnDestroy, OnInit, signal, viewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { SongsFacade } from '../../data-access/songs.facade';
import { AuthFacade } from '../../../../core/auth/auth.facade';
import { isChordLine, transposeChordLine, transposeKey } from '../../utils/song-transposition';

interface SheetLine { readonly text: string; readonly type: 'section' | 'chord' | 'lyric' | 'blank'; }
type ReaderTab = 'lyrics' | 'chords';

@Component({ selector: 'app-song-detail', imports: [RouterLink], templateUrl: './song-detail.html', styleUrl: './song-detail.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class SongDetail implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly scrollContainer = viewChild<ElementRef<HTMLElement>>('scrollContainer');
  private scrollSubscription?: Subscription;
  private readonly scrollPositions: Record<ReaderTab, number> = { lyrics: 0, chords: 0 };
  protected readonly facade = inject(SongsFacade);
  protected readonly authFacade = inject(AuthFacade);
  protected readonly expanded = signal(false);
  protected readonly activeTab = signal<ReaderTab>('chords');
  protected readonly autoScrolling = signal(false);
  protected readonly scrollSpeed = signal(4);
  protected readonly fontSize = signal(18);
  protected readonly semitoneOffset = signal(0);
  protected readonly currentKey = computed(() => transposeKey(this.facade.selected()?.defaultKey ?? '', this.semitoneOffset()));
  protected readonly sheetLines = computed<readonly SheetLine[]>(() => {
    const song = this.facade.selected();
    const chordsActive = this.activeTab() === 'chords';
    const content = chordsActive ? song?.chords ?? '' : song?.lyrics ?? '';
    return content.split('\n').map((text) => {
      const type = chordsActive ? this.lineType(text) : this.lyricLineType(text);
      return { text: type === 'chord' ? transposeChordLine(text, this.semitoneOffset()) : text, type };
    });
  });

  ngOnInit(): void { this.facade.loadOne(this.route.snapshot.paramMap.get('id') ?? ''); }
  ngOnDestroy(): void { this.stopAutoScroll(); }

  protected toggleExpanded(): void { this.expanded.update((value) => !value); }
  protected selectTab(tab: ReaderTab): void {
    const element = this.scrollContainer()?.nativeElement;
    if (element) this.scrollPositions[this.activeTab()] = element.scrollTop;
    this.activeTab.set(tab);
    queueMicrotask(() => { const container = this.scrollContainer()?.nativeElement; if (container) container.scrollTop = this.scrollPositions[tab]; });
  }
  protected changeSpeed(event: Event): void { this.scrollSpeed.set(Number((event.target as HTMLInputElement).value)); }
  protected adjustFontSize(change: number): void { this.fontSize.update((size) => Math.min(32, Math.max(14, size + change))); }
  protected resetFontSize(): void { this.fontSize.set(18); }
  protected transpose(change: number): void { this.semitoneOffset.update((offset) => Math.min(11, Math.max(-11, offset + change))); }
  protected resetKey(): void { this.semitoneOffset.set(0); }
  protected toggleAutoScroll(): void {
    if (this.autoScrolling()) { this.stopAutoScroll(); return; }
    this.autoScrolling.set(true);
    this.scrollSubscription = interval(50).subscribe(() => {
      const element = this.scrollContainer()?.nativeElement;
      if (!element) return;
      element.scrollTop += this.scrollSpeed() / 5;
      if (element.scrollTop + element.clientHeight >= element.scrollHeight - 1) this.stopAutoScroll();
    });
  }
  protected restartScroll(): void { const element = this.scrollContainer()?.nativeElement; if (element) element.scrollTop = 0; }
  private stopAutoScroll(): void { this.autoScrolling.set(false); this.scrollSubscription?.unsubscribe(); this.scrollSubscription = undefined; }
  private lineType(line: string): SheetLine['type'] {
    const value = line.trim();
    if (!value) return 'blank';
    if (value.startsWith('[') && value.endsWith(']')) return 'section';
    return isChordLine(value) ? 'chord' : 'lyric';
  }
  private lyricLineType(line: string): SheetLine['type'] {
    const value = line.trim();
    if (!value) return 'blank';
    return value.startsWith('[') && value.endsWith(']') ? 'section' : 'lyric';
  }
}
