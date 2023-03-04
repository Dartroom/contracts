import { Contracts, Provider } from '../../contracts'
import { deploy, DeploySinkParams } from './deploy'
import { destroy, DestroySinkParams } from './destroy'
import { optin, OptinParams } from './optin'
import { optout, OptoutParams } from './optout'
import { claim, ClaimParams } from './claim'
import { getGlobalState, GetGlobalStateParams } from './getGlobalState'

export class RevenueSink {

  private provider: Provider

  constructor(provider: Provider) {
    this.provider = provider
  }

  deploy (params: DeploySinkParams) {
    return deploy(this.provider, params)
  }

  optin (params: OptinParams) {
    return optin(this.provider, params)
  }

  optout (params: OptoutParams) {
    return optout(this.provider, params)
  }

  claim (params: ClaimParams) {
    return claim(this.provider, params)
  }

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
}