import { redirect } from "react-router";
import { prisma } from "~/utils/db.server";
import { getValidSpotifyToken } from "~/utils/spotify.server";

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const hostId = Number(formData.get("hostId"));
  const name = formData.get("name") as string;
  const theme = (formData.get("theme") as string)?.trim();
  const eraStart = formData.get("eraStart")
    ? parseInt(formData.get("eraStart") as string)
    : null;
  const eraEnd = formData.get("eraEnd")
    ? parseInt(formData.get("eraEnd") as string)
    : null;

  const playlist = await prisma.playlist.create({
    data: { name, theme, eraStart, eraEnd, hostId },
  });

  const accessToken = await getValidSpotifyToken(hostId);

  const res = await fetch("https://api.spotify.com/v1/me/playlists", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, public: false }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("Spotify create playlist error:", data);
    return Response.json({ error: data }, { status: res.status });
  }

  const spotifyData = await res.json();

  if (!res.ok) {
    console.error("Spotify playlist creation failed:", spotifyData);
    return { error: "Could not create playlist on Spotify" };
  }

  await prisma.playlist.update({
    where: { id: playlist.id },
    data: { spotifyId: spotifyData.id },
  });

  // 5️⃣ Redirect host to add-songs page
  return redirect(`/host/addsongs?playlistId=${spotifyData.id}`);
}
