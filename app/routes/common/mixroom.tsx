import { useLoaderData, type LoaderFunctionArgs } from "react-router";
import PlaylistTracks from "~/components/PlaylistTracks";
import AuthButton from "~/components/spotifyAuthButon";
import { SpotifySearchBox } from "~/components/spotifySearchBox";
import { PlaylistProvider } from "~/context/PlaylistContext";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const playlistId = url.searchParams.get("playlist");
  const playlistSpotifyId = url.searchParams.get("playlistSpotifyId");

  if (!token || !playlistId) {
    return Response.json({ token: null, playlistId: null });
  }

  return Response.json({ token, playlistId, playlistSpotifyId });
}
export default function PlaylistPage() {
  const { token, playlistId, playlistSpotifyId } =
    useLoaderData<typeof loader>();
  return (
    <PlaylistProvider
      playlistSpotifyId={playlistSpotifyId}
      token={token}
      playlist={parseInt(playlistId)}
    >
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold w-full text-center">Your Mixroom</h1>

        <SpotifySearchBox
          token={token}
          playlistId={playlistId!}
          playlistSpotifyId={playlistSpotifyId}
        />
        <PlaylistTracks />
      </div>
    </PlaylistProvider>
  );
}
