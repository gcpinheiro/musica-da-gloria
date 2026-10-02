import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, input, output, viewChild } from '@angular/core';
import { LyricsDocument, LyricSegment, LyricVoice } from '../../../../shared/models/lyrics-document.model';

const voiceColors: Record<LyricVoice, string> = {
  WOMEN: '#c33ba5',
  MEN: '#276fc2',
  ALL: '#172432',
};

@Component({
  selector: 'app-lyrics-editor',
  templateUrl: './lyrics-editor.html',
  styleUrl: './lyrics-editor.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LyricsEditor implements AfterViewInit {
  readonly value = input.required<LyricsDocument>();
  readonly valueChange = output<LyricsDocument>();
  private readonly editable = viewChild.required<ElementRef<HTMLElement>>('editable');

  ngAfterViewInit(): void {
    this.editable().nativeElement.innerHTML = this.editorHtml(this.value());
  }

  protected apply(command: 'bold' | 'italic' | 'undo' | 'redo' | 'removeFormat'): void {
    this.editable().nativeElement.focus();
    document.execCommand(command, false);
    this.emitValue();
  }

  protected applyVoice(voice: LyricVoice): void {
    this.editable().nativeElement.focus();
    document.execCommand('foreColor', false, voiceColors[voice]);
    this.emitValue();
  }

  protected preserveSelection(event: MouseEvent): void {
    event.preventDefault();
  }

  protected insertLineBreak(event: Event): void {
    event.preventDefault();
    document.execCommand('insertText', false, '\n');
    this.emitValue();
  }

  protected pastePlainText(event: ClipboardEvent): void {
    event.preventDefault();
    document.execCommand('insertText', false, event.clipboardData?.getData('text/plain') ?? '');
    this.emitValue();
  }

  protected emitValue(): void {
    const segments: LyricSegment[] = [];
    const walker = document.createTreeWalker(this.editable().nativeElement, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode as Text;
      if (!node.data) continue;
      const segment = this.segmentFromNode(node);
      const previous = segments.at(-1);
      if (previous && this.sameMarks(previous, segment))
        segments[segments.length - 1] = { ...previous, text: previous.text + segment.text };
      else segments.push(segment);
    }
    if (segments.length) this.valueChange.emit({ version: 1, segments });
  }

  private segmentFromNode(node: Text): LyricSegment {
    let element = node.parentElement;
    let bold = false;
    let italic = false;
    let voice: LyricVoice | undefined;
    while (element && element !== this.editable().nativeElement) {
      const tag = element.tagName.toLowerCase();
      bold ||= tag === 'b' || tag === 'strong' || element.style.fontWeight === 'bold' || Number(element.style.fontWeight) >= 600;
      italic ||= tag === 'i' || tag === 'em' || element.style.fontStyle === 'italic';
      voice ??= this.voiceFromElement(element);
      element = element.parentElement;
    }
    return {
      text: node.data,
      ...(bold ? { bold: true as const } : {}),
      ...(italic ? { italic: true as const } : {}),
      ...(voice ? { voice } : {}),
    };
  }

  private voiceFromElement(element: HTMLElement): LyricVoice | undefined {
    const semanticVoice = element.dataset['voice'];
    if (semanticVoice === 'WOMEN' || semanticVoice === 'MEN' || semanticVoice === 'ALL') return semanticVoice;
    const color = (element.getAttribute('color') ?? element.style.color).toLowerCase().replaceAll(' ', '');
    if (['#c33ba5', 'rgb(195,59,165)'].includes(color)) return 'WOMEN';
    if (['#276fc2', 'rgb(39,111,194)'].includes(color)) return 'MEN';
    if (['#172432', 'rgb(23,36,50)'].includes(color)) return 'ALL';
    return undefined;
  }

  private sameMarks(left: LyricSegment, right: LyricSegment): boolean {
    return left.bold === right.bold && left.italic === right.italic && left.voice === right.voice;
  }

  private editorHtml(value: LyricsDocument): string {
    return value.segments.map((segment) => {
      const classes = segment.voice ? ` lyrics-editor__segment--${segment.voice.toLowerCase()}` : '';
      const voice = segment.voice ? ` data-voice="${segment.voice}"` : '';
      let text = this.escapeHtml(segment.text);
      if (segment.italic) text = `<em>${text}</em>`;
      if (segment.bold) text = `<strong>${text}</strong>`;
      return `<span class="lyrics-editor__segment${classes}"${voice}>${text}</span>`;
    }).join('');
  }

  private escapeHtml(value: string): string {
    return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
  }
}
