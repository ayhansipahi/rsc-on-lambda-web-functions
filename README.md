# React Server Components on AWS Lambda Web Functions

Companion code for the post [React Server Components on Lambda Web Functions](https://sph.sh/en/posts/react-server-components-lambda-web-functions/) ([Türkçe](https://sph.sh/tr/posts/react-server-components-lambda-web-functions/)).

A small React Router 8.5 RSC Framework Mode app (and the same demo on TanStack Start) that runs as a Lambda Web Function behind CloudFront. Five routes cover the cases the post measures: streaming with Suspense, a cookie-backed page, a layout that is skipped on child navigation, a prerendered page cached at the edge, and a deliberately broken route that leaks state between concurrent requests.

Everything here was deployed and measured once, from one client machine, in one account. Treat it as a reproducible starting point, not a benchmark.

## Layout

| Path | What it is |
|---|---|
| `react-router/` | The app the post is built on. `index.js` is the Web Functions entry shim. |
| `react-router/scripts/patch-react-router.mjs` | Runs on `postinstall`. Adds `shouldRevalidate` to React Router 8.5.1's `getManifestRoute` (see below). |
| `tanstack-start/` | The same demo on TanStack Start with RSC enabled. `webfn/index.js` is its entry shim. |
| `cloudfront/` | Cache policy, Server-Timing response headers policy, and a distribution template with placeholders. |
| `bench/` | The probes behind the numbers in the post. |

## Versions

React Router and `@react-router/dev` 8.5.1, React 19.2, Vite 8.3.5, `@vitejs/plugin-rsc` 0.5.35, Express 5.3.0, `compression` 1.8.2, `@base-ui/react` 1.9.0. TanStack Start 1.169.4 with `@vitejs/plugin-rsc` 0.5.38 and Nitro 3.0.260610-beta. Runtime `nodejs24.x` on arm64, AWS CLI 2.38.4 or newer (`aws lambda-web`).

## React Router app

```bash
cd react-router
npm ci                 # postinstall applies the getManifestRoute patch
npm run build
npm prune --omit=dev   # aws lambda-web deploy zips the folder as it is
aws lambda-web deploy --name rr-rsc-webfn --code . --create --auth-type ApplicationManaged --region eu-central-1
```

Later deploys use the same command without `--create`. Run `npm ci` again before the next build, because the prune removed the build tools.

Local run of the production build:

```bash
AWS_LAMBDA_HTTP_ENDPOINT=127.0.0.1:3000 node index.js
```

Things the shim does on purpose:

- `process.env.NODE_ENV ??= "production"` runs before a dynamic `import()` of the server build. Without it React loads its development build, the Flight payload carries debug rows, and the production client never hydrates. `??=` keeps an explicit value, so do not set `NODE_ENV=development` on the revision.
- The server build's default export is `{ fetch }`, so the handler is `build.fetch`.
- Static files are served before compression. Prerendered `.rsc` files get `Content-Type: text/x-component`, otherwise they go out as `application/octet-stream` and CloudFront does not compress them.
- `compression` flushes every write (`Z_SYNC_FLUSH`, `BROTLI_OPERATION_FLUSH`) so Suspense chunks keep streaming. Neither the endpoint nor CloudFront compresses chunked responses.

`@vitejs/plugin-rsc` is pinned to 0.5.35: 0.5.36 and later fail the 8.5.1 build with `Vite RSC assets manifest not found` ([remix-run/react-router#15671](https://github.com/remix-run/react-router/issues/15671), fixed for `@react-router/dev` 8.5.2).

## TanStack Start app

```bash
cd tanstack-start
npm ci
npm run build
npm run package        # copies .output + webfn/index.js into deploy/ and installs compression
aws lambda-web deploy --name tss-rsc-webfn --code ./deploy --create --auth-type ApplicationManaged --region eu-central-1
```

Nitro's `node-middleware` preset bundles React into `.output`, so the deploy folder is about 2.9 MB. `webfn/index.js` normalizes `res.end(callback)` before `compression`, which otherwise crashes on Nitro's srvx adapter.

## CloudFront

```bash
cd cloudfront
aws cloudfront create-cache-policy --cache-policy-config file://cache-policy.json
aws cloudfront create-response-headers-policy --response-headers-policy-config file://server-timing-policy.json
# put the endpoint domain and both new policy IDs into distribution.json, then:
aws cloudfront create-distribution --distribution-config file://distribution.json
```

The custom cache policy keys on the path, all query strings (`_routes` decides which routes the server renders), and the normalized `Accept-Encoding`. It keeps `Host` out of the key: the managed `UseOriginCacheControlHeaders` policies include `Host`, which reaches the Web Function origin and fails TLS with a CloudFront 502. The origin request policy is the managed `AllViewerExceptHostHeader`, and the origin keepalive is 60 seconds.

The endpoint stays public with `ApplicationManaged`. For production, use `IamAuth` with CloudFront origin access control; this demo did not test that setup.

## Bench scripts

| Script | Measures |
|---|---|
| `probe.mjs <url> [accept]` | Chunk arrival times for one response (streaming check). |
| `raw-probe.mjs <url> <accept-encoding>` | Wire bytes and chunk times without decompression. |
| `bench.mjs <base> [concurrency]` | Cookie read, action `Set-Cookie`, the concurrency leak, payload sizes, warm TTFB. |
| `st-probe.mjs <url> <count> <gap-ms>` | CloudFront `Server-Timing`: how often the edge opens a new origin connection. |
| `compare.mjs <label>=<base> ...` | Document TTFB, wire bytes, cache status and stream bursts through CloudFront. |
| `cf-bench.mjs <origin-base> <cloudfront-base>` | Origin vs CloudFront for the same paths. |

Send a browser `User-Agent` when benchmarking TanStack Start: it waits for every Suspense boundary before sending HTML to bot-like user agents, and CloudFront sends `User-Agent: Amazon CloudFront` when the header is not forwarded.

## Cleanup

Deploys create a Web Function, an IAM role (`awscli-lambdaweb-<name>`), and a versioned S3 bucket per Region. Delete the function with `aws lambda-web delete-web-function --function-name <name> --region <region>`, then the role, the bucket's object versions, and the bucket. Disable a CloudFront distribution before deleting it, then delete the two custom policies.

## License

MIT, see [LICENSE](LICENSE).
