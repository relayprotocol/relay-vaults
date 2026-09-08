# AGENTS.md

Agent-oriented guide to the `relay-vaults` monorepo (a.k.a. Relay Protocol): a cross-chain liquidity protocol for fast bridging of assets across chains. It contains Solidity smart contracts (ERC4626 vaults, bridges, proxies), a Ponder blockchain indexer, an off-chain claimer service, and shared TypeScript packages. See [README.md](./README.md) for the full overview.

## Project

Yarn 4 workspaces monorepo. Top-level workspaces: `smart-contracts`, `backend`, `claimer`, and `packages/**`. Smart contracts are built and tested with **Hardhat** (not Foundry); the backend is a [Ponder](https://ponder.sh/) indexer; the claimer is a TypeScript (tsx) service.

## Setup

Requirements (see [README.md](./README.md#prerequisites)): Node.js 22, Yarn 4.9.2 (via Corepack), Docker (for backend/claimer), PostgreSQL (for backend).

```bash
corepack enable     # enable Yarn
yarn install        # install dependencies
yarn build          # clean + build shared packages (runs backend codegen first)
```

## Common commands

Run from the repo root unless noted. Component-specific commands are documented in each component's README.

| Task | Command | Notes |
| --- | --- | --- |
| Install deps | `yarn install` | Yarn 4 via Corepack |
| Build shared packages | `yarn build` | clean + topological build; runs `backend codegen` first |
| Build packages only | `yarn packages:build` | skips codegen prebuild |
| Lint (all workspaces) | `yarn lint` | parallel; also run by the `pre-commit` hook |
| Test (all packages) | `yarn test` | parallel package tests |
| Backend dev | `yarn backend:dev` | builds then `ponder dev` (needs `DATABASE_URL`) |
| Claimer dev | `yarn claimer:dev` | builds then runs the claimer |
| Compile contracts | `yarn workspace @relay-vaults/smart-contracts build` | `hardhat compile` |
| Contract tests (local) | `cd smart-contracts && yarn test:hardhat` | local Hardhat network |
| Contract tests (forks) | `yarn test:ethereum` / `test:optimism` / `test:base` / `test:zksync` | run from `smart-contracts/`; mainnet forks |
| Contract lint | `cd smart-contracts && yarn lint` | `solhint` + `eslint` |
| Backend tests | `yarn workspace @relay-vaults/backend test` | `vitest` |
| Backend typecheck | `yarn workspace @relay-vaults/backend typecheck` | `tsc` |
| Hardhat tasks | `cd smart-contracts && yarn run hardhat <task>` | e.g. `networks:list`, `pool:deposit`, deploy tasks |

Full smart-contract test/deploy options live in [smart-contracts/README.md](./smart-contracts/README.md). Backend and claimer specifics: [backend/README.md](./backend/README.md), [claimer/README.md](./claimer/README.md).

## Layout

```
relay-vaults/
├── smart-contracts/   # Solidity contracts + Hardhat (contracts/, tasks/, ignition/, test/, scripts/)
├── backend/           # Ponder indexer & GraphQL API
├── claimer/           # Off-chain bridge claim processing service
├── packages/
│   ├── abis/          # @relay-vaults/abis        - contract ABIs
│   ├── addresses/     # @relay-vaults/addresses   - deployed addresses
│   ├── networks/      # @relay-vaults/networks    - network configs
│   ├── client/        # @relay-vaults/client      - TS client library
│   ├── helpers/       # @relay-vaults/helpers     - utilities
│   ├── types/         # @relay-vaults/types       - shared types
│   ├── tsconfig/      # shared TypeScript config
│   └── eslint-config/ # shared ESLint config
├── bin/               # helper scripts
├── docs/              # audit reports (Spearbit/Cantina)
├── Dockerfile         # backend & claimer deployment image
├── README.md          # WHITEPAPER.md
```

## Conventions

- Open a pull request against `main` for review; never push directly to `main` or merge your own PR.
- A Husky `pre-commit` hook runs `yarn lint`. Fix lint failures rather than bypassing the hook — do not use `git commit --no-verify`.
- Match the style and formatting of surrounding code. Formatting is enforced by Prettier (incl. `prettier-plugin-solidity`); Solidity is linted with `solhint`, TS/JS with `eslint`.
- Make the smallest reasonable change; avoid unrelated edits.
- Published npm packages (`@relay-vaults/abis`, `addresses`, `networks`, `client`) are consumed externally — keep public APIs stable.
