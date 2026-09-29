FROM node:22.18.0-alpine AS dependencies

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS development

COPY . .

EXPOSE 4200

CMD ["npm", "start", "--", "--host", "0.0.0.0"]

FROM dependencies AS build

COPY . .
RUN npm run build

FROM node:22.18.0-alpine AS runtime

ENV NODE_ENV=production
ENV PORT=4000

WORKDIR /app

COPY --from=build /app/dist/musica-da-gloria ./dist/musica-da-gloria

USER node

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:4000/health || exit 1

CMD ["node", "dist/musica-da-gloria/server/server.mjs"]
