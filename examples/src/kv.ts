import * as keyvault from '@pulumi/azure-native/keyvault'
import * as resources from '@pulumi/azure-native/resources'
import { keyvault as keyvaultEnums } from '@pulumi/azure-native/types/enums'
import * as azuread from '@pulumi/azuread'
import * as pulumi from '@pulumi/pulumi'
import * as random from '@pulumi/random'

export const tenantId = new pulumi.Config('azure-native').require('tenantId')
const userName = new pulumi.Config('user').require('name')

const rgName = `rg-app-serv-cert-foo`
export const rg = new resources.ResourceGroup(rgName, {
    resourceGroupName: rgName,
})

//MANDATORY DO NOT CHANGE
// ADD Microsoft.Azure.CertificateRegistration acces to kv
const certificateRegistration = azuread.getServicePrincipal({
    displayName: 'Microsoft.Azure.CertificateRegistration',
})
// ADD App Service Identity
const azureAppServiceRegistration = azuread.getServicePrincipal({
    displayName: 'Microsoft Azure App Service',
})

const userObjectId = azuread.getUser({
    userPrincipalName: userName,
})

const randomSuffix = new random.RandomString(`kv-rnd-name`, {
    length: 5,
    upper: false,
    special: false,
})

export const kvName = pulumi.interpolate`kv-test-asc-${randomSuffix.result}`

export const kv = kvName.apply((name) => {
    return new keyvault.Vault(
        name,
        {
            vaultName: name,
            resourceGroupName: rg.name,
            properties: {
                accessPolicies: [
                    {
                        objectId: certificateRegistration.then((sp) => sp.id),
                        permissions: {
                            secrets: [keyvaultEnums.SecretPermissions.All],
                            certificates: [keyvaultEnums.CertificatePermissions.All],
                        },
                        tenantId: tenantId,
                    },
                    {
                        objectId: azureAppServiceRegistration.then((sp) => sp.id),
                        permissions: {
                            secrets: [keyvaultEnums.SecretPermissions.Get],
                            certificates: [keyvaultEnums.CertificatePermissions.Get],
                        },
                        tenantId: tenantId,
                    },
                    {
                        objectId: userObjectId.then((o) => o.id), // It's Your User Object ID
                        permissions: {
                            certificates: [keyvaultEnums.CertificatePermissions.All],
                            keys: [keyvaultEnums.KeyPermissions.All],
                            secrets: [keyvaultEnums.SecretPermissions.All],
                        },
                        tenantId: tenantId,
                    },
                ],
                enabledForDeployment: true,
                enabledForDiskEncryption: true,
                enabledForTemplateDeployment: true,
                enableSoftDelete: true,

                enableRbacAuthorization: false,
                networkAcls: {
                    defaultAction: keyvaultEnums.NetworkRuleAction.Deny,
                    bypass: keyvaultEnums.NetworkRuleBypassOptions.AzureServices,
                },

                sku: {
                    family: keyvaultEnums.SkuFamily.A,
                    name: keyvaultEnums.SkuName.Standard,
                },
                tenantId,
            },
        },
        { ignoreChanges: ['properties'] },
    )
})
