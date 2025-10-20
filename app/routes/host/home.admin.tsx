import { useEffect, useState } from "react";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";
import toast from "react-hot-toast";
import type { Guest } from "@prisma/client";
import { type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import { createGuestWithToken } from "~/utils/token.server";
import { findGuest, getGuests } from "~/utils/guest.server";
import { prisma } from "~/utils/db.server";

type ActionResult = {
  success: boolean;
  guest?: Guest;
  error?: string;
  duplicate?: boolean;
};
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const hostId = Number(url.searchParams.get("host"));
  const guests = await getGuests(hostId);

  return { guests };
}

export async function action({
  request,
}: ActionFunctionArgs): Promise<ActionResult> {
  const formData = await request.formData();
  const name = (formData.get("name") as string)?.trim();
  const telephone = (formData.get("telephone") as string)?.trim();
  const hostId = Number(formData.get("hostId"));

  if (!name || !telephone) {
    return { success: false, error: "Name and telephone are required." };
  }

  const existing = await findGuest(name, telephone, hostId);

  if (existing) {
    return { success: false, duplicate: true, guest: existing };
  }

  const host = await prisma.host.findUnique({
    where: { id: hostId },
  });

  if (!host) {
    throw new Error(`Host with ID ${hostId} does not exist`);
  }
  const guest = await createGuestWithToken(name, telephone, hostId);

  return { success: true, guest };
}

export default function HomePage() {
  const { guests: intialGuests } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [showForm, setShowForm] = useState(false);
  const [guests, setGuests] = useState<Guest[]>(intialGuests);
  const loading = navigation.state === "submitting";
  const [selectedGuest, setSelectedGuest] = useState<number | null>(null);
  const host = JSON.parse(sessionStorage.getItem("host") || "{}");
  const hostId = host?.id;
  const hostToken = host.hostToken;
  useEffect(() => {
    if (actionData?.duplicate) {
      toast.error(`${actionData.guest?.name} is already part of the list!`, {
        duration: 2000,
      });
      setShowForm(false);
    } else if (actionData?.success) {
      toast.success(
        `${actionData.guest?.name} Added to the invite list successfully !`,
        {
          duration: 1500,
        }
      );
      setGuests((prev: any) => [actionData.guest, ...prev]);
      setShowForm(false);
    } else if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  const copyLink = (token: string, name: string) => {
    const hostToken = localStorage.getItem("hostToken");
    const inviteLink = `${window.location.origin}/invite/${token}?host=${hostToken}`;
    navigator.clipboard.writeText(inviteLink);
    toast.success(`${name}'s invite link copied! `);
    setSelectedGuest(null);
  };

  return (
    <div className="h-screen p-4 bg-amber-100 flex flex-col ">
      <div>
        {showForm ? (
          <Form
            method="post"
            className="border rounded-lg text-black border-black p-3"
          >
            <input type="hidden" name="hostId" value={hostId} />

            <div className="flex flex-col gap-3">
              {" "}
              <label htmlFor="name">Name</label>
              <input
                type="text"
                name="name"
                id="name"
                className="p-2 outline-none border border-black rounded-md"
              />
            </div>
            <div className="flex flex-col gap-3">
              {" "}
              <label htmlFor="telephone">Telephone</label>
              <input
                type="text"
                name="telephone"
                id="telephone"
                className="p-2 outline-none border border-black rounded-md"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="p-3 bg-black text-teal-50 rounded w-full mt-4"
            >
              {loading ? "Submiting" : "Submit"}
            </button>
          </Form>
        ) : (
          <button
            className="p-3 bg-black text-teal-50 rounded mb-3"
            onClick={() => setShowForm(true)}
          >
            {" "}
            + Add Guest{" "}
          </button>
        )}
        <div>
          <Link to={`/createplaylist?host=${hostId}&token=${hostToken}`}>
            <button className="p-2 bg-blue-700 text-teal-100 rounded-lg mb-3">
              Create Playlist!
            </button>
          </Link>
        </div>
      </div>
      <div className="w-full flex-1 mt-8 max-h[60vh] overflow-y-auto hide-scrollbar">
        <h3 className="w-full text-center p-3 sticky">Invited guests</h3>
        <div className="flex flex-col gap-3 ">
          {guests.length === 0 && (
            <p className="text-gray-500 text-sm">No guests yet.</p>
          )}

          {guests.map((g) => (
            <div
              key={g.id}
              onClick={() =>
                setSelectedGuest((prev) => (prev === g.id ? null : g.id))
              }
              className="relative flex justify-between flex-col items-center p-3 rounded-lg shadow-sm border border-gray-200 group"
            >
              <div className="flex items-center justify-between w-full">
                <p className="font-medium text-gray-800">{g.name}</p>
                <p
                  className={`text-sm ${g.rsvpStatus.toLowerCase() === "accepted" ? "text-green-500" : g.rsvpStatus.toLowerCase() === "pending" ? "text-orange-400" : "text-red-800"} capitalize`}
                >
                  {g.rsvpStatus}
                </p>
              </div>
              {/* Hover button appears only on hover */}
              {selectedGuest === g.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation;
                    copyLink(g.uniqueToken, g.name);
                  }}
                  className="-translate-y-1/2 text-indigo-600 text-sm w-full mt-2 font-medium"
                >
                  Copy Link
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
