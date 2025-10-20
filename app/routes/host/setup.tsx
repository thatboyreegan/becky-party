// app/routes/host/setup.tsx

import {
  Form,
  useActionData,
  redirect,
  type ActionFunctionArgs,
  useNavigate,
} from "react-router";
import { useEffect } from "react";
import { prisma } from "~/utils/db.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const name = (formData.get("name") as string)?.trim();

  if (!name) {
    return { error: "Host name is required." };
  }

  let host = await prisma.host.findFirst({ where: { name } });

  if (!host) {
    host = await prisma.host.create({
      data: {
        name,
      },
    });
  }

  return { host };
}

export default function HostSetupPage() {
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData?.host) {
      sessionStorage.setItem("host", JSON.stringify(actionData.host));
      const encodedToken = encodeURIComponent(actionData.host.hostToken);
      navigate(`/host/invite?host=${actionData.host.id}&token=${encodedToken}`);
    }
  }, [actionData, navigate]);

  return (
    <div className="max-w-md mx-auto p-6 bg-amber-100 mt-16 rounded-2xl shadow-lg text-center">
      <h1 className="text-3xl font-bold mb-4">👋 Host Setup</h1>
      <p className="mb-6 text-gray-600">
        Enter your name to start hosting your party and creating playlists.
      </p>

      <Form method="post" className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Your name"
          required
          className="w-full p-3 rounded-lg bg-white border text-black  border-gray-300 focus:ring-2 focus:ring-pink-400 outline-none"
        />
        <button
          type="submit"
          className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-xl transition"
        >
          Continue
        </button>
      </Form>

      {actionData?.error && (
        <p className="text-red-500 mt-3">{actionData.error}</p>
      )}
    </div>
  );
}
