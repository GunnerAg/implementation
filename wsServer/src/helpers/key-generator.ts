import { strict } from 'node:assert'

const EC = require('elliptic').ec

// You can use any elliptic curve you want
const ec = new EC('secp256k1')

export const generateKeys = async (): Promise<{ publicKey: any; privateKey: any }> => {
  const key = await ec.genKeyPair()
  const publicKey = await key.getPublic('hex')
  const privateKey = await key.getPrivate('hex')

  return {
    publicKey,
    privateKey
  }
}

// Generate a new key pair and convert them to hex-strings
// const key = ec.genKeyPair()
// const publicKey = key.getPublic('hex')
// const privateKey = key.getPrivate('hex')
