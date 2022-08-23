import { Provider, TxnArray } from "../contracts"

export interface bidParams {
  appId: number
  amount: number
  bidderAddress: string
}

export default async function placeAuctionBid({ indexer }: Provider, { 
  appId, 
  amount, 
  bidderAddress 
}: bidParams): TxnArray {
  
  
  
  return []
}