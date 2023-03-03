import algosdk from "algosdk";
import { Provider, TxnArray } from "../../contracts";
import getAuctionGlobalState from './getAuctionGlobalState'
import { addressAssetBalance } from "../../functions/balance"

export interface DestoryAuctionParams {
  appId: number
}

export default async function destoryAuction({ algod, indexer, MIN_BALANCE_FEE }: Provider, { appId }:DestoryAuctionParams ): Promise<TxnArray>  {

  const state = await getAuctionGlobalState({ algod, indexer, MIN_BALANCE_FEE },{ appId })
  const appNftBalance = await addressAssetBalance(indexer, state.contractAddress, state.nftIndex)

  if (appNftBalance !== -1 && state.endRound !== 0) {
    if (state.timeLeft > 0) {
      throw new Error('The auction has not yet ended.')
    } else if (state.sellerShare !== 0) {
      throw new Error('The seller has not claimed their share yet.')
    } else if (state.artistShare !== 0) {
      throw new Error('The artist has not claimed their share yet.')
    } else if (state.managerShare !== 0) {
      throw new Error('The manager has not claimed their share yet.')
    } else if (appNftBalance > 0) {
      throw new Error('The buyer has not claimed their NFT yet.')
    }
  }

  if (state.currencyIndex >= 0) {
    console.log('ASA currency auction')
    return []
  } else {

    let params = await algod.getTransactionParams().do()
    params.fee = 3000
    params.flatFee = true

    let txn = algosdk.makeApplicationDeleteTxn(
      state.creatorAddress, 
      params, 
      appId, 
      [], 
      [], 
      [], 
      [state.nftIndex]
    )

    return [txn]
  }
}