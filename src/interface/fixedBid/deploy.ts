import { Provider } from "../../contracts"
import { TxnFormatter } from "../../functions/txn"
import { 
  ALGORAND_MIN_TX_FEE,
  isValidAddress, 
  OnApplicationComplete,
  makeApplicationCreateTxn,
  encodeUint64,
} from "algosdk"
import { convertProgram } from "../../functions/program"

import acApprovalProgram from '../../contracts/acFixedBid/approval'
import acClearProgram from '../../contracts/acFixedBid/clearState'
import algoApprovalProgram from '../../contracts/algoFixedBid/approval'
import algoClearProgram from '../../contracts/algoFixedBid/clearState'

export interface DeployFixedBidParams {
  sellerAddress: string
  sellerPayoutAddress: string
  royaltyPayoutAddress: string
  managerPayoutAddress: string
  sellerShare: number
  royaltyShare: number
  managerShare: number
  nftIndex: number
  price: number
  currencyIndex?: number
}

export async function deploy(provider: Provider, {
  sellerAddress,
  sellerPayoutAddress,
  royaltyPayoutAddress,
  managerPayoutAddress,
  sellerShare,
  royaltyShare,
  managerShare,
  nftIndex,
  price,
  currencyIndex
}: DeployFixedBidParams) {
  
  if (
    !isValidAddress(sellerAddress) || 
    !isValidAddress(sellerPayoutAddress) || 
    !isValidAddress(royaltyPayoutAddress) || 
    !isValidAddress(managerPayoutAddress)
  ) {
    throw new Error('One or more of the provided Algorand address are not in the correct format.')
  }

  if (sellerShare < 0 || royaltyShare < 0 || managerShare < 0) {
    throw new Error('Share percentage must be equal to or higher than zero.')
  }

  if ((sellerShare + royaltyShare + managerShare) !== 1000) {
    throw new Error('The combined share percentages must equal 1000.')
  }

  if (nftIndex < 0 || !Number.isInteger(nftIndex)) {
    throw new Error('The nftIndex must be a positive integer.')
  }

  if ((price < 1000) || (price % 1000 !== 0)) {
    throw new Error('The price should be at least 1000 base units of the currency.')
  }
  
  if (currencyIndex && (currencyIndex < 0 || !Number.isInteger(currencyIndex))) {
    throw new Error('The currency index must be a positive integer.')
  }

  const txnFormater = new TxnFormatter(provider)

  if (currencyIndex && currencyIndex !== 0) {
    // AC Fixed Bid

    const approvalProgram = convertProgram(acApprovalProgram)
    const clearStateProgram = convertProgram(acClearProgram)
    const onComplete = OnApplicationComplete.NoOpOC
    const localInts = 0
    const localBytes = 0
    const globalInts = 6 // 0,0285 Algo for every value
    const globalBytes = 5 // 0,05 Algo for every value

    // min balance base:      0,1   Algo
    // min balance storage:   0,421 Algo
    // min balance deposit:   0,3   Algo
    // total min balance:     0,821 Algo

    let params = await provider.algod.getTransactionParams().do()
    params.fee = ALGORAND_MIN_TX_FEE
    params.flatFee = true

    const appArgs = [
      encodeUint64(price),
      encodeUint64(sellerShare),
      encodeUint64(royaltyShare),
      encodeUint64(managerShare)
    ]

    const accounts = [
      sellerPayoutAddress,
      royaltyPayoutAddress,
      managerPayoutAddress
    ]

    const foreignAssets = [
      nftIndex,
      currencyIndex
    ]

    let txn = makeApplicationCreateTxn(
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

    txnFormater.push({
      description: "Deploy the fixed bid listing contract to the network.",
      txn: txn,
      signers: [sellerAddress]
    })

    return txnFormater.getTxns()

  } else {
    // Algo Fixed Bid

    const approvalProgram = convertProgram(algoApprovalProgram)
    const clearStateProgram = convertProgram(algoClearProgram)
    const onComplete = OnApplicationComplete.NoOpOC
    const localInts = 0
    const localBytes = 0
    const globalInts = 5 // 0,0285 Algo for every value
    const globalBytes = 3 // 0,05 Algo for every value

    // min balance base:      0,1   Algo
    // min balance storage:   0,2925 Algo
    // min balance deposit:   0,2   Algo
    // total min balance:     0,5925 Algo

    let params = await provider.algod.getTransactionParams().do()
    params.fee = ALGORAND_MIN_TX_FEE
    params.flatFee = true

    const appArgs = [
      encodeUint64(price),
      encodeUint64(sellerShare),
      encodeUint64(royaltyShare),
      encodeUint64(managerShare)
    ]

    const accounts = [
      sellerPayoutAddress,
      royaltyPayoutAddress,
      managerPayoutAddress
    ]

    const foreignAssets = [
      nftIndex
    ]

    let txn = makeApplicationCreateTxn(
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

    txnFormater.push({
      description: "Deploy the fixed bid listing contract to the network.",
      txn: txn,
      signers: [sellerAddress]
    })

    return txnFormater.getTxns()
  }
}