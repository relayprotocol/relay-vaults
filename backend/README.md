# Relay Protocol Backend

This is the backend service for the Relay Protocol, built with Ponder - a framework for indexing blockchain data.

## Setup

```bash
# Install dependencies:
yarn install

# run pg instance
docker run -d \
  --name relay-vaults \
  -e POSTGRES_USER=relay \
  -e POSTGRES_PASSWORD=relay \
  -e POSTGRES_DB=relay-vaults \
  -p 5432:5432 \
  -v relay-vaults-data:/var/lib/postgresql/data \
  postgres:17

# Export connection string as environment variable
export DATABASE_URL="postgresql://relay:relay@localhost:5432/relay-vaults"

# create env file
touch env.local

# start the development server
yarn dev

# To stop and remove the container:
docker stop relay-vaults && docker rm relay-vaults

# To delete the volume containig pg data:
docker volume rm relay-vaults-data

```

## Development

Generate types and database schema:

```bash
yarn codegen
```

## Production

To start the production server:

```bash
yarn start
```

## Docker Deployment

The project includes a Dockerfile for containerized deployment. To build and run:

```bash
# From the root of the monorepo
docker build -t relay-vaults .

# Run the backend
docker run relay-vaults \
  -e DATABASE_URL=$DATABASE_URL \
  -p 3000:3000 \
  -t relay-vaults \
  --name relay-backend
  backend "start backend:start"
```
