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

const appId = 162286528

jest.setTimeout(10000)

// test('deploy', async () => {
//   const appId = await deploy()
//   console.log(appId)
//   expect(typeof appId).toBe('number')
// })

// test('optin', async () => {
//   const round = await optin()
//   console.log(round)
//   expect(typeof round).toBe('number')
// })

// test('optout', async () => {
//   const round = await optout()
//   console.log(round)
//   expect(typeof round).toBe('number')
// })

// test('claim', async () => {
//   const round = await claim()
//   console.log(round)
//   expect(typeof round).toBe('number')
// })

test('destroy', async () => {
  const round = await destory()
  console.log(round)
  expect(typeof round).toBe('number')
})

// test('getState', async () => {
//   const round = await getState()
//   console.log(round)
//   expect(typeof round).toBe('number')
// })

// test('find', async () => {
//   const round = await find()
//   console.log(round)
//   expect(typeof round).toBe('number')
// })

async function deploy() {
  
  const txns = await c.acRevenueSink.deploy({
    recipientAddress: artistAccount.addr,
    managerAddress: managerAccount.addr
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

  // await writeFileSync('./tests/acSink/deploy.msgp', algosdk.encodeObj(dryrunRequest.get_obj_for_encoding(true)))
  // return 0

  const signedTxns = txns.map((txn) => {
    return txn.signTxn(managerAccount.sk)
  })

  const response = await c.algod.sendRawTransaction(signedTxns).do().catch((err) => {console.log(err)})
  const app = await algosdk.waitForConfirmation(c.algod, response.txId, 5)

  return app['application-index']
}

async function optin() {
  // const txns = await c.acRevenueSink.optin({
  //   appId: appId,
  //   asaArray: [
  //     84963414,
  //     84963730,
  //     161534719
  //   ]
  // })

  const txns = await c.acRevenueSink.optin({
    appId: appId,
    asaArray: [
      84963414,
      84963730,
      161534719,
      74346769,
      67032510,
      90623523,
      74359767,
      70906715,
      66926059,
      53190685,
      51710886,
      53191463
    ]
  })

  if (!txns) {
    return
  }

  // const signedTxns = txns.map((txn) => {
  //   return decodeSignedTransaction(txn.signTxn(managerAccount.sk))
  // })

  // const dryrunRequest = await createDryrun({
  //   client: c.algod,
  //   txns: signedTxns,
  // }).catch((err) => { console.log(err) })

  // if (!dryrunRequest) {
  //   return
  // }

  // await writeFileSync('./tests/acSink/optin.msgp', algosdk.encodeObj(dryrunRequest.get_obj_for_encoding(true)))
  // return 0

  const signedTxns = txns.map((txn) => {
    return txn.signTxn(managerAccount.sk)
  })

  const response = await c.algod.sendRawTransaction(signedTxns).do().catch((err) => {console.log(err)})
  const txnInfo = await algosdk.waitForConfirmation(c.algod, response.txId, 5)

  return txnInfo['confirmed-round']
}

async function optout() {
  // const txns = await c.acRevenueSink.optout({
  //   appId: appId,
  //   asaArray: [
  //     84963414,
  //     84963730,
  //     161534719
  //   ]
  // })

  const txns = await c.acRevenueSink.optout({
    appId: appId, 
    asaArray: [
      84963414,
      84963730,
      161534719,
      74346769,
      67032510,
      90623523,
      74359767,
      70906715,
      66926059,
      53190685,
      51710886,
      53191463
    ]
  })

  if (!txns) {
    return
  }

  // const signedTxns = txns.map((txn) => {
  //   return decodeSignedTransaction(txn.signTxn(managerAccount.sk))
  // })

  // const dryrunRequest = await createDryrun({
  //   client: c.algod,
  //   txns: signedTxns,
  // }).catch((err) => { console.log(err) })

  // if (!dryrunRequest) {
  //   return
  // }

  // await writeFileSync('./tests/acSink/optout.msgp', algosdk.encodeObj(dryrunRequest.get_obj_for_encoding(true)))
  // return 0

  const signedTxns = txns.map((txn) => {
    return txn.signTxn(managerAccount.sk)
  })

  const response = await c.algod.sendRawTransaction(signedTxns).do().catch((err) => {console.log(err)})
  const txnInfo = await algosdk.waitForConfirmation(c.algod, response.txId, 5)

  return txnInfo['confirmed-round']
}

async function claim() {
  // const txns = await c.acRevenueSink.claim({
  //   appId: appId,
  //   asaArray: [
  //     84963414,
  //     84963730,
  //     161534719
  //   ]
  // })

  const txns = await c.acRevenueSink.claim({
    appId: appId,
    asaArray: [
      84963414,
      84963730,
      161534719,
      74346769,
      67032510,
      90623523,
      74359767,
      70906715,
      66926059,
      53190685,
      51710886,
      53191463
    ]
  })

  if (!txns) {
    return
  }

  // const signedTxns = txns.map((txn) => {
  //   return decodeSignedTransaction(txn.signTxn(artistAccount.sk))
  // })

  // const dryrunRequest = await createDryrun({
  //   client: c.algod,
  //   txns: signedTxns,
  // }).catch((err) => { console.log(err) })

  // if (!dryrunRequest) {
  //   return
  // }

  // await writeFileSync('./tests/acSink/claim.msgp', algosdk.encodeObj(dryrunRequest.get_obj_for_encoding(true)))
  // return 0

  const signedTxns = txns.map((txn) => {
    return txn.signTxn(artistAccount.sk)
  })

  const response = await c.algod.sendRawTransaction(signedTxns).do().catch((err) => {console.log(err)})
  const txnInfo = await algosdk.waitForConfirmation(c.algod, response.txId, 5)

  return txnInfo['confirmed-round']
}

async function destory() {
  const txns = await c.acRevenueSink.destroy({
    appId: appId
  })

  if (!txns) {
    return
  }

  // const signedTxns = txns.map((txn) => {
  //   return decodeSignedTransaction(txn.signTxn(managerAccount.sk))
  // })

  // const dryrunRequest = await createDryrun({
  //   client: c.algod,
  //   txns: signedTxns,
  // }).catch((err) => { console.log(err) })

  // if (!dryrunRequest) {
  //   return
  // }

  // await writeFileSync('./tests/acSink/destory.msgp', algosdk.encodeObj(dryrunRequest.get_obj_for_encoding(true)))
  // return 0

  const signedTxns = txns.map((txn) => {
    return txn.signTxn(managerAccount.sk)
  })

  const response = await c.algod.sendRawTransaction(signedTxns).do().catch((err) => {console.log(err)})
  const txnInfo = await algosdk.waitForConfirmation(c.algod, response.txId, 5)

  return txnInfo['confirmed-round']
}

async function getState () {

  const state = await c.acRevenueSink.getGlobalState({ appId: appId })

  console.log(state)

  return 1
}

async function find () {

  const state = await c.acRevenueSink.find({ 
    asset: 84963414,
    recipientAddress: artistAccount.addr,
    managerAddress: managerAccount.addr
  })

  return 1
}