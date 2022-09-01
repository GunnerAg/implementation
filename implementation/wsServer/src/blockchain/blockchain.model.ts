// import BlockChain from './interfaces'
import { Peer, Transaction as ITransaction, Block as IBlock, Blockchain as IBlockchain } from '../interfaces'
import Block from './block.model'
import Transaction from './transaction.model'

export default class Blockchain implements IBlockchain {
  public chain: IBlock[]
  public difficulty: number
  public pendingTransactions: ITransaction[]
  public miningReward: number
  public version: string
  public peers: Peer[]
  public transactionCount: number
  /**
   * We create a constructor function that creates a genesis block, sets the difficulty to 2, creates an
   * empty array for pending transactions, and sets the mining reward to 100
   */
  constructor() {
    this.chain = [this.createGenesisBlock()]
    this.difficulty = 2
    this.pendingTransactions = []
    this.miningReward = 100
    this.version = '1.0.0'
    this.peers = []
    this.transactionCount = 0
  }

  /**
   * It returns a new Block object with the date set to the first of January 2017, an empty array of
   * transactions, and the previousHash set to 0
   * @returns A new Block object with the date, an empty array, and the hash of the previous block.
   */
  createGenesisBlock(): Block {
    return new Block(Date.parse('2022-01-01'), [], '0')
  }

  /**
   * It returns the last block in the chain
   * @returns The last block in the chain.
   */
  getLatestBlock(): IBlock {
    return this.chain[this.chain.length - 1]
  }

  /**
   * We create a new transaction that sends the mining reward to the address that was passed in as an
   * argument. We then add this transaction to the pending transactions array. We then create a new
   * block using the pending transactions and the hash of the latest block in the chain. We then mine
   * the block and add it to the chain. Finally, we reset the pending transactions array
   * @param miningRewardAddress - The address to send the mining reward to.
   */
  minePendingTransactions = async (miningRewardAddress: any): Promise<void> => {
    const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward, this.transactionCount + 1)
    this.transactionCount++
    this.pendingTransactions.push(rewardTx)

