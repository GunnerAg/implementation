import { Block } from './block.interface'
import { Transaction } from './transaction.interface'

export interface Peer {
  id: string,
  publicKey: string,
  privateKey: string
}

export interface Blockchain {
  chain: Block[]
  difficulty: number
  pendingTransactions: Transaction[]
  miningReward: number
  version: string
  peers: Peer[]
}
