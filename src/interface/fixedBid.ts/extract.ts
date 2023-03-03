import { Provider } from "../../contracts"
import { getGlobalState } from './getGlobalState'
import { addressAssetBalance } from "../../functions/balance"
import { hashAbiMethod } from "../../functions/abi"
import { 
  ALGORAND_MIN_TX_FEE,
  Transaction,
  makeApplicationNoOpTxn,
  encodeUint64
} from "algosdk"

export interface ExtractFixedBidParams {
  appId: number
  nNFTs: number
}

/**
 * Extract a given number of NFT tokens from the contract.
 * 
 * @param settings
 */
export async function extract(provider: Provider, {
  appId,
  nNFTs
}: ExtractFixedBidParams) {

  const state = await getGlobalState(provider,{ appId })
  const appNftBalance = await addressAssetBalance(provider.indexer, state.contractAddress, state.nftIndex)
  
  if (appNftBalance === -1) {
    throw new Error('The listing still needs to be set up. It is currently not opted into the NFT.')
  }

  if (appNftBalance === 0) {
    throw new Error('The contract does not hold any NFT tokens at the moment.')
  }

  if (appNftBalance < nNFTs) {
    throw new Error(`The contract only holds ${appNftBalance} NFT token(s) at the moment. Please lower the amount to extract.`)
  }

  const txns: Array<Transaction> = []

  let params = await provider.algod.getTransactionParams().do()
  params.fee = ALGORAND_MIN_TX_FEE
  params.flatFee = true

  txns.push(
    makeApplicationNoOpTxn(
      state.creatorAddress, 
      {
        ...params,
        fee: ALGORAND_MIN_TX_FEE * 2
      }, 
      appId, 
      [
        hashAbiMethod("extract(uint64)void"),
        encodeUint64(nNFTs)
      ], 
      [],
      [],
      [
        state.nftIndex
      ]
    )
  )

  return txns
}