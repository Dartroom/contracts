import { Provider } from "../../contracts"
import { getApplicationAddress } from "algosdk"
import { getGlobalUint, getGlobalByte, getGlobalAddress  } from '../../functions/globalState'
import { getHistory } from "./getHistory"

export interface GetGlobalStateFixedBidParams {
  appId: number
}

export interface IGetGlobalState {
  nftIndex: number
  currencyIndex: number
  unitPrice: number
  sellerShare: number
  royaltyShare: number
  managerShare: number
  sellerPayoutAddress: string
  royaltyPayoutAddress: string
  managerPayoutAddress: string
  sellerRevenueSink: string
  royaltyRevenueSink: string
  creatorAddress: string
  contractAddress: string
  deleted: boolean
}

export async function getGlobalState(provider: Provider, { 
  appId 
}: GetGlobalStateFixedBidParams) {

  const app = await provider.indexer.lookupApplications(appId).do().catch((err) => {
    throw err
  })

  if (app.application) {
    
    const state = app.application.params['global-state']
  
    return {
      nftIndex: getGlobalUint(state, 'nft_index'),
      currencyIndex: getGlobalUint(state, 'currency_index'),
      unitPrice: getGlobalUint(state, 'unit_price'),
      sellerShare: getGlobalUint(state, 'seller_share'),
      royaltyShare: getGlobalUint(state, 'royalty_share'),
      managerShare: getGlobalUint(state, 'manager_share'),
      sellerPayoutAddress: getGlobalAddress(state, 'seller_payout_address'),
      royaltyPayoutAddress: getGlobalAddress(state, 'royalty_payout_address'),
      managerPayoutAddress: getGlobalAddress(state, 'manager_payout_address'),
      sellerRevenueSink: getGlobalAddress(state, 'seller_revenue_sink'),
      royaltyRevenueSink: getGlobalAddress(state, 'royalty_revenue_sink'),
      creatorAddress: app.application.params.creator as string,
      contractAddress: getApplicationAddress(appId),
      deleted: app.application.deleted as boolean,
    }
  }

  const history = await getHistory(provider,{ appId })

  if (history) {
    return history.state
  } else {
    throw new Error(`no application found for application-id: ${appId}`)
  }
}