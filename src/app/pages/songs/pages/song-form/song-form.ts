import { ChangeDetectionStrategy, Component, effect, inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SongsFacade } from '../../data-access/songs.facade';
import { SongContentMode } from '../../models/song.model';
import { externalSongSource } from '../../utils/external-song-source';

const externalSourceValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
  externalSongSource(control.value as string) ? null : { externalSource: true };

@Component({
  selector: 'app-song-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './song-form.html',
  styleUrl: './song-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SongForm implements OnInit {
  private readonly route = inject(ActivatedRoute);
  protected readonly facade = inject(SongsFacade);
  protected readonly id = this.route.snapshot.paramMap.get('id');
  protected readonly form = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    author: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    defaultKey: new FormControl('C', { nonNullable: true, validators: [Validators.required] }),
    moments: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    contentMode: new FormControl<SongContentMode>('INTERNAL', { nonNullable: true }),
    externalUrl: new FormControl('', { nonNullable: true }),
    lyrics: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    chords: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  private readonly populate = effect(() => {
    const song = this.facade.selected();
    if (!song || !this.form.pristine) return;
    this.form.setValue({
      title: song.title,
      author: song.author,
      defaultKey: song.defaultKey,
      moments: song.liturgicalMoments.join(', '),
      contentMode: song.contentMode ?? 'INTERNAL',
      externalUrl: song.externalUrl ?? '',
      lyrics: song.lyrics,
      chords: song.chords,
    });
    this.configureContentValidators(song.contentMode ?? 'INTERNAL');
  });

  ngOnInit(): void {
    this.form.controls.contentMode.valueChanges.subscribe((mode) => this.configureContentValidators(mode));
    if (this.id) this.facade.loadOne(this.id);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const external = value.contentMode === 'EXTERNAL_EMBED';
    this.facade.save({
      title: value.title,
      author: value.author,
      defaultKey: value.defaultKey,
      liturgicalMoments: value.moments.split(',').map((item) => item.trim()).filter(Boolean),
      contentMode: value.contentMode,
      externalUrl: external ? value.externalUrl : null,
      lyrics: external ? '' : value.lyrics,
      chords: external ? '' : value.chords,
    }, this.id ?? undefined);
  }

  private configureContentValidators(mode: SongContentMode): void {
    const external = mode === 'EXTERNAL_EMBED';
    this.form.controls.externalUrl.setValidators(external ? [Validators.required, externalSourceValidator] : []);
    this.form.controls.lyrics.setValidators(external ? [] : [Validators.required]);
    this.form.controls.chords.setValidators(external ? [] : [Validators.required]);
    this.form.controls.externalUrl.updateValueAndValidity({ emitEvent: false });
    this.form.controls.lyrics.updateValueAndValidity({ emitEvent: false });
    this.form.controls.chords.updateValueAndValidity({ emitEvent: false });
  }
}
