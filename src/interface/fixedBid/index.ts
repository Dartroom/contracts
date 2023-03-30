import { deploy, DeployFixedBidParams } from './deploy'
import { setup, SetupFixedBidParams } from './setup'
import { buy, BuyFixedBidParams } from './buy'
import { deposit, DepositFixedBidParams } from './deposit'
import { extract, ExtractFixedBidParams } from './extract'
import { updatePrice, UpdatePriceFixedBidParams } from './updatePrice'
import { destroy, DestroyFixedBidParams } from './destroy'
import { getGlobalState, GetGlobalStateFixedBidParams } from './getGlobalState'
import { getStatus, GetStatusFixedBidParams } from './getStatus'
import { Contracts, Provider } from '../../contracts'
import type { ExtendOrDefault } from "../../contracts"

export class FixedBid<E extends boolean, B extends 'Uint8Array' | 'Base64', S extends boolean, A extends boolean> {

  private provider: Provider

  constructor(provider: Provider, extTxn: E, encoding: B, signed: S, auth: A) {
    this.provider = provider
  }

  /**
   * Generates the `makeApplicationCreateTxn()` transaction for a fixed bid listing. A different contract gets used depending on the type of currency that the listing uses.
   * 
   * If the `currencyIndex` is not provided or is set to `0`, then Algorand will be used as the listing currency. Otherwise, the provided currency will be used. Note that Algorand and ASA currencies use different contracts.
   * 
   * @param {string} params.sellerAddress - Algorand address of the wallet that deploys the contract.
   * @param {string} params.sellerPayoutAddress - Algorand address of the wallet that will recieve the sellers share of the revenue.
   * @param {string} params.royaltyPayoutAddress - Algorand address of the wallet that will recieve the royalty share of the revenue.
   * @param {string} params.managerPayoutAddress - Algorand address of the wallet that will recieve the managers share of the revenue.
   * @param {number} params.sellerShare - Percentage of the revenue paid out to the seller address denominted in 1/1000.
   * @param {number} params.royaltyShare - Percentage of the revenue paid out to the royalty address denominted in 1/1000.
   * @param {number} params.managerShare - Percentage of the revenue paid out to the manager address denominted in 1/1000.
   * @param {number} params.nftIndex - ASA index of the NFT.
   * @param {number} params.price - Unit price of each token to be sold in this contract.
   * @param {number} params.currencyIndex - ASA index of the currency used to settle the listing.
   * @return Promise<algosdk.Transaction[]>
   */
  deploy(params: DeployFixedBidParams): Promise<ExtendOrDefault<E, B, S, A>> {
    return deploy(this.provider, params) as Promise<ExtendOrDefault<E, B, S, A>>
  }

  /**
   * Generates the transactions to set up the contract. If `nNFTs` is not set, then the last deposit,`axfer`, transaction is not generated. More NFTs can be deposited into the listing contract with the `deposit` function.
   * 
   * - txns[0]: `pay` - min. balance payment to the contract address
   * - txns[1]: `appl` - opt the contract into the NFT ASA (and the currency ASA)
   * - txns[2]?: `axfer` - transfer NFTs to the contract address
   * 
   * @param {number} params.appId - App ID of the listing contract to be set up.
   * @param {number} params.nNFTs - Number of NFTs to be deposited into the contract.
   * @returns Promise<algosdk.Transaction[]>
   */
  setup (params: SetupFixedBidParams): Promise<ExtendOrDefault<E, B, S, A>> {
    return setup(this.provider, params) as Promise<ExtendOrDefault<E, B, S, A>>
  }

  /**
   * Deposit a number of NFTs into the listing contract.
   * 
   * - txns[0]: `axfer` - transfer NFTs to the contract address
   * 
   * @param {number} params.appId - App ID of the listing contract.
   * @param {number} params.nNFTs - Number of NFTs to be deposited into the contract.
   * @returns Promise<algosdk.Transaction[]>
   */
  deposit (params: DepositFixedBidParams): Promise<ExtendOrDefault<E, B, S, A>>  {
    return deposit(this.provider, params) as Promise<ExtendOrDefault<E, B, S, A>>
  }

