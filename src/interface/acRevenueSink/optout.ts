import { Provider } from "../../contracts"
import { getGlobalState } from './getGlobalState'
import { addressAssetBalance } from "../../functions/balance"
import { hashAbiMethod } from "../../functions/abi"
import { 
  ALGORAND_MIN_TX_FEE,
  Transaction,
  makePaymentTxnWithSuggestedParams,
  makeApplicationNoOpTxn,
  encodeUint64
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

  const txns: Array<Transaction> = []

  let params = await provider.algod.getTransactionParams().do()
  params.fee = ALGORAND_MIN_TX_FEE
  params.flatFee = true

  txns.push(
    makeApplicationNoOpTxn(
      state.managerAddress, 
      {
        ...params,
        fee: ALGORAND_MIN_TX_FEE * (asaArray.length + 2)
      }, 
      appId, 
      [hashAbiMethod("optout()void")], 
      [], 
      [], 
      asaArray
    )
  )

  return txns
}