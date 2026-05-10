import Link from "next/link";

export default function Home() {

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">

      <div className="bg-white shadow-xl border rounded-3xl p-10 max-w-xl w-full text-center">

        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          GetKnowify
        </h1>

        <p className="text-zinc-500 text-lg mb-10">
          Admin Dashboard Panel
        </p>

        {/* BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">

          {/* DASHBOARD */}
          <Link
            href="/dashboard"
            className="bg-black text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-zinc-800 transition"
          >
            Open Dashboard
          </Link>

          {/* QUIZZES */}
          <Link
            href="/quizzes"
            className="border px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-zinc-100 transition"
          >
            Manage Quizzes
          </Link>

          {/* LETTERS */}
          <Link
            href="/letters"
            className="border px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-zinc-100 transition"
          >
            Manage Letters
          </Link>

        </div>

      </div>

    </div>
  );
}