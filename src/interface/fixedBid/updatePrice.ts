import { Provider } from "../../contracts"
import { getGlobalState } from './getGlobalState'
import { addressAssetBalance } from "../../functions/balance"
import { hashAbiMethod } from "../../functions/abi"
import { 
  ALGORAND_MIN_TX_FEE,
  Transaction,
  makeApplicationNoOpTxn,
  encodeUint64
} from "algosdk"

export interface UpdatePriceFixedBidParams {
  appId: number
  unitPrice: number
}

export async function updatePrice(provider: Provider, {
  appId,
  unitPrice
}: UpdatePriceFixedBidParams): Promise<Array<Transaction>> {
  
  const state = await getGlobalState(provider,{ appId })

  const txns = []

  let params = await provider.algod.getTransactionParams().do()
  params.fee = ALGORAND_MIN_TX_FEE
  params.flatFee = true

  txns.push(
    makeApplicationNoOpTxn(
      state.creatorAddress, 
      {
        ...params,
        fee: ALGORAND_MIN_TX_FEE
      }, 
      appId, 
      [
        hashAbiMethod("update_price(uint64)void"),
        encodeUint64(unitPrice)
      ], 
      [],
      [],
      []
    )
  )

  return txns

}