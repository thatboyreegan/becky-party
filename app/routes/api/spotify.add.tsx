import { type ActionFunctionArgs } from "react-router";
import { getValidSpotifyToken } from "~/utils/spotify.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const playlistId = (formData.get("playlist") as string).trim();
  const trackUri = (formData.get("trackUri") as string).trim();
  const hostId = Number(formData.get("hostId"));

  if (!playlistId || !trackUri)
    return Response.json({ error: "Missing required data" }, { status: 400 });

  const accessToken = await getValidSpotifyToken(hostId);

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
