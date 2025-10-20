import { useEffect, useState } from "react";
import { AddToPlaylistButton } from "./AddToPlaylistButton";

interface Track {
  id: string;
  name: string;
  artist: string;
  year: number;
  image: string;
  uri: string;
}
export function SpotifySearchBox({
  token,
  playlistId,
  eraStart,
  eraEnd,
}: {
  token: string;
  playlistId?: string;
  eraStart?: number | null;
  eraEnd?: number | null;
}) {
  const [query, setQuery] = useState("");
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [cache, setCache] = useState<Record<string, Track[]>>(() => {
    const saved = localStorage.getItem("songSearchCache");
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    if (!query.trim()) return;

    const cacheKey = `${query.toLowerCase()}_${eraStart}_${eraEnd}`;

    if (cache[cacheKey]) {
      setTracks(cache[cacheKey]);
      return;
    }
    const delay = setTimeout(async () => {
      setLoading(true);
      const params = new URLSearchParams({
        query,
        token,
        ...(eraStart ? { eraStart: eraStart.toString() } : {}),
        ...(eraEnd ? { eraEnd: eraEnd.toString() } : {}),
      });

      const res = await fetch(`/api/spotify/search?${params.toString()}`);
      const data = await res.json();

      const tRacks: Track[] = data.tracks || [];

      const newCache = { ...cache, [cacheKey]: tRacks };
      setCache(newCache);
      localStorage.setItem("songSearchCache", JSON.stringify(newCache));
      setTracks(data.tracks || []);
      setLoading(false);
    }, 500);

    return () => clearTimeout(delay);
  }, [query, eraStart, eraEnd, token]);
  return (
    <div className="relative w-full max-w-lg mx-auto">
      <input
        type="text"
        placeholder="Search for a song..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full p-3 rounded-xl border border-black/20 focus:ring-2 text-black focus:ring-pink-400"
      />
      {loading && <p className="text-gray-500">Searching...</p>}

      {!loading && tracks.length > 0 && (
        <ul className="space-y-3">
          {tracks.map((t) => (
            <li key={t.id} className="flex items-center gap-3 border-b pb-2">
              <img src={t.image} alt={t.name} className="w-12 h-12 rounded" />
              <div className="flex-1">
                <p className="font-semibold">{t.name}</p>
                <p className="text-sm text-gray-500">
                  {t.artist} • {t.year}
                </p>
              </div>
              <AddToPlaylistButton
                trackUri={`spotify:track:${t.id}`}
                playlistId={playlistId!}
                token={token}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
