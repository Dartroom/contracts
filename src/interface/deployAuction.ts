import algosdk from "algosdk"
import clearState from "../contracts/algoAuction/clearState"
import algoApproval from "../contracts/algoAuction/approval"
import asaApproval from "../contracts/asaAuction/approval"
import { Provider, TxnArray } from "../contracts"
import { compileProgram } from "../functions/program"

export interface DeployAuctionParams {
  sellerAddress: string
  sellerPayoutAddress: string
  artistPayoutAddress: string
  managerAddress: string
  sellerShare: number
  artistShare: number
  managerShare: number
  nftIndex: number
  reservePrice: number
  minBidIncrease?: number
  currencyIndex?: number
  duration?: number
}

export default async function deployContract({ algod }: Provider, {
  sellerAddress,
  sellerPayoutAddress,
  artistPayoutAddress,
  managerAddress,
  sellerShare,
  artistShare,
  managerShare,
  nftIndex,
  reservePrice,
  minBidIncrease,
  currencyIndex,
  duration,
}: DeployAuctionParams): TxnArray {
  if (
    !algosdk.isValidAddress(sellerAddress) || 
    !algosdk.isValidAddress(sellerPayoutAddress) || 
    !algosdk.isValidAddress(artistPayoutAddress) || 
    !algosdk.isValidAddress(managerAddress)
  ) {
    throw new Error('The provided Algorand address is not in the correct format.')
  }

  if (sellerShare < 0 || artistShare < 0 || managerShare < 0) {
    throw new Error('Share percentage must be equal to or higher than zero.')
  }

  if ((sellerShare + artistShare + managerShare) !== 100) {
    throw new Error('The combined share percentages must equal 100.')
  }

  if (nftIndex < 0 || !Number.isInteger(nftIndex)) {
    throw new Error('The nftIndex must be a positive integer.')
  }
  
  if ((reservePrice >= 100) && (reservePrice % 100 === 0)) {
    throw new Error('The reserve price should be at least 100 base units of the currency.')
  }

  if (minBidIncrease) {
    if ((minBidIncrease >= 100) && (minBidIncrease % 100 === 0)) {
      throw new Error('The minimum bid increase should be at least 100 base units of the currency.')
    }
  } else {
    minBidIncrease = 100
  }

  if (currencyIndex && (currencyIndex < 0 || !Number.isInteger(currencyIndex))) {
    throw new Error('The currency index must be a positive integer.')
  }

  if (duration) {
    if (duration < 0 || !Number.isInteger(currencyIndex)) {
      throw new Error('The duration must be a positive integer.')
    }
  } else {
    duration = Math.round((24 * 60 * 60) / 4.3)
  }

  if (currencyIndex && currencyIndex !== 0) {

    const approval = asaApproval(duration, reservePrice, nftIndex, currencyIndex, sellerPayoutAddress, managerAddress, sellerShare, artistShare, managerShare)
    const approvalProgram = await algod.compile(approval).do()
    const clearStateProgram = await algod.compile(clearState).do()
    const onComplete = algosdk.OnApplicationComplete.NoOpOC
    const sender = sellerAddress
    const localInts = 0
    const localBytes = 0
    const globalInts = 8  // 0,0285 Algo for every value
    const globalBytes = 3 // 0,05 Algo for every value

    // min balance base of 0,1 Algo
    // min balance price: 0,478 Algo

    let params = await algod.getTransactionParams().do()
    params.fee = 1000
    params.flatFee = true

    let txn = algosdk.makeApplicationCreateTxn(sender, params, onComplete, approvalProgram, clearStateProgram, localInts, localBytes, globalInts, globalBytes)

    return [txn]
  } else {

    const approvalProgram = await compileProgram(algod, algoApproval)
    const clearStateProgram = await compileProgram(algod, clearState)
    const onComplete = algosdk.OnApplicationComplete.NoOpOC
    const localInts = 0
    const localBytes = 0
    const globalInts = 8  // 0,0285 Algo for every value
    const globalBytes = 4 // 0,05 Algo for every value

    // min balance base of 0,1 Algo
    // min balance total price: 0,528 Algo

    console.log(approvalProgram)

    let params = await algod.getTransactionParams().do()
    params.fee = 1000
    params.flatFee = true

    const appArgs = [
      algosdk.encodeUint64(duration), 
      algosdk.encodeUint64(minBidIncrease), 
      algosdk.encodeUint64(reservePrice),
      algosdk.encodeUint64(sellerShare),
      algosdk.encodeUint64(artistShare),
      algosdk.encodeUint64(managerShare)
    ]
    const accounts = [sellerPayoutAddress, artistPayoutAddress, managerAddress]
    const foreignAssets = [nftIndex]

    let txn = algosdk.makeApplicationCreateTxn(
      sellerAddress, 
      params, 
      onComplete, 
      approvalProgram, 
      clearStateProgram, 
      localInts, 
      localBytes, 
      globalInts, 
      globalBytes,
      appArgs,
      accounts,
      undefined,
      foreignAssets
    )

    return [txn]
  }
}