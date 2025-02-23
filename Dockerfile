FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Install dependencies (using install instead of ci for more flexibility)
RUN npm install && \
    cd frontend && \
    npm install

# Copy source files
COPY . .

# Build frontend first
RUN cd frontend && \
    npm run build

# Build backend
RUN npm run build

FROM node:18-alpine AS runner

WORKDIR /app

# Copy built assets and necessary files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/frontend/build ./frontend/build
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Set NODE_ENV
ENV NODE_ENV=production

EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD node -e "fetch('http://localhost:3000/api/tasks').then(r => process.exit(r.ok ? 0 : 1))"

CMD ["npm", "start"]
