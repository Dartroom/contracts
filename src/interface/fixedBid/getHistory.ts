import { Provider } from "../../contracts"
import { getGlobalState, IGetGlobalState, } from './getGlobalState'
import { hashAbiMethod } from "../../functions/abi"
import { getGlobalUint, getGlobalAddress } from "../../functions/globalState"
import { getApplicationAddress } from "algosdk"
import type { 
  IlookupAccountTransactions,
  ISearchForTransactions,
  ITransaction
} from "../../types/indexer"

export interface GetHistoryFixedBidParams {
  appId: number
}

interface BaseEvent {
  groupId: string | undefined
  round: number
  timestamp: string
  txIds: Array<string>
  txns: Array<ITransaction>
}

interface DeployEvent extends BaseEvent {
  type: "deploy"
  data: {}
}

interface DestroyEvent extends BaseEvent {
  type: "destroy"
  data: {}
}

interface SetupEvent extends BaseEvent {
  type: "setup"
  data: {}
}

interface DepositEvent extends BaseEvent {
  type: "deposit"
  data: {
    amount: number
    sender: string
  }
}

interface ExtractEvent extends BaseEvent {
  type: "extract"
  data: {
    amount: number
  }
}

interface BuyEvent extends BaseEvent {
  type: "buy"
  data: {
    buyerAddress: string
    unitPrice: number
    totalPrice: number
    amount: number
  }
}

interface UpdatePriceEvent extends BaseEvent {
  type: "updatePrice"
  data: {
    price: number
  }
}

export type HistoryEvent = BuyEvent | UpdatePriceEvent | DeployEvent | DepositEvent | DestroyEvent | ExtractEvent | SetupEvent

function defaultData (txn: ITransaction) {
  return {
    groupId: txn.group,
    round: txn["confirmed-round"] || 0,
    timestamp: new Date((txn["round-time"] || 0) * 1000).toISOString(),
  }
}

function parseDeposit (txn: ITransaction, state: IGetGlobalState): void | DepositEvent {

  if (!txn["asset-transfer-transaction"]) {
    return
  }

  if (txn["asset-transfer-transaction"].receiver !== state.contractAddress) {
    return
  }

  if (txn["asset-transfer-transaction"].amount === 0) {
    return
  }

  if (txn["asset-transfer-transaction"]["asset-id"] !== state.nftIndex) {
    return
  }

  if (txn.sender === state.contractAddress) {
    return
  }

  return {
    type: "deposit",
    ...defaultData(txn),
    txIds: [txn.id],
    data: {
      amount: txn["asset-transfer-transaction"].amount,
      sender: txn.sender
    },
    txns: [txn]
  }
}

function parseSetup (i: number, txns: Array<ITransaction>, state: IGetGlobalState): void | SetupEvent {

  if (txns.length < i + 2) {
    return
  }

  const optInTxn = txns[i]
  const minBalanceTxn = txns[i + 1]

  if (!minBalanceTxn || !optInTxn) {
    return
  }

  if (!minBalanceTxn.group || !optInTxn.group) {
    return
  }

  if (minBalanceTxn.group !== optInTxn.group) {
    return
  }

  if (minBalanceTxn["tx-type"] !== "pay" || optInTxn["tx-type"] !== "appl") {
    return
  }

  if (minBalanceTxn.sender !== state.creatorAddress || optInTxn.sender !== state.creatorAddress) {
    return
  }

  const innerOptIn = optInTxn["inner-txns"]

  if (!innerOptIn || !innerOptIn[0]) {
    return
  }

  if (innerOptIn[0].sender !== state.contractAddress) {
    return
  }

  if (innerOptIn[0]["asset-transfer-transaction"]?.receiver !== state.contractAddress) {
    return
  }

  if (state.currencyIndex > 0) {

    const globalState = optInTxn["global-state-delta"]
  
    if (globalState) {
      state.sellerRevenueSink = getGlobalAddress(globalState, 'seller_revenue_sink')
      state.royaltyRevenueSink = getGlobalAddress(globalState, 'royalty_revenue_sink')
    }
  }

  return {
    type: "setup",
    ...defaultData(optInTxn),
    txIds: [minBalanceTxn.id, optInTxn.id],
    data: {},
    txns: [minBalanceTxn, optInTxn]
  }
}

function parseBuy (i: number, txns: Array<ITransaction>, state: IGetGlobalState): void | BuyEvent {

  if (txns.length < i + 2) {
    return
  }

  const payout = txns[i]
  const payment = txns[i + 1]

  if (!payout || !payment) {
    return
  }

  if (!payout.group || !payment.group) {
    return
  }

  if (payout.group !== payment.group) {
    return
  }

  if (payout["tx-type"] !== "appl" || !(payment["tx-type"] === "pay" || payment["tx-type"] === "axfer")) {
    return
  }

  if (
    !(
      payment["payment-transaction"]?.receiver === state.contractAddress ||
      payment['asset-transfer-transaction']?.receiver === state.contractAddress
    )
  ) {
    return
  }

  if (!payout["inner-txns"]) {
    return
  }

  let totalPrice

  if (state.currencyIndex !== 0 && payment['asset-transfer-transaction']) {

    totalPrice = payment['asset-transfer-transaction'].amount

  } else if (payment['payment-transaction']) {

    totalPrice = payment['payment-transaction'].amount

  } else {
    return
  }

  const innerNFTPayout = payout["inner-txns"][payout['inner-txns'].length - 1]

  if (!innerNFTPayout || !innerNFTPayout["asset-transfer-transaction"]) {
    return
  }

  const amount = innerNFTPayout["asset-transfer-transaction"].amount
  const unitPrice = totalPrice / amount

  return {
    type: "buy",
    ...defaultData(payment),
    txIds: [payment.id, payout.id],
    data: {
      buyerAddress: payment.sender,
      unitPrice,
      totalPrice,
      amount
    },
    txns: [payment, payout]
  }
}

