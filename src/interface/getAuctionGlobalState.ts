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
    sellerShare: getGlobalUint(state, 'seller share'),
    artistShare: getGlobalUint(state, 'artist share'),
    managerShare: getGlobalUint(state, 'manager share'),
    duration: getGlobalUint(state, 'Duration'),
    endRound: getGlobalUint(state, 'End round'),
    nftIndex: getGlobalUint(state, 'nft index'),
    currencyIndex: getGlobalUint(state, 'currency index'),
    highestBid: getGlobalUint(state, 'Highest bid'),
    payoutAddress: getGlobalAddress(state, 'payout address'),
    highestBidder: getGlobalAddress(state, 'Highest bidder'),
    managerAddress: getGlobalAddress(state, 'manager address'),
    contractAddress: getApplicationAddress(appId),
    creatorAddress: app.application.params.creator as string,
    timeLeft: getGlobalUint(state, 'End round') - app['current-round'],
  }
}