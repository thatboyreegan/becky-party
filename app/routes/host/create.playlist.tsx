import { useEffect, useState } from "react";
import {
  Form,
  redirect,
  useActionData,
  useLoaderData,
  useNavigate,
  useRevalidator,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router";
import { prisma } from "~/utils/db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const hostToken = url.searchParams.get("hostToken") as string;

  const host = await prisma.host.findUnique({
    where: { hostToken },
    include: {
      Playlist: true,
    },
  });

  if (!host?.spotifyAccessToken) {
    return { error: "Spotify authentication required", reauth: true, host };
  }
  if (!host) throw new Response("Host not found", { status: 404 });

  return { playlist: host.Playlist, host };
}
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const res = await fetch(
    `${process.env.BASE_URL ?? "http://localhost:5173"}/api/spotify/createplaylist`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await res.json();

  if (!res.ok) {
    console.error("❌ Playlist creation failed:", data);
    return { error: data.error ?? "Failed to create playlist" };
  }

  return { playlist: data.playlist, success: true };
}

export default function CreatePlaylist() {
  const data = useActionData<typeof action>();
  const payload = useLoaderData<typeof loader>();
  const [preview, setPreview] = useState({ name: "", theme: "" });
  const [createdPlaylist, setCreatedPlaylist] = useState<any>(null);
  const [hostToken, setHostToken] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("playlist");
      if (stored) setCreatedPlaylist(JSON.parse(stored));

      const host = sessionStorage.getItem("host");
      if (host) {
        const parsed = JSON.parse(host);
        setHostToken(parsed.hostToken || "");
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && data?.playlist) {
      sessionStorage.setItem("playlist", JSON.stringify(data.playlist));
      setCreatedPlaylist(data.playlist);
      console.log(payload.playlist);
      navigate(
        `/mixroom?playlistSpotifyId=${data.playlist.spotifyId}&playlistId=${data.playlist.id}`
      );
    }
  }, [data?.success]);

  return (
    <div className="max-w-md mx-auto p-6 h-screen rounded-2xl mt-12 text-center flex flex-col items-center justify-center">
      {payload.reauth ? (
        <div className="text-center mt-12">
          <h1 className="text-2xl mb-4">🎧 Connect your Spotify account</h1>
          <form
            action={`/api/spotify/authenticate?hostToken=${payload.host?.hostToken}`}
            method="get"
          >
            <input
              type="hidden"
              name="hostToken"
              value={payload.host?.hostToken}
            />
            <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg">
              Connect Spotify
            </button>
          </form>
        </div>
      ) : (
        <div className="w-full ">
          {" "}
          <h1 className="text-2xl font-bold mb-4">🎵 Create Your Playlist</h1>
          <Form method="post" className="space-y-4">
            <input
              type="hidden"
              name="hostToken"
              value={payload.host?.hostToken}
            />
            <input type="hidden" name="hostId" value={payload.host?.id} />
            <input
              type="text"
              name="name"
              placeholder="Playlist name"
              onChange={(e) => setPreview({ ...preview, name: e.target.value })}
              required
              className="w-full p-3 rounded-lg border border-black/30 bg-white/20 text-black"
            />
            <input
              type="text"
              name="theme"
              placeholder="Party theme (e.g. Neon Nights)"
              onChange={(e) =>
                setPreview({ ...preview, theme: e.target.value })
              }
              className="w-full p-3 rounded-lg border border-black/30 bg-white/20 text-black"
            />
            <div className="flex gap-2">
              <input
                type="hidden"
                name="eraStart"
                value={1963}
                className="w-1/2 p-3 rounded-lg border border-black/30 bg-white/20 text-black"
              />
              <input
                type="hidden"
                name="eraEnd"
                value={2025}
                placeholder="To (e.g. 2005)"
                className="w-1/2 p-3 rounded-lg border border-black/30 bg-white/20 text-black"
              />
            </div>
            <button
              type="submit"
              className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 w-full rounded-xl"
            >
              Create Playlist
            </button>
          </Form>
          {preview.name && (
            <p className="mt-4 text-black">
              ✨ Playlist <strong>{preview.name}</strong> will capture your{" "}
              <em>{preview.theme}</em> vibes!
            </p>
          )}
        </div>
      )}
    </div>
  );
}
