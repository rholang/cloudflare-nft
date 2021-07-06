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

export type ExploreWorkerArgs = { node: NodeUrls; code: string }

const readRequestBody = async (request: Request) => {
  const { headers } = request
  const contentType = headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    return await request.json()
  } else {
    return ''
  }
}

const exploreRequest = async (request: Request) => {
  // Construct the cache key from the cache URL
  const { net, code } = await readRequestBody(request)
  console.log(net)
  if (net && code) {
    const node = getNode(net)
    const { exploreDeploy } = createRnodeService(node)
    const result = await exploreDeploy({
      code: code,
    })
    return { code: code, result: result }
  } else {
    return { code: '', result: '' }
  }
}

export async function handleRequest(event: FetchEvent): Promise<Response> {
  const request = event.request
  if (request.method === 'POST') {
    const { code, result } = await exploreRequest(request)

    // cache response
    const cacheUrl = new URL(code)
    const cacheKey = new Request(cacheUrl.toString(), request)
    const cache = caches.default

    const response = await cache.match(cacheKey)

    if (!response) {
      // Must use Response constructor to inherit all of response's fields
      const response = new Response(JSON.stringify(result), { status: 200 })

      // Cache API respects Cache-Control headers. Setting s-max-age to 10
      // will limit the response to be in cache for 10 seconds max

      // Any changes made to the response here will be reflected in the cached value
      response.headers.append('Cache-Control', 's-maxage=31556952')

      // Store the fetched response as cacheKey
      // Use waitUntil so you can return the response without blocking on
      // writing to cache
      event.waitUntil(cache.put(cacheKey, response.clone()))
      return response
    }
    return response
  } else {
    const response = new Response('Expected POST', { status: 500 })
    return response
  }
}
