import algosdk from "algosdk"
import { Provider, TxnArray } from "../../contracts"
import { hashAbiMethod } from "../../functions/abi"
import { addressAssetBalance } from "../../functions/balance"
import getAuctionGlobalState from "./getAuctionGlobalState"

export interface BidParams {
  appId: number
  amount: number
  bidderAddress: string
}

export default async function placeAuctionBid({ algod, indexer, MIN_BALANCE_FEE }: Provider, { 
  appId, 
  amount, 
  bidderAddress 
}: BidParams): Promise<TxnArray>  {
  
  const state = await getAuctionGlobalState({ algod, indexer, MIN_BALANCE_FEE },{ appId })

  if (state.endRound === 0 && state.timeLeft === 0) {
    const appNftBalance = await addressAssetBalance(indexer, state.contractAddress, state.nftIndex)

    if (appNftBalance === -1) {
      throw new Error('The auction is not set up yet.')
    }
  } else if (state.timeLeft < 0 && state.highestBidder !== state.creatorAddress) {
    throw new Error('The auction has ended.')
  } else if (state.highestBidder === state.creatorAddress) {
    if (amount < state.highestBid) {
      throw new Error('The bid is below the reserve price.')
    }
  } else if (state.highestBidder === bidderAddress) {
    throw new Error('The highest bidder can not overbid.')
  } else if (state.creatorAddress === bidderAddress) {
    throw new Error('The creator of the auction can not participate in the auction.')
  } else if (state.highestBidder !== state.creatorAddress) {
    if (amount <= state.highestBid) {
      throw new Error('The bid is below or equal to the current highest bid.')
    } else if ((amount - state.highestBid) < state.minimumBidIncrease) {
      throw new Error('The bid is below the minimum bid increase.')
    }
  }

  if (state.currencyIndex >= 0) {
    console.log('ASA currency auction')
    return []
  } else {

    let params = await algod.getTransactionParams().do()
    params.flatFee = true

    if (state.highestBidder === state.creatorAddress) {
      params.fee = 2000
    } else {
      params.fee = 3000
    }

    let params0 = JSON.parse(JSON.stringify(params))
    params0.fee = 0

    let txn0 = algosdk.makeApplicationNoOpTxn(
      bidderAddress, 
      params, 
      appId, 
      [hashAbiMethod("bid()void")], 
      [state.highestBidder, state.managerAddress], 
      [], 
      [state.nftIndex]
    )

    let txn1 = algosdk.makePaymentTxnWithSuggestedParams(
      bidderAddress, 
      state.contractAddress, 
      amount, 
      undefined,
      undefined,
      params0
    )

    const txGroup = algosdk.assignGroupID([txn0, txn1])
    
    return [...txGroup]
  }
}