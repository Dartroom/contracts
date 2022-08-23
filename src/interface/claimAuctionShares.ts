import { Provider, TxnArray } from "../contracts"

export interface claimAuctionSharesParams {
  appId: number
  senderAddress: string
}

export default async function claimAuctionShares({ indexer }: Provider, { 
  appId, 
  senderAddress
}: claimAuctionSharesParams): TxnArray {
  
  
  
  return []
}