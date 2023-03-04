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

  for (let i = 0; i < asaArray.length; i++) {
    const index = asaArray[i]
    const match = contractAccount.assets.find((asset: any) => asset['asset-id'] === index)

    if (!match) {
      throw new Error(`Contract is not opted into ${index}.`)
    }
  }

  const txns: Array<Transaction> = []

  let params = await provider.algod.getTransactionParams().do()
  params.fee = ALGORAND_MIN_TX_FEE
  params.flatFee = true

  txns.push(
    makeApplicationNoOpTxn(
      state.recipientAddress, 
      {
        ...params,
        fee: ALGORAND_MIN_TX_FEE * (asaArray.length + 1)
      }, 
      appId, 
      [hashAbiMethod("claim()void")], 
      [], 
      [], 
      asaArray
    )
  )

  return txns
}