FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY --from=builder /app/dist ./dist
HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
  CMD node -e "process.exit(0)"
CMD ["node", "dist/index.js"]