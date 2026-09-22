# AGENTS.md — Música da Glória

## 1. Objetivo do produto

Este repositório contém o sistema **Música da Glória**, destinado à gestão dos
ministérios de música da Paróquia Nossa Senhora da Glória, em Fortaleza/CE.

O produto deve permitir:

- manter um banco de talentos com membros, instrumentos, funções e disponibilidade;
- criar ministérios e definir sua formação habitual;
- associar ministérios a missas, celebrações e eventos recorrentes;
- gerar ocorrências de escala a partir dessas recorrências;
- flexibilizar a formação de uma ocorrência sem alterar a formação habitual;
- definir repertório, ordem, tom e orientações para cada celebração;
- permitir que líderes gerenciem usuários, membros, ministérios e escalas;
- permitir que membros consultem escalas, formação e repertório;
- destacar na página inicial a escala da semana, conflitos e confirmações.

## 2. Princípios de domínio

### 2.1 Formação habitual e escala concreta são conceitos diferentes

`MinistryMember` representa a formação habitual de um ministério.
`OccurrenceMember` representa quem efetivamente servirá em uma data específica.

Ao gerar uma ocorrência, a formação habitual é copiada para a escala. Alterações
posteriores na ocorrência não podem modificar implicitamente o ministério nem as
demais datas da série.

### 2.2 Recorrência e ocorrência são conceitos diferentes

`CelebrationSeries` guarda a regra recorrente, como “domingo às 19h”.
`CelebrationOccurrence` guarda uma celebração concreta, com data, formação,
repertório, status e confirmações próprios.

### 2.3 Histórico não deve ser destruído

Membros, usuários, ministérios, músicas e séries que já participem de um histórico
devem ser desativados ou arquivados. Exclusão definitiva só é aceitável para dados
sem referência e deve exigir confirmação explícita na interface.

## 3. Stack e convenções gerais

- Angular 20 ou a versão já fixada no projeto.
- Componentes standalone; não criar `NgModule` sem uma justificativa técnica real.
- TypeScript em modo estrito, sem `any` implícito ou atalhos que enfraqueçam tipos.
- SCSS para estilos.
- Angular Signals para estado local e estado exposto pelas facades.
- RxJS para fluxos assíncronos, integrações e composição de eventos.
- Reactive Forms para formulários de negócio.
- Rotas de páginas carregadas de forma lazy.
- SSR deve continuar funcional; não acessar `window`, `document`, `localStorage` ou
  outras APIs do navegador sem abstração e verificação de plataforma.
- Textos da interface em português do Brasil.
- Datas e horários no fuso `America/Fortaleza`, com exibição `dd/MM/yyyy` e `HH:mm`.
- Identificadores, nomes de arquivos e código em inglês; textos visíveis em português.

## 4. Arquitetura Angular obrigatória

Usar organização orientada a funcionalidades, mantendo separação clara entre
infraestrutura global, recursos compartilhados e regras de cada domínio.

```text
src/
├── app/
│   ├── core/
│   │   ├── auth/
│   │   ├── config/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── layout/
│   │   ├── services/
│   │   └── tokens/
│   ├── shared/
│   │   ├── components/
│   │   ├── directives/
│   │   ├── pipes/
│   │   ├── models/
│   │   ├── utils/
│   │   └── validators/
│   ├── pages/
│   │   ├── dashboard/
│   │   ├── members/
│   │   ├── ministries/
│   │   ├── celebrations/
│   │   ├── schedules/
│   │   ├── songs/
│   │   ├── users/
│   │   └── auth/
│   ├── app.config.ts
│   ├── app.config.server.ts
│   ├── app.routes.ts
│   └── app.ts
├── environments/
│   ├── environment.ts
│   └── environment.production.ts
└── styles/
    ├── _tokens.scss
    ├── _mixins.scss
    ├── _reset.scss
    ├── _typography.scss
    └── _utilities.scss
```

Cada domínio em `pages/` pode usar esta estrutura:

```text
members/
├── components/       # componentes de apresentação exclusivos do domínio
├── data-access/
│   ├── members.facade.ts
│   ├── members.service.ts
│   └── members.mock.ts
├── models/
│   └── member.model.ts
├── pages/
│   ├── member-list/
│   ├── member-detail/
│   └── member-form/
├── members.routes.ts
└── index.ts           # API pública opcional e controlada da feature
```

