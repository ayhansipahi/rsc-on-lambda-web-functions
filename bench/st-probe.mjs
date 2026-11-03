// Reads CloudFront Server-Timing per request: did the edge open a new origin connection?
// usage: node st-probe.mjs <url> <count> <gap-ms>
import https from "node:https";

const [url, count = "12", gap = "300"] = process.argv.slice(2);
const agent = new https.Agent({ keepAlive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const dur = (st, name) => Number(st.match(new RegExp(`${name};dur=([\\d.]+)`))?.[1] ?? NaN);

const rows = [];
for (let i = 0; i < Number(count); i++) {
  const t0 = performance.now();
  const st = await new Promise((ok) =>
    https.get(url, { agent, headers: { cookie: "name=u1", "accept-encoding": "br" } }, (res) => {
      const ttfb = performance.now() - t0;
      res.resume();
      res.on("end", () => ok({ ttfb, h: res.headers["server-timing"] ?? "" }));
    }),
  );
  rows.push({
    ttfb: Math.round(st.ttfb),
    connect: dur(st.h, "cdn-upstream-connect"),
    fbl: dur(st.h, "cdn-upstream-fbl"),
    pop: st.h.match(/cdn-pop;desc="?([\w-]+)/)?.[1],
  });
  await sleep(Number(gap));
}
const p50 = (xs) => [...xs].sort((a, b) => a - b)[xs.length >> 1];
const fresh = rows.filter((r) => r.connect > 0);
console.log(
  `gap=${gap}ms n=${rows.length} ttfb p50=${p50(rows.map((r) => r.ttfb))}ms | new origin conn ${fresh.length}/${rows.length} ` +
  `(ttfb p50 ${fresh.length ? p50(fresh.map((r) => r.ttfb)) : "-"}ms, connect p50 ${fresh.length ? p50(fresh.map((r) => r.connect)) : "-"}ms) | ` +
  `reused ttfb p50 ${rows.length - fresh.length ? p50(rows.filter((r) => !(r.connect > 0)).map((r) => r.ttfb)) : "-"}ms | pop=${[...new Set(rows.map((r) => r.pop))].join(",")}`,
);
console.log("  raw:", rows.map((r) => `${r.ttfb}/${Number.isNaN(r.connect) ? "?" : r.connect}`).join(" "));
