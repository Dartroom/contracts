import { Provider } from "../../contracts"
import { getGlobalState } from './getGlobalState'
import { addressAssetBalance } from "../../functions/balance"
import { TxnFormatter } from "../../functions/txn"
import { 
  ALGORAND_MIN_TX_FEE,
  makeApplicationDeleteTxn
} from "algosdk"

export interface DestroyFixedBidParams {
  appId: number
}

export async function destroy(provider: Provider, {
  appId
}: DestroyFixedBidParams) {
 
  const state = await getGlobalState(provider,{ appId })

  const [appNftBalance, params, account] = await Promise.all([
    addressAssetBalance(provider.indexer, state.contractAddress, state.nftIndex),
    provider.algod.getTransactionParams().do(),
    provider.algod.accountInformation(state.creatorAddress).do()
  ])

  const txnFormater = new TxnFormatter(provider)

  if (state.currencyIndex >= 0) {
    // ASA listing
    params.fee = ALGORAND_MIN_TX_FEE * (appNftBalance >= 0 ? 4 : 2 )
    params.flatFee = true

    txnFormater.push({
      description: "Call the smart contract to delete the listing and return the remaining NFTs to your account.",
      txn: makeApplicationDeleteTxn(
        state.creatorAddress,
        params,
        appId,
        [],
        [],
        [],
        [
          state.nftIndex,
          state.currencyIndex
        ]
      ),
      signers: [state.creatorAddress],
      authAddress: account['auth-addr'] || state.creatorAddress
    })

    return txnFormater.getTxns()

  } else {
    // Algo listing
    params.fee = ALGORAND_MIN_TX_FEE * (appNftBalance >= 0 ? 3 : 2 )
    params.flatFee = true

    txnFormater.push({
      description: "Call the smart contract to delete the listing and return the remaining NFTs to your account.",
      txn: makeApplicationDeleteTxn(
        state.creatorAddress,
        params,
        appId,
        [],
        [],
        [],
        [
          state.nftIndex
        ]
      ),
      signers: [state.creatorAddress],
      authAddress: account['auth-addr'] || state.creatorAddress
    })

    return txnFormater.getTxns()
  }
}