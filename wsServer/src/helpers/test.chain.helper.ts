'use strict'
import { Blockchain, Transaction } from '../blockchain'
const EC = require('elliptic').ec
const ec = new EC('secp256k1')

// Your private key goes here
const myKey = ec.keyFromPrivate('212cbd97fc771fc143b5a5e146c5e1668befbbf21d59c1ed073fe96bfbc9fad3')

// From that we can calculate your public key (which doubles as your wallet address)
const myWalletAddress = myKey.getPublic('hex')

// Create new instance of Blockchain class
const test = new Blockchain()

export default async (): Promise<void> => {
  // Mine first block
  test.minePendingTransactions(myWalletAddress)

  // Create a transaction & sign it with your key
  const tx1 = new Transaction(myWalletAddress, 'address2', 100)
  tx1.signTransaction(myKey)
  test.addTransaction(tx1)

  // Mine block
  test.minePendingTransactions(myWalletAddress)

  // Create second transaction
  const tx2 = new Transaction(myWalletAddress, 'address1', 50)
  tx2.signTransaction(myKey)
  test.addTransaction(tx2)

  // Mine block
  test.minePendingTransactions(myWalletAddress)

  console.log()
  console.log(`Balance of xavier is ${await test.getBalanceOfAddress(myWalletAddress)}`)

  // Uncomment this line if you want to test tampering with the chain
  // test.chain[1].transactions[0].amount = 10;

  // Check if the chain is valid
  console.log()
  console.log('Blockchain valid?', test.isChainValid() ? 'Yes' : 'No')
}
