import { useEffect, useState } from "react";

interface Track {
  id: string;
  name: string;
  artist: string;
  image: string;
}

export default function PlaylistTracks({
  playlistId,
  token,
}: {
  playlistId: string;
  token: string;
}) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTracks() {
      if (!playlistId || !token) return;
      try {
        const res = await fetch(
          `/api/spotify/tracks?playlistId=${playlistId}&token=${token}`
        );
        const data = await res.json();
        if (res.ok) setTracks(data.tracks);
        else console.error("Failed to load playlist tracks:", data.error);
      } catch (error) {
        console.error("Error fetching playlist tracks:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTracks();

    useEffect(() => {
      const handler = () => fetchTracks();
      window.addEventListener("playlist:updated", handler);
      return () => window.removeEventListener("playlist:updated", handler);
    }, []);
  }, [playlistId, token]);

  if (loading) return <p className="mt-6 text-gray-600">Loading songs...</p>;
  if (!tracks.length)
    return <p className="mt-6 text-gray-600">No songs yet — add some!</p>;

  return (
    <div className="mt-8 text-left">
      <h3 className="text-xl font-semibold mb-3">🎧 Songs in Playlist</h3>
      <ul className="space-y-3">
        {tracks.map((track) => (
          <li
            key={track.id}
            className="flex items-center gap-3 bg-white/10 rounded-lg p-3"
          >
            <img
              src={track.image}
              alt={track.name}
              className="w-12 h-12 rounded-md object-cover"
            />
            <div>
              <p className="font-medium">{track.name}</p>
              <p className="text-sm text-gray-500">{track.artist}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
