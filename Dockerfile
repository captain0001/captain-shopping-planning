# Stage 1: ビルド (Debian/glibc: lightningcss が linux-arm-gnueabihf バイナリを持つため)
FROM node:20 AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: ランタイム (ターゲットアーキテクチャ = ラズパイ3: linux/arm/v7)
FROM node:20-alpine AS runtime
WORKDIR /app

# better-sqlite3 のネイティブビルドに必要なツール
RUN apk add --no-cache python3 make g++

COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/db ./db

# ターゲットアーキテクチャ向けに better-sqlite3 をリビルド
RUN npm rebuild better-sqlite3

ENV NODE_ENV=production
ENV PORT=3000
ENV DB_PATH=/data/shopping.db

VOLUME ["/data"]
EXPOSE 3000

CMD ["node", "build"]
