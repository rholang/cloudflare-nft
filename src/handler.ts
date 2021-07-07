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

const checkBalance = `
new return, rl(\`rho:registry:lookup\`), RevVaultCh, vaultCh in {
  rl!(\`rho:rchain:revVault\`, *RevVaultCh) |
  for (@(_, RevVault) <- RevVaultCh) {
    @RevVault!("findOrCreate", "1111yNahhR8CYJ7ijaJsyDU4zzZ1CrJgdLZtK4fve7zifpDK3crzZ", *vaultCh) |
    for (@maybeVault <- vaultCh) {
      match maybeVault {
        (true, vault) => @vault!("balance", *return)
        (false, err)  => return!(err)
      }
    }
  }
}
`

export type ExploreWorkerArgs = { node: NodeUrls; code: string }

declare global {
  const KVSTORE: KVNamespace
}

const readRequestBody = async (request: Request) => {
  const { headers } = request
  const contentType = headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    return await request.json()
  } else {
    return ''
  }
}

const exploreRequest = async (net: string, code: string) => {
  const node = getNode(net)

  const { exploreDeploy } = createRnodeService(node)
  const result = await exploreDeploy({
    code: code,
  })

  return JSON.stringify(result)
}

const hashCode = (s: string) =>
  s.split('').reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0)
    return a & a
  }, 0)

export async function handleRequest(event: FetchEvent): Promise<Response> {
  const request = event.request
  if (request.method === 'GET') {
    const { searchParams } = new URL(request.url)
    const netParams = searchParams.get('net')

    const codeParams = searchParams.get('code')
    //console.log(codeParams)
    if (netParams && codeParams) {
      const code = codeParams
      //const { hostname } = new URL(request.url)
      //const concatUrl = 'https://' + hostname + '/' + code

      const hashedCodeKey = hashCode(code).toString()
      /*const cacheUrl = new URL(request.url)
      const cacheKey = new Request(cacheUrl.toString(), request)
      const cache = caches.default

      const response = await cache.match(cacheKey)
     */

      const storeValue = await KVSTORE.get(hashedCodeKey)

      if (storeValue) {
        const response = new Response(JSON.stringify(storeValue), {
          status: 200,
        })
        response.headers.append('Cache-Control', 's-maxage=86400')
        return response
      } else {
        try {
          const result = await exploreRequest('netParams', code)

          const storeKey = await KVSTORE.put(hashedCodeKey, result.toString())
          const response = new Response(JSON.stringify(result), {
            status: 200,
          })
          response.headers.append('Cache-Control', 's-maxage=86400')
          return response
        } catch (err) {
          return new Response(err, {
            status: 500,
          })
        }
      }
    } else {
      const response = new Response('Expected Arguments', { status: 500 })
      return response
    }
  } else {
    const response = new Response('Expected POST', { status: 500 })
    return response
  }
}
