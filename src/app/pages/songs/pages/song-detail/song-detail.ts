import { ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, HostListener, inject, OnDestroy, OnInit, signal, viewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { distinctUntilChanged, interval, map, Subscription } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SongsFacade } from '../../data-access/songs.facade';
import { AuthFacade } from '../../../../core/auth/auth.facade';
import { isChordLine, transposeChordLine, transposeKey } from '../../utils/song-transposition';

interface SheetLine { readonly text: string; readonly type: 'section' | 'chord' | 'lyric' | 'blank'; }
type ReaderTab = 'lyrics' | 'chords';

@Component({ selector: 'app-song-detail', imports: [RouterLink], templateUrl: './song-detail.html', styleUrls: ['./song-detail.scss', './song-navigation.scss'], changeDetection: ChangeDetectionStrategy.OnPush })
export class SongDetail implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly scrollContainer = viewChild<ElementRef<HTMLElement>>('scrollContainer');
  private readonly keyTrigger = viewChild<ElementRef<HTMLButtonElement>>('keyTrigger');
  private readonly keyModalClose = viewChild<ElementRef<HTMLButtonElement>>('keyModalClose');
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
  protected readonly keyModalOpen = signal(false);
  protected readonly currentKey = computed(() => transposeKey(this.facade.selected()?.defaultKey ?? '', this.semitoneOffset()));
  protected readonly availableKeys = computed(() => Array.from({ length: 12 }, (_, offset) => ({ offset, label: transposeKey(this.facade.selected()?.defaultKey ?? '', offset) })));
  protected readonly sheetLines = computed<readonly SheetLine[]>(() => {
    const song = this.facade.selected();
    const chordsActive = this.activeTab() === 'chords';
    const content = chordsActive ? song?.chords ?? '' : song?.lyrics ?? '';
    return content.split('\n').map((text) => {
      const type = chordsActive ? this.lineType(text) : this.lyricLineType(text);
      return { text: type === 'chord' ? transposeChordLine(text, this.semitoneOffset()) : text, type };
    });
  });

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map((params) => ({ songId: params.get('id') ?? '', scheduleId: params.get('scheduleId') ?? undefined })),
      distinctUntilChanged((previous, current) => previous.songId === current.songId && previous.scheduleId === current.scheduleId),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(({ songId, scheduleId }) => {
      this.stopAutoScroll();
      this.semitoneOffset.set(0);
      this.restartScroll();
      this.facade.loadOne(songId, scheduleId);
    });
  }
  ngOnDestroy(): void { this.stopAutoScroll(); }

  @HostListener('document:keydown.escape')
  protected closeKeyModalWithKeyboard(): void { if (this.keyModalOpen()) this.closeKeyModal(); }

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
  protected openKeyModal(): void { this.keyModalOpen.set(true); queueMicrotask(() => this.keyModalClose()?.nativeElement.focus()); }
  protected closeKeyModal(): void { this.keyModalOpen.set(false); queueMicrotask(() => this.keyTrigger()?.nativeElement.focus()); }
  protected selectKey(offset: number): void { this.semitoneOffset.set(offset); this.closeKeyModal(); }
  protected songRoute(songId: string): readonly string[] {
    const scheduleId = this.facade.contextSchedule()?.id;
    return scheduleId ? ['/escalas', scheduleId, 'repertorio', songId] : ['/repertorio', 'musicas', songId];
  }
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
