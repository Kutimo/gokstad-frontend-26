import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-4xl font-bold">Lord of the Rings Encyclopedia</h1>
      <p className="mb-8 text-stone-600">
        Data from The One API, images from Tolkien Gateway and book covers from Open Library.
      </p>
      <ul className="grid gap-4 sm:grid-cols-2">
        <li>
          <Link href="/books" className="block rounded-lg bg-stone-100 p-6 text-xl font-semibold hover:bg-stone-200">
            📚 The Books →
          </Link>
        </li>
        <li>
          <Link href="/characters" className="block rounded-lg bg-stone-100 p-6 text-xl font-semibold hover:bg-stone-200">
            🧙 Characters →
          </Link>
        </li>
      </ul>
    </main>
  );
}
