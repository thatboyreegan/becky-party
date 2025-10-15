import { useState } from "react";
import { Form } from "react-router";
import toast from "react-hot-toast";

export default function HomePage() {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guest, setGuest] = useState({ name: "", telephone: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    toast.success(`${guest.name} Added to the invite list successfully !`, {
      duration: 1500,
    });

    setGuest({ name: "", telephone: "" });
    setShowForm(false);
    setLoading(false);
  };
  return (
    <div className="h-screen p-4 bg-amber-100 ">
      <div>
        {showForm ? (
          <Form
            onSubmit={handleSubmit}
            className="border rounded-lg text-black border-black p-3"
          >
            <div className="flex flex-col gap-3">
              {" "}
              <label htmlFor="name">Name</label>
              <input
                type="text"
                name="name"
                id="name"
                className="p-2 outline-none border border-black rounded-md"
                onChange={(e) => setGuest({ ...guest, name: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-3">
              {" "}
              <label htmlFor="phone">Telephone</label>
              <input
                type="text"
                name="phone"
                id="phone"
                className="p-2 outline-none border border-black rounded-md"
                onChange={(e) =>
                  setGuest({ ...guest, telephone: e.target.value })
                }
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
      </div>
    </div>
  );
}
