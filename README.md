# Azure ASC Pulumi Dynamic Provider (TS)

The goal of this library is to provide a simple way to provision and maintain ✨App Service Certificat✨, using Typescript/Javascript, with Pulumi.

The reason why i create this provider is :

-   with Azure Classic provider, is not possible to create an ASC (App Service Provider)
-   with Azure Native, Azure Rest API have a bug (https://github.com/pulumi/pulumi-azure-native/issues/1292)

## Requirement

First, you need to install the Pulumi CLI in your system. This CLI will be needed to create any resources. Please refer to this [link](https://www.pulumi.com/docs/reference/cli/).

I consider that you are comfortable with Pulumi concepts, typescript and development.

### Installation

**yarn :**

```bash
yarn add @stawen/azure-certificate
```

**npm**

```bash
npm install @stawen/azure-certificate
```

### pulumi.[stack].yml

In this file, you must specify

Azure Native :

```yaml
config:
    azure-native:environment: public
    azure-native:location: <location>
    azure-native:subscriptionId: <xxxx-xxxx>
    azure-native:tenantId: <xxxx-xxxx>
```

Azure Classic :

```yaml
config:
    azure:environment: public
    azure:location: <location>
    azure:subscriptionId: <xxxx-xxxx>
    azure:tenantId: <xxxx-xxxx>
```

### Execution Context

It's work on your laptop, you must make a `az login` first. it's not a constraint, just how pulumi works.

If you want to run your Pulumi in Github Action, it's work too.

### Examples

### Use the componant how call the provider

🚀 I prefer this method which ensures consistency between Pulumi name and Azure ressources easily

```typescript
import * as azc from '@stawen/azure-certificate'

export const cert = new azc.CertificateOrder({
    fqdn: '*.foo.bar.domain.tld',
    autoRenew: true,
    suffix: '20230106',
    resourceGroupName: rg.name,
    keyVaultId: kv.id,
})
```

Output :

```bash
λ pulumi up
Updating (dev)

     Type                                  Name                                       Status            Info
     pulumi:pulumi:Stack                   app-services-cert-dev
 +   └─ azure-maif:certificate:asc         cert-wildcard-foo-bar-domain-tld-20230106  created (1s)
 +      └─ pulumi-nodejs:dynamic:Resource  asc-wildcard-foo-bar-domain-tld-20230106   created (20s)

Outputs:
  + cert: {
      + autoRenew              : true
      + certificateOrderName   : "asc-wildcard-foo-bar-domain-tld"
      + certificateURI         : "https://kv-asc-foobar.vault.azure.net/secrets/asc-wildcard-foo-bar-domain-tld-20230106"
      + domainVerificationToken: "2j7indfubi3228os1seelu37a4"
      + fqdn                   : "*.foo.bar.domain.tld"
      + keyVaultId             : "/subscriptions/<xxx-xxx-xxxx>/resourceGroups/rg-test-app-serv-cert/providers/Microsoft.KeyVault/vaults/kv-asc-foobar"
      + keyVaultSecretName     : "asc-wildcard-foo-bar-domain-tld-20230106"
      + resourceGroupName      : "rg-test-app-serv-cert"
      + suffix                 : "20230106"
      + urn                    : "urn:pulumi:dev::app-services-cert::stawen:azure-certificate:asc::cert-wildcard-foo-bar-domain-tld-20230106"
    }
```

You will notice that the component creates Pulumi ressource name automatically and also the Azure ASC resources name.

This names is based on the fqdn and the suffix properties

### Use the provider directly

```typescript
import * as azc from '@stawen/azure-certificate'

export const cert = new azc.AscCertificateOrder(`pulumi-certificate`, {
    fqdn: '*.foo.bar.domain.tld',
    autoRenew: true,
    suffix: '20230106',
    resourceGroupName: rg.name,
    keyVaultId: kv.id,
})
```

Output :

```bash
λ pulumi up
Updating (dev)

     Type                                  Name                   Status            Info
     pulumi:pulumi:Stack                   app-services-cert-dev
 +   └─ pulumi-nodejs:dynamic:Resource     pulumi-certificate     created (20s)


Outputs:
  + cert: {
      + autoRenew              : true
      + certificateOrderName   : "asc-wildcard-foo-bar-domain-tld"
      + certificateURI         : "https://kv-asc-foobar.vault.azure.net/secrets/asc-wildcard-foo-bar-domain-tld-20230106"
      + domainVerificationToken: "2j7indfubi3228os1seelu37a4"
      + fqdn                   : "*.foo.bar.domain.tld"
      + keyVaultId             : "/subscriptions/<xxx-xxx-xxxx>/resourceGroups/rg-test-app-serv-cert/providers/Microsoft.KeyVault/vaults/kv-asc-foobar"
      + keyVaultSecretName     : "asc-wildcard-foo-bar-domain-tld-20230106"
      + resourceGroupName      : "rg-test-app-serv-cert"
      + suffix                 : "20230106"
      + urn                    : "urn:pulumi:dev::app-services-cert::pulumi-nodejs:dynamic:Resource::pulumi-certificate"
    }
```

### Complet Example

You wil find a complet example in this [examples](./examples/) directory

# Knows Issues

At first, property `suffix` was not mandatory. But when i run `pulumi refresh` for a CertificateOrder without `suffix`, i've got this :

```bash
pulumi refresh

Error: Unexpected struct type.: Error: Unexpected struct type.
        at proto.google.protobuf.Value.fromJavaScript (/Users/workspaces/fu/cloud-platform-azure/divers/app-services-certificates/node_modules/google-protobuf/google/protobuf/struct_pb.js:885:13)
        at proto.google.protobuf.Struct.fromJavaScript (/Users/workspaces/fu/cloud-platform-azure/divers/app-services-certificates/node_modules/google-protobuf/google/protobuf/struct_pb.js:951:51)
        at Object.<anonymous> (/Users/workspaces/fu/cloud-platform-azure/divers/app-services-certificates/node_modules/@pulumi/pulumi/cmd/dynamic-provider/index.js:238:55)
        at Generator.next (<anonymous>)
        at fulfilled (/Users/workspaces/fu/cloud-platform-azure/divers/app-services-certificates/node_modules/@pulumi/pulumi/cmd/dynamic-provider/index.js:18:58)
        at process.processTicksAndRejections (node:internal/process/task_queues:95:5)

    error: preview failed
```

All the code is ready to managed optionnal suffix property, it's work when `suffix` is set.

So, i decide, for now, `suffix` will be mandatory until this issues is fixed.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)

## Contribute

See [CONTRIBUTING.md](./CONTRIBUTING.md)