### 4.1 `core/`

Contém somente recursos singleton e transversais à aplicação, como autenticação,
autorização, configuração, layout principal, guards, interceptors, logging e tokens
de injeção. Não colocar componentes ou regras específicas de um domínio em `core/`.

### 4.2 `shared/`

Contém componentes visuais reutilizáveis e sem regra de negócio, além de pipes,
diretivas, validadores e utilitários genéricos. Um componente compartilhado recebe
dados por inputs e comunica intenções por outputs; ele não injeta facades de páginas.

### 4.3 `pages/`

Cada pasta representa uma funcionalidade de negócio autocontida. Modelos, serviços,
facades e componentes específicos devem permanecer junto da feature. Evitar imports
diretos entre features; quando necessário, mover apenas o contrato verdadeiramente
compartilhado para `shared/models` ou criar uma abstração no `core`.

### 4.4 `environments/`

Guardar apenas valores de configuração não secretos, como URL da API, modo de mocks
e flags de recurso. Segredos nunca devem ser versionados nem embutidos no bundle.

## 5. Facade Pattern obrigatório

Cada feature com estado ou operações assíncronas deve possuir uma facade.

### Responsabilidade do componente de página

- renderizar estado exposto pela facade;
- capturar interações do usuário;
- controlar somente estado efêmero de apresentação;
- delegar carregamento, filtros persistentes e ações de negócio à facade.

### Responsabilidade da facade

- ser a API pública da feature para os componentes;
- orquestrar um ou mais serviços;
- manter e expor estado como signals somente leitura;
- expor estados de `loading`, `error` e dados vazios;
- aplicar regras de interação e coordenar comandos;
- nunca conter detalhes de HTTP, armazenamento ou implementação do mock.

### Responsabilidade do service

- encapsular acesso a dados e operações de persistência;
- retornar `Observable` com modelos tipados;
- inicialmente operar sobre dados mockados;
- preservar uma interface compatível com a futura API real;
- não manter estado visual de página.

Os componentes de página não devem consumir diretamente `HttpClient`, arquivos de
mock ou serviços de persistência. Devem depender da facade.

Exemplo de API esperada de uma facade:

```ts
@Injectable()
export class MembersFacade {
  readonly members = this.membersState.asReadonly();
  readonly selectedMember = this.selectedMemberState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();

  load(): void {}
  select(id: string): void {}
  create(input: CreateMemberInput): Observable<Member> {}
  update(id: string, input: UpdateMemberInput): Observable<Member> {}
  deactivate(id: string): Observable<void> {}
}
```

Não expor signals graváveis publicamente. Atualizações de coleções devem ser
imutáveis e previsíveis.

## 6. Dados mockados e caminho para a API

Enquanto não houver back-end, toda feature deve funcionar ponta a ponta com mocks
realistas. Não espalhar arrays fictícios dentro de componentes.

- Centralizar registros iniciais em arquivos `*.mock.ts` da própria feature.
- O service simula persistência em memória durante a sessão.
- Simular latência curta por Observable para exercitar estados de carregamento.
- Simular erros de forma controlada quando isso for útil para testes.
- Gerar IDs de forma estável e preservar relacionamentos.
- Usar datas coerentes e dados em português, sem `Lorem ipsum`.
- Não usar nomes, telefones ou e-mails de pessoas reais sem autorização.
- Fornecer massa suficiente para estados normal, vazio, conflito e indisponibilidade.

Preferir um contrato ou token de repositório quando isso facilitar a troca futura:

```ts
export abstract class MembersRepository {
  abstract list(): Observable<Member[]>;
  abstract getById(id: string): Observable<Member>;
  abstract create(input: CreateMemberInput): Observable<Member>;
  abstract update(id: string, input: UpdateMemberInput): Observable<Member>;
  abstract deactivate(id: string): Observable<void>;
}
```

A implementação mock e a futura implementação HTTP devem obedecer ao mesmo contrato.
Selecionar a implementação com providers/configuração, não com condicionais dentro
dos componentes.

## 7. Páginas e componentes completos

Cada rota deve apontar para um componente de página completo. Não criar telas como
fragmentos soltos nem concentrar todas as páginas no componente raiz.

