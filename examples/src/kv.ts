import * as pulumi from '@pulumi/pulumi'
import * as resources from '@pulumi/azure-native/resources'
import * as keyvault from '@pulumi/azure-native/keyvault'
import { keyvault as keyvaultEnums } from '@pulumi/azure-native/types/enums'
import * as azuread from '@pulumi/azuread'

export const tenantId = new pulumi.Config('azure-native').require('tenantId')
const userName = new pulumi.Config('user').require('name')

// Common ressource group
const rgName = `rg-test-app-serv-cert`
export const rg = new resources.ResourceGroup(rgName, {
    resourceGroupName: rgName,
})

//MANDATORY DO NOT CHANGE
// ADD Microsoft.Azure.CertificateRegistration acces to kv
const certificateRegistration = azuread.getServicePrincipal({
    displayName: 'Microsoft.Azure.CertificateRegistration',
})
// Not sure mandatory, App Service can get a cert into this kv
const azureAppServiceRegistration = azuread.getServicePrincipal({
    displayName: 'Microsoft Azure App Service',
})

const userObjectId = azuread.getServicePrincipal({
    displayName: userName,
})

const kvname = `kv-asc-foobar`

export const kv = new keyvault.Vault(
    kvname,
    {
        vaultName: kvname,
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
                    objectId: userObjectId, // Your User Object ID
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
            // enablePurgeProtection: false,
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
