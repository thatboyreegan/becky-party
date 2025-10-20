import { useNavigate } from "react-router";

export default function AuthButton() {
  const navigate = useNavigate();

  async function handleLogin() {
    window.location.href = "/api/spotify/authenticate";
  }

  return (
    <button
      onClick={handleLogin}
      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
    >
      Connect with Spotify
    </button>
  );
}
