// Raw (still-compressed) chunk timings + decoded body check. usage: node raw-probe.mjs <url> <accept-encoding>
import zlib from "node:zlib";
const [url, enc] = process.argv.slice(2);
const { get } = await import(url.startsWith("https") ? "node:https" : "node:http");
const t0 = performance.now();
get(url, { headers: { "accept-encoding": enc } }, (res) => {
  const parts = []; const times = [];
  res.on("data", (c) => { parts.push(c); times.push(`${Math.round(performance.now() - t0)}:${c.length}`); });
  res.on("end", () => {
    const raw = Buffer.concat(parts);
    const e = res.headers["content-encoding"];
    const body = (e === "br" ? zlib.brotliDecompressSync(raw) : e === "gzip" ? zlib.gunzipSync(raw) : raw).toString();
    console.log(`${enc.padEnd(8)} enc=${e ?? "none"} wire=${raw.length}B decoded=${body.length}B slow-parts=${(body.match(/slow-/g) ?? []).length} chunks(ms:bytes)=${times.join(" ")}`);
  });
});
