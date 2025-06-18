# Build stage
FROM node:22.16.0-alpine3.21 AS builder

# Set working directory
WORKDIR /app

# Enable corepack and set yarn version
RUN corepack enable && corepack prepare yarn@4.6.0 --activate

# Copy the entire repository
COPY . .

# Install dependencies
RUN yarn install

# Build all packages
RUN yarn build

# Production stage
FROM node:22.16.0-alpine3.21 AS runner

# Set working directory
WORKDIR /app

# Enable corepack and set yarn version
RUN corepack enable && corepack prepare yarn@4.6.0 --activate

# Copy built files from builder stage
COPY --from=builder /app .

# Install production dependencies; skipped build steps as code is already built
RUN yarn install --mode=skip-build

# Set environment variables
ENV NODE_ENV=production


# Add specific ARGs and persist them into ENV
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

# Expose port
EXPOSE 3000

# pass command as argument
COPY ./bin/entrypoint.sh entrypoint.sh
RUN chmod +x /app/entrypoint.sh
ENTRYPOINT ["/app/entrypoint.sh"]