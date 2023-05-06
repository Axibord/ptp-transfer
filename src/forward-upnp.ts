import natUpnp from 'nat-upnp'
import { PORT } from './constants'

export function forwardPort() {
  const client = natUpnp.createClient()
  client.portMapping(
    {
      public: PORT,
      private: PORT,
      ttl: 0,
    },
    function (err: any) {
      if (err) {
        console.log('Error creating port mapping:', err)
      } else {
        console.log('Port mapping created successfully!')
      }
    }
  )

  function removeMapping() {
    console.info('Removing port mapping')
    return client.portUnmapping({
      public: PORT,
      private: PORT,
    })
  }
  return {
    removeMapping,
  }
}
