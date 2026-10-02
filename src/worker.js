// Entry point: /api/* goes to the handlers below; everything else is served from public/
import * as land from "../functions/api/land/index.js";
import * as properties from "../functions/api/properties/index.js";
import * as property from "../functions/api/properties/[id].js";
import * as enquiries from "../functions/api/enquiries.js";
import { error } from "../lib/http.js";

const routes = [
  [/^\/api\/land\/?$/, land],
  [/^\/api\/properties\/?$/, properties],
  [/^\/api\/properties\/(?<id>\d+)\/?$/, property],
  [/^\/api\/enquiries\/?$/, enquiries],
];

export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);
    if (!pathname.startsWith("/api/")) return env.ASSETS.fetch(request);

    for (const [pattern, mod] of routes) {
      const m = pathname.match(pattern);
      if (!m) continue;
      const method = request.method[0] + request.method.slice(1).toLowerCase();
      const handler = mod[`onRequest${method}`];
      if (!handler) return error("Method not allowed", 405);
      try {
        return await handler({ request, env, ctx, params: m.groups || {} });
      } catch (e) {
        console.error(e);
        return error("Something went wrong", 500);
      }
    }
    return error("Not found", 404);
  },
};
