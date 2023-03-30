import { Provider } from "../../contracts"
import { getGlobalState } from './getGlobalState'
import { getApplicationAddress } from "algosdk"

export interface GetStatusFixedBidParams {
  appId: number
}

interface Account {
  amount: number
  assets: Array<{
    amount: number
    "asset-id": number
    "is-frozen": number
  }>
}

export async function getStatus(provider: Provider, { 
  appId 
}: GetStatusFixedBidParams) {

  const getGlobal = getGlobalState(provider,{ appId })

  const getAccount = provider.algod.accountInformation(getApplicationAddress(appId)).do() as Promise<Account>

  const [globalState, account] = await Promise.all([getGlobal, getAccount])

  let isSetup = true
  let balance = 0

  const nftState = account.assets.find((asset) => asset["asset-id"] === globalState.nftIndex)

  if (!nftState) {
    isSetup = false
  } else {
    balance = nftState.amount 
  }

  if (
    globalState.currencyIndex === 0 && 
    !account.assets.find((asset) => asset["asset-id"] === globalState.currencyIndex)
  ) {
    isSetup = false
  }

  return {
    appId: appId,
    globalState: globalState,
    isSetup: isSetup,
    balance: balance
  }
}