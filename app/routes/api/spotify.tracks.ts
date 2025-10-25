import { getValidSpotifyToken } from "~/utils/spotify.server";

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const playlistId = url.searchParams.get("playlistId");
  const token = url.searchParams.get("token");
  console.log(token);

  if (!playlistId || !token) {
    return Response.json({ error: "Missing parameters" }, { status: 400 });
  }

  const accessToken = await getValidSpotifyToken(token);
  const spotifyRes = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  const data = await spotifyRes.json();

  if (!spotifyRes.ok) {
    console.error("Spotify fetch error:", data);
    return Response.json(
      { error: data.error?.message || "Failed to load tracks" },
      { status: spotifyRes.status }
    );
  }

  const tracks = data.items.map((item: any) => ({
    id: item.track.id,
    name: item.track.name,
    artist: item.track.artists.map((a: any) => a.name).join(", "),
    image: item.track.album.images[0]?.url || "",
  }));

  return Response.json({ tracks });
}
