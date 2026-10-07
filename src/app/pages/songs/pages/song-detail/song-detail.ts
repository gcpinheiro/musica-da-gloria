import { ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, HostListener, inject, OnDestroy, OnInit, signal, viewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { distinctUntilChanged, interval, map, Subscription } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SongsFacade } from '../../data-access/songs.facade';
import { AuthFacade } from '../../../../core/auth/auth.facade';
import { isChordLine, isMusicalKey, keySemitoneOffset, MUSICAL_KEYS, transposeChordLine, transposeKey } from '../../utils/song-transposition';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { externalSongSource } from '../../utils/external-song-source';
import { LyricsEditor } from '../../components/lyrics-editor/lyrics-editor';
import { LyricsDocument, plainLyricsDocument } from '../../../../shared/models/lyrics-document.model';

interface SheetLine { readonly text: string; readonly type: 'section' | 'chord' | 'lyric' | 'blank'; }
type ReaderTab = 'lyrics' | 'chords';
type ReaderTheme = 'dark' | 'light';

@Component({ selector: 'app-song-detail', imports: [RouterLink, LyricsEditor], templateUrl: './song-detail.html', styleUrls: ['./song-detail.scss', './reader-theme.scss', './song-navigation.scss', './external-song-reader.scss', './formatted-lyrics.scss'], changeDetection: ChangeDetectionStrategy.OnPush })
export class SongDetail implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly scrollContainer = viewChild<ElementRef<HTMLElement>>('scrollContainer');
  private readonly keyTrigger = viewChild<ElementRef<HTMLButtonElement>>('keyTrigger');
  private readonly keyModalClose = viewChild<ElementRef<HTMLButtonElement>>('keyModalClose');
  private scrollSubscription?: Subscription;
  private readonly scrollPositions: Record<ReaderTab, number> = { lyrics: 0, chords: 0 };
  protected readonly facade = inject(SongsFacade);
  protected readonly authFacade = inject(AuthFacade);
  protected readonly expanded = signal(false);
  protected readonly activeTab = signal<ReaderTab>('chords');
  protected readonly readerTheme = signal<ReaderTheme>('dark');
  protected readonly autoScrolling = signal(false);
  protected readonly scrollSpeed = signal(4);
  protected readonly fontSize = signal(18);
  protected readonly semitoneOffset = signal(0);
  protected readonly previewKey = signal<string | null>(null);
  protected readonly keyModalOpen = signal(false);
  protected readonly editingLyrics = signal(false);
  protected readonly editingSetlistItem = signal(false);
  protected readonly editableLyrics = signal<LyricsDocument | null>(null);
  protected readonly editableSetlistKey = signal('');
  protected readonly editableLiturgicalMoment = signal('');
  protected readonly editableSetlistNotes = signal('');
  protected readonly externalSource = computed(() => externalSongSource(this.facade.selected()?.externalUrl));
  protected readonly isExternal = computed(() => this.facade.selected()?.contentMode === 'EXTERNAL_EMBED');
  protected readonly externalFrameUrl = computed<SafeResourceUrl | null>(() => {
    const source = this.externalSource();
    return source ? this.sanitizer.bypassSecurityTrustResourceUrl(source.url) : null;
  });
  protected readonly setlistItem = computed(() => {
    const songId = this.facade.selected()?.id;
    return this.facade.contextSchedule()?.songs.find((item) => item.songId === songId) ?? null;
  });
  protected readonly persistedKeyOffset = computed(() =>
    keySemitoneOffset(
      this.facade.selected()?.defaultKey ?? '',
      this.setlistItem()?.key ?? this.facade.selected()?.defaultKey ?? '',
    ),
  );
  protected readonly transpositionOffset = computed(() =>
    this.persistedKeyOffset() + this.semitoneOffset(),
  );
  protected readonly currentKey = computed(() =>
    this.previewKey() ?? transposeKey(this.facade.selected()?.defaultKey ?? '', this.transpositionOffset()),
  );
  protected readonly hasOriginalMusicalKey = computed(() =>
    isMusicalKey(this.facade.selected()?.defaultKey ?? ''),
  );
  protected readonly availableKeys = computed(() => {
    const originalKey = this.facade.selected()?.defaultKey ?? '';
    return MUSICAL_KEYS.map((fallbackKey, offset) => ({
      offset,
      label: isMusicalKey(originalKey) ? transposeKey(originalKey, offset) : fallbackKey,
    }));
  });
  protected readonly setlistKeyOptions = computed(() => [
    ...new Set([
      ...this.availableKeys().map((item) => item.label),
      this.setlistItem()?.key ?? '',
    ].filter(Boolean)),
  ]);
  protected readonly lyricsDocument = computed(() => {
    const song = this.facade.selected();
    const item = this.setlistItem();
    return item?.formattedLyrics ?? plainLyricsDocument(item?.lyricsSnapshot ?? song?.lyrics ?? '');
  });
  protected readonly hasVoiceFormatting = computed(() => this.lyricsDocument().segments.some((segment) => Boolean(segment.voice)));
  protected readonly sheetLines = computed<readonly SheetLine[]>(() => {
    const song = this.facade.selected();
    const chordsActive = this.activeTab() === 'chords';
    const content = chordsActive ? song?.chords ?? '' : song?.lyrics ?? '';
    return content.split('\n').map((text) => {
      const type = chordsActive ? this.lineType(text) : this.lyricLineType(text);
      return { text: type === 'chord' ? transposeChordLine(text, this.transpositionOffset()) : text, type };
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
      this.previewKey.set(null);
      this.editingLyrics.set(false);
      this.editingSetlistItem.set(false);
      this.editableLyrics.set(null);
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
  protected toggleReaderTheme(): void { this.readerTheme.update((theme) => theme === 'dark' ? 'light' : 'dark'); }
  protected transpose(change: number): void {
    if (!this.hasOriginalMusicalKey() || this.previewKey()) {
      const currentRoot = this.currentKey().match(/^([A-G](?:#|b)?)/)?.[1];
      const currentIndex = currentRoot ? MUSICAL_KEYS.indexOf(currentRoot) : -1;
      const nextIndex = currentIndex < 0
        ? 0
        : (currentIndex + change + MUSICAL_KEYS.length) % MUSICAL_KEYS.length;
      this.previewKey.set(MUSICAL_KEYS[nextIndex]);
      return;
    }
    this.semitoneOffset.update((offset) => Math.min(11, Math.max(-11, offset + change)));
  }
  protected resetKey(): void { this.semitoneOffset.set(0); this.previewKey.set(null); }
  protected startSetlistItemEditing(): void {
    const item = this.setlistItem();
    if (!item) return;
    this.editableSetlistKey.set(item.key);
    this.editableLiturgicalMoment.set(item.liturgicalMoment);
    this.editableSetlistNotes.set(item.notes ?? '');
    this.editingSetlistItem.set(true);
  }
  protected cancelSetlistItemEditing(): void { this.editingSetlistItem.set(false); }
  protected changeEditableSetlistKey(event: Event): void {
    this.editableSetlistKey.set((event.target as HTMLSelectElement).value);
  }
  protected changeEditableLiturgicalMoment(event: Event): void {
    this.editableLiturgicalMoment.set((event.target as HTMLInputElement).value);
  }
  protected changeEditableSetlistNotes(event: Event): void {
    this.editableSetlistNotes.set((event.target as HTMLTextAreaElement).value);
  }
  protected saveSetlistItemEditing(): void {
    const item = this.setlistItem();
    if (!item || !this.editableSetlistKey().trim() || !this.editableLiturgicalMoment().trim()) return;
    this.facade.saveSetlistItem(item.id, {
      key: this.editableSetlistKey().trim(),
      liturgicalMoment: this.editableLiturgicalMoment().trim(),
      notes: this.editableSetlistNotes().trim() || undefined,
    });
    this.semitoneOffset.set(0);
    this.previewKey.set(null);
    this.editingSetlistItem.set(false);
  }
  protected startLyricsEditing(): void { this.editableLyrics.set(this.lyricsDocument()); this.editingLyrics.set(true); }
  protected updateEditableLyrics(content: LyricsDocument): void { this.editableLyrics.set(content); }
  protected cancelLyricsEditing(): void { this.editingLyrics.set(false); this.editableLyrics.set(null); }
  protected saveLyricsEditing(): void {
    const item = this.setlistItem();
    const content = this.editableLyrics();
    if (!item || !content) return;
    this.facade.saveSetlistLyrics(item.id, content);
    this.editingLyrics.set(false);
  }
  protected openKeyModal(): void { this.keyModalOpen.set(true); queueMicrotask(() => this.keyModalClose()?.nativeElement.focus()); }
  protected closeKeyModal(): void { this.keyModalOpen.set(false); queueMicrotask(() => this.keyTrigger()?.nativeElement.focus()); }
  protected selectKey(offset: number): void {
    if (!this.hasOriginalMusicalKey()) {
      this.previewKey.set(this.availableKeys()[offset]?.label ?? null);
    } else {
      this.previewKey.set(null);
      this.semitoneOffset.set(offset - this.persistedKeyOffset());
    }
    this.closeKeyModal();
  }
  protected saveCurrentKeyToSchedule(): void {
    const item = this.setlistItem();
    if (!item || item.key === this.currentKey()) return;
    this.facade.saveSetlistItem(item.id, {
      key: this.currentKey(),
      liturgicalMoment: item.liturgicalMoment,
      notes: item.notes,
    });
    this.semitoneOffset.set(0);
    this.previewKey.set(null);
  }
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
