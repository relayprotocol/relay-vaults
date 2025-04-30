# Build stage
FROM node:22-alpine AS builder

# Install yarn
RUN corepack enable && corepack prepare yarn@4.6.0 --activate

# Set working directory
WORKDIR /app

# Copy root package files
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

# Copy workspace packages
COPY packages ./packages
COPY backend ./backend
COPY smart-contracts ./smart-contracts
COPY claimer ./claimer

# Install dependencies and build all packages
RUN yarn install
RUN yarn build


# Production stage
FROM builder AS production

# Set working directory
WORKDIR /app/claimer

# Set environment variables
ENV NODE_ENV=production

# Run the application
CMD ["yarn", "start"] 