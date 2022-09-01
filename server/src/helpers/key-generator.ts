
const EC = require('elliptic').ec

// You can use any elliptic curve you want
const ec = new EC('secp256k1')

/**
 * Generate a public and private key pair using the elliptic library
 * @returns An object with two properties, publicKey and privateKey.
 */
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
