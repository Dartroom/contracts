import { Provider } from "../../contracts"

export interface SetupFixedBidParams {
  appId: string
  nNFTs: number
}

/**
 * Deploy the fixed bid listings on the network.
 * 
 * @param settings
 */
export async function setup(this: Provider, {
  appId,
  nNFTs
}: SetupFixedBidParams): Promise<void> {
  
}