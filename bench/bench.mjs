// usage: node bench.mjs <base-url> [concurrency]
const [base, conc = "200"] = process.argv.slice(2);
const N = Number(conc);

async function hit(path, init = {}) {
  const t0 = performance.now();
  const res = await fetch(base + path, { redirect: "manual", ...init });
  const ttfb = performance.now() - t0;
  const body = await res.text();
  return { res, body, ttfb, total: performance.now() - t0 };
}
const median = (xs) => xs.sort((a, b) => a - b)[Math.floor(xs.length / 2)];
const p95 = (xs) => xs.sort((a, b) => a - b)[Math.floor(xs.length * 0.95)];
const nameIn = (html) => html.match(/hello (?:<!-- -->)?(u\d+)/)?.[1];

// 1. cookie read + Cache-Control
const me = await hit("/me", { headers: { cookie: "name=u42" } });
console.log(`cookie read: ${nameIn(me.body) === "u42" ? "ok" : "FAIL"}, cache-control=${me.res.headers.get("cache-control")}`);

// 2. cookie write via action
const post = await hit("/me", { method: "POST", body: new URLSearchParams({ name: "zeynep" }) });
console.log(`action set-cookie: status=${post.res.status} ${post.res.headers.get("set-cookie") ?? "MISSING"}`);

// 3. concurrency isolation: N parallel requests, each with its own cookie.
// Warm-up burst first, so both paths reuse open connections instead of paying N TLS handshakes.
await Promise.all(Array.from({ length: N }, () => hit("/about/")));
for (const path of ["/me", "/me-leaky"]) {
  const results = await Promise.all(
    Array.from({ length: N }, (_, i) => hit(path, { headers: { cookie: `name=u${i}` } }).then((r) => ({ i, ...r })))
  );
  const wrong = results.filter((r) => nameIn(r.body) !== `u${r.i}`).length;
  const totals = results.map((r) => r.total);
  console.log(`${path.padEnd(9)} x${N} parallel: wrong user=${wrong}/${N}, p50=${median(totals).toFixed(0)}ms p95=${p95(totals).toFixed(0)}ms`);
}

// 4. payload size: full document vs RSC navigation payload
const doc = await hit("/dash/a");
const nav = await hit("/dash/b.rsc");
console.log(`size: /dash/a html=${doc.body.length}B, /dash/b.rsc=${nav.body.length}B, encoding=${doc.res.headers.get("content-encoding") ?? "none"}`);

// 5. warm TTFB, 20 sequential each
for (const path of ["/about/", "/about.rsc", "/dash/a", "/dash/b.rsc", "/me"]) {
  const ts = [];
  for (let i = 0; i < 20; i++) ts.push((await hit(path)).ttfb);
  console.log(`ttfb ${path.padEnd(12)} p50=${median(ts).toFixed(0)}ms p95=${p95(ts).toFixed(0)}ms`);
}
