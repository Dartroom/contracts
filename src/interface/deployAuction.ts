import algosdk from "algosdk"
import clearState from "../contracts/algoAuction/clearState"
import algoApproval from "../contracts/algoAuction/approval"
import asaApproval from "../contracts/asaAuction/approval"
import { Provider, TxnArray } from "../contracts"

export interface DeployAuctionParams {
  creatorAddress: string
  payoutAddress: string
  managerAddress: string
  sellerShare: number
  artistShare: number
  managerShare: number
  reservePrice: number
  nftIndex: number
  duration: number
  currencyIndex?: number
  extensionTime?: number
}

export default async function deployContract({ algod }: Provider, {
  creatorAddress,
  payoutAddress,
  managerAddress,
  sellerShare,
  artistShare,
  managerShare,
  currencyIndex,
  nftIndex,
  duration,
  reservePrice,
  extensionTime
}: DeployAuctionParams): TxnArray {
  
  if (reservePrice < 100) {
    throw new Error('The reserve price should be at least 100 base units of the currency.')
  }

  if (algosdk.isValidAddress(payoutAddress) && algosdk.isValidAddress(managerAddress)) {
    throw new Error('The provided Algorand address is not in the correct format.')
  }

  if (sellerShare < 0 || artistShare < 0 || managerShare < 0) {
    throw new Error('Share percentage must be equal to or higher than zero.')
  }

  if ((sellerShare + artistShare + managerShare) !== 100) {
    throw new Error('The combined share percentages must equal 100.')
  }

  if (currencyIndex && currencyIndex < 0) {
    throw new Error('The currency index must be a positive integer.')
  }

  if (duration < 0) {
    throw new Error('The duration must be a positive integer.')
  }

  if (currencyIndex && currencyIndex !== 0) {

    const approval = asaApproval(duration, reservePrice, nftIndex, currencyIndex, payoutAddress, managerAddress, sellerShare, artistShare, managerShare)
    const approvalProgram = await algod.compile(approval).do()
    const clearStateProgram = await algod.compile(clearState).do()
    const onComplete = algosdk.OnApplicationComplete.NoOpOC
    const sender = creatorAddress
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
    throw new Error('Currency index is missing')
  }
  //   approval = algoApproval
  // }
}