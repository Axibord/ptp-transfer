import https from 'https'

export async function getMyIP() {
  https
    .get('https://api.ipify.org', (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        const publicIP = data
        console.log(`My public IP address is: ${publicIP}`)
      })
    })
    .on('error', (err) => {
      console.error(`Error getting public IP address: ${err.message}`)
    })
}
