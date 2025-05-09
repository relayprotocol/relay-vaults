# Docs

## Audits

Our code was audited by Spearbit [Cantina](https://cantina.xyz/).
We got 2 audits from them and you can consult the findings from there:

- [Audit 1](./report-cantinacode-relay-protocol-0203.pdf)
- [Audit 2](./report-cantinacode-relay-protocol-rereview-0310.pdf)

All Critical, High, Medium and Low have been patched.

## Build docker images

From monorepo root folder

```
# Build the image
docker build -t relay-vaults .

# Run the backend
docker run relay-vaults \
  -e DATABASE_URL=$DATABASE_URL \
  -p 3000:3000 \
  -t relay-backend
  backend "start backend:start --schema $RAILWAY_DEPLOYMENT_ID"

# Run the claimer
docker run relay-vaults -t relay-claimer claimer start
```
