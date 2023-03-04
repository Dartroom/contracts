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

export interface OptinParams {
  appId: number
  asaArray: Array<number>
}

export async function optin(provider: Provider, {
  appId,
  asaArray
}: OptinParams) {

  const state = await getGlobalState(provider,{ appId })
  const contractAccount = await provider.algod.accountInformation(state.contractAddress).do()

  if (!contractAccount) {
    throw new Error('Contract account information can not be found.')
  }

  for (let i = 0; i < asaArray.length; i++) {
    const index = asaArray[i]
    const match = contractAccount.assets.find((asset: any) => asset['asset-id'] === index)

    if (match) {
      throw new Error(`Contract is already opted into ${index}.`)
    }
  }

  const currentMinBalance = contractAccount['min-balance']
  const currentBalance = contractAccount.amount
  const newMinBalance = currentMinBalance + provider.MIN_BALANCE_FEE * asaArray.length
  const balanceToAdd = newMinBalance - currentBalance

  const txns: Array<Transaction> = []

  let params = await provider.algod.getTransactionParams().do()
  params.fee = ALGORAND_MIN_TX_FEE
  params.flatFee = true

  txns.push(
    makePaymentTxnWithSuggestedParams(
      state.managerAddress, 
      state.contractAddress, 
      balanceToAdd, 
      undefined,
      undefined,
      params
    )
  )

  txns.push(
    makeApplicationNoOpTxn(
      state.managerAddress, 
      {
        ...params,
        fee: ALGORAND_MIN_TX_FEE * (asaArray.length + 1)
      }, 
      appId, 
      [hashAbiMethod("optin()void")], 
      [], 
      [], 
      asaArray
    )
  )

  const txGroup = assignGroupID(txns)

  return txGroup
}