/**
 * @author Stanislas Draunet (https://github.com/stawen)
 * @copyright MAIF / Cloud Platform Public - Azure
 */
import { WebSiteManagementClient } from '@azure/arm-appservice'
import { DefaultAzureCredential } from '@azure/identity'
import * as pulumi from '@pulumi/pulumi'

/**
 * Certificate product Type :
 *
 * - StandardDomainValidatedSsl
 * - StandardDomainValidatedWildCardSsl
 */
enum CertificateProductType {
    StandardDomainValidatedSsl = 'StandardDomainValidatedSsl',
    StandardDomainValidatedWildCardSsl = 'StandardDomainValidatedWildCardSsl',
}

/**
 * Interface for AscCertificateOrder Class
 * @param resourceGroupName - Ressource Group Name where ASC will be created
 * @param keyVaultId - KeyVault ID where Certificate will be stored
 * @param fqdn - FQDN how will be protected
 * @param autoRenew - Default false
 * @param suffix - (optional) suffix must be unique and it's added at the end of certificate name
 */
export interface AscCertificateOrderRessourceInputs {
    resourceGroupName: pulumi.Input<string>
    keyVaultId: pulumi.Input<string>
    fqdn: pulumi.Input<string>
    autoRenew: pulumi.Input<boolean>
    suffix: pulumi.Input<string>
}

/**
 * Same properties as AscCertificateOrderRessourceInputs
 */
interface AscCertificateOrderInputs {
    resourceGroupName: string
    keyVaultId: string
    fqdn: string
    autoRenew: boolean
    suffix: string
}

/**
 * Interface internal preparing output values
 * @param certificateOrderName - Final name of App Service Certificate
 * @param keyVaultSecretName - Final name of Keyvault Secret name of Azure Certificate Managed services (same name as ascCertificateOrderName)
 * @param productType - Choice in enum CertificateProductType
 * @param certificateURI - Secret Keyvault URI of certificate
 */
interface AscCertificatePrepareOutputs {
    certificateOrderName: string
    keyVaultSecretName: string
    productType: string
    certificateURI: string
}

/**
 * Concat Inputs Properties and Prepare Outputs properties
 */
export interface AscCertificateOrderOutputs extends AscCertificateOrderInputs, AscCertificatePrepareOutputs {
    domainVerificationToken: string
}

/**
 * Class AscCertificateOrderProvider (Internal) as Pulumi Dynamic Provider
 *
 * This class isn't into Pulumi stack Context (important to understand)
 *
 * @param subscriptionId - Sub Id where is the Kv and where you storge your App Service Certificate
 */
export class AscCertificateOrderProvider implements pulumi.dynamic.ResourceProvider {
    private linkToKvName: string = `link-to-kv`
    private location: string = 'Global'
    private subscriptionId: string
    private tenantId: string

    constructor(args: { subscriptionId: string; tenantId: string }) {
        this.subscriptionId = args.subscriptionId
        this.tenantId = args.tenantId
    }

    /**
     * Escape Regex Expression
     * @param str
     * @returns Fully functional regex
     */
    public static escapeRegExp(str: string): string {
        return str.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
    }

    /**
     * Replace all characters with another char
     * @param str - string who will be transform
     * @param find - char who will be find
     * @param replace - char replacement
     * @returns string
     */
    public static replaceAll(str: string, find: string, replace: string): string {
        return str.replace(new RegExp(AscCertificateOrderProvider.escapeRegExp(find), 'g'), replace)
    }

    /**
     * Test if FQDN start with '*'
     * @param fqdn - FQDN to test
     * @returns boolean - true if FQDN start with '*' otherwise false
     */
    public static isWildcard(fqdn: string) {
        return fqdn.startsWith('*')
    }

    /**
     * Create final ressource name
     *
     * Test if fqdn start with * and replace it with 'wildcard'
     *
     * Replace all '.' by '-'
     *
     * Add suffix at the end if is set
     * @param fqdn
     * @param suffix
     * @returns normalized fqdn
     */
    public static normalizeFqdn(fqdn: string, suffix?: string | undefined): string {
        let response: string = fqdn

        //replace * by wildcard and check Cert was a wildcard type
        if (AscCertificateOrderProvider.isWildcard(response)) {
            response = AscCertificateOrderProvider.replaceAll(response, '*', 'wildcard')
        }
        // Replace all '.' by '-'
        response = AscCertificateOrderProvider.replaceAll(response, '.', '-')

        if (suffix != 'undefined') {
            response = response.concat(`-${suffix}`)
        }
        return response
    }
    /**
     * @param fqdn
     * @returns A property of CertificateProductType enum
     */
    private getProductType(fqdn: string): string {
        if (AscCertificateOrderProvider.isWildcard(fqdn)) {
            return CertificateProductType.StandardDomainValidatedWildCardSsl
        } else {
            return CertificateProductType.StandardDomainValidatedSsl
        }
    }

