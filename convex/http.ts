import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth.js";

const http = httpRouter();

import { webhook } from "./polar.js";

authComponent.registerRoutes(http, createAuth as any);

http.route({
  path: "/polar-webhook",
  method: "POST",
  handler: webhook,
});

export default http;
