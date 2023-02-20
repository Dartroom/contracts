A package that includes all Dartroom's smart contracts written in TEAL, with complete interfaces in TypeScript to interact with them.

The package includes the following:
- Smart contracts (TEAL code that needs to be deployed)
- Algo & ASA management of contracts (deploy the correct version with either Algo or ASA payments)
- Transaction validation (enough min balance, NFT still available, state of contracts)
- Contract-related functions (ABI hash conversion, global state parsing, address encoding)

Planned future expansion:
- On-chain contract discovery

The interface gets the parameters for the specific contract function and returns an array of transactions that only need to be signed before they can be committed to the network.