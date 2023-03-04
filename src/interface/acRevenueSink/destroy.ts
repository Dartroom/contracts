import { Contracts, Provider } from "../../contracts"
import { getGlobalState } from './getGlobalState'
import { 
  ALGORAND_MIN_TX_FEE,
  makeApplicationDeleteTxn
} from "algosdk"

export interface DestroySinkParams {
  appId: number
}

export async function destroy(provider: Provider,{
  appId
}: DestroySinkParams) {

  const state = await getGlobalState(provider,{ appId })
  
  let params = await provider.algod.getTransactionParams().do()
  params.fee = ALGORAND_MIN_TX_FEE * 2
  params.flatFee = true

  let txn = makeApplicationDeleteTxn(
    state.managerAddress,
    params,
    appId,
    [],
    [],
    [],
    []
  )

  return [txn]
}