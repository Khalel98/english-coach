FROM node:22-alpine AS base
WORKDIR /app

FROM base AS build
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM base AS runtime
COPY package.json package-lock.json ./
RUN npm ci
ENV NODE_ENV=production
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000
COPY --from=build /app/.output ./.output
COPY drizzle.config.ts ./
COPY server/db ./server/db
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
