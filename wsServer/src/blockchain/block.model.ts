// import Block from './interfaces'
import crypto from 'crypto'

export default class Block {
  // timestamp – the time when the block was mined.
  // blockNumber – the length of the blockchain in blocks.
  // baseFeePerGas - the minimum fee per gas required for a transaction to be included in the block.
  // difficulty – the effort required to mine the block.
  // mixHash – a unique identifier for that block.
  // parentHash – the unique identifier for the block that came before (this is how blocks are linked in a chain).
  // transactions – the transactions included in the block.
  // stateRoot – the entire state of the system: account balances, contract storage, contract code and account nonces are inside.
  // nonce – a hash that, when combined with the mixHash, proves that the block has gone through proof-of-work.

  // TODO: type the data
  public previousHash: any
  public timestamp: any
  public transactions: any
  public nonce: any
  public hash: any

  /**
   * The constructor function is used to create a new block object
   * @param timestamp - The time at which the block was created.
   * @param transactions - This is an array of transactions that are included in this block.
   * @param [previousHash] - The hash of the previous block in the chain.
   */
  constructor(timestamp:any, transactions:any, previousHash = '') {
    this.previousHash = previousHash
    this.timestamp = timestamp
    this.transactions = transactions
    this.nonce = 0
    this.hash = this.calculateHash()
  }

  /**
   * It takes the previous hash, the timestamp, the transactions, and the nonce, and then creates a
   * hash of all of that
   * @returns The hash of the block
   */
  calculateHash(): any {
    return crypto
      .createHash('sha256')
      .update(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce)
      .digest('hex')
  }

  /**
   * While the first [difficulty] characters of the hash are not equal to 0, increment the nonce and
   * recalculate the hash
   * @param difficulty - The number of leading zeros that the hash must have.
   */
  mineBlock(difficulty:any):void {
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
      this.nonce++
      this.hash = this.calculateHash()
    }

    console.log(`Block mined: ${this.hash}`)
  }

  /**
   * If any of the transactions in the block are invalid, return false, otherwise return true.
   * @returns A boolean value.
   */
  hasValidTransactions():boolean {
    for (const tx of this.transactions) {
      if (!tx.isValid()) {
        return false
      }
    }

    return true
  }
}
