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

# Run a specific service
docker run relay-vaults -t relay-<service> <service> start
```
