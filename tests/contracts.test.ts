import fs from 'fs'
import algosdk from "algosdk"
import { Contracts } from '../index'

const c = new Contracts({
  indexer: {
    token: "",
    portNet: "",
    baseServer: "https://algoindexer.testnet.algoexplorerapi.io",
  },
  algod: {
    token: {'X-API-key' : ''},
    portNet: "",
    baseServer: "https://testnet-algorand.api.purestake.io/ps2",
  }
})

const sellerAccount = algosdk.mnemonicToSecretKey('')
const artistAccount = algosdk.mnemonicToSecretKey('')
const buyerAccount = algosdk.mnemonicToSecretKey('')
const managerAddress = ""
const nftIndex = 0
const appId = 0


// healt()

async function healt () {
  const healthAlgod = await c.algod.status().do().catch((err) => {
    console.log(err)
  });
  
  console.log(healthAlgod)
  
  const healthIndexer = await c.indexer.makeHealthCheck().do().catch((err) => {
    console.log(err)
  });
  
  console.log(healthIndexer)

  const state = await c.getAuctionInfo({ appId: 94473499 })
  console.log(state)
}

jest.setTimeout(10000)

// test('deployAuction', async() => {
//   const appId = await deployAuction()
//   console.log(appId)
//   expect(typeof appId).toBe('number')
// })

// test('setAuction', async () => {
//   const confirmedRound = await setAuction()
//   console.log(confirmedRound)
//   expect(typeof confirmedRound).toBe('number')
// })

// test('PimaryBid', async () => {
//   const confirmedRound = await primaryBid()
//   console.log(confirmedRound)
//   expect(typeof confirmedRound).toBe('number')
// })

// test('SecondaryBid', async () => {
//   const confirmedRound = await secondaryBid()
//   console.log(confirmedRound)
//   expect(typeof confirmedRound).toBe('number')
// })

// test('ClaimNFT', async () => {
//   const confirmedRound = await claimNFT()
//   console.log(confirmedRound)
//   expect(typeof confirmedRound).toBe('number')
// })

// test('ClaimShares', async () => {
//   const confirmedRound = await claimShares()
//   console.log(confirmedRound)
//   expect(typeof confirmedRound).toBe('number')
// })

test('destoryAuction', async () => {
  const confirmedRound = await destoryAuction()
  console.log(confirmedRound)
  expect(typeof confirmedRound).toBe('number')
})

// test('getInfo', async () => {
//   const info = await c.getAuctionInfo({ appId: appId })
//   console.log(info)
//   expect(typeof info?.duration).toBe('number')
// })

async function deployAuction (): Promise<number> {
  const txns = await c.deployAuction({
    sellerAddress: sellerAccount.addr,
    sellerPayoutAddress: sellerAccount.addr,
    artistPayoutAddress: artistAccount.addr,
    managerAddress: managerAddress,
    sellerShare: 90,
    artistShare: 7,
    managerShare: 3,
    nftIndex: nftIndex,
    reservePrice: 1 * 1000000,
    minBidIncrease: 1 * 1000000,
  })

  const signedTxn = txns[0].signTxn(sellerAccount.sk)

  const response = await c.algod.sendRawTransaction(signedTxn).do().catch((err) => {console.log(err)})
  const app = await algosdk.waitForConfirmation(c.algod, response.txId, 5)

  return app['application-index']
}

async function setAuction () {
  const txns = await c.setupAuction({ appId: appId })

  const signedTxns: Array<Uint8Array> = []

  for (let i = 0; i < txns.length; i++) {
    signedTxns.push(txns[i].signTxn(sellerAccount.sk))
  }

  const response = await c.algod.sendRawTransaction(signedTxns).do().catch((err) => {console.log(err)})
  const txnInfo = await algosdk.waitForConfirmation(c.algod, response.txId, 5)
  return txnInfo['confirmed-round']
}

async function primaryBid () {
  const txns = await c.placeAuctionBid({ appId: appId, bidderAddress: buyerAccount.addr, amount: 10 * 1000000 })

  const signedTxns: Array<Uint8Array> = []

  for (let i = 0; i < txns.length; i++) {
    signedTxns.push(txns[i].signTxn(buyerAccount.sk))
  }

  const response = await c.algod.sendRawTransaction(signedTxns).do().catch((err) => {console.log(err)})
  const txnInfo = await algosdk.waitForConfirmation(c.algod, response.txId, 5)
  return txnInfo['confirmed-round']
}

async function secondaryBid () {
  const txns = await c.placeAuctionBid({ appId: appId, bidderAddress: artistAccount.addr, amount: 2 * 1000000 })

  const signedTxns: Array<Uint8Array> = []

  for (let i = 0; i < txns.length; i++) {
    signedTxns.push(txns[i].signTxn(artistAccount.sk))
  }

  const response = await c.algod.sendRawTransaction(signedTxns).do().catch((err) => {console.log(err)})
  const txnInfo = await algosdk.waitForConfirmation(c.algod, response.txId, 5)
  return txnInfo['confirmed-round']
}

async function claimNFT () {
  const tnxs = await c.claimAuctionNFT({ appId: appId, senderAddress: buyerAccount.addr })

  const signedTxn = tnxs[0].signTxn(buyerAccount.sk)

  // const drr = await algosdk.createDryrun({
  //   client: c.algod, 
  //   txns: [
  //     algosdk.decodeSignedTransaction(signedTxn),
  //   ]
  // })

  // const filename = '/home/stef/code/dartroom/dartroom-contracts/claimNFT.msgp'
  // fs.writeFileSync(filename, algosdk.encodeObj(drr.get_obj_for_encoding(true)))

  const response = await c.algod.sendRawTransaction(signedTxn).do().catch((err) => {console.log(err)})
  const txnInfo = await algosdk.waitForConfirmation(c.algod, response.txId, 5)
  return txnInfo['confirmed-round']
}

async function claimShares () {
  const txns = await c.claimAuctionShares({ appId: appId, senderAddress: buyerAccount.addr })

  const signedTxn = txns[0].signTxn(buyerAccount.sk)

  const response = await c.algod.sendRawTransaction(signedTxn).do().catch((err) => {console.log(err)})
  const txnInfo = await algosdk.waitForConfirmation(c.algod, response.txId, 5)
  return txnInfo['confirmed-round']
}

async function destoryAuction () {
  const txns = await c.destoryAuction({ appId: appId })

  const signedTxn = txns[0].signTxn(sellerAccount.sk)

  const response = await c.algod.sendRawTransaction(signedTxn).do().catch((err) => {console.log(err)})
  const app = await algosdk.waitForConfirmation(c.algod, response.txId, 5)
  
  return app['confirmed-round']
}