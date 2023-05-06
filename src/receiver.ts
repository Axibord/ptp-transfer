import { createWriteStream } from 'fs'
import * as net from 'net'
import { forwardPort } from './forward-upnp'
import { getMyIP } from './get-my-ip'
import { LOCAL_RECEIVER_IP, PORT } from './constants'

// forward port on router
const { removeMapping } = forwardPort()

// Create a socket server and listen for incoming connections
const server = net.createServer(async (socket) => {
  console.log('Client connected')

  // Create a writable stream to write the received data to a file
  const file = createWriteStream('received.mkv')

  // Pipe the socket to the file
  socket.pipe(file)

  // Listen for the 'end' event, which indicates that all data has been received
  socket.on('end', () => {
    console.log('File received')
    removeMapping()
  })
})

server.on('listening', async () => {
  // log my ip in the console
  await getMyIP()
})

server.listen(PORT, LOCAL_RECEIVER_IP, () => {
  console.log(`Listening for connections on ${LOCAL_RECEIVER_IP}:${PORT}`)
})

// handle global error if CTRL+C is pressed to close the server
process.on('SIGINT', () => {
  removeMapping()
  console.log(`Server closed`)
  process.exit(0)
})

// handle global error if happened
process.on('uncaughtException', (err) => {
  // closePort(PORT)
  removeMapping()
  console.log(`Uncaught Exception: ${err.message}`)
  process.exit(1)
})

process.on('ENOTSUP', (err) => {
  // closePort(PORT)
  removeMapping()
  console.log(`Uncaught Exception: ${err.message}`)
  process.exit(1)
})
