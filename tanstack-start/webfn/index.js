// Lambda Web Functions entry: the runtime loads index.js and probes AWS_LAMBDA_HTTP_ENDPOINT.
// Nitro's node-middleware preset bundles React (production build) into .output, so the only
// runtime dependency is compression.
import http from "node:http";
import zlib from "node:zlib";
import compression from "compression";
import { middleware } from "./.output/server/index.mjs";

const [host, port] = (process.env.AWS_LAMBDA_HTTP_ENDPOINT || "0.0.0.0:3000").split(":");

// Neither the Web Functions endpoint nor CloudFront compresses streamed (no Content-Length)
// responses. Flushing every write keeps Suspense chunks streaming instead of buffering them.
const compress = compression({
  flush: zlib.constants.Z_SYNC_FLUSH,
  brotli: { flush: zlib.constants.BROTLI_OPERATION_FLUSH },
});

// srvx (Nitro's Node adapter) calls res.end(callback); compression 1.8.2 patches end(chunk,
// encoding) and crashes with Buffer.from(function). Normalize the arguments and keep the callback.
function withEndCallback(res) {
  const end = res.end;
  res.end = (chunk, encoding, cb) => {
    if (typeof chunk === "function") [cb, chunk] = [chunk, undefined];
    else if (typeof encoding === "function") [cb, encoding] = [encoding, undefined];
    if (cb) res.once("finish", cb);
    return end.call(res, chunk, encoding);
  };
}

http
  .createServer((req, res) =>
    compress(req, res, () => {
      withEndCallback(res);
      middleware(req, res);
    }),
  )
  .listen(port, host, () => console.log(`listening on ${host}:${port}`));
