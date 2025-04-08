# Relay Protocol Backend

This is the backend service for the Relay Protocol, built with Ponder - a framework for indexing blockchain data.

## Setup

```bash
# Install dependencies:
yarn install

# run pg instance
docker run -d \
  --name relay-postgres \
  -e POSTGRES_USER=relay \
  -e POSTGRES_PASSWORD=relay \
  -e POSTGRES_DB=relay \
  -p 5432:5432 \
  -v relay-postgres-data:/var/lib/postgresql/data \
  postgres:17

# Export connection string as environment variable
export DATABASE_URL="postgresql://relay:relay@localhost:5432/relay"

# create env file
touch env.local

# start the development server
yarn dev

# To stop and remove the container:
docker stop relay-postgres && docker rm relay-postgres

# To delete the volume containig pg data:
docker volume rm relay-postgres-data

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
docker build -t relay-backend .
docker run -p 3000:3000 relay-backend
```
