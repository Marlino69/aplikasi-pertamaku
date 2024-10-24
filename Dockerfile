# FRONTEND
FROM node:20 AS frontend
WORKDIR /usr/src/frontend
COPY frontend/package.json frontend/pnpm-lock.yaml ./
ENV VITE_USER_NAME=${VITE_USER_NAME}
RUN npm install -g pnpm && pnpm install
COPY frontend/ .
RUN pnpm run build

# BACKEND
FROM node:20 AS backend
WORKDIR /usr/src/backend
COPY backend/package.json backend/pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY backend/ .
COPY --from=frontend /usr/src/frontend/dist ./public
EXPOSE 5173
EXPOSE 3000
CMD ["pnpm", "start"]