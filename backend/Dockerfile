# One image, two roles: APP_ROLE=api | worker (ADR-0003).

# ---- deps: full dependency tree for dev and build ----
FROM node:24-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ---- dev: nest --watch; compose bind-mounts src/ over the copy ----
FROM deps AS dev
COPY . .
CMD ["npm", "run", "start:dev"]

# ---- build: TS -> dist ----
FROM deps AS build
COPY . .
RUN npm run build

# ---- production: runtime deps + dist + SQL migrations (T02) ----
FROM node:24-alpine AS production
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY migrations ./migrations
USER node
EXPOSE 3000
CMD ["node", "dist/main"]
