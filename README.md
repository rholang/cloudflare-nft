# ʕ •́؈•̀) `workers-typescript-template`

A batteries included template for kick starting a TypeScript Cloudflare worker project.

## Note: You must use [wrangler](https://developers.cloudflare.com/workers/cli-wrangler/install-update) 1.17 or newer to use this template.

## 🔋 Getting Started

1. clone project
2. yarn install
3. yarn global add @cloudflare/wrangler
4. wrangler login
   - login
   - if message "waiting for api token very long" -> https://github.com/cloudflare/wrangler/issues/1703
5. put your AccountId into wrangler.toml (wrangler whoami)  
   name = "my-worker"
   account_id = "$yourAccountId"
6. wranger preview --watch
7. wrangler publish

### 👩 💻 Developing

[`src/index.ts`](./src/index.ts) calls the request handler in [`src/handler.ts`](./src/handler.ts), and will return the [request method](https://developer.mozilla.org/en-US/docs/Web/API/Request/method) for the given request.

### 🧪 Testing

This template comes with jest tests which simply test that the request handler can handle each request method. `npm test` will run your tests.

### ✏️ Formatting

This template uses [`prettier`](https://prettier.io/) to format the project. To invoke, run `npm run format`.

### 👀 Previewing and Publishing

For information on how to preview and publish your worker, please see the [Wrangler docs](https://developers.cloudflare.com/workers/tooling/wrangler/commands/#publish).

## 🤢 Issues

If you run into issues with this specific project, please feel free to file an issue [here](https://github.com/cloudflare/workers-typescript-template/issues). If the problem is with Wrangler, please file an issue [here](https://github.com/cloudflare/wrangler/issues).

## ⚠️ Caveats

The `service-worker-mock` used by the tests is not a perfect representation of the Cloudflare Workers runtime. It is a general approximation. We recommend that you test end to end with `wrangler dev` in addition to a [staging environment](https://developers.cloudflare.com/workers/tooling/wrangler/configuration/environments/) to test things before deploying.
