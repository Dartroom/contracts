import { Contracts } from '../index'
import { writeFileSync } from 'node:fs'
import algosdk, { createDryrun, decodeSignedTransaction } from "algosdk"

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
const managerAccount = algosdk.mnemonicToSecretKey('')

const appId = 162482533

jest.setTimeout(10000)

// test('deploy', async () => {
//   const appId = await deploy()
//   console.log(appId)
//   expect(typeof appId).toBe('number')
// })

// test('setup', async () => {
//   const round = await setup()
//   console.log(round)
//   expect(typeof round).toBe('number')
// })

// test('deposit', async () => {
//   const round = await deposit()
//   console.log(round)
//   expect(typeof round).toBe('number')
// })

// test('updatePrice', async () => {
//   const round = await updatePrice()
//   console.log(round)
//   expect(typeof round).toBe('number')
// })

// test('buy', async () => {
//   const round = await buy()
//   console.log(round)
//   expect(typeof round).toBe('number')
// })

// test('extract', async () => {
//   const round = await extract()
//   console.log(round)
//   expect(typeof round).toBe('number')
// })

// test('destroy', async () => {
//   const round = await destory()
//   console.log(round)
//   expect(typeof round).toBe('number')
// })

async function deploy() {
  
  const txns = await c.fixedBid.deploy({
    sellerAddress: sellerAccount.addr,
    sellerPayoutAddress: sellerAccount.addr,
    royaltyPayoutAddress: artistAccount.addr,
    managerPayoutAddress: managerAccount.addr,
    sellerShare: 900,
    royaltyShare: 70,
    managerShare: 30,
    price: 10000,
    nftIndex: 161534719,
    currencyIndex: 0
  })

  if (!txns) {
    return
  }

  // const signedTxns = txns.map((txn) => {
  //   return decodeSignedTransaction(txn.signTxn(sellerAccount.sk))
  // })

  // const dryrunRequest = await createDryrun({
  //   client: c.algod,
  //   txns: signedTxns,
  // }).catch((err) => { console.log(err) })

  // if (!dryrunRequest) {
  //   return
  // }

  // await writeFileSync('./tests/fixedbid/deploy.msgp', algosdk.encodeObj(dryrunRequest.get_obj_for_encoding(true)))
  // return 0

  const signedTxns = txns.map((txn) => {
    return txn.signTxn(sellerAccount.sk)
  })

  const response = await c.algod.sendRawTransaction(signedTxns).do().catch((err) => {console.log(err)})
  const app = await algosdk.waitForConfirmation(c.algod, response.txId, 5)

  return app['application-index']
}

async function setup() {

  const txns = await c.fixedBid.setup({
    appId: appId,
    nNFTs: 6
  })

  // const signedTxns = txns.map((txn) => {
  //   return decodeSignedTransaction(txn.signTxn(sellerAccount.sk))
  // })

  // const dryrunRequest = await createDryrun({
  //   client: c.algod,
  //   txns: signedTxns,
  // }).catch((err) => { console.log(err) })

  // if (!dryrunRequest) {
  //   return
  // }

  // await writeFileSync('./tests/fixedbid/setup.msgp', algosdk.encodeObj(dryrunRequest.get_obj_for_encoding(true)))
  // return 0

  const signedTxns = txns.map((txn) => {
    return txn.signTxn(sellerAccount.sk)
  })

  const response = await c.algod.sendRawTransaction(signedTxns).do().catch((err) => {console.log(err)})
  const txnInfo = await algosdk.waitForConfirmation(c.algod, response.txId, 5)

  return txnInfo['confirmed-round']
}

async function deposit() {
  const txns = await c.fixedBid.deposit({
    appId: appId,
    nNFTs: 5,
  })

  if (!txns) {
    return
  }

  const signedTxns = txns.map((txn) => {
    return txn.signTxn(sellerAccount.sk)
  })

  const response = await c.algod.sendRawTransaction(signedTxns).do().catch((err) => {console.log(err)})
  const txnInfo = await algosdk.waitForConfirmation(c.algod, response.txId, 5)

  return txnInfo['confirmed-round']
}