Uma página completa inclui, quando aplicável:

- arquivo `.ts`, template `.html`, estilo `.scss` e teste `.spec.ts`;
- cabeçalho com título, descrição e ação principal;
- estado de carregamento perceptível;
- estado vazio com orientação e ação;
- estado de erro com opção de tentar novamente;
- visualização responsiva dos dados;
- formulário com validação e mensagens claras;
- confirmação antes de ação destrutiva ou desativação;
- feedback de sucesso e falha;
- navegação por teclado, foco visível e semântica adequada.

Dividir componentes quando existir uma responsabilidade visual clara, reutilização
real ou complexidade relevante. Evitar tanto componentes monolíticos quanto a
fragmentação de elementos triviais em dezenas de arquivos.

Páginas mínimas planejadas:

- login e recuperação de acesso;
- dashboard semanal;
- lista, detalhe e formulário de membros;
- lista, detalhe e formulário de ministérios;
- calendário/lista de celebrações e séries recorrentes;
- detalhe e edição de uma ocorrência de escala;
- biblioteca e formulário de músicas;
- repertório da celebração;
- usuários e convites;
- área “Minhas escalas” do membro.

## 8. Modelagem inicial do domínio

Usar IDs como `string` e tipos explícitos para status e papéis. As entidades mínimas
são:

- `User`, `Role` e `UserStatus`;
- `MemberProfile`, `Talent` e `MemberTalent`;
- `AvailabilityRule` e `Unavailability`;
- `Ministry` e `MinistryMember`;
- `CelebrationSeries` e `RecurrenceRule`;
- `CelebrationOccurrence` e `OccurrenceMember`;
- `Song`, `Setlist` e `SetlistItem`;
- `AttendanceConfirmation`;
- `Notification` e `AuditLog`.

Separar modelos de leitura de comandos como `CreateMemberInput` e
`UpdateMemberInput`. Não enviar entidades inteiras como payload de atualização.

## 9. Rotas, autorização e navegação

- Definir rotas filhas por feature e carregá-las com `loadChildren`/`loadComponent`.
- Proteger áreas privadas com guards funcionais.
- Não confiar no guard como única proteção; a API futura validará autorização.
- Perfis iniciais: `ADMIN`, `LEADER` e `MEMBER`.
- `ADMIN` possui acesso global.
- `LEADER` gerencia membros, ministérios, usuários convidados, escalas e repertórios.
- `MEMBER` consulta escalas e repertórios e confirma disponibilidade/presença.
- Menus e ações devem respeitar permissões, mantendo URLs previsíveis.

## 10. Formulários

- Usar Reactive Forms tipados.
- Colocar validadores reutilizáveis em `shared/validators`.
- Mensagens devem explicar como corrigir o campo.
- Não perder dados digitados após erro recuperável.
- Desabilitar submissão duplicada durante salvamento.
- Normalizar valores no limite do formulário/service, não no template.
- Formulários de criação e edição podem compartilhar um componente quando o fluxo
  e os campos forem realmente equivalentes.

## 11. Design system e experiência

A interface deve refletir a identidade da Paróquia da Glória sem parecer uma peça
promocional temporária.

Paleta inicial, sujeita à validação com a Pascom:

- azul-mariano principal: `#173C67`;
- azul secundário: `#4B83B6`;
- dourado de destaque: `#C5A35A`;
- fundo branco quente: `#F7F5F0`;
- texto principal: `#172432`.

Regras visuais:

- declarar cores, espaçamentos, raios, sombras e tipografia como design tokens;
- usar peso 500 ou 600 em títulos e nomes da marca; reservar 700/800 para rótulos,
  botões ou indicadores pequenos quando necessário;
- não duplicar valores mágicos em componentes;
- usar dourado com moderação em ações ou destaques institucionais;
- reservar vermelho para erro, conflito ou ação perigosa;
- garantir contraste WCAG AA;
- projetar primeiro para uso móvel, preservando excelente experiência desktop;
- a escala semanal deve ser a informação dominante do dashboard;
- representar status também com texto/ícone, nunca apenas com cor;
- a imagem pública do perfil `@musicadagloria`, indicada pelo solicitante, pode ser
  usada como referência e marca provisória do aplicativo. Antes da publicação,
  pedir à Pastoral/Pascom o arquivo original em alta resolução e confirmar o uso;
  não redesenhar nem inferir uma marca final.

