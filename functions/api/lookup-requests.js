import { json, error, isAdmin, readBody, str, num } from "../../lib/http.js";

// POST (public): ask us to look up a document number we don't have yet
export async function onRequestPost({ request, env }) {
  const b = await readBody(request);
  if (!b) return error("Invalid JSON");
  if (b.website) return json({ ok: true }); // honeypot

  const doc = str(b.doc_number, 30), name = str(b.name, 100), phone = str(b.phone, 20);
  if (!doc || !name || !phone) return error("Document number, name and phone are required");
  if (!/^[+\d][\d\s-]{6,18}$/.test(phone)) return error("Enter a valid phone number");

  await env.DB.prepare(
    "INSERT INTO lookup_requests (doc_number, doc_year, sro, name, phone, email) VALUES (?,?,?,?,?,?)"
  ).bind(doc, num(b.doc_year), str(b.sro, 100), name, phone, str(b.email, 200)).run();
  return json({ ok: true }, 201);
}

// GET (admin): list requests
export async function onRequestGet({ request, env }) {
  if (!isAdmin(request, env)) return error("Unauthorized", 401);
  const { results } = await env.DB.prepare("SELECT * FROM lookup_requests ORDER BY id DESC LIMIT 200").all();
  return json({ results });
}

// PATCH (admin): { id, status }
export async function onRequestPatch({ request, env }) {
  if (!isAdmin(request, env)) return error("Unauthorized", 401);
  const b = await readBody(request);
  if (!b || !num(b.id) || !["new", "done"].includes(b.status)) return error("id and status (new/done) required");
  await env.DB.prepare("UPDATE lookup_requests SET status = ? WHERE id = ?").bind(b.status, num(b.id)).run();
  return json({ ok: true });
}
