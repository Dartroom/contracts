import { Provider } from "../../contracts"
import {
  Transaction,
  ALGORAND_MIN_TX_FEE,
  isValidAddress,
  makeApplicationNoOpTxn,
  makeAssetTransferTxnWithSuggestedParams,
  encodeUint64,
  assignGroupID,
  makePaymentTxnWithSuggestedParams
} from "algosdk"
import { hashAbiMethod } from "../../functions/abi"
import { getGlobalState } from './getGlobalState'
import { addressAssetBalance } from "../../functions/balance"

export interface BuyFixedBidParams {
  appId: number
  nNFTs: number
  buyerAddress: string
}

export async function buy(provider: Provider, {
  appId,
  nNFTs,
  buyerAddress
}: BuyFixedBidParams) {

  if (!isValidAddress(buyerAddress)) {
    throw new Error('One or more of the provided Algorand address are not in the correct format.')
  }

  if (nNFTs < 1 || !Number.isInteger(nNFTs)) {
    throw new Error('nNFTs must be a positive integer.')
  }
  
  const state = await getGlobalState(provider,{ appId })
  const appNftBalance = await addressAssetBalance(provider.indexer, state.contractAddress, state.nftIndex)
  const buyerNftBalance = await addressAssetBalance(provider.indexer, buyerAddress, state.nftIndex)

  if (appNftBalance === -1) {
    throw new Error('The listing still needs to be set up. It is currently not opted into the NFT.')
  }

  if (appNftBalance === 0) {
    throw new Error('The contract does not hold any NFT tokens at the moment.')
  }

  if (appNftBalance < nNFTs) {
    throw new Error(`The contract only holds ${appNftBalance} NFT token(s) at the moment. Please lower the amount to buy.`)
  }

  if (state.currencyIndex >= 0) {
    // AC

    const buyerCurrencyBalance = await addressAssetBalance(provider.indexer, buyerAddress, state.currencyIndex)

    if (buyerCurrencyBalance === -1) {
      throw new Error('The buyer is not opted into the listing currency.')
    }

    if (buyerCurrencyBalance < state.unitPrice * nNFTs) {
      throw new Error('The buyer is not opted into the listing currency.')
    }

    const txns: Array<Transaction> = []

    let params = await provider.algod.getTransactionParams().do()
    params.fee = ALGORAND_MIN_TX_FEE
    params.flatFee = true

    if (buyerNftBalance === -1) {
      txns.push(
        makeAssetTransferTxnWithSuggestedParams(
          buyerAddress,
          buyerAddress,
          undefined,
          undefined,
          0,
          undefined,
          state.nftIndex,
          params
        )
      )
    }

    txns.push(
      makeAssetTransferTxnWithSuggestedParams(
        buyerAddress,
        state.contractAddress,
        undefined,
        undefined,
        nNFTs * state.unitPrice,
        undefined,
        state.currencyIndex,
        params
      )
    )

    let baseFee = 2

    if (state.sellerShare > 0) {
      baseFee += 1
    }

    if (state.royaltyShare > 0) {
      baseFee += 1
    }

    if (state.managerShare > 0) {
      baseFee += 1
    }

    txns.push(
      makeApplicationNoOpTxn(
        buyerAddress, 
        {
          ...params,
          fee: ALGORAND_MIN_TX_FEE * baseFee
        }, 
        appId, 
        [
          hashAbiMethod("buy(uint64)void"),
          encodeUint64(nNFTs)
        ], 
        [
          state.sellerPayoutAddress,
          state.royaltyPayoutAddress,
          state.managerPayoutAddress
        ],
        [],
        [
          state.nftIndex,
          state.currencyIndex
        ]
      )
    )

    const txGroup = assignGroupID(txns)

    return txGroup

  } else {
    // Algo

    const txns: Array<Transaction> = []

    let params = await provider.algod.getTransactionParams().do()
    params.fee = ALGORAND_MIN_TX_FEE
    params.flatFee = true

    if (buyerNftBalance === -1) {
      txns.push(
        makeAssetTransferTxnWithSuggestedParams(
          buyerAddress,
          buyerAddress,
          undefined,
          undefined,
          0,
          undefined,
          state.nftIndex,
          params
        )
      )
    }

    txns.push(
      makePaymentTxnWithSuggestedParams(
        buyerAddress,
        state.contractAddress,
        nNFTs * state.unitPrice,
        undefined,
        undefined,
        params
      )
    )

    let baseFee = 2

    if (state.sellerShare > 0) {
      baseFee += 1
    }

    if (state.royaltyShare > 0) {
      baseFee += 1
    }

    if (state.managerShare > 0) {
      baseFee += 1
    }

    txns.push(
      makeApplicationNoOpTxn(
        buyerAddress, 
        {
          ...params,
          fee: ALGORAND_MIN_TX_FEE * baseFee
        }, 
        appId, 
        [
          hashAbiMethod("buy(uint64)void"),
          encodeUint64(nNFTs)
        ], 
        [
          state.sellerPayoutAddress,
          state.royaltyPayoutAddress,
          state.managerPayoutAddress
        ],
        [],
        [
          state.nftIndex
        ]
      )
    )

    const txGroup = assignGroupID(txns)

    return txGroup
  }
}