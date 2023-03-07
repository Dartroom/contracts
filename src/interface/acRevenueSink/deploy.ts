import { Contracts, Provider } from "../../contracts"
import { 
  ALGORAND_MIN_TX_FEE,
  isValidAddress, 
  OnApplicationComplete,
  makeApplicationCreateTxn,
  encodeUint64
} from "algosdk"
import { convertProgram } from "../../functions/program"
import acApprovalProgram from '../../contracts/acRevenueSink/approval'
import acClearProgram from '../../contracts/acRevenueSink/clearState'

export interface DeploySinkParams {
  recipientAddress: string
  managerAddress: string
}

export async function deploy({ algod }: Provider,{
  recipientAddress,
  managerAddress
}: DeploySinkParams) {
  
  if (
    !isValidAddress(recipientAddress) || 
    !isValidAddress(managerAddress)
  ) {
    throw new Error('One or more of the provided Algorand address are not in the correct format.')
  }

  const approvalProgram = convertProgram(acApprovalProgram)
  const clearStateProgram = convertProgram(acClearProgram)
  const onComplete = OnApplicationComplete.NoOpOC
  const localInts = 0
  const localBytes = 0
  const globalInts = 0 // 0,0285 Algo for every value
  const globalBytes = 2 // 0,05 Algo for every value

  // min balance base of 0,1 Algo
  // min balance storage of 0,1 Algo
  // min balance price: 0,2 Algo
  // min balance deposit: 0,1 Algo + 0,1 Algo for each currency

  let params = await algod.getTransactionParams().do()
  params.fee = ALGORAND_MIN_TX_FEE
  params.flatFee = true

  let txn = makeApplicationCreateTxn(
    managerAddress,
    params,
    onComplete,
    approvalProgram,
    clearStateProgram,
    localInts,
    localBytes,
    globalInts,
    globalBytes,
    [],
    [
      recipientAddress,
      managerAddress
    ],
    undefined,
    []
  )

  return [txn]
}