import { Provider } from "../../contracts"

export interface DeployFixedBidParams {
  sellerAddress: string
  sellerPayoutAddress: string
  artistPayoutAddress: string
  managerPayoutAddress: string
  sellerShare: number
  artistShare: number
  managerShare: number
  nftIndex: number
  price: number
  currencyIndex?: number
}

/**
 * Deploy the fixed bid listings on the network.
 * 
 * @param settings 
 */
export async function deploy(this: Provider, {
  sellerAddress,
  sellerPayoutAddress,
  artistPayoutAddress,
  managerPayoutAddress,
  sellerShare,
  artistShare,
  managerShare,
  nftIndex,
  price,
  currencyIndex
}: DeployFixedBidParams): Promise<void> {
  
}