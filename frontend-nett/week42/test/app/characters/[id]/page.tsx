import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCharacter, getQuotes, getCharacterImage } from "@/lib/api";
import ErrorMessage from "@/components/ErrorMessage";

type Props = { params: Promise<{ id: string }> };

// The page shows the back link right away.
// Everything that needs the id from the URL is inside <Suspense>.
export default function CharacterPage({ params }: Props) {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <Link href="/characters" className="text-sm underline">← All characters</Link>

      <Suspense fallback={<p className="mt-4 animate-pulse text-stone-600">Loading character…</p>}>
        <CharacterDetails params={params} />
      </Suspense>
    </main>
  );
}

async function CharacterDetails({ params }: Props) {
  const { id } = await params;

  // Character and quotes don't depend on each other → fetch them at the same time
  const [{ character, error }, quotes] = await Promise.all([getCharacter(id), getQuotes(id)]);

  // The API failed → show the message
  if (error) {
    return <ErrorMessage message={error} />;
  }
  // The API worked, but there is no character with this id → 404 page
  if (!character) notFound();

  // The image needs character.name → so it has to come after
  const image = await getCharacterImage(character.name);

  // The API sometimes sends empty values or "NaN", so we remove those
  const facts = [
    { label: "Race", value: character.race },
    { label: "Gender", value: character.gender },
    { label: "Realm", value: character.realm },
    { label: "Born", value: character.birth },
    { label: "Died", value: character.death },
    { label: "Spouse", value: character.spouse },
  ].filter((fact) => fact.value && fact.value !== "NaN");

  return (
    <>
      <div className="mt-4 flex flex-col gap-6 sm:flex-row">
        {image && (
          <Image src={image} alt={character.name} width={300} height={400} className="h-auto rounded-lg" />
        )}
        <div>
          <h1 className="text-3xl font-bold">{character.name}</h1>
          <ul className="mt-4 space-y-1">
            {facts.map((fact) => (
              <li key={fact.label}>
                <strong>{fact.label}:</strong> {fact.value}
              </li>
            ))}
          </ul>
          {character.wikiUrl && (
            <a href={character.wikiUrl} target="_blank" className="mt-4 inline-block underline">
              Read more on the wiki →
            </a>
          )}
        </div>
      </div>

      {quotes.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-2 text-xl font-semibold">Quotes from the movies</h2>
          <ul className="space-y-2">
            {quotes.map((q) => (
              <li key={q._id} className="border-l-4 border-amber-600 pl-3 italic">“{q.dialog}”</li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
