import { IBlock, ITransaction, IBlockchain } from 'src/interfaces'
import Block from './block'
import Transaction from './transaction'

export default class Blockchain implements IBlockchain {
  public chain: IBlock[]
  public difficulty: number
  public pendingTransactions: ITransaction[]
  public miningReward: number
  public version: string
  public transactionCount: number


  constructor(){
    this.chain = [this.createGenesisBlock()]
    this.difficulty = 2
    this.pendingTransactions = []
    this.miningReward = 100
    this.version = '1.0.0'
    this.transactionCount = 0
  }

  createGenesisBlock(): IBlock {
    return new Block(Date.parse('2022-01-01'), [], '0')
  }

  getLatestBlock(): IBlock {
    return this.chain[this.chain.length - 1]
  }

  async pendingBlock(miningRewardAddress: any): Promise<any> {
    const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward, this.transactionCount + 1 )
    this.transactionCount++
    this.pendingTransactions.push(rewardTx)
    const block = new Block(+Date.now(), this.pendingTransactions, this.getLatestBlock().hash)
    return block.pendingBlockData()
  }

  async testMinedBlock(_block:any, nonce:number): Promise<any> {

    const addedTransactions = []
    
    _block.transactions.forEach(tx => {
      addedTransactions.push(tx.id)
    })

    // console.log('Transactions in the mined block', _block.transactions, this.pendingTransactions.filter(t => addedTransactions.includes(t.id)))

    const block = new Block(
      _block.timestamp,
      this.pendingTransactions.filter(t => addedTransactions.includes(t.id)),
      this.getLatestBlock().hash
    )

    const condition = block.testHash(nonce).substring(0, this.difficulty) === Array(this.difficulty + 1).join('0')
    // console.log(
    //   'CONDITION?',
    //   nonce,
    //   condition,
    //   block.testHash(nonce).substring(0, this.difficulty),
    //   Array(this.difficulty + 1).join('0')
    // )
    block.nonce = nonce
    block.hash = block.testHash(nonce)
    this.adjustDifficulty()

    if(condition) this.addBlock(block)
  }

  adjustDifficulty(): void {
    const elapsed = (+Date.now() - this.getLatestBlock().timestamp) / 1000

    if(elapsed < 5) {
      this.difficulty++
    }

    if (elapsed > 10) {
      this.difficulty !<= 0 && this.difficulty--
    }
  }

  addBlock(block:IBlock): void {
    console.log('ADDING A NEW BLOCK : ', block)
    if (!this.isChainValid() || !block.hasValidTransactions()) {
      throw new Error('The new block is not a valid block')
    } else {
      this.chain.push(block)
      // console.log('A NEW BLOCK WAS ADDED TO THE CHAIN !')
      const addedTransactions = []
      block.transactions.forEach(tx=> {addedTransactions.push(tx.id)})

      this.pendingTransactions = this.pendingTransactions.filter(t => !addedTransactions.includes(t.id))
    }
  }

  addTransaction(transaction:ITransaction): void {
    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error('Transcion must include from and to addresses')
    }

    if (!transaction.isValid()){
      throw new Error('Cannot add invalid transaction to the chain')
    }

    if (transaction.amount <= 0) {
      throw new Error('Transaction amount shoud be bigger than 0')
    }

    const walletBalance = this.getBalanceOfAddress(transaction.fromAddress)
    if (walletBalance < transaction.amount) {
      throw new Error('Not enough balance')
    }

    const pendingTxForWallet = this.pendingTransactions.filter(tx => tx.fromAddress === transaction.fromAddress)

    if (pendingTxForWallet.length > 0) {
      const totalPendingAmount = pendingTxForWallet.map((tx: ITransaction)=> tx.amount).reduce((prev: number, curr:number) => Number(prev) + Number(curr))
      const totalAmount = Number(totalPendingAmount) + Number(transaction.amount)

      if(totalAmount>walletBalance) {
        throw new Error('Pending transactions for this wallet is higher than its balance')
      }
    }

    this.pendingTransactions.push(transaction)
    this.transactionCount++
    this.pendingTransactions.sort((t1:any, t2:any) => t1.timestamp - t2.timestamp)
  }

  getBalanceOfAddress(address:any): number {
    let balance = 0

    for (const block of this.chain) {
      for (const trans of block.transactions){
        if (trans.fromAddress === address){
          balance -= Number(trans.amount)
        }

        if (trans.toAddress === address) {
          balance += Number(trans.amount)
        }
      }
    }
    return balance
  }

  getAllTransactionsForWallet(address: any): ITransaction[] {
   const txs = []

   for (const block of this.chain) {
    for (const tx of block.transactions) {
      if (tx.fromAddress === address || tx.toAddress === address) {
        txs.push(tx)
      }
    }
  }
  return txs
  }

  isChainValid(): boolean {

    const realGenesis = JSON.stringify(this.createGenesisBlock())
    if (realGenesis !== JSON.stringify(this.chain[0])){
      return false
    }

    for (let i = 1; i < this.chain.length; i++ ) {
      const currentBlock = this.chain[i]
      const previousBlock = this.chain[i-1]

      // conditions //
      const wrongPrevHash = previousBlock.hash !== currentBlock.previousHash
      const wrongBlockTranasctions = !currentBlock.hasValidTransactions()
      const wrongCurrentHash = currentBlock.hash !== currentBlock.calculateHash()

      if (wrongPrevHash || wrongBlockTranasctions || wrongCurrentHash){
       return false
      }
    }

    return true
  }

}