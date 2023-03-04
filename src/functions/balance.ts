import algosdk, { Indexer } from "algosdk"

async function addressAssetBalance (indexerClient: Indexer, address: string, assetIndex: number) {
  const account = await indexerClient.lookupAccountAssets(address).do()
  const found = account.assets.find((a: any) => a['asset-id'] === assetIndex)
  
  if (found) {
    return found.amount
  } else {
    return -1
  }
}


export { addressAssetBalance }