    /**
     * Get Azure Credential
     * @returns Connection to Azure
     */
    private clientConnect(): WebSiteManagementClient {
        if (process.env.ARM_CLIENT_ID && process.env.ARM_CLIENT_SECRET) {
            //We are in a pipeline
            process.env['AZURE_CLIENT_ID'] = process.env.ARM_CLIENT_ID
            process.env['AZURE_CLIENT_SECRET'] = process.env.ARM_CLIENT_SECRET
            process.env['AZURE_TENANT_ID'] = this.tenantId
        }

        const credential = new DefaultAzureCredential()
        return new WebSiteManagementClient(credential, this.subscriptionId)
    }
    /**
     * Prepare all outputs properties
     * @param inputs args from AscCertificateOrderInputs Interface
     * @returns AscCertificatePrepareOutputs type
     */
    private prepareOutputs(inputs: AscCertificateOrderInputs): AscCertificatePrepareOutputs {
        const fqdnFormated: string = AscCertificateOrderProvider.normalizeFqdn(inputs.fqdn, inputs.suffix)
        const productType: string = this.getProductType(inputs.fqdn)

        const certificateOrderName: string = `asc-${fqdnFormated}`
        // Secre name is the same name like asc ressource name
        const keyVaultSecretName: string = certificateOrderName

        const kvName = inputs.keyVaultId.split('/').pop()

        return {
            productType: productType,
            certificateOrderName: certificateOrderName,
            keyVaultSecretName: keyVaultSecretName,
            certificateURI: `https://${kvName}.vault.azure.net/secrets/${keyVaultSecretName}`,
        }
    }

    /**
     * Call when you make a pulumi refresh
     * @param id - unique name
     * @param props - AscCertificateOrderInputs Interface
     * @returns AscCertificateOrderOutputs Interface
     */
    async read(id: string, props: AscCertificateOrderInputs): Promise<pulumi.dynamic.ReadResult> {
        const params = this.prepareOutputs(props)
        const client = this.clientConnect()

        const result = await client.appServiceCertificateOrders.get(
            props.resourceGroupName,
            params.certificateOrderName,
        )

        const outs: AscCertificateOrderOutputs = {
            certificateOrderName: params.certificateOrderName,
            autoRenew: <boolean>result.autoRenew,
            fqdn: props.fqdn,
            keyVaultId: props.keyVaultId,
            resourceGroupName: props.resourceGroupName,
            suffix: props.suffix,
            productType: params.productType,
            keyVaultSecretName: params.keyVaultSecretName,
            certificateURI: params.certificateURI,
            domainVerificationToken: <string>result.domainVerificationToken,
        }

        return {
            id,
            props: outs,
        }
    }

    /**
     * Call when 'pulumi preview' and 'pulumi up'
     *
     * Check properties compliance and Which properties are on failure otherwise, just inputs properties
     *
     * @param currentOutputs
     * @param news
     */
    async check(
        currentOutputs: AscCertificateOrderOutputs,
        news: AscCertificateOrderOutputs,
    ): Promise<pulumi.dynamic.CheckResult> {
        // If none of the properties changed, then there is nothing to be validated.
        if (
            currentOutputs.fqdn === news.fqdn &&
            currentOutputs.keyVaultId === news.keyVaultId &&
            currentOutputs.resourceGroupName === news.resourceGroupName &&
            currentOutputs.suffix === news.suffix &&
            currentOutputs.autoRenew === news.autoRenew
        ) {
            return { inputs: news }
        }

        // Otherwise, it's a news properties, we must confirm there compliance
        const failures: pulumi.dynamic.CheckFailure[] = []

        if (news.fqdn.length >= 64) {
            failures.push({
                property: 'fqdn',
                reason: 'fqdn property must be less or equal than 64 characters',
            })
        }

        if (news.suffix && news.suffix.length < 6) {
            failures.push({
                property: 'suffix',
                reason: 'suffix property must be greater or equal than 6 characters',
            })
        }

        return {
            failures,
            inputs: news,
        }
    }

