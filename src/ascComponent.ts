/**
 * @author Stanislas Draunet (https://github.com/stawen)
 * @copyright MAIF / Cloud Platform Public - Azure
 */
import * as pulumi from '@pulumi/pulumi'

import { AscCertificateOrder } from './ascRessources'
import { AscCertificateOrderProvider, AscCertificateOrderRessourceInputs } from './ascRessourcesProvider'

/**
 * CertificateOrder Component
 *
 * Create an App Service Certificate ressource and the certificate store into a Keyvault
 *
 * @example
 * ```ts
 * const asc = new CertificateOrder({
 *   fqdn: '*.foo.domain.tld',
 *   autoRenew: true,
 *   suffix: '20221230',
 *   resourceGroupName: rg.name,
 *   keyVaultId: kv.id,
 * })
 * ```
 *
 * @param args CertificateOrderInputs
 * @param args.resourceGroupName Ressource Group Name where ASC will be created
 * @param args.keyVaultId KeyVault ID where Certificate will be stored
 * @param args.fqdn FQDN how will be protected
 * @param args.autoRenew if True, autoRenew Certificate is set
 * @param args.suffix (Optional) suffix will be added at the end of certificate name
 * @param opts (Optional) pulumi.CustomResourceOptions
 *
 * @returns AscCertificateOrderOutputs include domainVerificationToken
 *
 */
export class CertificateOrder extends pulumi.ComponentResource {
    public readonly resourceGroupName: pulumi.Output<string>
    public readonly keyVaultId: pulumi.Output<string>
    public readonly fqdn: pulumi.Output<string>
    public readonly autoRenew: pulumi.Output<boolean>
    public readonly suffix: pulumi.Output<string>
    public readonly certificateOrderName: pulumi.Output<string>
    public readonly keyVaultSecretName: pulumi.Output<string>
    public readonly certificateURI: pulumi.Output<string>
    public readonly domainVerificationToken: pulumi.Output<string>

    constructor(args: AscCertificateOrderRessourceInputs, opts?: pulumi.CustomResourceOptions) {
        const commonName = AscCertificateOrderProvider.normalizeFqdn(`${args.fqdn}`, `${args.suffix}`)

        super('stawen:azure-certificate:asc', `cert-${commonName}`, {}, opts)

        const asc = new AscCertificateOrder(`asc-${commonName}`, args, {
            parent: this,
        })

        this.autoRenew = asc.autoRenew
        this.certificateOrderName = asc.certificateOrderName
        this.certificateURI = asc.certificateURI
        this.domainVerificationToken = asc.domainVerificationToken
        this.fqdn = asc.fqdn
        this.keyVaultId = asc.keyVaultId
        this.keyVaultSecretName = asc.keyVaultSecretName
        this.resourceGroupName = asc.resourceGroupName
        this.suffix = asc.suffix
    }
}
