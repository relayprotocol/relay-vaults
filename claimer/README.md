# Claimer

## Build docker image

From monorepo root folder

```
# Build the image
docker build -t relay-claimer  -f claimer/Dockerfile .

# Run the container
docker run relay-claimer
```