A package that includes all Dartroom's smart contracts written in TEAL, with complete interfaces in TypeScript to interact with them.

The package includes:
- Smart Contacts (TEAL code that needs to be deployed)
- Algo & ASA management of contracts (deploy the correct version with either Algo or ASA payments)
- Transaction validation (enough min balance, NFT still available, state of contracts)
- Contract-related functions (ABI hash conversion, global state parsing, address encoding)

The interface gets the right parameters for the contract function and returns an array of transactions that only need to be signed before they are committed to the network.