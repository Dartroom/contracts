import { Provider } from "../../contracts"
import { getGlobalState } from './getGlobalState'
import { hashAbiMethod } from "../../functions/abi"
import { 
  ALGORAND_MIN_TX_FEE,
  Transaction,
  makePaymentTxnWithSuggestedParams,
  makeApplicationNoOpTxn,
  assignGroupID
} from "algosdk"

export interface ClaimParams {
  appId: number
  asaArray: Array<number>
}

export async function claim(provider: Provider, {
  appId,
  asaArray
}: ClaimParams) {

  const state = await getGlobalState(provider,{ appId })
  const contractAccount = await provider.algod.accountInformation(state.contractAddress).do()

  if (!contractAccount) {
    throw new Error('Contract account information can not be found.')
  }

  let currentBatch: Array<number> = []
  const batchedAsas: Array<Array<number>> = []

  for (let i = 0; i < asaArray.length; i++) {
    const index = asaArray[i]
    const match = contractAccount.assets.find((asset: any) => asset['asset-id'] === index)

    if (!match) {
      throw new Error(`Contract is not opted into ${index}.`)
    }

    if (!index) {
      return
    }

    if (currentBatch.length < 8) {
      currentBatch.push(index)
    } else {
      batchedAsas.push([...currentBatch])
      currentBatch = [index]
    }
  }

  batchedAsas.push([...currentBatch])

  const txns: Array<Transaction> = []

  let params = await provider.algod.getTransactionParams().do()
  params.fee = ALGORAND_MIN_TX_FEE
  params.flatFee = true

  for (let i = 0; i < batchedAsas.length; i++) {
    const batch = batchedAsas[i]

    if (!batch) {
      return
    }

    txns.push(
      makeApplicationNoOpTxn(
        state.recipientAddress,
        {
          ...params,
          fee: ALGORAND_MIN_TX_FEE * (batch.length + 1)
        },
        appId,
        [hashAbiMethod("claim()void")],
        [],
        [],
        batch
      )
    )
  }

  if (txns.length > 1) {
    const txGroup = assignGroupID(txns)

    return txGroup
  } else {
    return txns
  }
}