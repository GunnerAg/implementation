// const crypto = require('crypto')

// /**
//  * It generates a public and private key pair using the RSA algorithm
//  * @param {number} size - The size of the key to be generated. The default is 2048.
//  * @returns An object with two properties, publickey and privatekey.
//  */
// export const generateKeys = async (size?: number): Promise<{ publickey: string; privatekey: string }> => {
//   const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
//     // The standard secure default length for RSA keys is 2048 bits
//     modulusLength: size || 2048
//   })

//   return {
//     publickey: publicKey.export({
//       type: 'spki',
//       format: 'pem'
//     }),
//     privatekey: privateKey.export({
//       type: 'pkcs8',
//       format: 'pem'
//     })
//   }
// }

'use strict'
const EC = require('elliptic').ec

// You can use any elliptic curve you want
const ec = new EC('secp256k1')

// Generate a new key pair and convert them to hex-strings
const key = ec.genKeyPair()
const publicKey = key.getPublic('hex')
const privateKey = key.getPrivate('hex')

// Print the keys to the console
console.log()
console.log('Your public key (also your wallet address, freely shareable)\n', publicKey)

console.log()
console.log('Your private key (keep this secret! To sign transactions)\n', privateKey)
