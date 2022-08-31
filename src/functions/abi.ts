import { sha512_256 } from 'js-sha512'

function hexToBytes (hex: string) {
  for (var bytes = [], c = 0; c < hex.length; c += 2) {
    bytes.push(parseInt(hex.substr(c, 2), 16));
  }
  
  return bytes;
}

function hashAbiMethod (method: string) {
  return new Uint8Array(hexToBytes(sha512_256(method).substring(0, 8)))
}

export { hashAbiMethod }