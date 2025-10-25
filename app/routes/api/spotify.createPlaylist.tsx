import { prisma } from "~/utils/db.server";
import { getValidSpotifyToken } from "~/utils/spotify.server";

export async function action({ request }: { request: Request }) {
  try {
    const formData = await request.formData();
    const hostId = Number(formData.get("hostId"));
    const name = formData.get("name") as string;
    const hostToken = formData.get("hostToken") as string;
    const theme = (formData.get("theme") as string)?.trim() ?? "";
    const eraStart = formData.get("eraStart")
      ? parseInt(formData.get("eraStart") as string)
      : null;
    const eraEnd = formData.get("eraEnd")
      ? parseInt(formData.get("eraEnd") as string)
      : null;

    const playlist = await prisma.playlist.create({
      data: { name, theme, eraStart, eraEnd, hostId },
    });

    const accessToken = await getValidSpotifyToken(hostToken);
    if (!accessToken) {
      return Response.json(
        { error: "Missing or invalid Spotify token" },
        { status: 401 }
      );
    }

    const spotifyResponse = await fetch(
      "https://api.spotify.com/v1/me/playlists",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, description: theme, public: false }),
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

    const updatedPlaylist = await prisma.playlist.update({
      where: { id: playlist.id },
      data: { spotifyId: spotifyData.id },
    });

    return Response.json({ playlist: updatedPlaylist });
  } catch (error) {
    console.error("❌ Server error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
