import { v4 as uuidv4 } from 'uuid'
import { Blockchain } from './blockchain'
import Transaction from './blockchain/transaction.model'
import { generateKeys } from './helpers/key-generator'
import loaders from './loaders'

const WebSocket = require('ws')
const wss = new WebSocket.Server({ port: 8000 })
const clients = new Map()
const EC = require('elliptic').ec
const ec = new EC('secp256k1')
const chain = new Blockchain()

wss.on('connection', async ws => {
  const id = uuidv4()
  const { publicKey, privateKey } = await generateKeys()
  const privateData = { id, publicKey, privateKey, balance: chain.getBalanceOfAddress(publicKey) }
  const publicData = []
  clients.set(ws, privateData)
  console.log('NEW CONNECTION, TOTAL CONNECTED PEERS: ', [...clients.keys()].length)
  ws.send(JSON.stringify({ type: 'CONNECTED', privateData }));

  [...clients.keys()].forEach(client => {
    const peer = clients.get(client)
    const clone = JSON.parse(JSON.stringify(peer))
    delete clone.privateKey
    publicData.push(clone)
  })

  ;[...clients.keys()].forEach(client => {
    client.send(JSON.stringify({ type: 'NEW_PEER', peer: id, data: publicData }))
  })

  ws.on('message', async (messageAsString: string) => {
    const msg = JSON.parse(messageAsString)
    console.log('DATA IS: ', messageAsString)
    const { type, amount, to } = msg
    const client = clients.get(ws)
    console.log('CLIENT IS', client)
    const { publicKey, privateKey, id } = privateData

    // const transactions = chain.getAllTransactionsForWallet(publicKey)
    const tx = new Transaction(publicKey, to, amount, chain.transactionCount + 1)

    /**
     * It takes a message as a parameter, and then sends that message to all the clients that are
     * connected to the server
     * @param {string} msg - The message to send to the client.
     */
    const sendMsg = (msg: string): void => {
      ;[...clients.keys()].forEach(client => {
        client.send(
          msg
          // JSON.stringify({ type: 'NEW_CHAIN', peer: id, data: chain })
          // JSON.stringify({ msg: 'Blockchain Updated by peer: ' + id + 'to the new state: ' + chain })
        )
      })
    }

    /**
     * It iterates over all the clients in the clients map, and sends them a message with the new
     * balance
     */
    const updateBalances = (): void => {
      ;[...clients.keys()].forEach(client => {
        const peer = clients.get(client)
        client.send(JSON.stringify({ type: 'NEW_BALANCE', data: chain.getBalanceOfAddress(peer.publicKey) }))
      })
    }

    switch (type) {
      case 'BALANCE':
        // eslint-disable-next-line no-case-declarations
        ws.send(JSON.stringify(chain.getBalanceOfAddress(publicKey)))
        break

      case 'ADD_TRANSACTION':
        tx.signTransaction(ec.keyFromPrivate(privateKey))
        chain.addTransaction(tx)
        sendMsg(JSON.stringify({ type: 'NEW_TRANSACTION', data: chain.pendingTransactions }))
        ws.send(JSON.stringify({ type: 'NEW_BALANCE', data: chain.getBalanceOfAddress(publicKey) }))
        break

      case 'MINE_BLOCK':
        console.log('MINING A BLOCK...')
        console.log('BEFORE')
        sendMsg(JSON.stringify({ type: 'MINING', peer: id }))
        // eslint-disable-next-line no-case-declarations
        await chain.minePendingTransactions(publicKey)
        // If mining takes less than 15 seconds increase dif,
        // else if it takes longer than 30 seconds, reduce dif.

        // eslint-disable-next-line no-case-declarations
        sendMsg(JSON.stringify({ type: 'NEW_CHAIN', peer: id, data: chain }))
        updateBalances()
        break

      case 'PENDING_BLOCK':
        // eslint-disable-next-line no-case-declarations
        // If mining takes less than 15 seconds increase dif,
        // else if it takes longer than 30 seconds, reduce dif.
        // eslint-disable-next-line no-case-declarations
        const blockData = await chain.pendingBlock(publicKey)
        blockData.difficulty = chain.difficulty
        console.log('PENDING BLOCK', blockData)
        // eslint-disable-next-line no-case-declarations
        ws.send(JSON.stringify({ type: 'PENDING_BLOCK', data: blockData }))
        break

      case 'MINED_BLOCK':
        // eslint-disable-next-line no-case-declarations
        // If mining takes less than 15 seconds increase dif,
        // else if it takes longer than 30 seconds, reduce dif.
        // eslint-disable-next-line no-case-declarations
        console.log('MINED_BLOCK', msg.data.block, msg.data.nonce)
        await chain.test(msg.data.block, msg.data.nonce)
        // msg.data.block
        // msg.data.nonce
        // eslint-disable-next-line no-case-declarations
        sendMsg(JSON.stringify({ type: 'NEW_CHAIN', peer: id, data: chain }))
        sendMsg(JSON.stringify({ type: 'NEW_TRANSACTION', data: chain.pendingTransactions }))
        updateBalances()
        sendMsg(JSON.stringify({ type: 'VALIDATE_BLOCK', data: msg.data }))
        break

      default:
        break
    }
  })

  ws.on('close', () => {
    // chain.removePeer(clients.get(ws).data)
    clients.delete(ws)
  })
})

console.log('wss up on port 8000')
loaders()
