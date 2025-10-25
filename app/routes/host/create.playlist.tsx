import { useEffect, useState } from "react";
import {
  Form,
  redirect,
  useActionData,
  useLoaderData,
  useRevalidator,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router";
import PlaylistTracks from "~/components/PlaylistTracks";
import { SpotifySearchBox } from "~/components/spotifySearchBox";
import { prisma } from "~/utils/db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const hostToken = url.searchParams.get("token") as string;

  const host = await prisma.host.findUnique({
    where: { hostToken },
    include: { Playlist: true },
  });

  if (!host) throw new Response("Host not found", { status: 404 });

  const isSpotifyConnected = !!host.spotifyAccessToken;

  const existingPlaylist = host.Playlist?.[0] ?? null;
  const needsSpotifySync =
    existingPlaylist && !existingPlaylist.spotifyId && isSpotifyConnected;

  return { host, isSpotifyConnected, existingPlaylist, needsSpotifySync };
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

  return { playlist: data.playlist };
}

export default function CreatePlaylist() {
  const data = useActionData<typeof action>();
  const loaded = useLoaderData<typeof loader>();
  const [preview, setPreview] = useState({ name: "", theme: "" });
  const [createdPlaylist, setCreatedPlaylist] = useState<any>(null);
  const [hostToken, setHostToken] = useState("");
  const revalidator = useRevalidator();

  const existingPlaylist =
    data?.playlist ?? loaded.existingPlaylist ?? createdPlaylist ?? null;

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
      console.log(existingPlaylist);
      revalidator.revalidate();
    }
  }, [data, loaded]);

  if (!loaded.isSpotifyConnected) {
    return (
      <div className="text-center mt-12">
        <h1 className="text-2xl mb-4">🎧 Connect your Spotify account</h1>
        <form action="/api/spotify/authenticate" method="get">
          <input type="hidden" name="hostToken" value={loaded.host.hostToken} />
          <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg">
            Connect Spotify
          </button>
        </form>
      </div>
    );
  }

  if (loaded.needsSpotifySync) {
    return (
      <div className="text-center mt-12">
        <h2 className="text-2xl mb-4">🔄 Sync your existing playlist</h2>
        <p className="mb-4 text-gray-600">
          You already have a playlist in the database, but it hasn’t been
          created on Spotify yet.
        </p>
        <form action="/api/spotify/syncplaylist" method="post">
          <input
            type="hidden"
            name="playlistId"
            value={loaded.existingPlaylist.id}
          />
          <input type="hidden" name="hostToken" value={loaded.host.hostToken} />
          <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg">
            Sync to Spotify
          </button>
        </form>
      </div>
    );
  }

  if (existingPlaylist) {
    console.log("Existing playlist:", existingPlaylist);
    console.log("Spotify ID:", existingPlaylist.spotifyId);
    return (
      <div className="p-6 text-center mt-12">
        <h2 className="text-2xl font-semibold mb-4">
          🎶 {existingPlaylist.name} Playlist
        </h2>
        <p className="text-gray-700 mb-4">Add songs to your playlist below</p>
        <SpotifySearchBox
          token={loaded.host.hostToken}
          playlistId={existingPlaylist.spotifyId}
          eraStart={existingPlaylist.eraStart}
          eraEnd={existingPlaylist.eraEnd}
        />
        <PlaylistTracks
          token={loaded.host.hostToken}
          playlistId={existingPlaylist.spotifyId}
        />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-amber-100 rounded-2xl mt-12 text-center">
      <h1 className="text-2xl font-bold mb-4">🎵 Create Your Playlist</h1>
      <Form method="post" className="space-y-4">
        <input type="hidden" name="hostId" value={loaded.host.id} />
        <input type="hidden" name="hostToken" value={hostToken} />
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
          onChange={(e) => setPreview({ ...preview, theme: e.target.value })}
          className="w-full p-3 rounded-lg border border-black/30 bg-white/20 text-black"
        />
        <div className="flex gap-2">
          <input
            type="number"
            name="eraStart"
            placeholder="From (e.g. 1998)"
            className="w-1/2 p-3 rounded-lg border border-black/30 bg-white/20 text-black"
          />
          <input
            type="number"
            name="eraEnd"
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
  );
}
