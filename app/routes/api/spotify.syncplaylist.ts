import { prisma } from "~/utils/db.server";
import { getValidSpotifyToken } from "~/utils/spotify.server";

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const hostToken = formData.get("hostToken") as string;
  const playlistId = Number(formData.get("playlistId"));

  const playlist = await prisma.playlist.findUnique({
    where: { id: playlistId },
  });
  if (!playlist)
    return Response.json({ error: "Playlist not found" }, { status: 404 });

  const accessToken = await getValidSpotifyToken(hostToken);
  if (!accessToken)
    return Response.json({ error: "Invalid Spotify token" }, { status: 401 });

  const spotifyResponse = await fetch(
    "https://api.spotify.com/v1/me/playlists",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: playlist.name,
        description: playlist.theme || "Synced playlist",
        public: false,
      }),
    }
  );

  const spotifyData = await spotifyResponse.json();

  if (!spotifyResponse.ok) {
    console.error("Spotify API error:", spotifyData);
    return Response.json(
      { error: spotifyData },
      { status: spotifyResponse.status }
    );
  }

  const updated = await prisma.playlist.update({
    where: { id: playlist.id },
    data: { spotifyId: spotifyData.id },
  });

  return { playlist: updated };
}
