import { v4 as uuidv4 } from 'uuid'
import loaders from './loaders'
const WebSocket = require('ws')
const wss = new WebSocket.Server({ port: 8000 })
const clients = new Map()

wss.on('connection', async ws => {
  const id = uuidv4()
  console.log('new connection', id, ws)
  const metadata = { id }

  clients.set(ws, metadata)
  console.table('clients', [clients.get(ws), clients.get(metadata)])

  ws.on('message', messageAsString => {
    const message = JSON.parse(JSON.stringify(messageAsString))
    const metadata = clients.get(ws)

    message.sender = metadata.id
    ;[...clients.keys()].forEach(client => {
      client.send(JSON.stringify(message))
    })
  })
})

wss.on('close', ws => {
  clients.delete(ws)
})

console.log('wss up on port 8000')
loaders()
