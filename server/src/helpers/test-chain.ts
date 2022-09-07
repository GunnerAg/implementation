import crypto from 'crypto'
import { Block, Blockchain, Transaction } from '../blockchain'

const EC = require('elliptic').ec
const ec = new EC('secp256k1')

// Your private key goes here
const myKey = ec.keyFromPrivate('212cbd97fc771fc143b5a5e146c5e1668befbbf21d59c1ed073fe96bfbc9fad3')

const myWalletAddress = myKey.getPublic('hex')

// Create new instance of Blockchain class
const testChain = new Blockchain()

// Calculate the hash of a message.
const calculateHash = (msg:any): string => {
  return crypto
    .createHash('sha256')
    .update(msg)
    .digest('hex')
}

// Replicate what the client does when mining a pending block.
async function mineBlock(block) {
  // We need this block-data to mine the block -> previousHash, version, timestamp, transactions
  // On mine Block request, send the block data (with pending transactions and reward transaction added)
  // If mined successfully then send the result back and broadcast it to all peers.

  let hash = "";
  let nonce = 0;

  while (
    hash.substring(0, testChain.difficulty) !==
    Array(testChain.difficulty + 1).join("0")
  ) {
    nonce++;
    const jsonTransactions = JSON.stringify(block.transactions);

    hash = await calculateHash(
      block.previousHash + block.version + await calculateHash(
        block.timestamp + block.version + jsonTransactions
      ) + nonce
    );

    console.log('HASHING', block.previousHash + block.version + await calculateHash(
      block.timestamp + block.version + jsonTransactions
    ) + nonce)
  }
  console.log(`Block mined: ${hash}, ${nonce}, ${JSON.stringify(block)}`);

  return { block, nonce };


}

const test = async (): Promise<void> => {
  // Mine first block.
  const blockData = await testChain.pendingBlock(myWalletAddress)
  const { block, nonce } = await mineBlock(blockData)
  // Test the mined block, if good add it to testChain.
  testChain.testMinedBlock(block, nonce)
  console.log(`Mined block 1, balance is: ${testChain.getBalanceOfAddress(myWalletAddress)}`)

  // Add a new transaction.
  const tx1 = new Transaction(myWalletAddress, 'address2', 100, testChain.transactionCount + 1)
  tx1.signTransaction(myKey)

  testChain.addTransaction(tx1)

  // Mine second block.
  const blockData2 = await testChain.pendingBlock(myWalletAddress)
  blockData.difficulty = testChain.difficulty
  const { block: block2, nonce: nonce2 } = await mineBlock(blockData2)
  // Test the mined block, if good add it to testChain.
  testChain.testMinedBlock(block2, nonce2)
  console.log(`Mined block 2, balance is: ${testChain.getBalanceOfAddress(myWalletAddress)}`)
  console.log('BLOCK DATA', testChain.getLatestBlock())

  // Create second transaction
  const tx2 = new Transaction(myWalletAddress, 'address1', 50, testChain.transactionCount + 1)
  tx2.signTransaction(myKey)
  testChain.addTransaction(tx2)

  // Mine third block with the pending transaction
  const blockData3 = await testChain.pendingBlock(myWalletAddress)
  blockData.difficulty = testChain.difficulty
  const { block: block3, nonce: nonce3 } = await mineBlock(blockData3)
  // Test the mined block, if good add it to testChain.
  testChain.testMinedBlock(block3, nonce3)
  console.log(`Mined block 3, balance is: ${testChain.getBalanceOfAddress(myWalletAddress)}`)
  console.log('BLOCK DATA', testChain.getLatestBlock())

  console.log()
  console.log(`Balance of tester0 is ${testChain.getBalanceOfAddress(myWalletAddress)}`)
  console.log(`Balance of tester2 is ${testChain.getBalanceOfAddress('address1')}`)
  console.log(`Balance of tester2 is ${testChain.getBalanceOfAddress('address2')}`)

  // Test what happens if we try to change a transaction inside a past block.
  // testChain.chain[1].transactions[0].amount = 10

  // Check if the chain is valid
  console.log()
  console.log(' ')
  console.log('---THE BLOCKCHAIN---', testChain)
  console.log(' ')
  console.log('Blockchain valid?', testChain.isChainValid() ? 'Yes' : 'No')
}


test();