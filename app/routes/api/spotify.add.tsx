import { type ActionFunctionArgs } from "react-router";
import { prisma } from "~/utils/db.server";
import { getValidSpotifyToken } from "~/utils/spotify.server";

export async function action({ request }: ActionFunctionArgs) {
  const {
    playlistId,
    trackUri,
    token,
    name,
    artist,
    albumArt,
    trackId,
    playlistSpotifyId,
  } = await request.json();

  if (!playlistId || !trackUri || !token)
    return Response.json({ error: "Missing required data" }, { status: 400 });

  const accessToken = await getValidSpotifyToken(token);

  const exists = await prisma.song.findFirst({
    where: { spotifyId: trackId, playlistId: Number(playlistId) },
  });

  if (exists) {
    Response.json({ duplicate: true, exists });
  }

  const res = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistSpotifyId}/tracks`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uris: [trackUri] }),
    }
  );

  const track = await prisma.song.create({
    data: {
      title: name,
      spotifyId: trackId,
      artist: artist,
      albumArt,
      playlistId: Number(playlistId),
    },
  });

  if (!res.ok) {
    const err = await res.json();
    console.error("Spotify add track error:", err);
    return Response.json(
      { error: err, track: { name, artist } },
      { status: res.status }
    );
  }

  return Response.json({ success: true, track });
}
