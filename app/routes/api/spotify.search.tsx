import { type LoaderFunctionArgs } from "react-router";
import { getValidSpotifyToken } from "~/utils/spotify.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("query");
  const hostId = Number(url.searchParams.get("hostId"));
  const eraStart = url.searchParams.get("eraStart");
  const eraEnd = url.searchParams.get("eraEnd");
  const hostToken = url.searchParams.get("token");

  if (!query)
    return Response.json({ error: "Missing query or token" }, { status: 400 });

  let spotifyQuery = query;
  spotifyQuery += `year:${eraStart}-${eraEnd}`;
  if (!query || !hostToken) {
    return Response.json({ error: "Missing query or token" }, { status: 400 });
  }

  const accessToken = await getValidSpotifyToken(hostToken);
  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(
      spotifyQuery
    )}&type=track&limit=12`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!res.ok) {
    console.error(await res.text());
    return Response.json({ error: "Spotify search failed" }, { status: 400 });
  }
  const data = await res.json();
  const filteredTracks = data.tracks.items
    .map((t: any) => ({
      id: t.id,
      name: t.name,
      artist: t.artists[0]?.name,
      year: new Date(t.album.release_date).getFullYear(),
      image: t.album.images[0]?.url,
      uri: t.uri,
    }))
    .filter((t: any) =>
      eraStart && eraEnd
        ? t.year >= Number(eraStart) && t.year <= Number(eraEnd)
        : true
    );

  return Response.json({ tracks: filteredTracks });
}
