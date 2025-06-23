# Relay Vaults Packages

## Publish packages

Release public packages to npm (set `private: true` to ignore a package)

### Version

Specify a strategy to bump to a new version (see [yarn docs](https://yarnpkg.com/cli/version#details)).
This will update the `version` field for all public packages and their direct deps in the repo

```
yarn bump <major/minor/patch>
```

### Release to npm

Publish all packages

```
yarn publish
```

### Changelog

TODO
