import { Indexer, Algodv2, BaseHTTPClient, Transaction } from "algosdk"
import { AlgodTokenHeader, CustomTokenHeader, IndexerTokenHeader } from "algosdk/src/client/urlTokenBaseHTTPClient"
import { FixedBid } from './interface/fixedBid/index'
import { RevenueSink } from './interface/acRevenueSink/index'
import { verifyTxns } from './functions/verify'

export interface Provider {
  indexer: Indexer
  algod: Algodv2
  MIN_BALANCE_FEE: number
  extendedTransactionFormat: boolean
  serverSecret: string | undefined
  transactionBlobEncoding: 'Uint8Array' | 'Base64'
}

export type TxnArray = Array<Transaction>

export type Base64 = string

export interface ExtendedTxn<B> {
  description: string
  blob: B extends 'Uint8Array' ? Uint8Array : Base64
  txID: string
  signers: Array<string>
  signature?: string
}

export type ExtendedTxnArray<B> = Array<ExtendedTxn<B>>

export type ExtendOrDefault<T, B> = T extends true ? ExtendedTxnArray<B> : TxnArray

export class Contracts<E extends boolean, B extends 'Uint8Array' | 'Base64'> {

  indexer: Indexer
  algod: Algodv2
  MIN_BALANCE_FEE: number
  extendedTransactionFormat: E
  serverSecret: string | undefined
  transactionBlobEncoding: B
  /**
   * List one or multiple tokens of an ASA for a fixed price.
   */
  fixedBid: FixedBid<E, B>
  /**
   * A revenue sink can be used to let an account receive sales revenue in ASA currencies while they are opted out. This contract will function as an on-chain proof of reserves which the recipient of the revenue can claim when they eventually opt into the ASA currency.
   */
  acRevenueSink: RevenueSink

  constructor(provider: { 
    indexer: { 
      baseServer: string,
      portNet: string,
      token: string | IndexerTokenHeader | CustomTokenHeader |  BaseHTTPClient
    },
    algod: {
      baseServer: string,
      portNet: string
      token: string | AlgodTokenHeader | CustomTokenHeader |  BaseHTTPClient
    },
    /**
     * Overwrite the default min balance fee for ASA opt-ins. Only use this in case the min balance fee changes in the future from the current default of 0.1 Algo.
     */
    minBalanceFee?: number
    /**
     * Extend the return format of the contract functions. When enabled, the functions will not just return the standard AlgoSDK transaction format but will add additional fields to make working with the transactions easier in a server plus client-side setup.
     */
    extendedTransactionFormat?: E
    /**
     * If a secret is given and the `extendedTransactionFormat` is enabled, the return format will include a signed hash based on the `txID` and signed with the secret. This will enable the system on the server to verify that the submitted transactions from the client were provided by the server and have not been altered.
     */
    serverSecret?: string
    /**
     * If `extendedTransactionFormat` is enabled, this option will change te encoding of the original transaction in the `blob` field.
     */
    transactionBlobEncoding?: B
  }) {
    this.MIN_BALANCE_FEE = provider.minBalanceFee || 100000
    this.extendedTransactionFormat = provider.extendedTransactionFormat || false as E
    this.serverSecret = provider.serverSecret || undefined
    this.transactionBlobEncoding = provider.transactionBlobEncoding || 'Uint8Array' as B
    this.indexer = new Indexer(
      provider.indexer.token, 
      provider.indexer.baseServer,
      provider.indexer.portNet
    )
    this.algod = new Algodv2(
      provider.algod.token, 
      provider.algod.baseServer,
      provider.algod.portNet
    )
    this.fixedBid = new FixedBid(this, this.extendedTransactionFormat, this.transactionBlobEncoding)
    this.acRevenueSink = new RevenueSink(this)
  }

  /**
   * Verify if the provided transactions originated from the server by checking the txID against the server signature.
   */
  verifyTxns (txns: Array<ExtendedTxn<B>>) {
    verifyTxns(this, txns)
  }
}