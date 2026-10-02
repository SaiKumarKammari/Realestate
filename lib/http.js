export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

export const error = (message, status = 400) => json({ error: message }, status);

export function isAdmin(request, env) {
  const auth = request.headers.get("authorization") || "";
  return Boolean(env.ADMIN_TOKEN) && auth === `Bearer ${env.ADMIN_TOKEN}`;
}

export async function readBody(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

const clean = (v) => (typeof v === "string" ? v.trim() : v);
export const str = (v, max = 500) => {
  const s = clean(v);
  return s === undefined || s === null || s === "" ? null : String(s).slice(0, max);
};
export const num = (v) => {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : null;
};
