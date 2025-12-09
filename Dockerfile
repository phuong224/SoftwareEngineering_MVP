# =======================
# 1) FRONTEND BUILDER
# =======================
FROM node:18 AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm install

COPY frontend ./
RUN npm run build

# =======================
# 2) BACKEND BUILDER
# =======================
FROM node:18 AS backend-builder

WORKDIR /app/backend

COPY backend/package.json backend/package-lock.json ./
RUN npm install

COPY backend ./

# =======================
# 3) PRODUCTION IMAGE
# =======================
FROM node:18 AS production

WORKDIR /app

# Copy backend package
COPY backend/package.json backend/package-lock.json ./
RUN npm install --production

# Copy backend source code
COPY backend/backend ./backend

# Copy env (nếu có)
COPY backend/.env ./

# Copy frontend build -> backend/public
COPY --from=frontend-builder /app/frontend/dist ./backend/public

EXPOSE 4000

CMD ["node", "backend/src/index.js"]
