

A package that includes all Dartroom's smart contracts written in TEAL, with complete interfaces in TypeScript to interact with them.

The package includes the following:
- Smart contracts (TEAL code that needs to be deployed)
- Algo & ASA management of contracts (deploy the correct version with either Algo or ASA payments)
- Transaction validation (enough min balance, NFT still available, state of contracts)
- Contract-related functions (ABI hash conversion, global state parsing, address encoding)

Planned future expansion:
- On-chain contract discovery

The interface gets the parameters for the specific contract function and returns an array of transactions that only need to be signed before they can be committed to the network.

## Contracts:
[![npm version](https://badge.fury.io/js/@dartroom%2Fcontracts.svg)](https://badge.fury.io/js/@dartroom%2Fcontracts)
[![Publish](https://github.com/Dartroom/contracts/actions/workflows/publish.yml/badge.svg)](https://github.com/Dartroom/contracts/actions/workflows/publish.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

- [Fixed bid](src/interface/fixedBid/README.md)
- [ASA currency revenue sink](src/interface/acRevenueSink/README.md)

## Documenation
- [Installation](#installation)
- [Setup](#setup)
  - [Options](#options)
- [Verify Transactions](#verify-transactions)
- [Transaction Formatter](#verify-transactions)
  - [Grouped Transactions](#grouped-transactions)
- [Payment Units](#payment-units)


> **Warning**
> Please note that all payment amounts in this package should be passed in as the base unit of the token. For details see: [Payment Units](#payment-units)

# Installation

```bash
npm install @dartroom/contracts
```

# Setup

You only need a connection to an Algorand [Indexer](https://github.com/algorand/indexer) and [Node](https://github.com/algorand/go-algorand) to get started.

```ts
import { Contracts } from "@dartroom/contracts" 

const contracts = new Conctract({
  indexer: {
    token: "",
    portNet: "",
    baseServer: "",
  },
  algod: {
    token: "",
    portNet: "",
    baseServer: "",
  },
	signature: false,
	authAddress: false,
})
```

## Options

#### **`minBalanceFee?: number`**

Overwrite the default min balance fee for ASA opt-ins. Only use this if the min balance fee changes from the current default of 0.1 Algo in the future.

#### **`extendedTransactionFormat?: boolean`**

Extends the return format of the contract interaction functions. When enabled, the functions will not only return the standard AlgoSDK transaction format but add additional fields to make working with the transactions easier in a server + client-side setup.

#### **`serverSecret?: string`**

If a secret is provided and the `extendedTransactionFormat` is enabled, the return format will include a signed hash based on the `txID` signed with the secret. This will enable the system on the server to verify that the submitted transactions from the client were provided by the server and have not been altered in the client.

#### **`transactionBlobEncoding?: "Uint8Array" | "Base64"`**

If `extendedTransactionFormat` is enabled, this option will change the encoding of the original transaction in the `blob` field.

#### **`authAddress: boolean`**

Include the `authAddress` field in the transaction array return format. Some wallet apps and extensions, such as the AlgoSigner, require the auth field to support the use of rekeyed accounts.

#### **`signature: string`**

Include the server signature in the transaction array return format. The signature will be a hash of the txID signed with the server secret. The signature can be used to validate that a transaction sent back from the client was proposed by the server.

Note that you must provide a `serverSecret` to create server signatures.

# Verify Transactions

```ts
import { Contracts } from "@dartroom/contracts" 

const contracts = new Conctract({
  indexer: {
    token: "",
    portNet: "",
    baseServer: "",
  },
  algod: {
    token: "",
    portNet: "",
    baseServer: "",
  },
	extendedTransactionFormat: true,
  serverSecret: serverSecret,
  transactionBlobEncoding: 'Uint8Array',
  authAddress: true,
  signature: true
})

// Request the transactions to perform a specific action on the contract.
const unsignedTxns = await contracts.fixedBid.buy({
  appId: 210217503,
  nNFTs: 2,
  buyerAddress: "FSQW3UTLB5IZ32ZE35MUDPNNAXHCBGMGAKXHR3ENQ5JMT43IB3BET7WPDE"
})

// Normally the unsigned transaction would be sent to the client from the server where they would be signed.For this example, the transactions get signed on the server (which, in practice, makes the server secret setup unnecessary as the transaction would never leave the server).
// All the extended transaction information must be returned from the server for this setup to work. When using a transaction signer, only sign the `blob` property and return it with the other transaction info. 
// When using the Dartroom package, this is not necessary. With that setup, you can provide the full extended transaction, and the sign function will return the full extended transaction info.
const signedTxns = txns.map((txn) => {
  return {
    ...txn,
    blob: decodeUnsignedTransaction(txn.blob).signTxn(sellerAccount.sk)
  }
})

// When receiving the transactions back from the client, the `verifyTxns` function can be used to verify the signature. The transaction will be hashed again and compared to the attached signature. If they are not equal or the signature field is missing, the function will throw an error. This way the server signature can be used to guard API routes from submitting transactions that where not proposed by your API.
contracts.verifyTxns(signedTxns)
```

# Transaction Formatter

```ts
import { Contracts } from "@dartroom/contracts" 
import algosdk from "algosdk"

const contracts = new Conctract({
  indexer: {
    token: "",
    portNet: "",
    baseServer: "",
  },
  algod: {
    token: "",
    portNet: "",
    baseServer: "",
  },
	extendedTransactionFormat: true,
  serverSecret: serverSecret,
  transactionBlobEncoding: 'Uint8Array',
  authAddress: true,
  signature: true
})

const address = "FSQW3UTLB5IZ32ZE35MUDPNNAXHCBGMGAKXHR3ENQ5JMT43IB3BET7WPDE"

// For simplicity, we use the `algod` instance generated by the contract setup, but this is just a standard `algod` instance. A separate `algod` instance would work the exact same way.
const account = await contracts.algod.accountInformation(address).do()
let params = await contracts.algod.getTransactionParams().do()

params.flatFee = true
params.fee = 1000

// The first step is to create a new transaction format instance. Every new transaction (group) will require a new instance.
const formater = contracts.newTxnFormatter()

// All transactions are passed into the push function with the additional info for the extended transaction format.
formater.push({
  description: "Send a 0 Algo transaction to yourself to verify your account.",
  txn: algosdk.makePaymentTxnWithSuggestedParams(
    address,
    address,
    0,
    undefined,
    undefined,
    params
  ),
  signers: [address],
  authAddress: account["auth-addr"] || address,
})

// When all transactions are pushed into the formatter, you can get the formatted transactions back by calling `getTxns()`.
// Calling `getTxns()` will convert the `blob` field and attach the `signature` based on the Contract options.
const tnxs = formater.getTxns()
```

## Grouped Transactions

If more than one transaction is pushed to the transaction formatter, the `assignGroupID()` function should be called. This function will generate a groupId for the transactions, which will create what is known as an [Atomic Transfer](https://developer.algorand.org/docs/get-details/atomic_transfers/) on Algorand. Atomic Transfer groups can include a maximum of 16 transactions. If more than 16 transactions need to be submitted, the group should be split among multiple transaction fromatters.

```ts
txnFormater.assignGroupID()

const tnxs = formater.getTxns()
```

# Payment Units

All Algorand transactions, and by extension contracts, work with integers only. The Algorand token, and all ASA tokens, have a specified decimals property that needs to be used to convert any float values back to integers for use in transactions.

The base unit conversion is not handled by the contract package to remove unnecessary Indexer calls. If you have a specific set of tokens that are allowed to be used on your platform, you can store the decimals statically, such as in the example below.
The `ASAToBaseInt` and `ASAToFloat` functions can be used to convert the amounts between the contract system and any frontend system you may use.

```ts
const tokens: Array<ASA> = [
  {
    index: 0,
    unitName: "ALGO",
    assetName: "ALGO",
    decimals: 6,
  },
  {
    index: 31566704,
    unitName: "USDC",
    assetName: "USDC",
    decimals: 6,

  },
  {
    index: 386195940,
    unitName: "goETH",
    assetName: "goETH",
    decimals: 8,
  }
]

function ASAToBaseInt (asa: ASA, amount: number) {
  return amount * (10 ** asa.decimals)
}

function ASAToFloat (asa: ASA, amount: number) {
  return amount / (10 ** asa.decimals)
}

const unitName = "USDC"
const asa = tokens.find((token) => token.unitName === unitName)

const txns = await contracts.fixedBid.updatePrice({
  appId: 210217503,
  unitPrice: ASAToBaseInt(asa, set.price)
})
```

If all currencies are allowed on the platform, then the decimal settings can be fetched from the Indexer or Node.

```ts
const asaIndex = 386195940
const asaInfo = await algod.getAssetByID(386195940).do()

function ASAToBaseInt (asaInfo: ASAInfo, amount: number) {
  return amount * (10 ** asaInfo.params.decimals)
}

function ASAToFloat (asaInfo: ASAInfo, amount: number) {
  return amount / (10 ** asaInfo.params.decimals)
}

const txns = await contracts.fixedBid.updatePrice({
  appId: 210217503,
  unitPrice: ASAToBaseInt(asa, set.price)
})
```
