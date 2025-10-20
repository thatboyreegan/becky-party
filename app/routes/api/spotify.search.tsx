import { type LoaderFunctionArgs } from "react-router";
import { getValidSpotifyToken } from "~/utils/spotify.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("query");
  const hostId = Number(url.searchParams.get("hostId"));
  const eraStart = url.searchParams.get("eraStart");
  const eraEnd = url.searchParams.get("eraEnd");

  if (!query)
    return Response.json({ error: "Missing query or token" }, { status: 400 });

  let spotifyQuery = query;
  spotifyQuery += `year:${eraStart}-${eraEnd}`;

  const accessToken = await getValidSpotifyToken(hostId);
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
  const tracks =
    data.tracks?.items?.map((t: any) => ({
      id: t.id,
      name: t.name,
      artist: t.artists[0].name,
      year: parseInt(t.album.release_date.split("-")[0]),
      image: t.album.images[1]?.url,
      uri: t.uri,
    })) ?? [];

  return Response.json({ tracks });
}
