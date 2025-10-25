import { type ActionFunctionArgs } from "react-router";
import { getValidSpotifyToken } from "~/utils/spotify.server";

export async function action({ request }: ActionFunctionArgs) {
  const { playlistId, trackUri, token } = await request.json();

  if (!playlistId || !trackUri || !token)
    return Response.json({ error: "Missing required data" }, { status: 400 });

  const accessToken = await getValidSpotifyToken(token);
  console.log("playlistId:", playlistId);
  console.log("trackUri:", trackUri);

  const res = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uris: [trackUri] }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    console.error("Spotify add track error:", err);
    return Response.json({ error: err }, { status: res.status });
  }

  return Response.json({ success: true });
}
