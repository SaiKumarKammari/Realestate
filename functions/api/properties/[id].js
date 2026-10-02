import { json, error, isAdmin, readBody } from "../../../lib/http.js";

export async function onRequestGet({ params, env }) {
  const row = await env.DB.prepare("SELECT * FROM properties WHERE id = ?").bind(Number(params.id)).first();
  return row ? json(row) : error("Property not found", 404);
}

export async function onRequestPatch({ params, request, env }) {
  if (!isAdmin(request, env)) return error("Unauthorized", 401);
  const b = await readBody(request);
  if (!b || !["available", "sold"].includes(b.status)) return error("status must be 'available' or 'sold'");
  await env.DB.prepare("UPDATE properties SET status = ? WHERE id = ?").bind(b.status, Number(params.id)).run();
  return json({ ok: true });
}

export async function onRequestDelete({ params, request, env }) {
  if (!isAdmin(request, env)) return error("Unauthorized", 401);
  await env.DB.prepare("DELETE FROM properties WHERE id = ?").bind(Number(params.id)).run();
  return json({ ok: true });
}
