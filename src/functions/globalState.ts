import algosdk from "algosdk";

interface StateValueObject {
  key: string
  value: {
    bytes: string
    type: number
    uint: number
  }
}

type GlobalState = Array<StateValueObject>

function findState (state: GlobalState, key: string): StateValueObject | undefined {
  return state.find(x => x.key === Buffer.from(key).toString("base64"))
}

function encodeStateAddress (address: string): string {
  return algosdk.encodeAddress(new Uint8Array(Buffer.from(address, "base64"))) 
}

export function getGlobalByte(state: GlobalState, key: string): string {
  const stateValue = findState(state, key)

  if (stateValue) {
    return stateValue.value.bytes
  } else {
    return ""
  }
}

export function getGlobalUint(state: GlobalState, key: string): number {
  const stateValue = findState(state, key)

  if (stateValue) {
    return stateValue.value.uint
  } else {
    return -1
  }
}

export function getGlobalAddress(state: GlobalState, key: string): string {
  const stateValue = findState(state, key)

  if (stateValue) {
    return encodeStateAddress(stateValue.value.bytes)
  } else {
    return ""
  }
}