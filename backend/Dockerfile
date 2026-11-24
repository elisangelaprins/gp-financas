# Estágio 1: Build (instala dependências, gera o Prisma Client e compila o TypeScript)
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma/
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Remove as devDependencies mantendo o Prisma Client já gerado em node_modules/.prisma
RUN npm prune --omit=dev

# Estágio 2: Produção (imagem enxuta e rodando com usuário não-root)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder --chown=node:node /app/package*.json ./
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/src/docs/swagger.yaml ./src/docs/swagger.yaml

USER node
EXPOSE 3000
CMD ["node", "dist/index.js"]