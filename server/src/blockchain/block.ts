import crypto from 'crypto'
import { ITransaction, IBlock } from '../interfaces'

export default class Block implements IBlock {
  public previousHash: string
  public timestamp: number
  public transactions: ITransaction[]
  public nonce: number
  public hash: string
  public version: string

  constructor(timestamp: number, transactions: ITransaction[], prevuiousHash = "", version?: string ) {
    this.timestamp = timestamp
    this.transactions = transactions
    this.previousHash = prevuiousHash
    this.version = version || '1.0.0'
    this.nonce = 0
    this.hash = this.calculateHash()
  }

  calculateHashTransactions(): string {
    return crypto
      .createHash('sha256')
      .update(this.timestamp + this.version + JSON.stringify(this.transactions))
      .digest('hex')
  }

  calculateHash(): string {
    return crypto
      .createHash('sha256')
      .update(this.previousHash + this.version + this.calculateHashTransactions() + this.nonce)
      .digest('hex')
  }

  testHash(nonce: number): string {
    // console.log(`Testing this hash: ${this.previousHash + this.version + this.calculateHashTransactions() + nonce}`)

    return crypto
      .createHash('sha256')
      .update(this.previousHash + this.version + this.calculateHashTransactions() + nonce)
      .digest('hex')
  }

  async mineBlock(difficulty: number): Promise<void> {
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
      this.nonce ++
      this.hash = this.calculateHash()
    }
    // console.log(`Block mined: ${this.hash}, ${this.nonce}`)
    // console.log('hashing this', this.previousHash + this.version + this.calculateHashTransactions() + this.nonce)
  }

  pendingBlockData(): any {
    return {
      previousHash: this.previousHash,
      version: this.version,
      transactions: this.transactions,
      timestamp: this.timestamp
    }
  }

  hasValidTransactions(): boolean {
    for (const tx of this.transactions) {
      if (!tx.isValid()){
        return false
      }
    }

    return true
  }
}