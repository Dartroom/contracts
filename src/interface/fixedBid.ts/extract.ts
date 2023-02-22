import { Provider } from "../../contracts"

export interface ExtractFixedBidParams {
  appId: string
  nNFTs: number
}

/**
 * Deploy the fixed bid listings on the network.
 * 
 * @param settings
 */
export async function extract(this: Provider, {
  appId,
  nNFTs
}: ExtractFixedBidParams): Promise<void> {
  
}