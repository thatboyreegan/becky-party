import { useState } from "react";

export function AddToPlaylistButton({
  trackUri,
  playlistId,
  token,
}: {
  trackUri: string;
  playlistId: string;
  token: string;
}) {
  const [added, setAdded] = useState(false);

  async function handleAdd() {
    console.log("playlistId:", playlistId);
    console.log("trackUri:", trackUri);
    const res = await fetch("/api/spotify/add", {
      method: "POST",
      body: JSON.stringify({
        playlistId,
        trackUri,
        token,
      }),
    });

    const data = await res.json();
    if (data.success) setAdded(true);
    if (res.ok) {
      window.dispatchEvent(new Event("playlist:updated"));
      alert("✅ Song added to playlist!");
    } else {
      alert("❌ Failed to add song.");
    }
  }

  return (
    <button
      onClick={handleAdd}
      disabled={added}
      className={`${
        added ? "bg-gray-400" : "bg-pink-500 hover:bg-pink-600"
      } text-white px-3 py-1 rounded-lg`}
    >
      {added ? "Added" : "Add"}
    </button>
  );
}
