import { Provider } from "../../contracts"
import { TxnFormatter } from "../../functions/txn"
import { getGlobalState } from './getGlobalState'
import { addressAssetBalance } from "../../functions/balance"
import { hashAbiMethod } from "../../functions/abi"
import { 
  ALGORAND_MIN_TX_FEE,
  makePaymentTxnWithSuggestedParams,
  makeApplicationNoOpTxn,
  makeAssetTransferTxnWithSuggestedParams
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

  const txnFormater = new TxnFormatter(provider)

  let params = await provider.algod.getTransactionParams().do()
  params.fee = ALGORAND_MIN_TX_FEE
  params.flatFee = true

  if (state.currencyIndex >= 0) {

    const accounts = [
      state.sellerPayoutAddress, // seller sink,
      state.royaltyPayoutAddress // royalty sink
    ]

    txnFormater.push({
      description: "Send the necessary minimum balance to the contract address to make it operational.",
      txn: makePaymentTxnWithSuggestedParams(
        state.creatorAddress, 
        state.contractAddress, 
        provider.MIN_BALANCE_FEE * 3, 
        undefined, 
        undefined, 
        params
      ),
      signers: [state.creatorAddress]
    })

    txnFormater.push({
      description: "Call the smart contract to opt it into the NFT and currency ASAs.",
      txn: makeApplicationNoOpTxn(
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
      ),
      signers: [state.creatorAddress]
    })

    if (nNFTs) {

      if (nNFTs < 1 || !Number.isInteger(nNFTs)) {
        throw new Error('nNFTs must be a positive integer.')
      }

      txnFormater.push({
        description: "Deposit the NFTs into the listing contract to offer them for sale.",
        txn: makeAssetTransferTxnWithSuggestedParams(
          state.creatorAddress, 
          state.contractAddress, 
          undefined, 
          undefined, 
          nNFTs,
          undefined, 
          state.nftIndex, 
          params
        ),
        signers: [state.creatorAddress]
      })
    }
    
    txnFormater.assignGroupID()

    return txnFormater.getTxns()

  } else {
    // Algo Fixed Bid

    txnFormater.push({
      description: "Send the necessary minimum balance to the contract address to make it operational.",
      txn: makePaymentTxnWithSuggestedParams(
        state.creatorAddress, 
        state.contractAddress, 
        provider.MIN_BALANCE_FEE * 2, 
        undefined, 
        undefined, 
        params
      ),
      signers: [state.creatorAddress]
    })

    txnFormater.push({
      description: "Call the smart contract to opt it into the NFT and currency ASAs.",
      txn: makeApplicationNoOpTxn(
        state.creatorAddress, 
        {
          ...params,
          fee: ALGORAND_MIN_TX_FEE * 2
        }, 
        appId, 
        [hashAbiMethod("setup()void")], 
        [], 
        [], 
        [
          state.nftIndex
        ]
      ),
      signers: [state.creatorAddress]
    })

    if (nNFTs) {

      if (nNFTs < 1 || !Number.isInteger(nNFTs)) {
        throw new Error('nNFTs must be a positive integer.')
      }

      txnFormater.push({
        description: "Deposit the NFTs into the listing contract to offer them for sale.",
        txn: makeAssetTransferTxnWithSuggestedParams(
          state.creatorAddress, 
          state.contractAddress, 
          undefined, 
          undefined, 
          nNFTs,
          undefined, 
          state.nftIndex, 
          params
        ),
        signers: [state.creatorAddress]
      })
    }
    
    txnFormater.assignGroupID()

    return txnFormater.getTxns()
  }
}