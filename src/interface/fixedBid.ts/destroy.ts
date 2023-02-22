import { Provider } from "../../contracts"

export interface DestroyFixedBidParams {
  appId: string
}

/**
 * Deploy the fixed bid listings on the network.
 * 
 * @param settings
 */
export async function destroy(this: Provider, {
  appId
}: DestroyFixedBidParams): Promise<void> {
  
}