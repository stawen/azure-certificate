# Pulumi Example

## Pulumi.[stack].yml

In this file, you must specify

If you're using Azure Native :

```yaml
config:
  azure-native:environment: public
  azure-native:location: <location>
  azure-native:subscriptionId: <xxxx-xxxx>
  azure-native:tenantId: <xxxx-xxxx>
```

If you're using Azure Classic :

```yaml
config:
  azure:environment: public
  azure:location: <location>
  azure:subscriptionId: <xxxx-xxxx>
  azure:tenantId: <xxxx-xxxx>
```

Set your Azure login name :

```yaml
user:name: name@domain.tld
```

You will need to set your name, otherwise you will not be able to access the keyvault because it is configured in AccessPolicy and not RBAC

## Init Pulumi project

```bash
npm install
pulumi up
```
