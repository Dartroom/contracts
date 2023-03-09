import { encodeUnsignedTransaction } from 'algosdk'
import { Transaction, assignGroupID } from 'algosdk'
import type { ExtendedTxn, Provider } from "../contracts"
import { sha512_256 } from 'js-sha512'

interface Txn {
  description: string,
  txn: Transaction,
  signers: Array<string>
}

export interface ExtendedTxnUnEncoded {
  description: string
  txn: Transaction
  txID: string
  signers: Array<string>
  signature?: string
}

export class TxnFormatter {

  private txns: Array<ExtendedTxnUnEncoded | Transaction>
  private provider: Provider

  constructor (provider: Provider) {
    this.txns = []
    this.provider = provider
  }

  push (...elements: Txn[]): void {
    for (let i = 0; i < arguments.length; i++) {
      const txn = elements[i]

      if (txn) {
        if (this.provider.extendedTransactionFormat) {
          const txID = txn.txn.txID()

          this.txns.push({
            description: txn.description,
            txn: txn.txn,
            txID: txID,
            signers: txn.signers,
            signature: this.signTxn(txID)
          })
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
      return undefined
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
      const txns = this.txns as Array<ExtendedTxnUnEncoded>
      const rawTxns = txns.map((txn) => txn.txn)

      const groupedTxns = assignGroupID(rawTxns)

      this.txns = groupedTxns.map((groupedTxn, index) => {
        return {
          ...txns[index] as ExtendedTxnUnEncoded,
          txn: groupedTxn
        }
      })
    } else {
      this.txns = assignGroupID(this.txns as Array<Transaction>)
    }
  }

  getTxns(): Array<ExtendedTxn<string> | Transaction> {
    if (this.provider.extendedTransactionFormat) {
      const tnxs = this.txns.map((unencodedTxn) => {
        const { txn, ...data } = unencodedTxn as ExtendedTxnUnEncoded

        return {
          ...data,
          blob: this.encodeTxn(txn) 
        }
      }) as Array<ExtendedTxn<string>>

      return tnxs
    } else {
      return this.txns as Array<Transaction>
    }
  }
}