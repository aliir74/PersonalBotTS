# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy Sentry config
# COPY .sentryclirc ./

# Copy source code
COPY . .

# Build the application and generate sourcemaps
RUN npm run build

# Production stage
FROM node:20-alpine

ENV TZ=Asia/Tehran

WORKDIR /app

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Copy Sentry config
# COPY .sentryclirc ./

CMD ["npm", "run", "start:prod"]