    /**
     * Call when 'pulumi preview' and 'pulumi up' and AFTER check()
     *
     * Fonction verify if properties is changed or not and if the Azure ressource should be updated or replaced
     *
     * @param id
     * @param previousOutput
     * @param news
     */
    async diff(
        id: string,
        previousOutput: AscCertificateOrderOutputs,
        news: AscCertificateOrderInputs,
    ): Promise<pulumi.dynamic.DiffResult> {
        const replaces: string[] = []
        let changes = false
        let deleteBeforeReplace = false

        if (
            previousOutput.fqdn !== news.fqdn ||
            previousOutput.suffix !== news.suffix ||
            previousOutput.resourceGroupName !== news.resourceGroupName ||
            previousOutput.keyVaultId !== news.keyVaultId
        ) {
            changes = true
            deleteBeforeReplace = true

            if (previousOutput.fqdn !== news.fqdn) {
                replaces.push('fqdn')
            }
            if (previousOutput.suffix !== news.suffix) {
                replaces.push('suffix')
            }

            if (previousOutput.resourceGroupName !== news.resourceGroupName) {
                replaces.push('resourceGroupName')
            }
            if (previousOutput.keyVaultId !== news.keyVaultId) {
                replaces.push('keyVaultId')
            }
        }

        // With deleteBeforeReplace = false and Changes = true, you make an update and not a replace
        // If autorenew is changed, you make an update
        if (previousOutput.autoRenew !== news.autoRenew) {
            changes = true
        }

        return {
            deleteBeforeReplace: deleteBeforeReplace,
            replaces: replaces,
            changes: changes,
        }
    }

    /**
     * Call when 'pulumi up'
     * @param inputs
     * @returns AscCertificateOrderOutputs Interface
     */
    async create(inputs: AscCertificateOrderInputs): Promise<pulumi.dynamic.CreateResult> {
        const params = this.prepareOutputs(inputs)
        const client = this.clientConnect()

        // Create ASC Certificate
        const resultAsc = await client.appServiceCertificateOrders.beginCreateOrUpdateAndWait(
            inputs.resourceGroupName,
            params.certificateOrderName,
            {
                location: this.location,
                distinguishedName: `CN=${inputs.fqdn}`,
                autoRenew: inputs.autoRenew,
                productType: <CertificateProductType>params.productType,
            },
        )

        // Create Link to Kv
        await client.appServiceCertificateOrders.beginCreateOrUpdateCertificate(
            inputs.resourceGroupName,
            params.certificateOrderName,
            this.linkToKvName,
            {
                keyVaultId: inputs.keyVaultId,
                keyVaultSecretName: params.keyVaultSecretName,
                location: this.location,
            },
        )

        const outs: AscCertificateOrderOutputs = {
            ...inputs,
            productType: params.productType,
            certificateOrderName: params.certificateOrderName,
            keyVaultSecretName: params.keyVaultSecretName,
            certificateURI: params.certificateURI,
            domainVerificationToken: <string>resultAsc.domainVerificationToken,
        }

        return { id: params.certificateOrderName, outs: outs }
    }

    /**
     * Call when 'pulumi preview' and 'pulumi up' AFTER Check() and Diff() if Ressources will be updated
     * @param id
     * @param olds
     * @param news
     * @returns AscCertificateOrderOutputs Interface
     */
    async update(
        id: string,
        olds: AscCertificateOrderOutputs,
        news: AscCertificateOrderInputs,
    ): Promise<pulumi.dynamic.UpdateResult> {
        // Updated only if autorenew change
        const params = this.prepareOutputs(news)
        const client = this.clientConnect()

        const resultAsc = await client.appServiceCertificateOrders.update(
            news.resourceGroupName,
            params.certificateOrderName,
            {
                distinguishedName: `CN=${news.fqdn}`,
                autoRenew: news.autoRenew,
                productType: <CertificateProductType>params.productType,
            },
        )

        const outs: AscCertificateOrderOutputs = {
            ...news,
            productType: params.productType,
            certificateOrderName: params.certificateOrderName,
            keyVaultSecretName: params.keyVaultSecretName,
            certificateURI: params.certificateURI,
            domainVerificationToken: <string>resultAsc.domainVerificationToken,
        }

        return { outs: outs }
    }

    /**
     * Call when you remove your ressources from your IAC or 'Pulumi destroy'
     * @param id
     * @param props
     */
    async delete(id: string, props: AscCertificateOrderInputs) {
        const params = this.prepareOutputs(props)
        const client = this.clientConnect()

        // Delete ASC Certificate and link into Kv
        await client.appServiceCertificateOrders.delete(props.resourceGroupName, params.certificateOrderName)
    }
}
