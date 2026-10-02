import { json, error, isAdmin, readBody, str, num } from "../../../lib/http.js";

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  let doc = str(url.searchParams.get("doc"), 30);
  let year = num(url.searchParams.get("year"));
  const sro = str(url.searchParams.get("sro"), 100);

  // Accept "1234/2023" in a single field
  if (doc && doc.includes("/") && !year) {
    const [d, y] = doc.split("/");
    doc = d.trim();
    year = num(y);
  }
  if (!doc) return error("Enter a document number");

  let sql = "SELECT * FROM land_records WHERE doc_number = ?";
  const args = [doc];
  if (year) { sql += " AND doc_year = ?"; args.push(year); }
  if (sro) { sql += " AND sro LIKE ?"; args.push(`%${sro}%`); }
  sql += " ORDER BY doc_year DESC LIMIT 20";

  const { results } = await env.DB.prepare(sql).bind(...args).all();
  return json({ results });
}

export async function onRequestPost({ request, env }) {
  if (!isAdmin(request, env)) return error("Unauthorized", 401);
  const b = await readBody(request);
  if (!b) return error("Invalid JSON");
  const doc = str(b.doc_number, 30), year = num(b.doc_year);
  if (!doc || !year) return error("Document number and year are required");

  try {
    const r = await env.DB.prepare(
      `INSERT INTO land_records (doc_number, doc_year, sro, survey_number, village, mandal, district, state,
        extent, extent_unit, land_type, owner_name, registration_date, market_value, boundaries, remarks)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    ).bind(
      doc, year, str(b.sro, 100), str(b.survey_number, 50), str(b.village, 100), str(b.mandal, 100),
      str(b.district, 100), str(b.state, 100), num(b.extent), str(b.extent_unit, 20) || "sq yards",
      str(b.land_type, 50), str(b.owner_name, 200), str(b.registration_date, 20), num(b.market_value),
      str(b.boundaries, 1000), str(b.remarks, 2000)
    ).run();
    return json({ id: r.meta.last_row_id }, 201);
  } catch (e) {
    if (String(e).includes("UNIQUE")) return error("A record with this document number, year and SRO already exists", 409);
    throw e;
  }
}
