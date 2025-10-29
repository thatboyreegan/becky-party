import { useState } from "react";
import toast from "react-hot-toast";
import { usePlaylist } from "~/context/PlaylistContext";

export function AddToPlaylistButton({
  trackUri,
  playlistId,
  playlistSpotifyId,
  token,
  name,
  artist,
  albumArt,
  trackId,
}: {
  trackUri: string;
  playlistId: number;
  playlistSpotifyId: string;
  token: string;
  name: string;
  artist: string;
  albumArt: string;
  trackId: string;
}) {
  const { setTracks } = usePlaylist();

  async function handleAdd() {
    const res = await fetch("/api/spotify/add", {
      method: "POST",
      body: JSON.stringify({
        playlistId,
        trackUri,
        playlistSpotifyId,
        token,
        name,
        artist,
        albumArt,
        trackId,
      }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      setTracks((prev) => [
        ...prev,
        {
          id: data.track.trackId,
          name: data.track.title,
          artist: data.track.artist,
          image: data.track.albumArt,
          year: data.track.releaseYear,
        },
      ]);
      toast.success(
        `${data.track.title} by ${data.track.artist} added to playlist`
      );
    } else if (data.duplicate) {
      toast.error(
        `${data.exists.name} by ${data.exists.artist} already exists in the playlist`
      );
    } else {
      toast.error(
        `Failed to add ${data.track.name} by ${data.track.artist} to playlist, try again`
      );
    }
  }

  return (
    <button
      onClick={handleAdd}
      className={`
         bg-pink-500 hover:bg-pink-600
       text-white px-3 py-1 rounded-lg`}
    >
      Add
    </button>
  );
}
