FROM node:24-bookworm-slim AS build
RUN npm install -g pnpm@11.25.0
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/mobile/package.json apps/mobile/package.json
COPY apps/website/package.json apps/website/package.json
COPY packages/ packages/
RUN pnpm install --frozen-lockfile
COPY apps/ apps/
ARG NUXT_PUBLIC_API_BASE=http://localhost:8000
ARG NUXT_PUBLIC_MOBILE_URL=http://localhost:3000
ENV NUXT_PUBLIC_API_BASE=$NUXT_PUBLIC_API_BASE
ENV NUXT_PUBLIC_MOBILE_URL=$NUXT_PUBLIC_MOBILE_URL
RUN pnpm build

FROM nginx:1.27-alpine AS mobile
COPY --from=build /app/apps/mobile/.output/public /usr/share/nginx/html
COPY deployment/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

FROM node:24-bookworm-slim AS website
WORKDIR /app
COPY --from=build --chown=node:node /app/apps/website/.output ./.output
USER node
ENV PORT=3001 HOST=0.0.0.0
EXPOSE 3001
CMD ["node", ".output/server/index.mjs"]
