import { Contracts } from '../index'
import algosdk, { decodeUnsignedTransaction } from "algosdk"

const algodToken = ''
const serverSecret = ''

test('Txn Formatter', async () => {

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
  
  const formatter = c.newTxnFormater()

  let params = await c.algod.getTransactionParams().do()
  params.flatFee = true
  params.fee = 1000

  formatter.push({
    description: "Send a 0 Algo transaction to yourself to verify your account.",
    txn: algosdk.makePaymentTxnWithSuggestedParams(
      "B6OKNN6EWVZM3BRYNEWTA4OIE7RA537SZ5GOKRCKHIPEHUZNDXD6ZLDC4E", 
      "JRDF6G5JJCZFZADHNFUXQBMEJ5CRYMXD3XRF4BTJRWMEPJSLGZYYSDU3RM",
      1000000, 
      undefined,
      undefined,
      params
    ),
    signers: ["B6OKNN6EWVZM3BRYNEWTA4OIE7RA537SZ5GOKRCKHIPEHUZNDXD6ZLDC4E"],
    authAddress: "B6OKNN6EWVZM3BRYNEWTA4OIE7RA537SZ5GOKRCKHIPEHUZNDXD6ZLDC4E"
  })

  formatter.push({
    description: "Send a 0 Algo transaction to yourself to verify your account.",
    txn: algosdk.makePaymentTxnWithSuggestedParams(
      "B6OKNN6EWVZM3BRYNEWTA4OIE7RA537SZ5GOKRCKHIPEHUZNDXD6ZLDC4E", 
      "JRDF6G5JJCZFZADHNFUXQBMEJ5CRYMXD3XRF4BTJRWMEPJSLGZYYSDU3RM",
      1000000, 
      undefined,
      undefined,
      params
    ),
    signers: ["B6OKNN6EWVZM3BRYNEWTA4OIE7RA537SZ5GOKRCKHIPEHUZNDXD6ZLDC4E"],
    authAddress: "B6OKNN6EWVZM3BRYNEWTA4OIE7RA537SZ5GOKRCKHIPEHUZNDXD6ZLDC4E"
  })

  formatter.assignGroupID()

  console.log(formatter.txns)

  const tnxs = formatter.getTxns()
})