import { Provider } from "../contracts"
import { getApplicationAddress } from "algosdk"
import { getGlobalUint, getGlobalByte, getGlobalAddress  } from '../functions/globalState'

export interface GetAuctionParams {
  appId: number
}

export default async function getAuctionGlobalState({ indexer }: Provider, { appId }: GetAuctionParams) {

  const app = await indexer.lookupApplications(appId).do().catch((err) => {
    throw err
  })
  
  const state = app.application.params['global-state']

  return {
    sellerShare: getGlobalUint(state, 'seller_share'),
    artistShare: getGlobalUint(state, 'artist_share'),
    managerShare: getGlobalUint(state, 'manager_share'),
    duration: getGlobalUint(state, 'duration'),
    endRound: getGlobalUint(state, 'end_round'),
    nftIndex: getGlobalUint(state, 'nft_index'),
    highestBid: getGlobalUint(state, 'highest_bid'),
    minimumBidIncrease: getGlobalUint(state, 'minimum_bid_increase'),
    sellerPayoutAddress: getGlobalAddress(state, 'seller_payout_address'),
    artistPayoutAddress: getGlobalAddress(state, 'artist_payout_address'),
    managerAddress: getGlobalAddress(state, 'manager_address'),
    highestBidder: getGlobalAddress(state, 'highest_bidder'),
    contractAddress: getApplicationAddress(appId),
    creatorAddress: app.application.params.creator as string,
    timeLeft: getGlobalUint(state, 'end_round') - app['current-round'],
    currencyIndex: getGlobalUint(state, 'currency_index'),
  }
}