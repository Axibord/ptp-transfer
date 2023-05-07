import fs, { createWriteStream } from 'fs'
import * as net from 'net'
import { LOCAL_RECEIVER_IP, PORT } from './constants'
import { forwardPort } from './forward-upnp'
import { getMyIP } from './get-my-ip'

const FILE_PATH = 'received.txt'

// forward port on router
const { removeMapping } = forwardPort()

// Check if the file already exists, and get its size
let safeStartPosition = 0
let fileExists = fs.existsSync(FILE_PATH)
if (fileExists) {
  const lastPosition = fs.statSync(FILE_PATH).size
  // remove last 1% data from file to avoid corruption or incomplete file
  const safeFileSize = lastPosition > 0 ? Math.floor(lastPosition - lastPosition * 0.1) : 0
  fs.truncateSync(FILE_PATH, safeFileSize)
  safeStartPosition = safeFileSize
}

// Create a writable stream to write the received data to a file
const file = createWriteStream(FILE_PATH, {
  start: safeStartPosition,
  flags: 'a+',
})

// Create a socket server and listen for incoming connections
const server = net.createServer(async (socket) => {
  socket.on('ready', () => {
    console.info('Server created successfully and socket is ready!')
  })
  socket.on('data', (data) => {
    const receivedData = data.toString()
    if (receivedData.startsWith('sender:connected')) {
      console.info('Remote sender is connected, and ready to receive data')

      socket.write(`startPosition:${safeStartPosition}`)
    } else if (receivedData.startsWith('sender:ready-to-stream')) {
      socket.write('receiver:start-to-stream')
    } else {
      console.info('receiving data...piping to file', receivedData)

      file.write(receivedData)
    }
  })

  // Listen for the 'end' event, which indicates that all data has been received
  socket.on('end', () => {
    console.log('Closing connection with the sender...')
    removeMapping()
  })
})

server.on('listening', async () => {
  // log my ip to the console
  await getMyIP()
})

server.listen(PORT, LOCAL_RECEIVER_IP, () => {
  console.log(`Listening for connections on ${LOCAL_RECEIVER_IP}:${PORT}`)
})

process.on('SIGINT', () => {
  removeMapping()
  console.log(`Server closed`)
  process.exit(0)
})

process.on('uncaughtException', (err) => {
  removeMapping()
  console.log(`Uncaught Exception: ${err.message}`)
  process.exit(1)
})

process.on('ENOTSUP', (err) => {
  removeMapping()
  console.log(`Uncaught Exception: ${err.message}`)
  process.exit(1)
})

// catch any unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  removeMapping()
  console.log(`Unhandled rejection at ${promise}, reason: ${reason}`)
  process.exit(1)
})

process.on('error', (err) => {
  removeMapping()
  console.log(`Error: ${err.message}`)
  process.exit(1)
})
