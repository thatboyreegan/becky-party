import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("invite", "routes/invite.tsx"),
  route("admin/invite", "routes/admin/home.admin.tsx"),
] satisfies RouteConfig;
