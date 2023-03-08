const glob = require("glob")
const { readFileSync, writeFileSync } = require('node:fs')
const algoSDK = require('algosdk')

const algod = new algoSDK.Algodv2(
  "",
  "https://node.testnet.algoexplorerapi.io",
  "",
)

glob('**/algoFixedBid/*.teal', (err, files) => {

  if (err) {
    console.log(err)
  }

  for (let i = 0; i < files.length; i++) {
    compileTeal(files[i])
  }
})

async function compileTeal (filePath) {

  const teal = await readFileSync(filePath)

  let compileResponse = await algod.compile(teal).do().catch((err) => {console.log(err)});

  await writeFileSync(filePath.replace('.teal','.ts'),`export default "${compileResponse.result}"`)

}