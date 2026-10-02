# ADR 0002 — Fotos de membros em Base64

## Status

Aceita em 01/10/2026. Substitui somente a decisão sobre fotos da ADR 0001.

## Decisão

- o front envia JPG, PNG ou WebP por `multipart/form-data`;
- a API limita o arquivo a 5 MB e valida sua assinatura binária, além do MIME declarado;
- a API converte a imagem em Data URL Base64 e a armazena na coluna textual existente;
- o Base64 é retornado apenas no detalhe do membro e omitido nas listagens;
- não são aceitas URLs de imagem informadas pelo usuário.

## Consequências

O deploy não depende de volume persistente ou provedor de objetos. Em contrapartida,
Base64 aumenta o tamanho armazenado em aproximadamente um terço e torna a leitura do
perfil mais pesada. Se o volume de fotos crescer, esta decisão deverá ser revista em
favor de armazenamento de objetos com URLs assinadas.