async function updatePrice() {
  const txns = await c.fixedBid.updatePrice({
    appId: appId,
    unitPrice: 200000,
  })

  if (!txns) {
    return
  }

  // const signedTxns = txns.map((txn) => {
  //   return decodeSignedTransaction(txn.signTxn(sellerAccount.sk))
  // })

  // const dryrunRequest = await createDryrun({
  //   client: c.algod,
  //   txns: signedTxns,
  // }).catch((err) => { console.log(err) })

  // if (!dryrunRequest) {
  //   return
  // }

  // await writeFileSync('./tests/fixedbid/updatePrice.msgp', algosdk.encodeObj(dryrunRequest.get_obj_for_encoding(true)))
  // return 0

  const signedTxns = txns.map((txn) => {
    return txn.signTxn(sellerAccount.sk)
  })

  const response = await c.algod.sendRawTransaction(signedTxns).do().catch((err) => {console.log(err)})
  const txnInfo = await algosdk.waitForConfirmation(c.algod, response.txId, 5)

  return txnInfo['confirmed-round']
}

async function buy() {
  const txns = await c.fixedBid.buy({
    appId: appId,
    nNFTs: 2,
    buyerAddress: buyerAccount.addr
  })

  if (!txns) {
    return
  }

  // const signedTxns = txns.map((txn) => {
  //   return decodeSignedTransaction(txn.signTxn(buyerAccount.sk))
  // })

  // const dryrunRequest = await createDryrun({
  //   client: c.algod,
  //   txns: signedTxns,
  // }).catch((err) => { console.log(err) })

  // if (!dryrunRequest) {
  //   return
  // }

  // await writeFileSync('./tests/fixedbid/buy.msgp', algosdk.encodeObj(dryrunRequest.get_obj_for_encoding(true)))
  // return 0

  const signedTxns = txns.map((txn) => {
    return txn.signTxn(buyerAccount.sk)
  })

  const response = await c.algod.sendRawTransaction(signedTxns).do().catch((err) => {console.log(err)})
  const txnInfo = await algosdk.waitForConfirmation(c.algod, response.txId, 5)

  return txnInfo['confirmed-round']
}

async function extract() {
  const txns = await c.fixedBid.extract({
    appId: appId,
    nNFTs: 5,
  })

  if (!txns) {
    return
  }

  // const signedTxns = txns.map((txn) => {
  //   return decodeSignedTransaction(txn.signTxn(sellerAccount.sk))
  // })

  // const dryrunRequest = await createDryrun({
  //   client: c.algod,
  //   txns: signedTxns,
  // }).catch((err) => { console.log(err) })

  // if (!dryrunRequest) {
  //   return
  // }

  // await writeFileSync('./tests/fixedbid/extract.msgp', algosdk.encodeObj(dryrunRequest.get_obj_for_encoding(true)))
  // return 0

  const signedTxns = txns.map((txn) => {
    return txn.signTxn(sellerAccount.sk)
  })

  const response = await c.algod.sendRawTransaction(signedTxns).do().catch((err) => {console.log(err)})
  const txnInfo = await algosdk.waitForConfirmation(c.algod, response.txId, 5)

  return txnInfo['confirmed-round']
}

async function destory() {
  const txns = await c.fixedBid.destroy({
    appId: appId
  })

  if (!txns) {
    return
  }

  // const signedTxns = txns.map((txn) => {
  //   return decodeSignedTransaction(txn.signTxn(sellerAccount.sk))
  // })

  // const dryrunRequest = await createDryrun({
  //   client: c.algod,
  //   txns: signedTxns,
  // }).catch((err) => { console.log(err) })

  // if (!dryrunRequest) {
  //   return
  // }

  // await writeFileSync('./tests/fixedbid/destory.msgp', algosdk.encodeObj(dryrunRequest.get_obj_for_encoding(true)))
  // return 0

  const signedTxns = txns.map((txn) => {
    return txn.signTxn(sellerAccount.sk)
  })

  const response = await c.algod.sendRawTransaction(signedTxns).do().catch((err) => {console.log(err)})
  const txnInfo = await algosdk.waitForConfirmation(c.algod, response.txId, 5)

  return txnInfo['confirmed-round']
}