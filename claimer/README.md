# Claimer

The Claimer processes bridge claims for the Relay Protocol vaults

## Run with Docker

From monorepo root folder

```
# Build the image
docker build -t relay-vaults .

# Run the claimer
docker run relay-vaults -t relay-claimer claimer start
```
