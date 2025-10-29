import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/invite/:token", "routes/guest/invite.$token.tsx"),
  route("host/setup", "routes/host/setup.tsx"),
  route("host/invite", "routes/host/home.admin.tsx"),
  route("/mixroom", "routes/common/mixroom.tsx"),
  route("/createplaylist", "routes/host/create.playlist.tsx"),
  route("/api/spotify/authenticate", "routes/api/spotify.auth.tsx"),
  route("/api/spotify/search", "routes/api/spotify.search.tsx"),
  route("/api/spotify/createplaylist", "routes/api/spotify.createPlaylist.tsx"),
  route("/api/spotify/syncplaylist", "routes/api/spotify.syncplaylist.ts"),
  route("/api/spotify/add", "routes/api/spotify.add.tsx"),
  route("/api/spotify/tracks", "routes/api/spotify.tracks.ts"),
  route("/api/spotify/callback", "routes/api/spotify.callback.tsx"),
] satisfies RouteConfig;
