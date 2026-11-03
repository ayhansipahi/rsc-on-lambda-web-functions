// usage: node cf-bench.mjs <origin-base> <cloudfront-base>
// node:https instead of fetch: fetch auto-decompresses, so wire bytes would be invisible.
import https from "node:https";

const [originBase, cfBase] = process.argv.slice(2);
const agent = new https.Agent({ keepAlive: true });

function get(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const t0 = performance.now();
    https.get(url, { agent, headers: { "accept-encoding": "br, gzip", ...headers } }, (res) => {
      const ttfb = performance.now() - t0;
      const chunks = []; // [ms since request, bytes]
      let bytes = 0;
      res.on("data", (c) => { bytes += c.length; chunks.push([Math.round(performance.now() - t0), c.length]); });
      res.on("end", () => resolve({ status: res.statusCode, h: res.headers, ttfb, bytes, chunks }));
    }).on("error", reject);
  });
}
const p50 = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)].toFixed(0);

const html = (await get(originBase + "/dash/a", { "accept-encoding": "identity" }));
const asset = (await new Promise((r) => {
  https.get(originBase + "/dash/a", (res) => { let s = ""; res.on("data", (c) => (s += c)); res.on("end", () => r(s.match(/\/assets\/[\w.-]+\.js/)[0])); });
}));
const paths = ["/about/", asset, "/dash/a", "/dash/b.rsc?_routes=root%2C..%2Froutes%2Fdash.child", "/me"];

for (const [label, base] of [["origin", originBase], ["cf", cfBase]]) {
  console.log(`== ${label}`);
  for (const path of paths) {
    await get(base + path, { cookie: "name=u1" }); // warm: connection + edge cache
    const runs = [];
    for (let i = 0; i < 15; i++) runs.push(await get(base + path, { cookie: "name=u1" }));
    const last = runs.at(-1);
    console.log(
      `${path.slice(0, 28).padEnd(28)} ttfb p50=${p50(runs.map((r) => r.ttfb)).padStart(4)}ms ` +
      `bytes=${String(last.bytes).padStart(6)} enc=${(last.h["content-encoding"] ?? "none").padEnd(4)} ` +
      `x-cache=${last.h["x-cache"] ?? "-"}`
    );
  }
  // Streaming: chunk arrival times for the 1 s / 3 s Suspense page, compressed.
  const s = await get(base + "/stream");
  console.log(`/stream enc=${s.h["content-encoding"] ?? "none"} chunks(ms,bytes)=${s.chunks.map(([t, b]) => `${t}:${b}`).join(" ")}`);
}
console.log(`(uncompressed /dash/a from origin: ${html.bytes} bytes)`);
