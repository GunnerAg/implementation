import { Block } from "./block.interface"
import { Transaction } from "./transaction.interface"

export interface Blockchain {
  
  chain: [Block]
  difficulty: number
  pendingTransactions: [Transaction]
  miningReward: number
  version: string
}
