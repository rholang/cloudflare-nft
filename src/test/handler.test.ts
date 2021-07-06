import { handleRequest } from '../src/handler'
import makeServiceWorkerEnv from 'service-worker-mock'
import { ne } from 'connectors/rnode-https-js'

declare var global: any

describe('handle', () => {
  beforeEach(() => {
    Object.assign(global, makeServiceWorkerEnv())
    jest.resetModules()
  })

  test('handle GET', async () => {
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

    const body = { net: 'testnet', code: checkBalance }

    const result = await handleRequest(
      new Request('/', {
        body: JSON.stringify(body),
        method: 'POST',
        headers: {
          'content-type': 'application/json;charset=UTF-8',
        },
      }),
    )
    console.log(result)
    expect(result.status).toEqual(200)
    const text = await result.text()
    expect(text).toEqual('request method: GET')
  })
})
