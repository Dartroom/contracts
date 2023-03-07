import { Provider } from "../../contracts"
import { getGlobalState } from './getGlobalState'
import { addressAssetBalance } from "../../functions/balance"
import { hashAbiMethod } from "../../functions/abi"
import { 
  ALGORAND_MIN_TX_FEE,
  Transaction,
  makeApplicationNoOpTxn,
  assignGroupID
} from "algosdk"

export interface OptoutParams {
  appId: number
  asaArray: Array<number>
}

export async function optout(provider: Provider, {
  appId,
  asaArray
}: OptoutParams) {

  const state = await getGlobalState(provider,{ appId })

  let currentBatch: Array<number> = []
  const batchedAsas: Array<Array<number>> = []

  for (let i = 0; i < asaArray.length; i++) {
    const index = asaArray[i]

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
        state.managerAddress,
        {
          ...params,
          fee: ALGORAND_MIN_TX_FEE * (batch.length + 2)
        }, 
        appId,
        [hashAbiMethod("optout()void")], 
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