function parseUpdatePrice (txn: ITransaction): void | UpdatePriceEvent {

  if (!txn["application-transaction"] || txn["tx-type"] !== "appl") {
    return
  }

  const method = hashAbiMethod("update_price(uint64)void", "base64")

  if (!txn["application-transaction"]['application-args'].includes(method)) {
    return
  }

  if (!txn["global-state-delta"]) {
    return
  }

  const price = getGlobalUint(txn["global-state-delta"], "unit_price")

  if (!price) {
    return
  }

  return {
    type: "updatePrice",
    ...defaultData(txn),
    txIds: [txn.id],
    data: {
      price
    },
    txns: [txn]
  }
}

function parseDeploy (txn: ITransaction): void | DeployEvent {
  
  if (txn["tx-type"] !== "appl" || !txn["created-application-index"]) {
    return
  }

  if (!txn['application-transaction'] || txn['application-transaction']["application-id"] !== 0) {
    return
  }

  return {
    type: "deploy",
    ...defaultData(txn),
    txIds: [txn.id],
    data: {},
    txns: [txn]
  }
}

function parseExtract (txn: ITransaction): void | ExtractEvent {
  
  if (!txn["application-transaction"] || txn["tx-type"] !== "appl") {
    return
  }

  const method = hashAbiMethod("extract(uint64)void", "base64")

  if (!txn["application-transaction"]['application-args'].includes(method)) {
    return
  }

  if (!txn['inner-txns']) {
    return
  }

  const axfer = txn["inner-txns"][0]

  if (!axfer || !axfer['asset-transfer-transaction']) {
    return
  }

  return {
    type: "extract",
    ...defaultData(txn),
    txIds: [txn.id],
    data: {
      amount: axfer['asset-transfer-transaction'].amount
    },
    txns: [txn]
  }
}

function parseDestroy (txn: ITransaction): void | DestroyEvent {

  if (txn["tx-type"] !== "appl" || !txn["application-transaction"]) {
    return
  }

  if (txn["application-transaction"]['on-completion'] !== "delete") {
    return
  }

  return {
    type: "destroy",
    ...defaultData(txn),
    txIds: [txn.id],
    data: {},
    txns: [txn]
  }
}

export async function getHistory(provider: Provider, { 
  appId 
}: GetHistoryFixedBidParams) {

  const events: Array<HistoryEvent> = []
  const contractAddress = getApplicationAddress(appId)

  const [{ transactions }, appCalls] = await Promise.all([
    provider.indexer.lookupAccountTransactions(contractAddress).do() as Promise<IlookupAccountTransactions>,
    provider.indexer.searchForTransactions().applicationID(appId).do() as Promise<ISearchForTransactions>
  ])

  let destoryTxn
  let deployTxn
  let latestPrice

  for (let i = appCalls.transactions.length - 1; i >= 0; i--) {
    const transaction = appCalls.transactions[i]

    if (!transaction) {
      continue
    }

    const deploy = parseDeploy(transaction)

    if (deploy) {
      events.push(deploy)
      appCalls.transactions.splice(i, 1)
      deployTxn = deploy
      continue
    }

    const updatePrice = parseUpdatePrice(transaction)

    if (updatePrice) {
      events.push(updatePrice)
      appCalls.transactions.splice(i, 1)
      latestPrice = updatePrice.data.price
      continue
    }

    const extract = parseExtract(transaction)

    if (extract) {
      events.push(extract)
      appCalls.transactions.splice(i, 1)
      continue
    }

    const destroy = parseDestroy(transaction)

    if (destroy) {
      events.push(destroy)
      appCalls.transactions.splice(i, 1)
      destoryTxn = destroy
      continue
    }

    appCalls.transactions.splice(i, 1)
  }

  if (!deployTxn || !deployTxn.txns[0]) {
    return
  }

  const globalState = deployTxn.txns[0]["global-state-delta"]

  if (!globalState) {
    return
  }

  const state = {
    nftIndex: getGlobalUint(globalState, 'nft_index'),
    currencyIndex: getGlobalUint(globalState, 'currency_index'),
    unitPrice: latestPrice || getGlobalUint(globalState, 'unit_price'),
    sellerShare: getGlobalUint(globalState, 'seller_share'),
    royaltyShare: getGlobalUint(globalState, 'royalty_share'),
    managerShare: getGlobalUint(globalState, 'manager_share'),
    sellerPayoutAddress: getGlobalAddress(globalState, 'seller_payout_address'),
    royaltyPayoutAddress: getGlobalAddress(globalState, 'royalty_payout_address'),
    managerPayoutAddress: getGlobalAddress(globalState, 'manager_payout_address'),
    sellerRevenueSink: getGlobalAddress(globalState, 'seller_revenue_sink'),
    royaltyRevenueSink: getGlobalAddress(globalState, 'royalty_revenue_sink'),
    creatorAddress: deployTxn.txns[0].sender,
    contractAddress: getApplicationAddress(appId),
    deleted: destoryTxn ? true : false,
  }

  for (let i = 0; i < transactions.length; i++) {
    const transaction = transactions[i]

    if (!transaction) {
      continue
    }

    const deposit = parseDeposit(transaction, state)

    if (deposit) {
      events.push(deposit)
      continue
    }

    const setup = parseSetup(i, transactions, state)

    if (setup) {
      events.push(setup)
      continue
    }

    const buy = parseBuy(i, transactions, state)

    if (buy) {
      events.push(buy)
      continue
    }
  }

  events.sort((a, b) => b.round - a.round)

  return {
    appId,
    state,
    events
  }
}