import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("stream", "routes/stream.tsx"),
  route("me", "routes/me.tsx"),
  route("me-leaky", "routes/me-leaky.tsx"),
  route("about", "routes/about.tsx"),
  route("dash", "routes/dash.tsx", [route(":id", "routes/dash.child.tsx")]),
] satisfies RouteConfig;
