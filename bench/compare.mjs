// Document loads through CloudFront for two apps: warm TTFB p50, wire bytes, cache status, stream timing.
// usage: node compare.mjs <label>=<base> <label>=<base>
import https from "node:https";

const agent = new https.Agent({ keepAlive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const get = (url) =>
  new Promise((ok, fail) => {
    const t0 = performance.now();
    https
      .get(url, { agent, headers: {
        "accept-encoding": "br",
        cookie: "name=u1",
        // Without a browser UA, CloudFront sends "Amazon CloudFront" and TanStack treats it as a bot (no streaming).
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36",
      } }, (res) => {
        const ttfb = performance.now() - t0;
        const chunks = [];
        let bytes = 0;
        res.on("data", (c) => { bytes += c.length; chunks.push(Math.round(performance.now() - t0)); });
        res.on("end", () => ok({ ttfb, bytes, chunks, h: res.headers }));
      })
      .on("error", fail);
  });
const p50 = (xs) => [...xs].sort((a, b) => a - b)[xs.length >> 1].toFixed(0);

for (const arg of process.argv.slice(2)) {
  const [label, base] = arg.split("=");
  console.log(`== ${label}`);
  for (const path of ["/", "/me", "/dash/a", "/about", "/about/"]) {
    await get(base + path);
    const runs = [];
    for (let i = 0; i < 10; i++) { runs.push(await get(base + path)); await sleep(1000); }
    const last = runs.at(-1);
    console.log(`${path.padEnd(8)} ttfb p50=${p50(runs.map((r) => r.ttfb)).padStart(4)}ms wire=${String(last.bytes).padStart(5)}B enc=${last.h["content-encoding"] ?? "none"} ${last.h["x-cache"]}`);
  }
  const s = await get(base + "/stream");
  const marks = [s.chunks[0], ...s.chunks.filter((t, i, a) => i && t - a[i - 1] > 500)];
  console.log(`/stream  first byte ${Math.round(s.ttfb)}ms, chunk bursts at ${marks.join(" / ")}ms, wire=${s.bytes}B`);
}
