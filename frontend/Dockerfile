# frontend/Dockerfile

# Use Node.js LTS base image
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies and build app
COPY package*.json ./
RUN npm install --force

COPY . .
RUN npm run build

# Production image
FROM node:18-alpine AS runner

WORKDIR /app

COPY --from=builder /app ./

EXPOSE 3000

ENV NODE_ENV=production

CMD ["npm", "run", "start"]
