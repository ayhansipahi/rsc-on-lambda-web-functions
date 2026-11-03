// Lambda Web Functions entry: the runtime loads index.js and probes AWS_LAMBDA_HTTP_ENDPOINT.
import zlib from "node:zlib";
import compression from "compression";
import express from "express";
import { createRequestListener } from "@remix-run/node-fetch-server";

// Must be set before React loads: without it the server uses React's dev build, whose
// Flight payload carries debug rows the production client never hydrates. Static imports
// are hoisted, so the build is imported dynamically below.
process.env.NODE_ENV ??= "production";
// RR 8.5 exports `default: { fetch }`, not a bare handler as the RSC docs show.
const { default: build } = await import("./build/server/index.js");

const [host, port] = (process.env.AWS_LAMBDA_HTTP_ENDPOINT || "0.0.0.0:3000").split(":");

const app = express();
app.use("/assets", express.static("build/client/assets", { immutable: true, maxAge: "1y" }));
app.use(
  express.static("build/client", {
    // Prerendered pages: the CDN keeps them 5 min, browsers always revalidate.
    setHeaders: (res, path) => {
      if (/\.(html|rsc)$/.test(path)) res.setHeader("Cache-Control", "public, max-age=0, s-maxage=300");
      // mime-db has no .rsc entry, so send falls back to application/octet-stream, which
      // CloudFront does not compress. text/x-component is on its compressible list.
      if (path.endsWith(".rsc")) res.setHeader("Content-Type", "text/x-component");
    },
  }),
);
// Neither the Web Functions endpoint nor CloudFront compresses streamed (no Content-Length)
// responses. Flushing every write keeps Suspense chunks streaming instead of buffering them.
app.use(
  compression({
    flush: zlib.constants.Z_SYNC_FLUSH,
    brotli: { flush: zlib.constants.BROTLI_OPERATION_FLUSH },
  }),
);
app.use(createRequestListener(build.fetch));
app.listen(port, host, () => console.log(`listening on ${host}:${port}`));
