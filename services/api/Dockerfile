FROM node:24.13.0-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS builder
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY services/api/package.json ./services/api/package.json
RUN pnpm install --frozen-lockfile --filter api...
COPY services/api ./services/api
RUN pnpm --filter api run build
RUN pnpm --filter api deploy --prod /prod/api

FROM base
ENV NODE_ENV=production
WORKDIR /app
USER node
COPY --chown=node:node --from=builder /prod/api/node_modules ./node_modules
COPY --chown=node:node --from=builder /prod/api/dist ./dist
COPY --chown=node:node --from=builder /prod/api/package.json ./package.json
EXPOSE 3000
CMD ["node", "dist/app.js"]
