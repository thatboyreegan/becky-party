import { redirect } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { prisma } from "~/utils/db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const hostToken = url.searchParams.get("state");

  if (!code || !hostToken)
    throw new Response("Missing code or hostToken!", { status: 400 });

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
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
    }),
  });

  const data = await res.json();
  const token = data.access_token;
  const refreshToken = data.refresh_token;
  const expiresAt = new Date(Date.now() + data.expires_in * 1000);

  await prisma.host.update({
    where: { hostToken },
    data: {
      spotifyAccessToken: token,
      spotifyRefreshToken: refreshToken,
      spotifyTokenExpiresAt: expiresAt,
    },
  });

  return redirect(`/createplaylist?hostToken=${hostToken}`);
}