## 12. Acessibilidade

- HTML semântico antes de ARIA.
- Todos os controles devem funcionar por teclado.
- Inputs precisam de labels associados.
- Modais devem controlar foco e permitir fechamento acessível.
- Feedback assíncrono importante deve ser anunciado adequadamente.
- Imagens informativas precisam de texto alternativo; imagens decorativas usam alt
  vazio.
- Respeitar `prefers-reduced-motion`.

## 13. Tratamento de estado e erros

- Toda operação assíncrona relevante deve representar `idle`, `loading`, `success`
  e `error`, explicitamente ou por estado equivalente.
- Erros técnicos não devem ser mostrados diretamente ao usuário.
- A facade converte erros de infraestrutura em mensagens úteis para a página.
- Conflito de agenda, indisponibilidade e função descoberta são estados de domínio,
  não falhas genéricas.
- Evitar subscriptions manuais em componentes; preferir signals, `async`, efeitos
  bem delimitados e mecanismos de teardown do Angular.

## 14. Testes e qualidade

Para cada feature:

- testar facades em carregamento, sucesso e erro;
- testar services e contratos de repositório;
- testar validações e comportamentos críticos dos formulários;
- testar permissões e guards;
- testar visualmente/funcionalmente estados vazio, carregando, erro e populado;
- manter ao menos um teste de integração para o fluxo principal da feature.

Fluxos críticos que não podem regredir:

1. criar um membro com talentos e disponibilidade;
2. criar um ministério com formação habitual;
3. associar o ministério a uma série recorrente;
4. gerar uma ocorrência;
5. substituir um integrante somente naquela ocorrência;
6. definir e ordenar repertório;
7. publicar a escala;
8. consultar a escala como membro.

Antes de concluir uma alteração, executar no mínimo:

```text
npm test
npm run build
```

Se algum comando não puder ser executado, registrar claramente o motivo na entrega.

## 15. Convenções de código

- Arquivos em kebab-case: `members.facade.ts`, `member-form.ts`.
- Classes e tipos em PascalCase.
- Variáveis, signals e métodos em camelCase.
- Observables podem usar sufixo `$`; signals não usam `$`.
- Preferir `inject()` de forma consistente no código novo.
- Usar `ChangeDetectionStrategy.OnPush` nos componentes.
- Preferir `input()`, `output()` e `computed()` quando compatíveis com o caso.
- Não deixar `console.log`, código comentado, imports mortos ou TODO sem contexto.
- Não criar abstração genérica antes de haver uso real em mais de um domínio.
- Manter funções pequenas e nomes orientados à intenção do negócio.

## 16. Segurança e privacidade

- Nunca versionar senhas, tokens ou segredos.
- Usuários devem receber convite temporário; líderes não visualizam senhas.
- Dados pessoais devem ser os mínimos necessários para a operação pastoral.
- Mocks não devem conter dados pessoais reais.
- Ações administrativas relevantes devem estar preparadas para auditoria.
- Não expor observações privadas de líderes ao perfil `MEMBER`.
- Sanitizar e validar dados também na futura API.

## 17. Critério de pronto

Uma tarefa só está pronta quando:

- o comportamento solicitado funciona com os mocks atuais;
- componentes acessam dados pela facade, não diretamente pelo mock;
- estados de carregamento, vazio, erro e sucesso foram tratados;
- layout funciona em celular e desktop;
- permissões aplicáveis foram respeitadas;
- testes relevantes foram criados ou atualizados;
- `npm test` e `npm run build` passam;
- não há regressão de SSR;
- a documentação foi atualizada se a decisão arquitetural mudou.

## 18. Sequência recomendada de implementação

1. fundação: estilos, tokens, environments, layout, rotas e mocks base;
2. autenticação simulada e autorização por perfil;
3. banco de talentos e membros;
4. ministérios e formação habitual;
5. séries recorrentes e ocorrências de celebração;
6. edição da formação por ocorrência e detecção de conflitos;
7. músicas e repertório;
8. dashboard semanal e área do membro;
9. convites, notificações simuladas e auditoria;
10. substituição gradual dos repositórios mock por API real.
