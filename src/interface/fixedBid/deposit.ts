import { Provider } from "../../contracts"
import { getGlobalState } from './getGlobalState'
import { addressAssetBalance } from "../../functions/balance"
import { hashAbiMethod } from "../../functions/abi"
import {
  Transaction,
  ALGORAND_MIN_TX_FEE,
  makeAssetTransferTxnWithSuggestedParams
} from "algosdk"

export interface DepositFixedBidParams {
  appId: number
  nNFTs: number
}

export async function deposit(provider: Provider, {
  appId,
  nNFTs
}: DepositFixedBidParams) {

  if (nNFTs < 1 || !Number.isInteger(nNFTs)) {
    throw new Error('nNFTs must be a positive integer.')
  }

  const state = await getGlobalState(provider,{ appId })
  const appNftBalance = await addressAssetBalance(provider.indexer, state.contractAddress, state.nftIndex)
  const creatorNftBalance = await addressAssetBalance(provider.indexer, state.creatorAddress, state.nftIndex)
  
  if (appNftBalance === -1) {
    throw new Error('The listing still needs to be set up. It is currently not opted into the NFT.')
  }

  if (creatorNftBalance === 0) {
    throw new Error('You currently do not hold any NFT tokens to deposit.')
  }

  if (creatorNftBalance < nNFTs) {
    throw new Error(`You currently only hold ${appNftBalance} NFT token(s). Please lower the amount to deposit.`)
  }

  const txns: Array<Transaction> = []

  let params = await provider.algod.getTransactionParams().do()
  params.fee = ALGORAND_MIN_TX_FEE
  params.flatFee = true

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

  return txns
}