import { Contracts } from '../index'
import algosdk, { decodeUnsignedTransaction } from "algosdk"

const algodToken = ''
const serverSecret = 'test'
const sellerAccount = algosdk.mnemonicToSecretKey('')  

test('Server signature', async () => {

  const c = new Contracts({
    indexer: {
      token: "",
      portNet: "",
      baseServer: "https://algoindexer.testnet.algoexplorerapi.io",
    },
    algod: {
      token: {'X-API-key' : algodToken },
      portNet: "",
      baseServer: "https://testnet-algorand.api.purestake.io/ps2",
    },
    extendedTransactionFormat: true,
    serverSecret: serverSecret,
    transactionBlobEncoding: 'Uint8Array',
    authAddress: true,
    signature: true
  })
  
  const txns = await c.fixedBid.deploy({
    sellerAddress: sellerAccount.addr,
    sellerPayoutAddress: sellerAccount.addr,
    royaltyPayoutAddress: sellerAccount.addr,
    managerPayoutAddress: sellerAccount.addr,
    sellerShare: 900,
    royaltyShare: 70,
    managerShare: 30,
    price: 10000,
    nftIndex: 161534719,
    currencyIndex: 0
  })

  if (!txns) {
    throw new Error('Failed to generate transactions.')
  }

  const signedTxns = txns.map((txn) => {
    return {
      ...txn,
      blob: decodeUnsignedTransaction(txn.blob).signTxn(sellerAccount.sk)
    }
  })

  c.verifyTxns(signedTxns)
})

test('Base64 formating', async () => {
  const c = new Contracts({
    indexer: {
      token: "",
      portNet: "",
      baseServer: "https://algoindexer.testnet.algoexplorerapi.io",
    },
    algod: {
      token: {'X-API-key' : algodToken },
      portNet: "",
      baseServer: "https://testnet-algorand.api.purestake.io/ps2",
    },
    extendedTransactionFormat: true,
    serverSecret: serverSecret,
    transactionBlobEncoding: 'Base64',
    authAddress: false,
    signature: true
  })

  const txns = await c.fixedBid.deploy({
    sellerAddress: sellerAccount.addr,
    sellerPayoutAddress: sellerAccount.addr,
    royaltyPayoutAddress: sellerAccount.addr,
    managerPayoutAddress: sellerAccount.addr,
    sellerShare: 900,
    royaltyShare: 70,
    managerShare: 30,
    price: 10000,
    nftIndex: 161534719,
    currencyIndex: 0
  })

  if (!txns) {
    throw new Error('Failed to generate transactions.')
  }

  const signedTxns = txns.map((txn) => {
    return {
      ...txn,
      blob: Buffer.from(decodeUnsignedTransaction(Buffer.from(txn.blob, 'base64')).signTxn(sellerAccount.sk)).toString('base64')
    }
  })

  c.verifyTxns(signedTxns)
})