  /**
   * Update the unit price of the listing. The price must be dividable by 1000. Otherwise, the revenue split can not be executed to the necessary precision.
   * 
   * Note that the price is always denoted in the base unit.
   * 
   * - txns[0]: `appl` - call the contract to update the price.
   * 
   * @param {number} params.appId - App ID of the listing contract.
   * @param {number} params.unitPrice - Number of NFTs to be deposited into the contract.
   * @returns Promise<algosdk.Transaction[]>
   */
  updatePrice(params: UpdatePriceFixedBidParams): Promise<ExtendOrDefault<E, B, S, A>>  {
    return updatePrice(this.provider, params) as Promise<ExtendOrDefault<E, B, S, A>>
  }

  /**
   * Purchases a number of NFTs from the listing contract.
   * 
   * If the buyer still needs to opt into the NFT, an opt-in transaction will be placed in front of the contract call logic.
   * 
   * Payout inner transactions are only generated for share holders with a higher than zero share. If the seller or royalty share holders have not opted into the AC currency there, funds will be redirected to their respective revenue sinks.
   * 
   * AC transactions:
   * - txns[0]?: `axfer` - Opt the buyer into the NFT index.
   * - txns[1]: `axfer` - Send the payment for the NFTs to the contract.
   * - txns[2]: `appl` - Call the smart contrac to purchase the NFTs.
   *    - intxns[0]?: `axfer` - Payout the seller share of the revenue.
   *    - intxns[1]?: `axfer` - Payout the royalty share of the revenue.
   *    - intxns[2]?: `axfer` - Payout the manager share of the revenue.
   *    - intxns[3]: `axfer` - Payout the NFTs to the buyer address.
   * 
   * Algo transactions:
   * - txns[0]?: `axfer` - Opt the buyer into the NFT index.
   * - txns[1]: `pay` - Send the payment for the NFTs to the contract.
   * - txns[2]: `appl` - Call the smart contrac to purchase the NFTs.
   *    - intxns[0]?: `pay` - Payout the seller share of the revenue.
   *    - intxns[1]?: `pay` - Payout the royalty share of the revenue.
   *    - intxns[2]?: `pay` - Payout the manager share of the revenue.
   *    - intxns[3]: `axfer` - Payout the NFTs to the buyer address.
   * 
   * @param {number} params.appId - App ID of the listing contract.
   * @param {number} params.nNFTs - The number  of NFTs to purchase from the contract.
   * @param {string} params.buyerAddress - Algorand address of the buyer.
   * @returns Promise<algosdk.Transaction[]>
   */
  buy(params: BuyFixedBidParams): Promise<ExtendOrDefault<E, B, S, A>>  {
    return buy(this.provider, params) as Promise<ExtendOrDefault<E, B, S, A>>
  }

  /**
   * Extract a number of NFTs from the contract. An `appl` call will be generated to request the token extraction from the contract. The contract will then generate an internal transaction that sends back the tokens.
   * 
   * - txns[0]: `appl` - call the contract to extract the NFTs.
   *    - itxns[0]: `axfer` - return the NFTs to the creator of the listing
   * 
   * @param {number} params.appId - App ID of the listing contract.
   * @param {number} params.nNFTs - Number of NFTs to be extract from the contract.
   * @returns Promise<algosdk.Transaction[]>
   */
  extract (params: ExtractFixedBidParams): Promise<ExtendOrDefault<E, B, S, A>>  {
    return extract(this.provider, params) as Promise<ExtendOrDefault<E, B, S, A>>
  }

  /**
   * Destroy the listing contract. Through inner transactions, this will return all leftover NFTs and the minimum contract balance to the creator.
   * 
   * - txns[0]: `appl` - call the contract to destroy it.
   *    - itxns[0]: `axfer` - Close out the NFT balance to the creator of the listing.
   *    - itxns[1]?: `axfer` - Close out the AC balance to the creator of the listing.
   *    - itxns[2]: `pay` - Close out the Algo balance to the creator of the listing.
   * 
   * @param {number} params.appId - App ID of the listing contract.
   * @returns Promise<algosdk.Transaction[]>
   */
  destroy (params: DestroyFixedBidParams): Promise<ExtendOrDefault<E, B, S, A>>  {
    return destroy(this.provider, params) as Promise<ExtendOrDefault<E, B, S, A>>
  }

  /**
   * Fetches and parses the Global State of the listing contract and returns the info in an object.
   * 
   * @param {number} params.appId - Application index of the listing contract. 
   * @returns Promise<GlobalState> 
   */
  getGlobalState(params: GetGlobalStateFixedBidParams) {
    return getGlobalState(this.provider, params)
  }

  /**
   * 
   */
  getStatus(params: GetStatusFixedBidParams) {
    return getStatus(this.provider, params)
  }
}