    const block = new Block(+Date.now(), this.pendingTransactions, this.getLatestBlock().hash)
    console.log('this.pendingTransactions', this.pendingTransactions)
    await block.mineBlock(this.difficulty)
    // adjust here difficulty.
    this.adjustDifficulty()
    console.log('this.pendingTransactions')
    this.addBlock(block)
  }

  pendingBlock = async (miningRewardAddress: any): Promise<any> => {
    const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward, this.transactionCount + 1)
    this.transactionCount++
    this.pendingTransactions.push(rewardTx)
    const block = new Block(+Date.now(), this.pendingTransactions, this.getLatestBlock().hash)
    return block.data()
  }

  test = async (_block: any, nonce: number): Promise<any> => {
    console.log('_block.transactions', _block.transactions)

    const addedTransactions = []
    _block.transactions.forEach(element => {
      addedTransactions.push(element.id)
    })

    const block = new Block(
      _block.timestamp,
      this.pendingTransactions.filter(t => addedTransactions.includes(t.id)),
      this.getLatestBlock().hash
    )

    const condition = block.testHash(nonce).substring(0, this.difficulty) === Array(this.difficulty + 1).join('0')
    console.log(
      'CONDITION?',
      nonce,
      condition,
      block.testHash(nonce).substring(0, this.difficulty),
      Array(this.difficulty + 1).join('0')
    )
    block.nonce = nonce
    block.hash = block.testHash(nonce)
    this.adjustDifficulty()

    if (condition) this.addBlock(block)
  }

  /* Adjusting the difficulty of the blockchain. */
  adjustDifficulty = (): void => {
    const elapsed = (+Date.now() - this.getLatestBlock().timestamp) / 1000
    console.log('ELAPSED TIME', elapsed)
    if (elapsed < 5) {
      this.difficulty++
      console.log('DIFICULTAD AJUSTADA A', this.difficulty)
    }
    if (elapsed > 10) {
      this.difficulty! <= 0 && this.difficulty--
      console.log('DIFICULTAD AJUSTADA A', this.difficulty)
    }
  }

  // /**
  //  * If the mined block has valid transactions,
  //  * and it creates a valid chain, we add the new block.
  //  *
  //  * @param block - The new block to be added containing all the transactions.
  //  */
  // addBlock = (block: IBlock): void => {
  //   if (!this.isChainValid() || !block.hasValidTransactions()) {
  //     throw new Error('The new block is not a valid Block')
  //   } else {
  //     this.chain.push(block)
  //     this.pendingTransactions = []
  //   }
  // }

  /**
   * If the mined block has valid transactions,
   * and it creates a valid chain, we add the new block.
   *
   * @param block - The new block to be added containing all the transactions.
   */
  addBlock = (block: IBlock): void => {
    if (!this.isChainValid() || !block.hasValidTransactions()) {
      throw new Error('The new block is not a valid Block')
    } else {
      this.chain.push(block)

      const addedTransactions = []
      block.transactions.forEach(element => {
        addedTransactions.push(element.id)
      })

      this.pendingTransactions = this.pendingTransactions.filter(t => !addedTransactions.includes(t.id))
    }
  }

  /**
   * "If the transaction is valid, add it to the pending transactions array."
   *
   * The first thing we do is check if the transaction has a fromAddress and toAddress. If it doesn't,
   * we throw an error
   * @param transaction - The transaction object to be added to the pending transactions array.
   */
  addTransaction(transaction: ITransaction): void {
    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error('Transaction must include from and to address')
    }

    // Verify the transactiion
    if (!transaction.isValid()) {
      throw new Error('Cannot add invalid transaction to chain')
    }

    if (transaction.amount <= 0) {
      throw new Error('Transaction amount should be higher than 0')
    }

    // Making sure that the amount sent is not greater than existing balance
    const walletBalance = this.getBalanceOfAddress(transaction.fromAddress)
    if (walletBalance < transaction.amount) {
      throw new Error('Not enough balance')
    }

    // Get all other pending transactions for the "from" wallet
    const pendingTxForWallet = this.pendingTransactions.filter(tx => tx.fromAddress === transaction.fromAddress)

    // If the wallet has more pending transactions, calculate the total amount
    // of spend coins so far. If this exceeds the balance, we refuse to add this
    // transaction.
    if (pendingTxForWallet.length > 0) {
      const totalPendingAmount = pendingTxForWallet
        .map((tx: Transaction) => tx.amount)
        .reduce((prev: number, curr: number) => Number(prev) + Number(curr))
      const totalAmount = Number(totalPendingAmount) + Number(transaction.amount)
      console.log('DUDAS', totalAmount, walletBalance, totalAmount > walletBalance)
      if (totalAmount > walletBalance) {
        throw new Error('Pending transactions for this wallet is higher than its balance.')
      }
    }

    this.pendingTransactions.push(transaction)
    this.transactionCount++
    console.log(' ')
    console.log('---NEW TRANSACTION---', transaction)
    console.log(' ')
    // Make sure to add the transactions in order to avoid double-expending.
    this.pendingTransactions.sort((t1: any, t2: any) => t1.timestamp - t2.timestamp)
  }

  /**
   * We loop through all the blocks in the chain, and for each block we loop through all the
   * transactions in the block. If the transaction is sending coins to the address we're checking, we
   * add the amount to the balance. If the transaction is sending coins from the address we're
   * checking, we subtract the amount from the balance
   * @param address - The address to get the balance of.
   * @returns The balance of the address.
   */
  getBalanceOfAddress(address: any): number {
    let balance = 0

    for (const block of this.chain) {
      for (const trans of block.transactions) {
        if (trans.fromAddress === address) {
          balance -= Number(trans.amount)
        }

        if (trans.toAddress === address) {
          balance += Number(trans.amount)
        }
      }
    }

    console.log('getBalanceOfAdrees: %s', balance)
    return balance
  }

  /**
   * We loop through all the blocks in the chain, and for each block we loop through all the
   * transactions in the block. If the transaction is either from or to the address we're looking for,
   * we add it to the txs array
   * @param address - The address of the wallet we want to get the transactions for.
   * @returns An array of transactions
   */
  getAllTransactionsForWallet(address): Transaction[] {
    const txs = []

    for (const block of this.chain) {
      for (const tx of block.transactions) {
        if (tx.fromAddress === address || tx.toAddress === address) {
          txs.push(tx)
        }
      }
    }

    console.log('get transactions for wallet count: %s', txs.length)
    return txs
  }

  /**
   * We check if the Genesis block is valid, then we check if the remaining blocks are valid
   * @returns A boolean value.
   */
  isChainValid(): boolean {
    // Check if the Genesis block hasn't been tampered with by comparing
    // the output of createGenesisBlock with the first block on our chain
    const realGenesis = JSON.stringify(this.createGenesisBlock())

    // console.table([realGenesis, JSON.stringify(this.chain[0])])

    if (realGenesis !== JSON.stringify(this.chain[0])) {
      return false
    }

    // Check the remaining blocks on the chain to see if there hashes and
    // signatures are correct
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i]
      const previousBlock = this.chain[i - 1]
      const wrongPreviousHash = previousBlock.hash !== currentBlock.previousHash
      const wrongBlockTransactions = !currentBlock.hasValidTransactions()
      const wrongCurrentHash = currentBlock.hash !== currentBlock.calculateHash()
      console.log('CHECKING ALL PAST TRANSACTIONS HASHES')
      console.table([
        previousBlock.hash,
        currentBlock.previousHash,
        '\n',
        currentBlock.hasValidTransactions(),
        '\n',
        currentBlock.hash,
        currentBlock.calculateHash()
      ])

      if (wrongPreviousHash || wrongBlockTransactions || wrongCurrentHash) {
        return false
      }
    }

    return true
  }
}
