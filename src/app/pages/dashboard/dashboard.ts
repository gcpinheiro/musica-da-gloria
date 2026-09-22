import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardFacade } from './data-access/dashboard.facade';
import { AuthFacade } from '../../core/auth/auth.facade';

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, RouterLink],
  providers: [DashboardFacade],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit {
  protected readonly facade = inject(DashboardFacade);
  protected readonly authFacade = inject(AuthFacade);
  protected readonly newsEditorOpen = signal(false);
  protected readonly editingNewsId = signal<string | null>(null);
  protected readonly newsTitle = signal('');
  protected readonly newsBody = signal('');

  ngOnInit(): void {
    this.facade.load();
  }
  protected editNews(id: string, title: string, body: string): void { this.editingNewsId.set(id); this.newsTitle.set(title); this.newsBody.set(body); this.newsEditorOpen.set(true); }
  protected createNews(): void { this.editingNewsId.set(null); this.newsTitle.set(''); this.newsBody.set(''); this.newsEditorOpen.set(true); }
  protected saveNews(): void { const title = this.newsTitle().trim(); const body = this.newsBody().trim(); if (!title || !body) return; this.facade.saveNews({ title, body }, this.editingNewsId() ?? undefined); this.newsEditorOpen.set(false); }
  protected updateTitle(event: Event): void { this.newsTitle.set((event.target as HTMLInputElement).value); }
  protected updateBody(event: Event): void { this.newsBody.set((event.target as HTMLTextAreaElement).value); }
}
