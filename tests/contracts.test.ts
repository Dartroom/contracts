import Contracts from "../src/contracts"

const c = new Contracts({
  indexer: {
    token: "",
    portNet: "",
    baseServer: "https://algoindexer.testnet.algoexplorerapi.io",
  },
  algod: {
    token: {'X-API-key' : '5eheA7RdhM2XHLxdY2xPmae6uobgvI4UaHMMjT3K'},
    portNet: "",
    baseServer: "https://testnet-algorand.api.purestake.io/ps2",
  }
})

healt()

async function healt () {
  // const healthAlgod = await c.algod.status().do().catch((err) => {
  //   console.log(err)
  // });
  
  // console.log(healthAlgod)
  
  // const healthIndexer = await c.indexer.makeHealthCheck().do().catch((err) => {
  //   console.log(err)
  // });
  
  // console.log(healthIndexer)

  const state = await c.getAuctionInfo({ appId: 94473499 })
  console.log(state)
}