
export interface AssetParams {
  creator: string
  decimals: number
  "default-frozen"?: boolean
  manager: string
  "metadata-hash"?: string
  name?: string
  "name-b64"?: string
  reserve?: string
  total: number
  "unit-name"?: string
  "unit-name-b64"?: string
  url?: string
  "url-b64"?: string
  clawback?: string
}

export type OnCompletion = "noop" | "optin" | "closeout" | "clear" | "update" | "delete"

export type TransactionType = "pay" | "keyreg" | "acfg" | "axfer" | "afrz" | "appl" | "stpf"

export interface IlookupAccountTransactions {
  "current-round": number
  "next-token": number
  transactions: Array<ITransaction>
}

export interface ISearchForTransactions {
  "current-round": number
  "next-token": number
  transactions: Array<ITransaction>
}

export interface ITransaction {
  "asset-config-transaction"?: {
    "asset-id"?: number
    "params"?: AssetParams
  }
  "application-transaction"?: {
    accounts: Array<string>
    "application-args": Array<string>
    "application-id": number
    "foreign-apps": Array<number>
    "foreign-assets": Array<number>
    "global-state-schema": {
      "num-byte-slice": number
      "num-uint": number
    }
    "local-state-schema": {
      "num-byte-slice": number
      "num-uint": number
    }
    "on-completion": OnCompletion
    "approval-program"?: string
    "clear-state-program"?: string
  }
  "asset-freeze-transaction"?: any
  "asset-transfer-transaction"?: {
    amount: number
    "asset-id": number
    "close-amount": number
    "receiver": string
  }
  "payment-transaction"?: {
    amount: number
    "close-amount": number
    receiver: string
  }
  "auth-addr"?: string
  "close-rewards"?: number
  "closing-amount"?: number
  "confirmed-round"?: number
  "created-application-index"?: number
  "created-asset-index"?: number
  fee: number
  "first-valid": number
  "genesis-hash": string
  "genesis-id": string
  "global-state-delta"?: Array<{
    key: string
    value: {
      action: number
      bytes?: string
      uint?: number
    }
  }>
  group?: string
  id: string
  "inner-txns"?: Array<ITransaction>
  "intra-round-offset"?: number
  lastValid: number
  lease?: string
  logs?: Array<Uint8Array>
  note?: string
  "round-time"?: number
  sender: string
  "sender-rewards"?: number
  signature?: {
    sig: string
  }
  "tx-type"?: TransactionType
}