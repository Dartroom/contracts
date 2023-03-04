import { Provider } from "../../contracts"
import { getApplicationAddress } from "algosdk"
import { getGlobalUint, getGlobalByte, getGlobalAddress  } from '../../functions/globalState'

export interface GetGlobalStateFixedBidParams {
  appId: number
}

export async function getGlobalState({ indexer }: Provider, { 
  appId 
}: GetGlobalStateFixedBidParams) {

  const app = await indexer.lookupApplications(appId).do().catch((err) => {
    throw err
  })
  
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
  }
}