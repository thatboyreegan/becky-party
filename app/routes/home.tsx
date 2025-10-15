import { Form } from "react-router";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Becky's Birthday App" },
    { name: "description", content: "Welcome to Becky's Special Day!" },
  ];
}

export default function Home() {
  return (
    <div className="p-4 flex  h-screen justify-center w-full ">
      <div className="w-[96%] rounded-lg border-2 flex flex-col justify-between items-center pt-8 border-black  h-11/12 md:h-[98%]">
        <h1 className="text-[34px]">Becky's </h1>
        <h1 className="text-[30px]">Birthday Bash</h1>
        <div className="flex-1 items-center flex flex-col w-full p-3">
          <h1 className="text-[26px] pb-10">You have been invited!</h1>
          <p>Becky is throwing a fire party !</p>
          <p>Date: **November 1st**</p>
          <p>Day: **Saturday**</p>
        </div>
        <Form
          className="w-full flex gap-2.5 justify-between px-3 py-3"
          method="post"
        >
          <input type="hidden" name="token" value={""} />
          <button
            type="submit"
            name="rsvp"
            value="YES"
            className="text-[#dd6666] px-3 py-2 rounded-md bg-black"
          >
            RSVP YES
          </button>
          <button
            type="submit"
            name="rsvp"
            value="NO"
            className="text-white px-3 py-2 rounded-md bg-[#c03737]"
          >
            No, I cannot make it
          </button>
        </Form>
      </div>
    </div>
  );
}
