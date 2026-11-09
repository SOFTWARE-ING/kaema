FROM oven/bun:1.3.0-debian

WORKDIR /app

RUN apt-get update \
  && apt-get install --yes --no-install-recommends ffmpeg ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY prisma ./prisma
COPY prisma.config.ts tsconfig.json ./
RUN bun run db:generate

COPY src ./src
COPY scripts ./scripts

ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001

CMD ["sh", "-c", "bun run db:deploy && bun run start"]
