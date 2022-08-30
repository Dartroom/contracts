import algosdk from "algosdk"
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

const sellerAccount = algosdk.mnemonicToSecretKey('surface hurry neglect setup grape tribe sniff exclude what wrap wave car scheme metal warm toy same glove any again wrong problem audit ability appear')
const artistAccount = algosdk.mnemonicToSecretKey('oak tip snake spoil vendor screen total pull wise casual property slab armed large gravity piano human trick taste cube broccoli fabric weather abandon unaware')
const buyerAccount = algosdk.mnemonicToSecretKey('space canal chaos traffic amateur tobacco atom holiday enroll sell unknown install pride render pulp rival waste name crop fossil fitness urban fruit about exit')
const managerAddress = "IC6Q7LOQWCUYD3PQS2E43BEOIDVPTDBZHZ6T5VGEBLBCRQVOMYKSZBUU6I"
const nftIndex = 73652018

// healt()

async function healt () {
  // const healthAlgod = await c.algod.status().do().catch((err) => {
  //   console.log(err)
  // });
  
  // console.log(healthAlgod)
  
  // const healthIndexer = await c.indexer.makeHealthCheck().do().catch((err) => {
  //   console.log(err)
  // });
  
  // console.log(healthIndexer)

  // const state = await c.getAuctionInfo({ appId: 94473499 })
  // console.log(state)
}

deployAuction()

async function deployAuction () {
  const txns = await c.deployAuction({
    sellerAddress: sellerAccount.addr,
    sellerPayoutAddress: sellerAccount.addr,
    artistPayoutAddress: artistAccount.addr,
    managerAddress: managerAddress,
    sellerShare: 90,
    artistShare: 7,
    managerShare: 3,
    nftIndex: nftIndex,
    reservePrice: 10,
    minBidIncrease: 10,
  })

  const signedTxn = txns[0].signTxn(sellerAccount.sk)

  const response = await c.algod.sendRawTransaction(signedTxn).do().catch((err) => {console.log(err)});
  console.log(response)
}