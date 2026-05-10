# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:24-alpine AS build
WORKDIR /app
ARG VITE_APP_VERSION=dev
ARG VITE_API_URL
ENV VITE_APP_VERSION=$VITE_APP_VERSION
ENV VITE_API_URL=$VITE_API_URL
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm install --omit=dev

COPY server/ ./server/
COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["node", "server/index.js"]
