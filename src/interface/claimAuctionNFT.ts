import { Provider, TxnArray } from "../contracts"

export interface claimNFTParams {
  appId: number
  senderAddress: string
  checkOptedIn: boolean
}

export default async function claimAuctionNFT({ indexer }: Provider, { 
  appId, 
  senderAddress, 
  checkOptedIn 
}: claimNFTParams): TxnArray {
  
  
  
  return []
}