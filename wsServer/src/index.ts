import { v4 as uuidv4 } from 'uuid'
import { Blockchain } from './blockchain'
import Transaction from './blockchain/transaction.model'
import { generateKeys } from './helpers/key-generator'
import loaders from './loaders'
import { performance } from 'node:perf_hooks'

const WebSocket = require('ws')
const wss = new WebSocket.Server({ port: 8000 })
const clients = new Map()
const EC = require('elliptic').ec
const ec = new EC('secp256k1')
const chain = new Blockchain()

wss.on('connection', async ws => {
  const id = uuidv4()
  // console.log('new connection', id, ws)
  const wallet = await generateKeys()
  console.log('THE WALLET', wallet)
  const metadata = { id, wallet }
  console.log('THE metadata', metadata)
  clients.set(ws, metadata)

  // send back the new ID and the wallet details for the new client connection
  ws.send(JSON.stringify(metadata))

  ws.on('message', async (messageAsString: string) => {
    const data = JSON.parse(JSON.stringify(messageAsString))
    const metadata = clients.get(ws)
    const { type, amount, to } = data
    const { publicKey, privateKey } = clients.get(ws).metadata.wallet
    data.sender = metadata.id

    switch (type) {
      case 'BALANCE':
        const balance = chain.getBalanceOfAddress(publicKey)
        ws.send(JSON.stringify(balance))

      case 'TRANSACTIONS':
        const transactions = chain.getAllTransactionsForWallet(publicKey)
        ws.send(JSON.stringify(transactions))

      case 'ADD_TRANSACTION':
        const tx = new Transaction(publicKey, to, amount)
        tx.signTransaction(ec.keyFromPrivate(privateKey))
        chain.addTransaction(tx)

      case 'MINE_BLOCK':
        const start = performance.now()
        await chain.minePendingTransactions(publicKey)
        const end = performance.now()
        const elapsed: number = (end - start) / 1000
        // If mining takes less than 15 seconds increase dif,
        // else if it takes longer than 30 seconds, reduce dif.
        if (15 > elapsed) {
          chain.adjustDificulty(chain.difficulty++)
        } else if (30 < elapsed) {
          chain.adjustDificulty(chain.difficulty--)
        }

        ;[...clients.keys()].forEach(client => {
          client.send(
            JSON.stringify({ msg: 'Blockchain Updated by peer: ' + data.sender + 'to the new state: ' + chain })
          )
        })

      default:
        break
    }
  })
})

wss.on('close', ws => {
  clients.delete(ws)
})

console.log('wss up on port 8000')
loaders()
