import { Provider } from "../../contracts"
import { getApplicationAddress } from "algosdk"
import { getGlobalAddress } from '../../functions/globalState'
import acApprovalProgram from '../../contracts/acRevenueSink/approval'
import acClearProgram from '../../contracts/acRevenueSink/clearState'

export interface FindParams {
  asset: number
  recipientAddress: string
  managerAddress: string
}

interface TxnsByAccount {
  "current-round": number
  "next-token": string
  transactions: Array<{
    "tx-type": string
    "application-transaction": {
      accounts: Array<string>
      "application-args": Array<string>
      "approval-program"?: string
      "clear-state-program"?: string
      "application-id": number
      "foreign-apps": Array<number>
      "foreign-assets": Array<number>
      "global-state-schema": {
        "num-byte-slice": number
        "num-uint": number
      }
      "local-state-schema": {
        "num-byte-slice": number
        "num-uint": number
      }
      "on-completion": string
    }
    "created-application-index"?: number,
    "close-rewards": number
    "closing-amount": number
    "confirmed-round": number
    fee: number
    "first-valid": number
    "genesis-hash": string
    "genesis-id": string
    group: string
    id: string
    "intra-round-offset": number
    "last-valid": number
    note: string
    "receiver-rewards": number
    "round-time": number
    sender: string
    "sender-rewards": number
    signature: {
      sig: string
    }
  }>
}

export async function find({ indexer }: Provider, { 
  asset,
  recipientAddress,
  managerAddress
}: FindParams) {

  const tnxs = await indexer.lookupAccountTransactions(managerAddress).do() as TxnsByAccount | undefined

  if (!tnxs) {
    throw new Error('Fetching txns failed.')
  }

  const sinkCreationTxns = tnxs.transactions.filter((txn) =>
    txn["tx-type"] === 'appl' &&
    txn["application-transaction"] &&
    txn["application-transaction"].accounts.includes(managerAddress) &&
    txn["application-transaction"].accounts.includes(recipientAddress) &&
    txn["application-transaction"]["foreign-assets"].includes(asset) &&
    txn["application-transaction"]["application-id"]
  )

  const appIndexes = sinkCreationTxns.map((txn) => txn["application-transaction"]["application-id"])
  const uniqueIndexes = [...new Set(appIndexes)]
  const apps = uniqueIndexes.map((index) => {
    return {
      id: index,
      address: getApplicationAddress(index)
    }
  })

  const fetchArray = []

  for (let i = 0; i < apps.length; i++) {
    const app = apps[i]

    if (app) {
      fetchArray.push(indexer.lookupApplications(app.id).do().catch((err) => err))
      fetchArray.push(indexer.lookupAccountByID(app.address).do().catch((err) => err))
    }
  }

  const appAndAccounts = await Promise.all(fetchArray)

  const fullAppInfo = apps.map((app) => {

    const appInfo = appAndAccounts.find((response) => response['application'] && response['application'].id == app.id)
    const accountInfo = appAndAccounts.find((response) => response['account'] && response['account'].address == app.address)

    return {
      ...app,
      application: appInfo,
      account: accountInfo
    }
  }).filter((app) => app.account && app.application)
  
  return fullAppInfo
}