# 🎈 Bokinha

Bokinha é uma plataforma para gerenciar competições de programação para crianças e adolescentes. Permite criar competições, cadastrar questões, gerenciar participantes e exibir um placar público em tempo real.

## Tecnologias
- Next.js (App Router) + React (componentes server/client)
- TypeScript
- Prisma (ORM) + PostgreSQL (ou outro banco suportado)
- NextAuth (autenticação)
- React Query (@tanstack/react-query) para fetching/polling
- Tailwind CSS para UI
- Axios / fetch para chamadas HTTP

## Principais conceitos
- Competição (Contest): título, slug, startTime, endTime, questões.
- Questão (Question): título, ordem, cor do balão (balloonColor), pertence a uma competição.
- Usuário (User): admin ou participante; participantes vinculados a uma competição.
- SolvedQuestion: registro que marca que um participante resolveu uma questão.
- Placar (scoreboard): conjunto ordenado por número de acertos e tempo.

## Estrutura importante (resumo)
- app/
  - (private)/[slug_contest]/... — área privada (admin/participantes) da competição
  - (public)/placar/[slug_contest]/... — placar público por slug
  - api/
    - /contests/[id]/scoreboard — retorna placar com informações das questões (cores)
    - /questions/[id]/solve — marca uma questão como resolvida pelo usuário autenticado
    - /questions/[id]/solved — retorna se o usuário autenticado já resolveu a questão
    - /questions/[id] — retorna a contest com as questões (quando solicitado)
    - /confirm-password — valida senha do usuário (usado ao confirmar ações administrativas)
- components/
  - _components como CardQuestion, ContainerQuestions, ContainerScoreboard, Scoreboard, HeaderParticipant, Balloon, BoxContainer, etc.
- prisma/
  - schema.prisma — modelos: User, Contest, Question, SolvedQuestion, Role, etc.
- middleware (next-auth) — controla acesso; `/placar` é público; admins são redirecionados para `/admin`.

## Como rodar (desenvolvimento)
1. Instalar dependências:
   - pnpm install  (ou npm/yarn)
2. Configurar variáveis de ambiente (.env):
   - DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, etc.
3. Gerenciar banco:
   - pnpm prisma migrate dev --name init
   - pnpm prisma generate
4. Rodar o app:
   - pnpm dev

## Fluxos principais
- Admin:
  - Login via NextAuth.
  - Criação/edição de competições e questões.
  - Visualiza menu admin e gerenciamento de participantes.
- Participante:
  - Acessa competição pelo slug (ex: `https://.../{slug}`).
  - Vê lista de questões (cards) e marca questão como "Terminei" fornecendo senha de admin (fluxo atual).
  - Placar público (`/placar/{slug}`) mostra posição, nome, turma e balões indicando questões resolvidas (balão com cor correspondente).

## API e comportamento relevante
- Polling/atualização:
  - Componentes client usam React Query com `refetchInterval` (ex.: 10s) para manter placar e listas sincronizadas.
- Hydration:
  - Componentes que dependem de tempo (cronômetro) inicializam relógio apenas no cliente para evitar mismatch SSR/CSR.
- Permissões:
  - Rotas do placar são públicas.
  - Middleware redireciona usuários com role ADMIN para `/admin`.

## Notas para desenvolvedores
- Evitar efeitos que causem hydration mismatch: não usar Date.now() na renderização server; inicializar relógio no client (useEffect).
- As APIs retornam formatos consistentes, mas os consumidores aceitam duas variações (`{ questions: [...] }` ou `{ contest: { questions: [...] } }`) — padronizar idealmente.
- Para atualizações em tempo real mais eficientes, considerar WebSocket/Server-Sent Events no lugar de polling.

## Contribuição
- Abrir issues e PRs no repositório.
- Seguir convenções de lint/format (prettier/eslint) se existirem no projeto.

## Licença
- Incluir arquivo LICENSE conforme necessidade (ex.: MIT).