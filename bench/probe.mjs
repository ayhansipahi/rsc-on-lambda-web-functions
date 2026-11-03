// Prints when each response chunk arrives, so buffering vs streaming is visible.
// usage: node probe.mjs <url> [Accept header]
const [url, accept = "text/html"] = process.argv.slice(2);
const t0 = performance.now();
const res = await fetch(url, { headers: { accept } });
const ms = () => String(Math.round(performance.now() - t0)).padStart(5);
console.log(`${ms()}ms status=${res.status} type=${res.headers.get("content-type")} te=${res.headers.get("transfer-encoding")}`);
const dec = new TextDecoder();
let n = 0;
for await (const chunk of res.body) {
  const text = dec.decode(chunk, { stream: true });
  const hits = text.match(/shell rendered|loading-\d+|slow-\d+ms/g) ?? [];
  console.log(`${ms()}ms chunk#${++n} ${chunk.length}B ${[...new Set(hits)].join(",")}`);
}
console.log(`${ms()}ms done, ${n} chunks`);
