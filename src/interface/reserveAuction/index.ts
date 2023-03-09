
  
  /**
   * Generates the `makeApplicationCreateTxn()` transaction for a reserve auction. A different contract gets used depending on the type of currency that the auction uses. 
   * 
   * If the `currencyIndex` is not provided or is set to `0`, then Algorand will be used as the auction currency. Otherwise, the provided currency will be used. Note that Algorand and ASA currencies use different contracts.
   * 
   * @param {string} params.creatorAddress - Algorand address of the wallet that deploys the auction contract.
   * @param {string} params.payoutAddress - Algorand address to which the seller share will be paid out to.
   * @param {string} params.managerAddress - Algorand address to which the manager share will be paid out to.
   * @param {number} params.sellerShare - Percentage of the funds paid out to the seller of the NFT.
   * @param {number} params.artistShare - Percentage of the funds paid out to the creator of the NFT.
   * @param {number} params.managerShare - Percentage of the funds paid out to the manager of the auction.
   * @param {number} params.reservePrice - Minimum bid amount to start the auction.
   * @param {number} params.nftIndex - ASA index of the NFT.
   * @param {number} params.duration - Duration of the auction after the first bid gets placed in Algorand blocks (rounds).
   * @param {number} params.currencyIndex - ASA index of the currency used to bid and settle the auction.
   * @param {number} params.extensionTime - Minimum time in blocks left after a bid is placed. If the time is lower than this minimum and a bid is placed then the time gets increased to the minimum. (AKA anti-snipe)
   * @return Promise<algosdk.Transaction[]> 
   */
  // deployAuction (params: DeployAuctionParams) {
  //   return deployAuction(this, params)
  // }

  /**
   * Generates transactions to complete the auction setup. The function checks the global state of the auction and balances of the contract address to ensure the auction is still unset.
   * 
   * - txns[0]: `pay` - min. balance payment to the contract address
   * - txns[1]: `appl` - opt the contract into the NFT ASA (and the currency ASA)
   * - txns[2]: `axfer` transfer NFT to the contract address
   * 
   * @param {number} params.appId - Application index of the auction contract.
   * @return Promise<algosdk.Transaction[]>
   */
  // setupAuction (params: SetupAuctionParams) {
  //   return setupAuction(this, params)
  // }

  /**
   * Generates transactions to bid on an existing auction contract. The function will check whether the bid is primary or secondary and modify the transactions accordingly.
   * 
   * - txns[0]: `appl` - call the smart contract to update the auction
   * - txns[1]: `pay` or `axfer` - tranfer the bid to the contract address
   * 
   * @param {number} params.appId - Application index of the auction contract.
   * @param {number} params.amount - The bid amount in either Algo or the auction currency ASA.
   * @param {string} params.bidderAddress - The Algorand address placing the bid.
   * @return Promise<algosdk.Transaction[]>
   */
  // placeAuctionBid (params: BidParams) {
  //   return placeAuctionBid(this, params)
  // }

  /**
   * Generates transactions to claim the NFT out of the auction contract. If the auction winner has not yet opted into the NFT, the function will return an opt-in transaction in addition to the claim transaction.
   * 
   * - tnxs[0]: `axfer` - opt-in transaction
   * - txns[0 / 1]: `appl` - call the smart contract to claim the NFT
   * 
   * @param {number} params.appId - Application index of the auction contract.
   * @param {string} params.senderAddress - Address of the account sending the transaction (does not have to be the same address as the auction winner)
   * @returns Promise<algosdk.Transaction[]>
   */
  // claimAuctionNFT (params: ClaimNFTParams) {
  //   return claimAuctionNFT(this, params)
  // }

  /**
   * Generates transactions to distribute the funds earned by auction to the shareholders. In the case of Algo auctions, all shares will be paid out at once. For ASA currency auctions, only the shares of shareholders who already opted into the auction currency will be paid out.
   * 
   * - txns[0]: `appl` - Call the smart contract to distribute the funds
   * 
   * @param {number} params.appId - Application index of the auction contract.
   * @param {string} params.senderAddress - Address of the account sending the transaction
   * @returns 
   */
  // claimAuctionShares (params: ClaimAuctionSharesParams) {
  //   return claimAuctionShares(this, params)
  // }

  /**
   * Generates transactions to destroy an existing auction contract. Destroying the contract will close out (return) all the contract assets back to the auction creator.
   * 
   * Destroying an auction is only available if there are either no bids placed yet, or both the sale funds and the NFT have been claimed after the end of an auction.
   * 
   * @param {number} params.appId - Application index of the auction contract.
   * @return Promise<algosdk.Transaction[]>
   */
  // destoryAuction (params: DestoryAuctionParams) {
  //   return destoryAuction(this, params)
  // }
  
  /**
   * Fetches and parses the Global State of the auction contract and returns the info in an object.
   * 
   * @param {number} params.appId - Application index of the auction contract. 
   * @returns Promise<GlobalState> 
   */
  // getAuctionGlobalState (params: GetAuctionParams) {
  //   return getAuctionGlobalState(this, params)
  // }

  /**
   * Return information about the current state of the contract, including the full Global State and bid history.
   * 
   * @param {number} params.appId - Application index of the auction contract. 
   * @returns
   */
  // getAuctionInfo (params: GetAuctionParams) {
  //   return getAuctionInfo(this, params)
  // }