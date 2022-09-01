export interface Transaction {
  id: number
  fromAddress: string
  toAddress: string
  amount: number
  timestamp: number
  signature: any
  calculateHash: ()=> string
  signTransaction: (signingKey:any)=>void
  isValid: ()=> boolean
}
