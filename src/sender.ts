import { createReadStream } from 'fs'
import * as net from 'net'
import path from 'path'
import { PORT, REMOTE_RECEIVER_PUBLIC_IP } from './constants'

// The file to send
const parentDirectoryPath = path.join(__dirname, '..')
const file = createReadStream(path.join(parentDirectoryPath, 'files', 'test.txt'))

// Create a socket connection to the receiver
const socket = net.connect({ host: REMOTE_RECEIVER_PUBLIC_IP, port: PORT }, () => {
  console.log('Socket connection established')
})
// Send the file over the socket connection
file.pipe(socket)
