import Image from "next/image";
import { getBooks, getBookCover } from "@/lib/api";
import ErrorMessage from "@/components/ErrorMessage";

export const metadata = { title: "Books" };

export default async function BooksPage() {
  const { books, error } = await getBooks();

  // Three searches against Open Library, ALL AT ONCE (if getBooks failed, books is empty → no searches)
  const covers = await Promise.all(books.map((book) => getBookCover(book.name)));

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-3xl font-bold">The Books</h1>

      {error && <ErrorMessage message={error} />}

      <ul className="grid gap-6 sm:grid-cols-3">
        {books.map((book, i) => (
          <li key={book._id} className="rounded-lg bg-stone-100 p-4 text-center">
            {covers[i] ? (
              <Image
                src={covers[i]}
                alt={`Cover: ${book.name}`}
                width={300}
                height={450}
                className="mx-auto h-auto w-full rounded"
              />
            ) : (
              <div className="grid aspect-[2/3] place-items-center bg-stone-300">No cover</div>
            )}
            <h2 className="mt-3 font-semibold">{book.name}</h2>
          </li>
        ))}
      </ul>
    </main>
  );
}
