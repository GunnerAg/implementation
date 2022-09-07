export interface Transaction {
  id: number
  fromAddress: string
  toAddress: string
  amount: number
  timestamp: number
  signature: any
  calculateHash: () => string
  signTransaction: (signingKey: any) => void
  isValid: () => boolean
}

export interface Block {
  previousHash: string
  timestamp: number
  transactions: Transaction[]
  nonce: number
  hash: string
  version: string
  difficulty?: number
  calculateHashTransactions: () => string
  calculateHash: () => string
  testHash: (nonce:number) => string
  mineBlock: (difficulty: number) => Promise<void>
  pendingBlockData: () => any
  hasValidTransactions: () => boolean
}

export interface Blockchain {
  chain: Block[]
  difficulty: number
  pendingTransactions: Transaction[]
  miningReward: number
  version: string
  transactionCount: number
  createGenesisBlock: () => Block
  getLatestBlock: () => Block
  pendingBlock: (miningRewardAddress:any) => Promise<any>
  testMinedBlock: (_block: any, nonce: number) => Promise<any>
  adjustDifficulty: () => void
  addBlock: (block: Block) => void
  addTransaction: (transaction: Transaction) => void
  getBalanceOfAddress: (address: any) => number
  getAllTransactionsForWallet: (address: any) => Transaction[]
  isChainValid: () => boolean
}