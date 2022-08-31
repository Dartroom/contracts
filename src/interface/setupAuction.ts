import algosdk from "algosdk"
import { Provider, TxnArray } from "../contracts"
import { addressAssetBalance } from "../functions/balance"
import getAuctionGlobalState from "./getAuctionGlobalState"
import { hashAbiMethod } from "../functions/abi"

export interface SetupAuctionParams {
  appId: number
}

export default async function setupAuction({ algod, indexer }: Provider, { appId }: SetupAuctionParams): TxnArray {
  
  const state = await getAuctionGlobalState({ algod, indexer },{ appId })
  const appNftBalance = await addressAssetBalance(indexer, state.contractAddress, state.nftIndex)

  if (appNftBalance !== -1 || state.endRound > 0) {
    throw new Error('The auction is already set.')
  }

  if (state.currencyIndex >= 0) {
    console.log('ASA currency auction')
    return []
  } else {

    let params = await algod.getTransactionParams().do()
    params.fee = 4000
    params.flatFee = true

    let params0 = JSON.parse(JSON.stringify(params))
    params0.fee = 0

    let txn0 = algosdk.makePaymentTxnWithSuggestedParams(
      state.creatorAddress, 
      state.contractAddress, 
      200000, 
      undefined, 
      undefined, 
      params
    )

    let txn1 = algosdk.makeApplicationNoOpTxn(
      state.creatorAddress, 
      params0, 
      appId, 
      [hashAbiMethod("set()void")], 
      [], 
      [], 
      [state.nftIndex]
    )

    let txn2 = algosdk.makeAssetTransferTxnWithSuggestedParams(
      state.creatorAddress, 
      state.contractAddress, 
      undefined, 
      undefined, 
      1, 
      undefined, 
      state.nftIndex, 
      params0
    )

    const txGroup = algosdk.assignGroupID([txn0, txn1, txn2])

    return txGroup
  }
}