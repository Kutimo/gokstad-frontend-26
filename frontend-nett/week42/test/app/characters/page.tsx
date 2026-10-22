import { Suspense } from "react";
import Link from "next/link";
import { getCharacters, getCharacterImage } from "@/lib/api";
import CharacterCard from "@/components/CharacterCard";
import ErrorMessage from "@/components/ErrorMessage";

export const metadata = { title: "Characters" };

const RACES = ["Hobbit", "Human", "Elf", "Dwarf", "Maiar", "Orc"];

type Props = { searchParams: Promise<{ page?: string; race?: string }> };

// The page shows the heading right away.
// Everything that needs ?page= and ?race= from the URL is inside <Suspense>.
export default function CharactersPage({ searchParams }: Props) {
  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-4 text-3xl font-bold">Characters</h1>

      <Suspense fallback={<p className="animate-pulse text-stone-600">Fetching characters from Middle-earth…</p>}>
        <CharacterList searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function CharacterList({ searchParams }: Props) {
  const { page = "1", race } = await searchParams;

  // Step 1: get the characters (we need their names before we can find images)
  const { characters, totalPages, error } = await getCharacters(page, race);

  // The API failed → show the message instead of the list
  if (error) {
    return <ErrorMessage message={error} />;
  }

  // Step 2: get all the images AT ONCE
  const images = await Promise.all(characters.map((c) => getCharacterImage(c.name)));

  const currentPage = Number(page);
  const raceFilter = race ? `&race=${race}` : "";

  return (
    <>
      <nav className="mb-6 flex flex-wrap gap-2">
        <Link href="/characters" className={!race ? "font-bold underline" : ""}>All</Link>
        {RACES.map((r) => (
          <Link key={r} href={`/characters?race=${r}`} className={race === r ? "font-bold underline" : ""}>
            {r}
          </Link>
        ))}
      </nav>

      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {characters.map((c, i) => (
          <li key={c._id}>
            <CharacterCard character={c} image={images[i]} />
          </li>
        ))}
      </ul>

      <div className="mt-8 flex items-center justify-center gap-4">
        {currentPage > 1 && (
          <Link href={`/characters?page=${currentPage - 1}${raceFilter}`}>← Previous</Link>
        )}
        <span>Page {currentPage} of {totalPages}</span>
        {currentPage < totalPages && (
          <Link href={`/characters?page=${currentPage + 1}${raceFilter}`}>Next →</Link>
        )}
      </div>
    </>
  );
}
