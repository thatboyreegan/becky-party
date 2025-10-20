import { prisma } from "./db.server";

export async function getValidSpotifyToken(hostId: number) {
  const host = await prisma.host.findUnique({
    where: { id: hostId },
    select: {
      spotifyAccessToken: true,
      spotifyRefreshToken: true,
      spotifyTokenExpiresAt: true,
    },
  });

  if (!host) throw new Error("Host not found");

  // check if the token is Still valid
  if (host.spotifyTokenExpiresAt && host.spotifyTokenExpiresAt > new Date()) {
    return host.spotifyAccessToken!;
  }

  // refresh the token if invalid
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString("base64"),
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: host.spotifyRefreshToken!,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("Failed to refresh Spotify token:", data);
    throw new Error("Spotify token refresh failed");
  }

  const newAccessToken = data.access_token;
  const expiresAt = new Date(Date.now() + data.expires_in * 1000);

  await prisma.host.update({
    where: { id: hostId },
    data: {
      spotifyAccessToken: newAccessToken,
      spotifyTokenExpiresAt: expiresAt,
    },
  });

  return newAccessToken;
}
