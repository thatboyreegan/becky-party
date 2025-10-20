import { useState } from "react";
import {
  Form,
  redirect,
  useActionData,
  useLoaderData,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router";
import { SpotifySearchBox } from "~/components/spotifySearchBox";
import { prisma } from "~/utils/db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const hostId = url.searchParams.get("host");
  const hostToken = url.searchParams.get("token") as string;

  if (!hostId) throw new Response("Missing host Id", { status: 400 });

  const host = await prisma.host.findUnique({ where: { hostToken } });

  if (!host) throw new Response("Host not found", { status: 404 });

  const isSpotifyConnected = !!host.spotifyAccessToken;
  return { host, isSpotifyConnected };
}
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const name = (formData.get("name") as string).trim();
  const theme = (formData.get("theme") as string).trim();
  const eraStart = parseInt(formData.get("eraStart") as string);
  const eraEnd = parseInt(formData.get("eraStart") as string);

  if (!name) {
    return { error: "Missing required fields", status: 400 };
  }

  const playlist = await prisma.playlist.create({
    data: { name, theme, eraStart, eraEnd },
  });

  console.log(playlist);
  return { playlist };
}

export default function CreatePlaylist() {
  const data = useActionData<typeof action>();
  const loaded = useLoaderData<typeof loader>();
  const [preview, setPreview] = useState({ name: "", theme: "" });

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

  if (data?.playlist?.id) {
    return (
      <div className="p-6 text-center mt-12">
        <h2 className="text-2xl font-semibold mb-4">
          🎶 {data.playlist.name} Playlist
        </h2>
        <p className="text-gray-700 mb-4">Add songs to your playlist below</p>
        <SpotifySearchBox
          token={loaded.host.hostToken}
          playlistId={String(data.playlist.id)}
          eraStart={data.playlist.eraStart}
          eraEnd={data.playlist.eraEnd}
        />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-amber-100 rounded-2xl mt-12 text-center">
      <h1 className="text-2xl font-bold mb-4">🎵 Create Your Playlist</h1>
      <Form method="post" className="space-y-4">
        <input type="hidden" name="hostId" value={loaded.host.id} />
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
