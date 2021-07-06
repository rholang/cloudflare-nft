import { handleRequest } from '../src/handler'
import makeServiceWorkerEnv from 'service-worker-mock'
import 'isomorphic-fetch'
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

    /*const result = await handleRequest(
      new Request('/', {
        body: JSON.stringify(body),
        method: 'POST',
        headers: {
          'content-type': 'application/json;charset=UTF-8',
        },
      }),
    )*/
    console.log('test')
    const result = await fetch(
      'https://71c37243bb5507f453fb5b93f055dac7.cloudflareworkers.com/.edgeworker-fiddle-init-preview/d41f2196b50547c3fe7cc122e7f9d9785b50079424dcc3747d38a5d569509c5f1example.com/',
      {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'content-type': 'application/json;charset=UTF-8',
        },
      },
    )
    expect(result.status).toEqual(200)
  })
})
