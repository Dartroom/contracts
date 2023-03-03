import { Provider } from "../../contracts"
import { getGlobalState } from './getGlobalState'
import { addressAssetBalance } from "../../functions/balance"
import { hashAbiMethod } from "../../functions/abi"
import { 
  ALGORAND_MIN_TX_FEE,
  makePaymentTxnWithSuggestedParams,
  makeApplicationNoOpTxn,
  makeAssetTransferTxnWithSuggestedParams,
  assignGroupID
} from "algosdk"

export interface SetupFixedBidParams {
  appId: number
  nNFTs?: number
}

/**
 * Deploy the fixed bid listings on the network.
 * 
 * @param settings
 */
export async function setup(provider: Provider, {
  appId,
  nNFTs
}: SetupFixedBidParams) {
  
  const state = await getGlobalState(provider,{ appId })
  const appNftBalance = await addressAssetBalance(provider.indexer, state.contractAddress, state.nftIndex)

  if (appNftBalance !== -1) {
    throw new Error('The listing is already set.')
  }

  if (state.currencyIndex >= 0) {

    const txns = []

    let params = await provider.algod.getTransactionParams().do()
    params.fee = ALGORAND_MIN_TX_FEE
    params.flatFee = true

    const accounts = [
      state.sellerPayoutAddress, // seller sink,
      state.royaltyPayoutAddress // royalty sink
    ]

    txns.push(
        makePaymentTxnWithSuggestedParams(
        state.creatorAddress, 
        state.contractAddress, 
        provider.MIN_BALANCE_FEE * 3, 
        undefined, 
        undefined, 
        params
      )
    )

    txns.push(
      makeApplicationNoOpTxn(
        state.creatorAddress, 
        {
          ...params,
          fee: ALGORAND_MIN_TX_FEE * 3
        }, 
        appId, 
        [hashAbiMethod("setup()void")], 
        accounts, 
        [], 
        [
          state.nftIndex, 
          state.currencyIndex
        ]
      )
    )

    if (nNFTs) {

      if (nNFTs < 1 || !Number.isInteger(nNFTs)) {
        throw new Error('nNFTs must be a positive integer.')
      }

      txns.push(
        makeAssetTransferTxnWithSuggestedParams(
          state.creatorAddress, 
          state.contractAddress, 
          undefined, 
          undefined, 
          nNFTs,
          undefined, 
          state.nftIndex, 
          params
        )
      )
    }
    
    const txGroup = assignGroupID(txns)

    return txGroup

  } else {
    // Algo Fixed Bid
    return []
  }
}