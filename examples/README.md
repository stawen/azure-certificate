# Pulumi Example

## Pulumi.[stack].yml

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

set your azure login name

```yaml
user:name: name@domain.tld
```

## Init Pulumi project

```bash
npm install
pulumi up
```
