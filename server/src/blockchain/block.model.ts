// import Block from './interfaces'
import crypto from 'crypto'
import { Transaction, Block as IBlock } from '../interfaces'

export default class Block implements IBlock {
  // rootHash (Merkel root).✅
  // previousHash.✅
  // timeStamp. ✅
  // nonce. ✅
  // version. ✅

  // TODO: type the data
  public previousHash: string
  public timestamp: number
  public transactions: Transaction[]
  public nonce: number
  public hash: string
  public version: string

  /**
   * The constructor function is used to create a new block object
   * @param timestamp - The time at which the block was created.
   * @param transactions - This is an array of transactions that are included in this block.
   * @param [previousHash] - The hash of the previous block in the chain.
   */
  constructor(timestamp: number, transactions: Transaction[], previousHash = '', version?: string) {
    this.version = version || '1.0.0'
    this.previousHash = previousHash
    this.timestamp = timestamp
    this.transactions = transactions
    this.nonce = 0
    this.hash = this.calculateHash()
  }

  // /**
  //  * It takes the previous hash, the timestamp, the transactions, and the nonce, and then creates a
  //  * hash of all of that
  //  * @returns The hash of the block
  //  */
  // calculateHash(): any {
  //   return crypto
  //     .createHash('sha256')
  //     .update(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce)
  //     .digest('hex')
  // }

  /**
   * It takes the previous hash, the timestamp, the transactions, and the nonce, and then creates a
   * hash of all of that
   * @returns The hash of the block
   */
  calculateHashTransactions(): string {
    return crypto
      .createHash('sha256')
      .update(this.timestamp + this.version + JSON.stringify(this.transactions))
      .digest('hex')
  }

  /**
   * It takes the previous hash, the timestamp, the transactions, and the nonce, and then creates a
   * hash of all of that
   * @returns The hash of the block
   */
  calculateHash(): string {
    // console.log(`hashing this: ${this.previousHash + this.version + this.calculateHashTransactions() + this.nonce}`)

    return crypto
      .createHash('sha256')
      .update(this.previousHash + this.version + this.calculateHashTransactions() + this.nonce)
      .digest('hex')
  }

  /** */
  testHash(nonce:number): string {
    console.log(`hashing this: ${this.previousHash + this.version + this.calculateHashTransactions() + nonce}`)

    return crypto
      .createHash('sha256')
      .update(this.previousHash + this.version + this.calculateHashTransactions() + nonce)
      .digest('hex')
  }

  /**
   * While the first [difficulty] characters of the hash are not equal to 0, increment the nonce and
   * recalculate the hash
   * @param difficulty - The number of leading zeros that the hash must have.
   */
  async mineBlock(difficulty: any): Promise<void> {
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
      this.nonce++
      this.hash = this.calculateHash()
    }
    console.log(`Block mined: ${this.hash}, ${this.nonce}`)
    console.log('hashing this', this.previousHash + this.version + this.calculateHashTransactions() + this.nonce)
  }

  /**
   * It returns a string that is the concatenation of the previous hash, the version, and the hash of
   * the transactions
   * @returns The previous hash, the version, and the hash of the transactions.
   */
  data(): any {
    return {
      prevHash: this.previousHash,
      version: this.version,
      transactions: this.transactions,
      timestamp: this.timestamp
    }
  }

  /**
   * If any of the transactions in the block are invalid, return false, otherwise return true.
   * @returns A boolean value.
   */
  hasValidTransactions(): boolean {
    for (const tx of this.transactions) {
      if (!tx.isValid()) {
        return false
      }
    }

    return true
  }
}
