import { sha512_256 } from 'js-sha512'

function hexToBytes (hex: string) {
  for (var bytes = [], c = 0; c < hex.length; c += 2) {
    bytes.push(parseInt(hex.substr(c, 2), 16));
  }
  
  return bytes;
}

function hashAbiMethod (method: string): Uint8Array
function hashAbiMethod (method: string, encoding: BufferEncoding): string
function hashAbiMethod (method: string, encoding?: BufferEncoding) {

  const bytes = hexToBytes(sha512_256(method).substring(0, 8))

  if (!encoding) {
    return new Uint8Array(bytes)
  }

  return Buffer.from(bytes).toString(encoding)
}

export { hashAbiMethod }