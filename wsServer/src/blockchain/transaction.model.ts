'use strict'
// import Transaction from './interfaces' TODO TRANSACTION INTERFACE
const crypto = require('crypto')
const EC = require('elliptic').ec
const ec = new EC('secp256k1')

export default class Transaction {
  // params -> receptor, firma, valor, data, gasLimit
  // Se crea el hash de la transacción.
  // recipient.
  // sender.
  // signature.
  // value.
  // data.
  // gasLimit.
  // maxPriorityFeePerGas.
  // maxFeePerGas.

  // TODO type the data
  public fromAddress: any
  public toAddress: any
  public amount: any
  public timestamp: any
  public signature: any

  /**
   * The constructor function is a special function that is called when an object is created from a
   * class.
   * @param fromAddress - The address of the sender
   * @param toAddress - The address of the recipient of the transaction.
   * @param amount - The amount of coins to be transferred
   */
  constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress
    this.toAddress = toAddress
    this.amount = amount
    this.timestamp = Date.now()
  }

  /**
   * It creates a hash of the transaction data.
   * @returns The hash of the transaction.
   */
  calculateHash(): any {
    return crypto
      .createHash('sha256')
      .update(this.fromAddress + this.toAddress + this.amount + this.timestamp)
      .digest('hex')
  }

  /**
   * It signs the transaction with the private key of the sender.
   * @param signingKey - The private key of the wallet that is sending the transaction.
   */
  signTransaction(signingKey:any): void {
    // You can only send a transaction from the wallet that is linked to your
    // key. So here we check if the fromAddress matches your publicKey
    if (signingKey.getPublic('hex') !== this.fromAddress) {
      throw new Error('You cannot sign transactions for other wallets!')
    }

    // Calculate the hash of this transaction, sign it with the key
    // and store it inside the transaction object
    const hashTx = this.calculateHash()
    const sig = signingKey.sign(hashTx, 'base64')

    this.signature = sig.toDER('hex')
  }

  /**
   * Checks if the signature is valid (transaction has not been tampered with).
   * It uses the fromAddress as the public key.
   *
   * @returns {boolean}
   */
  isValid(): boolean {
    // If the transaction doesn't have a from address we assume it's a
    // mining reward and that it's valid. You could verify this in a
    // different way (special field for instance)
  
    // This is a reward transaction and we don't need to verify it.
    if (this.fromAddress === null) return true

    if (!this.signature || this.signature.length === 0) {
      throw new Error('No signature in this transaction')
    }

    const publicKey = ec.keyFromPublic(this.fromAddress, 'hex')
    return publicKey.verify(this.calculateHash(), this.signature)
  }
}

// Una vez se crea una transacción, los pasos a seguir son:
// Se añade a un nodo.
// Se validan sus parámetros (por el nodo).
// Se comparte con otros nodos (por el nodo).
// Se incluye en un candidato a proximo bloque.
// Un bloque que la contiene se añade a la cadena.
