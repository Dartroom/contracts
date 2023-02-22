import { Provider } from "../../contracts"

export interface BuyFixedBidParams {
  appId: string
  nNFTs: number
}

/**
 * Deploy the fixed bid listings on the network.
 * 
 * @param settings
 */
export async function buy(this: Provider, {
  appId,
  nNFTs
}: BuyFixedBidParams): Promise<void> {
  
}