import { sha512_256 } from 'js-sha512'
import type { ExtendedTxn, Provider } from "../contracts"
import { decodeSignedTransaction } from 'algosdk'

export function verifyTxns<B>(provider: Provider, txns: Array<ExtendedTxn<B>>) {
  if (provider.serverSecret) {
    for (let i = 0; i < txns.length; i++) {
      const txn = txns[0]
  
      if (txn) {
        const decodedTxn = decodeTxn(provider, txn.blob)
  
        const txnSignature = sha512_256.hmac(provider.serverSecret, decodedTxn.txn.txID())
  
        if (txnSignature !== txn.signature) {
          throw new Error(`Transaction ${i} has an invalid signature. This transaction was either modified on the client side or was not requested from the server before signing.`)
        }
      }
    }
  } else {
    throw new Error('No server secret set to verify the transactions with.')
  }
}

export function decodeTxn<B>(provider: Provider, txn: ExtendedTxn<B>['blob']) {
  if (provider.transactionBlobEncoding === 'Uint8Array') {
    return decodeSignedTransaction(txn as Uint8Array)
  } else {
    return decodeSignedTransaction(new Uint8Array(Buffer.from(txn as string, 'base64')))
  }
}