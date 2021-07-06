import {
  DeployArgs,
  DeployEff,
  ExploreDeployArgs,
  ExploreDeployEff,
  RNodeEff,
  Status,
  NodeUrls,
} from './types'
import * as R from 'ramda'
import { RevAccount, RevAddress, createRevAccount } from './rev-address'
import { ethereumAddress } from './eth/eth-wrapper'
import { makeRNodeWeb } from './rnode-web'

const exploreDeploy = ({ rnodeHttp, node }: ExploreDeployEff) =>
  async function ({ code }: ExploreDeployArgs): Promise<Status> {
    const {
      expr: [e],
    } = await rnodeHttp(node.httpUrl, 'explore-deploy', code)
    const dataBal = e as string
    //console.log(dataBal);
    const dataError = (e && e.ExprString && e.ExprString.data) || ''
    return { success: dataError, message: dataBal }
  }

const deploy = (effects: DeployEff) =>
  async function ({ code, account, phloLimit }: DeployArgs): Promise<Status> {
    const { node, sendDeploy, getDataForDeploy } = effects
    console.log(account)
    const phloLimitNum = R.isNil(phloLimit) ? phloLimit : parseInt(phloLimit)
    const { signature } = await sendDeploy(node, account, code, phloLimitNum)

    // Progress dots
    const mkProgress = (i: number) => () => {
      i = i > 60 ? 0 : i + 3
      return `Checking result ${R.repeat('.', i).join('')}`
    }
    const progressStep = mkProgress(0)
    const updateProgress = () => true
    updateProgress()

    // Try to get result from next proposed block

    /*const getData = async () => {
      const { data, cost } = await getDataForDeploy(
        node,
        signature,
        updateProgress
      );
      return { data, cost };
    };

    const { data, cost } = await getData();

    // Extract data from response object
    const args = data ? rhoExprToJson(data.expr) : void 0;

    const costTxt = R.isNil(cost) ? 'failed to retrive' : cost;
    const [succ, message] = R.isNil(args)
      ? [
          false,
          'deploy found in the block but data is not sent on `rho:rchain:deployId` channel',
        ]
      : [true, R.is(Array, args) ? args.join(', ') : args];

    if (!succ) throw Error(`Deploy error: ${message}. // cost: ${costTxt}`);

    const success = succ.toString();*/
    const message = signature
    return { success: '', message: message }
  }

export const getMetamaskAccount = async () => {
  const ethAddr = await ethereumAddress()
  const revAddress = createRevAccount(ethAddr) as RevAddress
  const revAccountAddress = { ethAddr: ethAddr, ...revAddress }
  const revAccountName = { name: 'revWallet' }
  const revAccount: RevAccount = { ...revAccountAddress, ...revAccountName }
  return revAccount
}

export const createRnodeService = (node: NodeUrls): RNodeEff => {
  const rnodeWeb = makeRNodeWeb({ now: Date.now })

  const { rnodeHttp, sendDeploy, getDataForDeploy } = rnodeWeb

  // App actions to process communication with RNode
  return {
    exploreDeploy: exploreDeploy({ rnodeHttp, node }),
    deploy: deploy({ node, sendDeploy, getDataForDeploy }),
  }
}
