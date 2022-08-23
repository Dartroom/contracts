import { Provider } from "../contracts"
import getAuctionGlobalState from "./getAuctionGlobalState"

export interface GetAuctionParams {
  appId: number
}

interface Transaction {
  "asset-transfer-transaction": {
    amount: number,
    "asset-id": number,
    "close-amount": number,
    receiver: string
  },
  "confirmed-round": number,
  "sender": string,
}

interface TransactionsInfo {
  "current-round": number,
  "next-token": string,
  "transactions": Array<Transaction>
}

export default async function getAuctionInfo({ indexer, algod }: Provider, params: GetAuctionParams) {

  const appState = await getAuctionGlobalState({ indexer, algod }, params)

  const bids = []

  if (appState.highestBidder !== appState.creatorAddress) {

    const txnsInfo = await indexer.lookupAccountTransactions(appState.contractAddress).do().catch((err) => {
      throw err
    }) as TransactionsInfo | undefined
    
    if (txnsInfo) {

      const txns = txnsInfo.transactions

      for (let i = 0; i < txns.length; i++) {

        if (
          txns[i]['asset-transfer-transaction'] &&
          txns[i]['asset-transfer-transaction']['asset-id'] === appState.currencyIndex && 
          txns[i]['asset-transfer-transaction'].receiver === appState.contractAddress
        ) {
          bids.push({
            amount: txns[i]["asset-transfer-transaction"].amount,
            bidderAddress: txns[i].sender,
            round: txns[i]["confirmed-round"]
          })
        }
      }
    }

    return {
      ...appState,
      sellerShareClaimed: appState.sellerShare === 0,
      artistShareClaimed: appState.artistShare === 0,
      managerShareClaimed: appState.managerShare === 0,
      auctionEnded: (appState.timeLeft) < 0,
      bids: bids
    }
  }
}