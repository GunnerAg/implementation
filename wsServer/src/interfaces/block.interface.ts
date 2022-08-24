import { Transaction } from "./transaction.interface"

export interface Block {
  previousHash: string
  timestamp: number
  transactions: [Transaction]
  nonce: number
  hash: string
  version: string
  calculateHash:()=> string
  calculateHashTransactions:()=> string
  mineBlock:(difficulty:number)=> void
  hasValidTransactions:()=>boolean
}

