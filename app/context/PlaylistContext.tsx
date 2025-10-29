import {
  useState,
  createContext,
  type ReactNode,
  useContext,
  useEffect,
} from "react";

interface Track {
  id: string;
  name: string;
  artist: string;
  image: string;
  uri?: string;
  year?: number;
}

interface PlaylistContextType {
  tracks: Track[];
  setTracks: React.Dispatch<React.SetStateAction<Track[]>>;
  addTrack: (track: Track) => void;
  fetchTracks: () => Promise<void>;
  removeTrack: (trackId: string) => void;
  loading: boolean;
  source: "spotify" | "database" | null;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(
  undefined
);

export function PlaylistProvider({
  children,
  playlistSpotifyId,
  playlist,
  token,
}: {
  children: ReactNode;
  playlistSpotifyId: string;
  playlist: number;
  token: string;
}) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<"spotify" | "database" | null>(null);

  async function fetchTracks() {
    if (!playlistSpotifyId || !token) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/spotify/tracks?playlistId=${playlistSpotifyId}&token=${token}&playlist=${playlist}`
      );
      const data = await res.json();
      if (res.ok) {
        setTracks(data.tracks);
        setSource(data.source || "spotify");

        localStorage.setItem(
          `playlist_${playlistSpotifyId}`,
          JSON.stringify({ tracks: data.tracks, source: data.source })
        );
      } else console.error("Failed to load playlist tracks:", data.error);
    } catch (error) {
      console.error("Error fetching playlist tracks:", error);
      const cached = localStorage.getItem(`playlist_${playlistSpotifyId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        setTracks(parsed.tracks || []);
        setSource("database");
      } else {
        console.warn("No cache found for playlist:", playlistSpotifyId);
        setTracks([]);
        setSource(null);
      }
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchTracks();
  }, [playlistSpotifyId, token]);

  const addTrack = (track: Track) => {
    setTracks((prev) => {
      const exists = prev.some((t) => t.id === track.id);
      if (exists) return prev;
      const updated = [track, ...prev];
      localStorage.setItem(
        `playlist_${playlistSpotifyId}`,
        JSON.stringify({ tracks: updated, source })
      );
      return updated;
    });
  };

  const removeTrack = (trackId: string) => {
    setTracks((prev) => {
      const updated = prev.filter((t) => t.id !== trackId);

      localStorage.setItem(
        `playlist_${playlistSpotifyId}`,
        JSON.stringify({ tracks: updated, source })
      );

      return updated;
    });
  };

  return (
    <PlaylistContext.Provider
      value={{
        tracks,
        setTracks,
        addTrack,
        removeTrack,
        fetchTracks,
        loading,
        source,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
}

export function usePlaylist() {
  const context = useContext(PlaylistContext);
  if (!context)
    throw new Error("usePlaylist must be used within a PlaylistProvider");
  return context;
}
