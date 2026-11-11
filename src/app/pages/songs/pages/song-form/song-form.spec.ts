import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { SongsFacade } from '../../data-access/songs.facade';
import { SongForm } from './song-form';

describe('SongForm', () => {
  let fixture: ComponentFixture<SongForm>;
  let facade: { readonly selected: ReturnType<typeof signal<null>>; readonly saving: ReturnType<typeof signal<boolean>>; save: jasmine.Spy };

  beforeEach(async () => {
    facade = {
      selected: signal(null),
      saving: signal(false),
      save: jasmine.createSpy('save'),
    };
    await TestBed.configureTestingModule({
      imports: [SongForm],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({}) } } },
        { provide: SongsFacade, useValue: facade },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(SongForm);
    fixture.detectChanges();
  });

  it('explains why an incomplete song was not submitted', async () => {
    const form = (fixture.componentInstance as unknown as { form: FormGroup }).form;
    form.patchValue({
      title: 'Cheiro de Rosas',
      author: 'Comunidade Católica Colo de Deus',
      defaultKey: 'F#m',
      moments: 'Entrada, Envio',
      chords: 'G  D/F#\nTexto cantado nesta linha',
    });
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('button[type="submit"], footer button') as HTMLButtonElement).click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(facade.save).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('.form-error-summary')?.textContent).toContain('Não foi possível salvar');
    expect(fixture.nativeElement.querySelector('#lyrics-error')?.textContent).toContain('Informe a letra limpa');
    expect(document.activeElement?.id).toBe('lyrics');
  });

});
