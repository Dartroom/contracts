import { Indexer, Algodv2, BaseHTTPClient, Transaction } from "algosdk"
import { AlgodTokenHeader, CustomTokenHeader, IndexerTokenHeader } from "algosdk/dist/types/src/client/urlTokenBaseHTTPClient"

import deployAuction, { DeployAuctionParams } from "./interface/deployAuction"
import setupAuction, { SetupAuctionParams } from "./interface/setupAuction"
import getAuctionGlobalState, { GetAuctionParams } from "./interface/getAuctionGlobalState"
import getAuctionInfo from "./interface/getAuctionInfo"

export interface Provider {
  indexer: Indexer
  algod: Algodv2
}

export type TxnArray = Promise<Array<Transaction>>

export default class Contracts {

  indexer: Indexer
  algod: Algodv2

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
    }
  }) {
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
  }
  
  /**
   * Generates the `makeApplicationCreateTxn()` transaction for a reserve auction. A different contract gets used depending on the type of currency that the auction uses. 
   * 
   * If the `currencyIndex` is not provided or is set to `0`, then Algorand will be used as the auction currency. Otherwise, the provided currency will be used. Note that Algorand and ASA currencies use different contracts.
   * 
   * @param {string} params.creatorAddress - Algorand address of the wallet that deploys the auction contract.
   * @param {string} params.payoutAddress - Algorand address to which the seller share will be paid out to.
   * @param {string} params.managerAddress - Algorand address to which the manager share will be paid out to.
   * @param {number} params.sellerShare - Percentage of the funds paid out to the seller of the NFT.
   * @param {number} params.artistShare - Percentage of the funds paid out to the creator of the NFT.
   * @param {number} params.managerShare - Percentage of the funds paid out to the manager of the auction.
   * @param {number} params.reservePrice - Minimum bid amount to start the auction.
   * @param {number} params.nftIndex - ASA index of the NFT.
   * @param {number} params.duration - Duration of the auction after the first bid gets placed in Algorand blocks (rounds).
   * @param {number} params.currencyIndex - ASA index of the currency used to bid and settle the auction.
   * @param {number} params.extensionTime - Minimum time in blocks left after a bid is placed. If the time is lower than this minimum and a bid is placed then the time gets increased to the minimum. (AKA anti-snipe)
   * @return Promise<algosdk.Transaction[]> 
   */
  deployAuction (params: DeployAuctionParams) {
    return deployAuction(this, params)
  }

  /**
   * Generates transactions to complete the auction setup. The function checks the global state of the auction and balances of the contract address to ensure the auction is still unset.
   * 
   * - txns[0]: `pay` - min. balance payment to the contract address
   * - txns[1]: `appl` - opt the contract into the NFT ASA (and the currency ASA)
   * - txns[2]: `axfer` transfer NFT to the contract address
   * 
   * @param {number} params.appId - Application index of the auction contract.
   * @return Promise<algosdk.Transaction[]>
   */
  setupAuction (params: SetupAuctionParams) {
    return setupAuction(this, params)
  }
  
  /**
   * Fetches and parses the Global State of the auction contract and returns the info in an object.
   * 
   * @param {number} params.appId - Application index of the auction contract. 
   * @returns Promise<GlobalState> 
   */
  getAuctionGlobalState (params: GetAuctionParams) {
    return getAuctionGlobalState(this, params)
  }

  /**
   * Return information about the current state of the contract, including the full Global State and bid history.
   * 
   * @param {number} params.appId - Application index of the auction contract. 
   * @returns
   */
  getAuctionInfo (params: GetAuctionParams) {
    return getAuctionInfo(this, params)
  }
}

