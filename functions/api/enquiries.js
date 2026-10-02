import { json, error, isAdmin, readBody, str, num } from "../../lib/http.js";

export async function onRequestPost({ request, env }) {
  const b = await readBody(request);
  if (!b) return error("Invalid JSON");
  if (b.website) return json({ ok: true }); // honeypot field: bots fill it, humans don't

  const name = str(b.name, 100), phone = str(b.phone, 20), area = str(b.area, 200);
  const budgetMax = num(b.budget_max), budgetMin = num(b.budget_min);
  if (!name || !phone || !area || budgetMax === null) return error("Name, phone, area and budget are required");
  if (!/^[+\d][\d\s-]{6,18}$/.test(phone)) return error("Enter a valid phone number");
  if (budgetMin !== null && budgetMin > budgetMax) return error("Minimum budget is more than maximum");

  await env.DB.prepare(
    `INSERT INTO enquiries (name, phone, email, area, property_type, budget_min, budget_max, message, property_id)
     VALUES (?,?,?,?,?,?,?,?,?)`
  ).bind(
    name, phone, str(b.email, 200), area, str(b.property_type, 30), budgetMin, budgetMax,
    str(b.message, 2000), num(b.property_id)
  ).run();
  return json({ ok: true }, 201);
}

export async function onRequestGet({ request, env }) {
  if (!isAdmin(request, env)) return error("Unauthorized", 401);
  const { results } = await env.DB.prepare("SELECT * FROM enquiries ORDER BY id DESC LIMIT 200").all();
  return json({ results });
}
