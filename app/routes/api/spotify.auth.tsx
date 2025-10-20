import { redirect, type LoaderFunctionArgs } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const hostToken = url.searchParams.get("hostToken");
  const scopes = [
    "playlist-modify-public",
    "playlist-modify-private",
    "user-read-email",
  ];
  const authUrl = new URL("https://accounts.spotify.com/authorize");
  authUrl.searchParams.set("client_id", process.env.SPOTIFY_CLIENT_ID!);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("redirect_uri", process.env.SPOTIFY_REDIRECT_URI!);
  authUrl.searchParams.set("scope", scopes.join(" "));
  authUrl.searchParams.set("show_dialog", "false");
  authUrl.searchParams.set("state", hostToken!);

  return redirect(authUrl.toString());
}
