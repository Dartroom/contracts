import algosdk from "algosdk"
import { Provider, TxnArray } from "../contracts"
import { hashAbiMethod } from "../functions/abi"
import { addressAssetBalance } from "../functions/balance"
import getAuctionGlobalState from "./getAuctionGlobalState"

export interface ClaimAuctionSharesParams {
  appId: number
  senderAddress: string
}

export default async function claimAuctionShares({ algod, indexer }: Provider, { 
  appId, 
  senderAddress
}: ClaimAuctionSharesParams): TxnArray {
  
  const state = await getAuctionGlobalState({ algod, indexer },{ appId })

  if (state.endRound === 0) {
    throw new Error('The acution has not yet started.')
  } else if (state.timeLeft > 0) {
    throw new Error('The auction is still running.')
  } else if (state.sellerShare === 0 && state.artistShare === 0 && state.managerShare === 0) {
    throw new Error('There are no auctions left to claim.')
  }

  if (state.currencyIndex >= 0) {
    console.log('ASA currency auction')
    return []
  } else {

    let params = await algod.getTransactionParams().do()
    params.fee = 4000
    params.flatFee = true

    let txn = algosdk.makeApplicationNoOpTxn(
      senderAddress, 
      params, 
      appId, 
      [hashAbiMethod('claimShares()void')], 
      [state.sellerPayoutAddress, state.artistPayoutAddress, state.managerAddress], 
      [], 
      [state.nftIndex]
    )
  
    return [txn]
  }
}