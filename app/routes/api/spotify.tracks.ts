import { prisma } from "~/utils/db.server";
import { getValidSpotifyToken } from "~/utils/spotify.server";

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const playlistId = url.searchParams.get("playlistId");
  const token = url.searchParams.get("token");
  const playlist = url.searchParams.get("playlist");

  if (!playlistId || !token) {
    return Response.json({ error: "Missing parameters" }, { status: 400 });
  }

  try {
    const accessToken = await getValidSpotifyToken(token);
    const spotifyRes = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!spotifyRes.ok) {
      const errorBody = await spotifyRes.text();
      console.error("Spotify HTTP error:", errorBody);
      return Response.json(
        { error: "Spotify API responded with an error" },
        { status: spotifyRes.status }
      );
    }

    const data = await spotifyRes.json();
    const tracks = data.items.map((item: any) => ({
      id: item.track.id,
      name: item.track.name,
      artist: item.track.artists.map((a: any) => a.name).join(", "),
      image: item.track.album.images[0]?.url || "",
    }));

    await prisma.$transaction(
      tracks.map(
        (track: { id: string; name: string; artist: string; image: string }) =>
          prisma.song.upsert({
            where: { spotifyId: track.id },
            update: {
              title: track.name,
              artist: track.artist,
              albumArt: track.image,
              spotifyPlaylistId: playlistId,
            },
            create: {
              title: track.name,
              artist: track.artist,
              albumArt: track.image,
              spotifyId: track.id,
              spotifyPlaylistId: playlistId,
              playlistId: parseInt(playlist!),
            },
          })
      )
    );

    return Response.json({ source: "spotify", tracks });
  } catch (err: any) {
    console.warn("Spotify fetch failed, falling back to DB:", err);

    // fallback: fetch from database
    const cachedTracks = await prisma.song.findMany({
      where: { playlistId: parseInt(playlistId) },
      select: {
        id: true,
        spotifyId: true,
        title: true,
        artist: true,
        albumArt: true,
      },
      orderBy: { id: "desc" },
    });

    const formatted = cachedTracks.map((t) => ({
      id: t.id,
      spotifyId: t.spotifyId,
      name: t.title,
      artist: t.artist,
      image: t.albumArt,
    }));

    return Response.json({ source: "database", tracks: formatted });
  }
}
