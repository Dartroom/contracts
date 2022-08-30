import { Algodv2 } from "algosdk";

async function compileProgram(client: Algodv2, programSource: string) {
  let encoder = new TextEncoder();
  let programBytes = encoder.encode(programSource);
  let compileResponse = await client.compile(programBytes).do().catch((err) => {console.log(err)});
  let compiledBytes = new Uint8Array(Buffer.from(compileResponse.result, "base64"));
  return compiledBytes;
}

export { compileProgram }