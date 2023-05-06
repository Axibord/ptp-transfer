import * as net from 'net'

const server = net.createServer()

server.listen(1337, () => console.log('server is running'))

server.on('connection', (socket) => {
  console.log('new connection')
  socket.write('hello')

  socket.on('data', (data) => {
    const incomingData = data.toString()
    console.log('data', incomingData)

    if (incomingData === 'e') {
      socket.end('\n goodbye\n')
    }
  })
})

server.on('error', (err) => {
  console.log('error', err)
})

server.on('close', () => {
  console.log('server closed')
})
