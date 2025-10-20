import { useLoaderData, type LoaderFunctionArgs } from "react-router";
import AuthButton from "~/components/spotifyAuthButon";
import { SpotifySearchBox } from "~/components/spotifySearchBox";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const playlistId = url.searchParams.get("playlist");

  if (!token || !playlistId) {
    return Response.json({ token: null, playlistId: null });
  }

  return Response.json({ token, playlistId });
}
export default function PlaylistPage() {
  const { token, playlistId } = useLoaderData<typeof loader>();
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Your Mixroom</h1>

      {!token ? (
        <div className="text-center">
          <p className="mb-3 text-gray-500">
            Connect to Spotify to search and add songs.
          </p>
          <AuthButton />
        </div>
      ) : (
        <SpotifySearchBox token={token} playlistId={playlistId!} />
      )}
    </div>
  );
}
