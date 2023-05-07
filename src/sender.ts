import { ReadStream, createReadStream } from 'fs'
import * as net from 'net'
import path from 'path'
import { PORT, REMOTE_RECEIVER_PUBLIC_IP } from './constants'

// The file to send
const parentDirectoryPath = path.join(__dirname, '..')
let file: ReadStream

// Create a socket connection to the receiver
const socket = net.connect({ host: REMOTE_RECEIVER_PUBLIC_IP, port: PORT }, () => {
  console.log('Socket connection established')
})

socket.on('ready', () => {
  console.log('Socket is ready!')
  socket.write('sender:connected')
})
socket.on('data', (data) => {
  const receivedData = data.toString()
  if (receivedData.startsWith('startPosition:')) {
    const safeStartPosition = parseInt(receivedData.split(':')[1])
    console.info('sender received startPosition from receiver', safeStartPosition)
    file = createReadStream(path.join(parentDirectoryPath, 'files', 'test.txt'), {
      start: safeStartPosition,
      flags: 'r',
    })
    socket.write('sender:ready-to-stream')
  } else {
    console.info('sending data ...')
    file.pipe(socket)
  }
})

socket.on('error', (err) => {
  console.log('Socket error:', err)
})
