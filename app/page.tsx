import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center gap-6 p-24 container mx-auto">
      <h1 className="text-6xl font-semibold ">AI Text Summarizer</h1>

      <div className="flex rounded-md border min-h-96 w-full border-opacity-40 border-gray-200">
        <textarea className="bg-transparent resize-none flex-1 p-4 outline-none" />
        <hr className="border-[.5px] border-opacity-40 border-gray-200 h-auto " />
        <textarea
          readOnly
          className="bg-transparent resize-none flex-1 outline-none p-4"
        />
      </div>
    </main>
  );
}
