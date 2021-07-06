import {
  createRnodeService,
  localNet,
  testNet,
  mainNet,
  getNodeUrls,
} from 'connectors/rnode-http-js'
import { NodeUrls } from 'connectors/rnode-http-js/types'

const nets = [localNet, testNet, mainNet].map(
  ({ title, name, hosts, readOnlys }) => ({
    title,
    name,
    hosts: hosts.map((x) => ({ ...x, title, name })),
    readOnlys: readOnlys.map((x) => ({ ...x, title, name })),
  }),
)

const initNet = nets[1]

const getNode = (net: string): NodeUrls => {
  switch (net) {
    case 'mainnet': {
      const net = initNet.hosts[0]
      return getNodeUrls(net)
    }

    case 'testnet': {
      const net = initNet.readOnlys[0]
      return getNodeUrls(net)
    }

    default: {
      const net = initNet.readOnlys[0]
      return getNodeUrls(net)
    }
  }
}

export async function handleRequest(request: Request): Promise<Response> {
  if (request.method === 'POST') {
    const url = new URL(request.url)
    const { body } = request

    console.log(body)
    // Only use the path for the cache key, removing query strings
    // and always store using HTTPS e.g. https://www.example.com/file-uri-here
    const someCustomKey = `https://${url.hostname}${url.pathname}`

    /*const { exploreDeploy } = createRnodeService(getNode(body.net))
   const result = await exploreDeploy({
      code: pCode,
    })*/
    // Reconstruct the Response object to make its headers mutable.
    const response = new Response()

    // Set cache control headers to cache on browser for 25 minutes
    response.headers.set('Cache-Control', 'max-age=1500')
    return response
  } else {
    const response = new Response('Expected POST', { status: 500 })
    return response
  }
}
