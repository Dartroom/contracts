import { Provider } from "../../contracts"
import {
  ALGORAND_MIN_TX_FEE,
  isValidAddress,
  makeApplicationNoOpTxn,
  makeAssetTransferTxnWithSuggestedParams,
  encodeUint64,
  makePaymentTxnWithSuggestedParams
} from "algosdk"
import { hashAbiMethod } from "../../functions/abi"
import { getGlobalState } from './getGlobalState'
import { addressAssetBalance } from "../../functions/balance"
import { TxnFormatter } from "../../functions/txn"

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

  const [appNftBalance, buyerNftBalance, params, account] = await Promise.all([
    addressAssetBalance(provider.indexer, state.contractAddress, state.nftIndex),
    addressAssetBalance(provider.indexer, buyerAddress, state.nftIndex),
    provider.algod.getTransactionParams().do(),
    provider.algod.accountInformation(buyerAddress).do()
  ])

  if (appNftBalance === -1) {
    throw new Error('The listing still needs to be set up. It is currently not opted into the NFT.')
  }

  if (appNftBalance === 0) {
    throw new Error('The contract does not hold any NFT tokens at the moment.')
  }

  if (appNftBalance < nNFTs) {
    throw new Error(`The contract only holds ${appNftBalance} NFT token(s) at the moment. Please lower the amount to buy.`)
  }

  const txnFormater = new TxnFormatter(provider)

  if (state.currencyIndex >= 0) {
    // AC

    const buyerCurrencyBalance = await addressAssetBalance(provider.indexer, buyerAddress, state.currencyIndex)

    if (buyerCurrencyBalance === -1) {
      throw new Error('The buyer is not opted into the listing currency.')
    }

    if (buyerCurrencyBalance < state.unitPrice * nNFTs) {
      throw new Error('The buyer is not opted into the listing currency.')
    }

    params.fee = ALGORAND_MIN_TX_FEE
    params.flatFee = true

    if (buyerNftBalance === -1) {
      txnFormater.push({
        description: "Opt your address into the NFT ASA.",
        txn: makeAssetTransferTxnWithSuggestedParams(
          buyerAddress,
          buyerAddress,
          undefined,
          undefined,
          0,
          undefined,
          state.nftIndex,
          params
        ),
        signers: [buyerAddress],
        authAddress: account['auth-addr'] || buyerAddress
      })
    }

    txnFormater.push({
      description: "Send the payment for the NFTs to the smart contract address.",
      txn: makeAssetTransferTxnWithSuggestedParams(
        buyerAddress,
        state.contractAddress,
        undefined,
        undefined,
        nNFTs * state.unitPrice,
        undefined,
        state.currencyIndex,
        params
      ),
      signers: [buyerAddress],
      authAddress: account['auth-addr'] || buyerAddress
    })

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

    txnFormater.push({
      description: "Call the smart contract to purchase the NFTs.",
      txn: makeApplicationNoOpTxn(
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
      ),
      signers: [buyerAddress],
      authAddress: account['auth-addr'] || buyerAddress
    })

    txnFormater.assignGroupID()

    return txnFormater.getTxns()

  } else {
    // Algo

    params.fee = ALGORAND_MIN_TX_FEE
    params.flatFee = true

    if (buyerNftBalance === -1) {
      txnFormater.push({
        description: "Opt your address into the NFT ASA.",
        txn: makeAssetTransferTxnWithSuggestedParams(
          buyerAddress,
          buyerAddress,
          undefined,
          undefined,
          0,
          undefined,
          state.nftIndex,
          params
        ),
        signers: [buyerAddress],
        authAddress: account['auth-addr'] || buyerAddress
      })
    }

    txnFormater.push({
      description: "Send the payment for the NFTs to the smart contract address.",
      txn: makePaymentTxnWithSuggestedParams(
        buyerAddress,
        state.contractAddress,
        nNFTs * state.unitPrice,
        undefined,
        undefined,
        params
      ),
      signers: [buyerAddress],
      authAddress: account['auth-addr'] || buyerAddress
    })

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

    txnFormater.push({
      description: "Call the smart contract to purchase the NFTs.",
      txn: makeApplicationNoOpTxn(
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
      ),
      signers: [buyerAddress],
      authAddress: account['auth-addr'] || buyerAddress
    })

    txnFormater.assignGroupID()

    return txnFormater.getTxns()
  }
}