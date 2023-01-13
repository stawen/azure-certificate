import * as pulumi from '@pulumi/pulumi'
import * as azc from '@stawen/azure-certificate'

// For local dev, uncomment this line, and comment previous line
// import * as azc from '../../index'
import { kv, rg } from './kv'

// With config in pulumi.<stack>.yaml
interface CertInputs {
    fqdn: string
    autoRenew: boolean
    suffix: string
}

const parameters: CertInputs[] = new pulumi.Config('asc').requireObject<CertInputs[]>('certificates')

for (const param of parameters) {
    new azc.CertificateOrder({
        fqdn: param.fqdn,
        autoRenew: param.autoRenew,
        suffix: param.suffix,
        resourceGroupName: rg.name,
        keyVaultId: kv.id,
    })
}
