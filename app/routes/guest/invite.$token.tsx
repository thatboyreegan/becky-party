import {
  useLoaderData,
  Form,
  useActionData,
  useNavigation,
  redirect,
  Link,
} from "react-router";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import toast from "react-hot-toast";
import { prisma } from "~/utils/db.server";
import { useEffect } from "react";

export async function loader({ params }: LoaderFunctionArgs) {
  const uniqueToken = params.token;

  const guest = await prisma.guest.findFirst({ where: { uniqueToken } });

  if (!guest) {
    throw new Response("Invalid invite link.", { status: 404 });
  }

  return { guest };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const uniqueToken = params.token;
  const formData = await request.formData();
  const rsvpStatus = formData.get("response")?.toString()?.trim();

  if (!rsvpStatus || !["accepted", "declined"].includes(rsvpStatus)) {
    return { success: false, error: "Invalid RSVP response." };
  }
  if (typeof uniqueToken === "string" && uniqueToken.length > 10) {
    await prisma.guest.update({
      where: { uniqueToken },
      data: { rsvpStatus },
    });

    return { success: true, rsvpStatus };
  } else {
    return { success: false, error: "Invalid token" };
  }
}
export default function InvitePage() {
  const { guest } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const loading = navigation.state === "submitting";

  useEffect(() => {
    if (actionData?.success) {
      toast.success(
        `Thank you ${guest?.name}, you have ${actionData.rsvpStatus === "accepted" ? "accepted" : "declined"} the invite  `
      );
    } else if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData, guest]);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-amber-100 text-gray-800 p-6">
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-sm text-center">
        <h2 className="text-xl font-bold mb-2">🎉 Hi {guest?.name}!</h2>

        {guest?.rsvpStatus === "PENDING" ? (
          <>
            <p className="text-gray-600 mb-4">
              You’ve been invited to a special birthday celebration.
            </p>
            <p className="mb-3 text-sm text-gray-500">
              Will you be joining us?
            </p>
            <Form method="post" className="flex flex-col gap-3">
              <button
                type="submit"
                name="response"
                value="accepted"
                disabled={loading}
                className="p-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
                {loading ? "Submitting..." : "Accept Invitation"}
              </button>
              <button
                type="submit"
                name="response"
                value="declined"
                disabled={loading}
                className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                {loading ? "Submitting..." : "Decline Invitation"}
              </button>
            </Form>
          </>
        ) : (
          <div>
            <p className="text-gray-700 font-medium mt-4">
              You have already{" "}
              <span
                className={`${
                  guest?.rsvpStatus === "accepted"
                    ? "text-green-600"
                    : "text-red-600"
                } font-semibold`}
              >
                {guest?.rsvpStatus}
              </span>{" "}
              the invitation.
            </p>

            <p>
              Do you want to add to Becky's birthday{" "}
              <Link to={"/playlist"}>
                <span className="underline text-blue-400">playlist?</span>
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
