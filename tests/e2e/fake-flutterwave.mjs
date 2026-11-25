// A stand-in for Flutterwave's hosted checkout and verify API, for local
// end-to-end tests only. Shapes follow Flutterwave's v3 docs (see
// docs/PAYMENTS.md). Never used outside tests.
import http from "node:http";

const PORT = Number(process.env.FAKE_FLW_PORT ?? 3999);
const KEY = process.env.FLUTTERWAVE_SECRET_KEY ?? "FLWSECK_TEST-local-fake";
const byRef = new Map();
const byId = new Map();
let nextId = 9000001;

function json(res, code, body) {
  res.writeHead(code, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => resolve(data));
  });
}

function pay(txRef) {
  const tx = byRef.get(txRef);
  if (!tx) return null;
  if (!tx.id) {
    tx.id = nextId++;
    tx.status = "successful";
    byId.set(String(tx.id), tx);
  }
  return tx;
}

http
  .createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    if (req.method === "POST" && url.pathname === "/v3/payments") {
      if (req.headers.authorization !== `Bearer ${KEY}`) return json(res, 401, { status: "error" });
      const body = JSON.parse((await readBody(req)) || "{}");
      byRef.set(body.tx_ref, { tx_ref: body.tx_ref, amount: body.amount, currency: body.currency, redirect_url: body.redirect_url, status: "pending" });
      return json(res, 200, { status: "success", message: "Hosted Link", data: { link: `http://localhost:${PORT}/pay/${encodeURIComponent(body.tx_ref)}` } });
    }
    const payMatch = url.pathname.match(/^\/pay\/(.+)$/);
    if (payMatch && req.method === "GET") {
      const ref = decodeURIComponent(payMatch[1]);
      if (!byRef.has(ref)) return json(res, 404, {});
      res.writeHead(200, { "Content-Type": "text/html" });
      return res.end(`<!doctype html><title>Fake checkout</title><h1>Fake Flutterwave checkout</h1><form method="post"><button type="submit">Pay now</button></form>`);
    }
    if (payMatch && req.method === "POST") {
      const tx = pay(decodeURIComponent(payMatch[1]));
      if (!tx) return json(res, 404, {});
      const back = new URL(tx.redirect_url);
      back.searchParams.set("status", "successful");
      back.searchParams.set("tx_ref", tx.tx_ref);
      back.searchParams.set("transaction_id", String(tx.id));
      res.writeHead(303, { Location: back.toString() });
      return res.end();
    }
    // test-only: pay without redirecting, so the webhook path can be exercised on its own
    const settle = url.pathname.match(/^\/__settle\/(.+)$/);
    if (settle && req.method === "POST") {
      const tx = pay(decodeURIComponent(settle[1]));
      return tx ? json(res, 200, tx) : json(res, 404, {});
    }
    const verify = url.pathname.match(/^\/v3\/transactions\/([0-9]+)\/verify$/);
    if (verify && req.method === "GET") {
      if (req.headers.authorization !== `Bearer ${KEY}`) return json(res, 401, { status: "error" });
      const tx = byId.get(verify[1]);
      if (!tx) return json(res, 404, { status: "error", message: "No transaction was found for this id" });
      return json(res, 200, { status: "success", message: "Transaction fetched successfully", data: { id: tx.id, tx_ref: tx.tx_ref, status: tx.status, amount: tx.amount, currency: tx.currency, payment_type: "card" } });
    }
    if (url.pathname === "/health") return json(res, 200, { ok: true });
    json(res, 404, {});
  })
  .listen(PORT, () => console.log(`fake flutterwave on ${PORT}`));
