FROM node:20-bookworm-slim AS base
WORKDIR /app

COPY frontend/package.json ./frontend/package.json
COPY backend/package.json ./backend/package.json

RUN npm install --prefix frontend --no-audit --no-fund
RUN npm install --prefix backend --no-audit --no-fund

COPY frontend ./frontend
COPY backend ./backend

RUN npm run build --prefix frontend

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=base /app/backend /app/backend
COPY --from=base /app/backend/node_modules /app/backend/node_modules
COPY --from=base /app/frontend/dist /app/frontend/dist

EXPOSE 5000
CMD ["node", "backend/index.js"]
