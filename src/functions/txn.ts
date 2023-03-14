import { encodeUnsignedTransaction, decodeUnsignedTransaction } from 'algosdk'
import { Transaction, assignGroupID } from 'algosdk'
import type { ExtendOrDefault, Provider } from "../contracts"
import { sha512_256 } from 'js-sha512'

interface Txn {
  description: string,
  txn: Transaction,
  signers: Array<string>
  authAddress?: string
}

export interface ExtendedTxnUnEncoded {
  description: string
  txn: Transaction
  txID: string
  signers: Array<string>
  signature?: string
  authAddress?: string
}

export class TxnFormatter<E, B, S, A> {

  txns: Array<ExtendedTxnUnEncoded | Transaction>
  private provider: Provider
  private extendedTransactionFormat: E
  private transactionBlobEncoding: B
  private signature: S
  private authAddress: A

  constructor (provider: Provider) {
    this.txns = []
    this.provider = provider
    this.extendedTransactionFormat = provider.extendedTransactionFormat as E
    this.transactionBlobEncoding = provider.transactionBlobEncoding as B
    this.signature = provider.signature as S
    this.authAddress = provider.authAddress as A
  }

  push (...elements: Txn[]): void {
    for (let i = 0; i < arguments.length; i++) {
      const txn = elements[i]

      if (txn) {
        if (this.provider.extendedTransactionFormat) {
          const txID = txn.txn.txID()

          let format = {
            description: txn.description,
            txn: decodeUnsignedTransaction(encodeUnsignedTransaction(txn.txn)),
            txID: txID,
            signers: txn.signers,
          } as ExtendedTxnUnEncoded

          if (this.signature) {
            format['signature'] = this.signTxn(txID)
          }

          if (this.authAddress) {
            format['authAddress'] = txn.authAddress || txn.signers[0]
          }

          this.txns.push(format)
        } else {
          this.txns.push(txn.txn)
        }
      }
    }
  }

  private signTxn (txID: string) {
    if (this.provider.serverSecret) {
      return sha512_256.hmac(this.provider.serverSecret, txID)
    } else {
      throw new Error('No server secret set to sign the transactions with.')
    }
  }

  private encodeTxn (txn: Transaction) {
    const encodedTxn = encodeUnsignedTransaction(txn)

    if (this.provider.transactionBlobEncoding === 'Uint8Array') {
      return encodedTxn
    }

    return Buffer.from(encodedTxn).toString('base64')
  }

  assignGroupID () {
    if (this.provider.extendedTransactionFormat) {
      assignGroupID((this.txns as Array<ExtendedTxnUnEncoded>).map((txn) => txn.txn))
    } else {
      assignGroupID(this.txns as Array<Transaction>)
    }
  }

  getTxns(): ExtendOrDefault<E, B, S, A> {
    if (this.provider.extendedTransactionFormat) {
      const tnxs = this.txns.map((unencodedTxn) => {
        const { txn, ...data } = unencodedTxn as ExtendedTxnUnEncoded

        return {
          ...data,
          blob: this.encodeTxn(txn)
        }
      })

      return tnxs as unknown as ExtendOrDefault<E, B, S, A>
    } else {
      return this.txns as unknown as ExtendOrDefault<E, B, S, A>
    }
  }
}