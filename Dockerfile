# Usa Node 20 (Recomendado para Next.js 15+)
FROM node:20-alpine AS base

# 1. Instala dependências do sistema necessárias para o Prisma e PNPM
# libc6-compat é obrigatório para o Prisma rodar no Alpine
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@latest --activate

# 2. Estágio de Dependências (Cache)
FROM base AS deps
WORKDIR /app

# Copia apenas os arquivos de lock para instalar
COPY package.json pnpm-lock.yaml* ./

# Instala as deps (frozen-lockfile garante versões exatas)
RUN pnpm install --frozen-lockfile

# 3. Estágio de Build
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Desabilita telemetria do Next.js durante o build
ENV NEXT_TELEMETRY_DISABLED 1

ENV NEXT_PUBLIC_BUILD_ENV=production

# IMPORTANTE: Gera o cliente do Prisma ANTES do build do Next
# O Next precisa dos tipos do Prisma para compilar
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" pnpm prisma generate

# Faz o build do projeto
RUN pnpm build

# 4. Estágio de Produção (Runner)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Cria usuário não-root para segurança
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copia a pasta public (imagens, favicon)
COPY --from=builder /app/public ./public

# Copia o build "standalone" (Otimizado do Next.js)
# Isso reduz a imagem de 1GB+ para ~150MB
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000
# O Cloud Run exige que o host seja 0.0.0.0
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]