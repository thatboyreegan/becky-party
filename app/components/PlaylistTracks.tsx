import { useEffect, useState } from "react";
import { usePlaylist } from "~/context/PlaylistContext";

export default function PlaylistTracks() {
  const { tracks, loading, source } = usePlaylist();

  if (loading) return <p className="mt-6 text-gray-600">Loading songs...</p>;
  if (!tracks.length)
    return <p className="mt-6 text-gray-600">No songs yet — add some!</p>;

  return (
    <div className="mt-8 text-left">
      <div className="w-full flex justify-between items-center bg-green-300 px-2">
        <h3 className="text-xl font-semibold mb-3 pt-2">
          🎧 Songs in Playlist
        </h3>{" "}
        <span
          className={`${source === "spotify" ? "bg-red-500" : "bg-blue-500"} rounded-full h-5 w-5`}
        ></span>
      </div>

      <ul className="space-y-3 h-[700px] overflow-y-auto hide-scrollbar">
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
              <p className="font-medium text-black">{track.name}</p>
              <p className="text-sm text-gray-500">{track.artist}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
