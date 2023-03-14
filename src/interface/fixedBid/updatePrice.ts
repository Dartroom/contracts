import { Provider } from "../../contracts"
import { getGlobalState } from './getGlobalState'
import { TxnFormatter } from "../../functions/txn"
import { hashAbiMethod } from "../../functions/abi"
import { resolveObject } from '../../functions/promise'
import { 
  ALGORAND_MIN_TX_FEE,
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
}: UpdatePriceFixedBidParams) {
  
  const state = await getGlobalState(provider,{ appId })

  const { params, account } = await resolveObject({
    params: provider.algod.getTransactionParams().do(),
    account: provider.algod.accountInformation(state.creatorAddress).do()
  })
  
  params.fee = ALGORAND_MIN_TX_FEE
  params.flatFee = true

  const txnFormater = new TxnFormatter(provider)

  txnFormater.push({
    description: "Call the smart contract to update the unit price of the listing.",
    txn: makeApplicationNoOpTxn(
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
    ),
    signers: [state.creatorAddress],
    authAddress: account['auth-addr'] || state.creatorAddress
  })

  return txnFormater.getTxns()
}