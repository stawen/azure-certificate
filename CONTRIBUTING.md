# Contribuer

## Versionning

To release a new version:

1. Commit code + changes infos in [CHANGELOG.md](./CHANGELOG.md) in the **Unreleased** section.
2. Create the version (tag) manually on your desktop:

```bash
npm run version-changelog-patch
npm run version-changelog-minor
npm run version-changelog-major
```

## Reference

- [Pulumi Blob](https://www.pulumi.com/blog/dynamic-providers/)
- [Pulumi documentation](https://www.pulumi.com/docs/intro/concepts/resources/dynamic-providers/)
- [Github - pulumi@pulumi - Node JS Dynamic provider class definition](https://github.com/pulumi/pulumi/blob/master/sdk/nodejs/dynamic/index.ts#L204)
- [Youtube - Pulumi Dynamic Provider starter pack](https://www.youtube.com/watch?v=H4nehfvCLm8)
- [Github - fauna-pulumi-provider](https://github.com/TriangularCube/fauna-pulumi-provider)
- [How get Azure Credential](https://github.com/Azure/azure-sdk-for-js/blob/main/documentation/next-generation-quickstart.md)
- [Doc - Typescript spread tips and tricks](https://levelup.gitconnected.com/spreading-resting-and-renaming-properties-in-typescript-68fb35ffb1f)
- [Doc - Typescript spread tips and tricks again](https://gentille.us/typescript-tips-b74925485b78)
- [Azure WebSiteManagement client library for JavaScript](https://www.npmjs.com/package/@azure/arm-appservice)

## Just in case

- This provider is only for `TypeScript Pulumi`
- If you want to make a Cross language Provider, check this :

  - [BoilerPlate Example](https://github.com/mikhailshilkov/pulumi-provider-boilerplate)
  - [Here](https://github.com/pulumi/pulumi-provider-boilerplate)
