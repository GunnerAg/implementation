
const crypto = require('crypto')
const EC = require('elliptic').ec
const ec = new EC('secp256k1')

export default class Transaction {
  public fromAddress: any
  public toAddress: any
  public amount: any
  public timestamp: any
  public signature: any
  public id: number

  constructor(fromAddress, toAddress, amount, id, timestamp?) {
    this.id = id
    this.fromAddress = fromAddress
    this.toAddress = toAddress
    this.amount = amount
    this.timestamp = timestamp || +Date.now()
  }

  calculateHash(): any {
    return crypto
      .createHash('sha256')
      .update(this.fromAddress + this.toAddress + this.amount + this.timestamp)
      .digest('hex')
  }

  signTransaction(singingKey: any): void {
    if (singingKey.getPublic('hex') !== this.fromAddress) {
      throw new Error('Your cannot sign transactions from other wallets')
    }

    const hashTx = this.calculateHash()
    const sign = singingKey.sign(hashTx, 'base64')

    this.signature = sign.toDER('hex')
  }

  isValid(): boolean {
    if (this.fromAddress ===  null) return true

    if (!this.signature || this.signature.length === 0){
      throw new Error('No signature in this transaction')
    }

    const publicKey = ec.keyFromPublic(this.fromAddress, 'hex')
    return publicKey.verify(this.calculateHash(), this.signature)
  }

}