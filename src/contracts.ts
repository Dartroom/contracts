import { Indexer, Algodv2, BaseHTTPClient, Transaction } from "algosdk"
import { FixedBid } from './interface/fixedBid/index'
import { RevenueSink } from './interface/acRevenueSink/index'
import { verifyTxns } from './functions/verify'
import { TxnFormatter } from "./functions/txn"

export interface AlgodTokenHeader {
  'X-Algo-API-Token': string;
}

export interface IndexerTokenHeader {
  'X-Indexer-API-Token': string;
}

export interface CustomTokenHeader {
  [headerName: string]: string;
}

export interface Provider {
  indexer: Indexer
  algod: Algodv2
  MIN_BALANCE_FEE: number
  extendedTransactionFormat: boolean
  serverSecret: string | undefined
  transactionBlobEncoding: 'Uint8Array' | 'Base64'
  authAddress: boolean
  signature: boolean
}

export type TxnArray = Array<Transaction>

export type Base64 = string

export type ExtendedTxn<B, S, A> = RemoveSignature<RemoveAuthAddress<ExtendedTxnBase<B>, A>, S>

type RemoveSignature<Type, S> = {
  [Property in keyof Type as S extends true ? Property : Exclude<Property, "signature">]: Type[Property]
};

type RemoveAuthAddress<Type, A> = {
  [Property in keyof Type as A extends true ? Property : Exclude<Property, "authAddress">]: Type[Property]
};

interface ExtendedTxnBase<B> {
  description: string
  blob: B extends 'Uint8Array' ? Uint8Array : Base64
  txID: string
  signers: Array<string>
  signature: string
  authAddress: string
}

export type ExtendedTxnArray<B, S, A> = Array<ExtendedTxn<B, S, A>>

export type ExtendOrDefault<T, B, S, A> = T extends true ? ExtendedTxnArray<B, S, A> : TxnArray

export class Contracts<E extends boolean, B extends 'Uint8Array' | 'Base64', S extends boolean, A extends boolean> {

  indexer: Indexer
  algod: Algodv2
  MIN_BALANCE_FEE: number
  extendedTransactionFormat: E
  serverSecret: string | undefined
  signature: S
  transactionBlobEncoding: B
  authAddress: A
  /**
   * List one or multiple tokens of an ASA for a fixed price.
   */
  fixedBid: FixedBid<E, B, S, A>
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
    /**
     * Include the authAddress field in the transaction array return format. Some wallet apps and extensions, such as the AlgoSigner, require the auth field to support rekeyed accounts.
     */
    authAddress: A
    /**
     * Include the server signature in the transaction array return format. The signature will be a hash of the txID signed with the server secret. The signature can be used to validate that a transaction sent back from the fronted was proposed by the server.
     * 
     * Note that you must provide a server secret to create server signatures.
     */
    signature: S
  }) {
    this.MIN_BALANCE_FEE = provider.minBalanceFee || 100000
    this.extendedTransactionFormat = provider.extendedTransactionFormat || false as E
    this.serverSecret = provider.serverSecret || undefined
    this.signature = provider.signature
    this.authAddress = provider.authAddress
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
    this.fixedBid = new FixedBid(this, this.extendedTransactionFormat, this.transactionBlobEncoding, this.signature, this.authAddress)
    this.acRevenueSink = new RevenueSink(this)
  }

  /**
   * Verify if the provided transactions originated from the server by checking the txID against the server signature.
   */
  verifyTxns (...elements: Array<Array<ExtendedTxn<B, S, A>>>) {
    for (let i = 0; i < arguments.length; i++) {
      const txns = elements[i] as unknown as Array<ExtendedTxn<'Uint8Array' | 'Base64', boolean, boolean>>
      verifyTxns(this, txns)
    }
  }

  /**
   * Create a new Transaction formatter instance. With the formatter you can create a new transaction array in the same format as the contract package returns.
   */
  newTxnFormatter () {
    return new TxnFormatter<E, B, S, A>(this)
  }
}