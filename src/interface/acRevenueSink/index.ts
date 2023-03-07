import { Contracts, Provider } from '../../contracts'
import { deploy, DeploySinkParams } from './deploy'
import { destroy, DestroySinkParams } from './destroy'
import { optin, OptinParams } from './optin'
import { optout, OptoutParams } from './optout'
import { claim, ClaimParams } from './claim'
import { find, FindParams } from './find'
import { getGlobalState, GetGlobalStateParams } from './getGlobalState'

export class RevenueSink {

  private provider: Provider

  constructor(provider: Provider) {
    this.provider = provider
  }

  /**
   * Generates the `makeApplicationCreateTxn()` transaction for an AC revenue sink contract.
   * 
   *  txns[0]: `appl` - create and deploy the smart contract
   * 
   * @param {string} params.recipientAddress - Algorand address of the wallet that will be able to claim the revenue.
   * @param {string} params.managerAddress - Algorand address of the wallet that will be able to opt the contract into and out of assets.
   * @return Promise<algosdk.Transaction[]>
   */
  deploy (params: DeploySinkParams) {
    return deploy(this.provider, params)
  }

  /**
   * Opt the revenue sink into one or more assets. The group's first transaction will deposit the minimum balance into the contract. The following transactions will call the contract to opt-in a maximum of 8 assets at once. If more then 8 assets are passed in, the function automatically generates multiple app call transactions. This allows for a theoretical maximum of 120 opt-ins at once.
   * 
   * - txns[0]: `pay` - min. balance payment to the contract address
   * - txns[N]: `appl` - opt the contract into the specified ASA's
   *    - intxns[N]: `axfer` - Opt the contract into each ASA.
   * 
   * @param {number} params.appId - App ID of the smart contract.
   * @param {Array<number>} params.asaArray - Array of assets to opt the contract into.
   * @returns Promise<algosdk.Transaction[]>
   */
  optin (params: OptinParams) {
    return optin(this.provider, params)
  }

  /**
   * Opt the revenue sink out of one or more assets. After opting out of the requested assets, the reduction in minimum balance will be paid back to the manager's address.
   * 
   * You can opt out of 8 assets at once. If more than 8 assets are passed in, the function will automatically generate multiple app call transactions. This allows for a theoretical maximum of 120 opt-outs at once.
   * 
   * - txns[N]: `appl` - opt the contract out of the specified ASA's
   *    - intxns[N]: `axfer` - Opt the contract out of each ASA.
   *    - intxns[N + 1]: `pay` - Send back the reduction in minimum balance.
   * 
   * @param {number} params.appId - App ID of the smart contract.
   * @param {Array<number>} params.asaArray - Array of assets to opt the contract out of.
   * @returns Promise<algosdk.Transaction[]>
   */
  optout (params: OptoutParams) {
    return optout(this.provider, params)
  }


  /**
   * As the recipient account, claim the funds of one or more ASAs registered in the contract.
   * 
   * You can claim 8 assets at once. If more than 8 assets are passed in, the function will automatically generate multiple app call transactions. This allows for a theoretical maximum of 120 assets to be claimed at once.
   * 
   * - txns[N]: `appl` - Call the contract to claim the assets
   *    - intxns[N]: `axfer` - Payout the ASA revuneu to the recipient address.
   * 
   * @param {number} params.appId - App ID of the smart contract.
   * @param {Array<number>} params.asaArray - Array of assets to claim the revenue of.
   * @returns Promise<algosdk.Transaction[]> 
   */
  claim (params: ClaimParams) {
    return claim(this.provider, params)
  }

  /**
   * Destroy the smart contract. Before the contract can be destroyed, it needs to be opted out of all assets. The remaining minimum balance will be returned to the manager's address.
   * 
   * - txns[0]: `appl` - Call the contract to claim the destory it.
   *    - intxns[0]: `pay` - Close out the remaing ALGO balance to the manager address.
   * 
   * @param {number} params.appId - App ID of the smart contract.
   * @returns Promise<algosdk.Transaction[]>
   */
  destroy (params: DestroySinkParams) {
    return destroy(this.provider, params)
  }

  /**
   * Fetches and parses the Global State of the contract and returns the info in an object.
   * 
   * @param {number} params.appId - Application index of the contract. 
   * @returns Promise<GlobalState> 
   */
  getGlobalState(params: GetGlobalStateParams) {
    return getGlobalState(this.provider, params)
  }

  find(params: FindParams) {
    return find(this.provider, params)
  }
}