import algosdk from "algosdk"
import { Provider, TxnArray } from "../../contracts"
import { hashAbiMethod } from "../../functions/abi"
import { addressAssetBalance } from "../../functions/balance"
import getAuctionGlobalState from "./getAuctionGlobalState"

export interface ClaimNFTParams {
  appId: number
  senderAddress: string
}

export default async function claimAuctionNFT({ algod, indexer, MIN_BALANCE_FEE }: Provider, { 
  appId, 
  senderAddress
}: ClaimNFTParams): Promise<TxnArray> {
  
  const state = await getAuctionGlobalState({ algod, indexer, MIN_BALANCE_FEE },{ appId })
  const appNftBalance = await addressAssetBalance(indexer, state.contractAddress, state.nftIndex)
  const buyerNftBalance = await addressAssetBalance(indexer, state.highestBidder, state.nftIndex)
  let optInTxn

  if (state.endRound === 0) {
    throw new Error('The auction has not yet started.')
  } else if (state.timeLeft > 0) {
    throw new Error('The auction is still in running.')
  } else if (appNftBalance === -1) {
    throw new Error('The NFT was already claimed.')
  }

  let params = await algod.getTransactionParams().do()
  params.fee = 2000
  params.flatFee = true

  if (buyerNftBalance < 0) {

    let params1000 = JSON.parse(JSON.stringify(params))
    params1000.fee = 1000

    optInTxn = algosdk.makeAssetTransferTxnWithSuggestedParams(
      state.highestBidder, 
      state.highestBidder, 
      undefined, 
      undefined, 
      0, 
      undefined,  
      state.nftIndex, 
      params1000
    )

  }

  let appCalTxn = algosdk.makeApplicationNoOpTxn(
    senderAddress, 
    params, 
    appId, 
    [hashAbiMethod("claimNFT()void")], 
    [state.highestBidder], 
    [], 
    [state.nftIndex]
  )
  
  if (buyerNftBalance < 0 && optInTxn) {
    return [optInTxn, appCalTxn]
  } else {
    return [appCalTxn]
  }
}