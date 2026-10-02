import { json, error, isAdmin, readBody, str, num } from "../../../lib/http.js";

const TYPES = ["plot", "agricultural", "house", "flat", "commercial"];

export async function onRequestGet({ request, env }) {
  const p = new URL(request.url).searchParams;
  // Admins can pass ?all=1 to include sold listings
  const all = p.get("all") === "1" && isAdmin(request, env);
  let sql = all ? "SELECT * FROM properties WHERE 1=1" : "SELECT * FROM properties WHERE status = 'available'";
  const args = [];

  const area = str(p.get("area"), 100);
  if (area) { sql += " AND (area LIKE ? OR city LIKE ?)"; args.push(`%${area}%`, `%${area}%`); }
  const type = str(p.get("type"), 30);
  if (type && TYPES.includes(type)) { sql += " AND type = ?"; args.push(type); }
  const min = num(p.get("min"));
  if (min !== null) { sql += " AND price >= ?"; args.push(min); }
  const max = num(p.get("max"));
  if (max !== null) { sql += " AND price <= ?"; args.push(max); }

  const sort = p.get("sort");
  sql += sort === "price_asc" ? " ORDER BY price ASC" : sort === "price_desc" ? " ORDER BY price DESC" : " ORDER BY created_at DESC, id DESC";
  sql += " LIMIT ?";
  args.push(Math.min(num(p.get("limit")) || 50, 100));

  const { results } = await env.DB.prepare(sql).bind(...args).all();
  return json({ results });
}

export async function onRequestPost({ request, env }) {
  if (!isAdmin(request, env)) return error("Unauthorized", 401);
  const b = await readBody(request);
  if (!b) return error("Invalid JSON");

  const title = str(b.title, 200), type = str(b.type, 30), area = str(b.area, 100), city = str(b.city, 100);
  const price = num(b.price);
  if (!title || !area || !city || price === null) return error("Title, area, city and price are required");
  if (!TYPES.includes(type)) return error("Invalid property type");

  const r = await env.DB.prepare(
    `INSERT INTO properties (title, type, area, city, price, size, size_unit, description, image_url, doc_number)
     VALUES (?,?,?,?,?,?,?,?,?,?)`
  ).bind(
    title, type, area, city, price, num(b.size), str(b.size_unit, 20) || "sq yards",
    str(b.description, 4000), str(b.image_url, 1000), str(b.doc_number, 40)
  ).run();
  return json({ id: r.meta.last_row_id }, 201);
}
