const EC = require('elliptic').ec
const ec = new EC('secp256k1')


export const generateKeys = async (): Promise<{ publicKey: any, privateKey: any }> => {
  const key = await ec.genKeyPair()
  const publicKey = await key.getPublic('hex')
  const privateKey = await key.getPrivate('hex')

  return {
    publicKey,
    privateKey
  }
}