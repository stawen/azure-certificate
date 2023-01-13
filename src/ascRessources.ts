/**
 * @author Stanislas Draunet (https://github.com/stawen)
 * @copyright MAIF / Cloud Platform Public - Azure
 */
import * as pulumi from '@pulumi/pulumi'

import { AscCertificateOrderProvider, AscCertificateOrderRessourceInputs } from './ascRessourcesProvider'

/**
 * Create an App Service Certificate and store certificate DV into a KeyVault Secret
 *
 * @example
 * ```ts
 * const asc = new AscCertificateOrder(`pulumi-asc-foo.domain.tld`, {
 *  fqdn: 'foo.domain.tld',
 *  suffix: '20221230',
 *  autoRenew: false,
 *  resourceGroupName: rg.name,
 *  keyVaultId: kv.id,
 * })
 * ```
 * 
 * @extends pulumi.dynamic.Resource
 * @param name - unique ressource name
 * @param args - AscCertificateOrderRessourceInputs Interface
 * @param opts - (optional) pulumi.CustomResourceOptions
 *

 */
export class AscCertificateOrder extends pulumi.dynamic.Resource {
    public readonly resourceGroupName!: pulumi.Output<string>
    public readonly keyVaultId!: pulumi.Output<string>
    public readonly fqdn!: pulumi.Output<string>
    public readonly autoRenew!: pulumi.Output<boolean>
    public readonly suffix!: pulumi.Output<string>
    public readonly certificateOrderName!: pulumi.Output<string>
    public readonly keyVaultSecretName!: pulumi.Output<string>
    public readonly certificateURI!: pulumi.Output<string>
    public readonly domainVerificationToken!: pulumi.Output<string>

    constructor(name: string, args: AscCertificateOrderRessourceInputs, opts?: pulumi.CustomResourceOptions) {
        let subscriptionId: string
        try {
            // Check if Azure native provider is available
            subscriptionId = new pulumi.Config('azure-native').require('subscriptionId')
        } catch {
            // Otherwise, check Azure Classic provider is available
            try {
                subscriptionId = new pulumi.Config('azure').require('subscriptionId')
            } catch {
                throw 'No Subscription ID found. You must specify it in your pulumi.<stack>.yaml, with property azure-native:subscriptionId OR azure:subscriptionId'
            }
        }
        let tenantId: string
        try {
            // Check if Azure native provider is available
            tenantId = new pulumi.Config('azure-native').require('tenantId')
        } catch {
            // Otherwise, check Azure Classic provider is available
            try {
                tenantId = new pulumi.Config('azure').require('tenantId')
            } catch {
                throw 'No Tenant ID found. You must specify it in your pulumi.<stack>.yaml, with property azure-native:tenantId OR azure:tenantId'
            }
        }

        super(
            new AscCertificateOrderProvider({ subscriptionId, tenantId }),
            name,
            {
                ...args,
                certificateOrderName: undefined,
                keyVaultSecretName: undefined,
                productType: undefined,
                certificateURI: undefined,
                domainVerificationToken: undefined,
            },
            opts,
        )
    }
}
