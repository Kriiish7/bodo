import { httpRouter } from "convex/server";
import { webhook } from "./polar.js";

const http = httpRouter();

http.route({
  path: "/polar-webhook",
  method: "POST",
  handler: webhook,
});

export default http;
