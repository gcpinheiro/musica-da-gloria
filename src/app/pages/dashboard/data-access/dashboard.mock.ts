import { NewsItem } from '../models/dashboard.model';

export const NEWS_MOCK: readonly NewsItem[] = [
  {
    id: 'news-001',
    title: 'Ensaio geral dos ministérios',
    body: 'No próximo sábado teremos ensaio geral às 16h, na Igreja Matriz.',
    publishedAt: new Date().toISOString(),
    author: 'Eury',
  },
  {
    id: 'news-002',
    title: 'Novo repertório para o Tempo Comum',
    body: 'As cifras-base já estão disponíveis na biblioteca.',
    publishedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    author: 'Eury',
  },
];
