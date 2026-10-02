# ADR 0001 — Stack inicial da API

## Status

Aceita em 28/09/2026. A decisão sobre fotos foi substituída pela ADR 0002.

## Decisão

- NestJS 11 e TypeScript estrito;
- PostgreSQL 16;
- Prisma ORM 6.19.3, com `@prisma/adapter-pg` e client gerado pelo `prisma-client-js`;
- migrações versionadas em `prisma/migrations`;
- `prisma migrate dev` somente para desenvolver migrações e `prisma migrate deploy`
  em container isolado antes da inicialização da API;
- BullMQ e Redis para a fila `email-delivery`;
- sessão opaca em cookie `HttpOnly`, `Secure` em produção e `SameSite=Lax`;
- fotos fora do banco, em volume persistente (substituído pela ADR 0002);
- erros HTTP em `application/problem+json`.

## Consequências

O schema Prisma representa persistência e relações, sem substituir DTOs HTTP nem
models de tela. Restrições críticas continuam também nas regras de domínio e nas
migrações SQL geradas/revisadas. Alterações de schema exigem nova migração
versionada; `db push` não faz parte do fluxo de implantação.
