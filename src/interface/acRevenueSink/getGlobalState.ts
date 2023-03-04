import { Provider } from "../../contracts"
import { getApplicationAddress } from "algosdk"
import { getGlobalAddress } from '../../functions/globalState'

export interface GetGlobalStateParams {
  appId: number
}

export async function getGlobalState({ indexer }: Provider, { 
  appId 
}: GetGlobalStateParams) {

  const app = await indexer.lookupApplications(appId).do().catch((err) => {
    throw err
  })
  
  const state = app.application.params['global-state']

  return {
    recipientAddress: getGlobalAddress(state, 'recipient_address'),
    managerAddress: getGlobalAddress(state, 'manager_address'),
    creatorAddress: app.application.params.creator as string,
    contractAddress: getApplicationAddress(appId),
  }
}