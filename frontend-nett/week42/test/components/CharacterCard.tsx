import Image from "next/image";
import Link from "next/link";
import type { Character } from "@/lib/api";

// Many characters have no image on the wiki.
// Then we show their first letter on a color that matches their race.
const RACE_COLORS: Record<string, string> = {
  Hobbit: "bg-green-700",
  Human: "bg-sky-800",
  Elf: "bg-teal-600",
  Dwarf: "bg-amber-700",
  Maiar: "bg-violet-700",
  Orc: "bg-red-900",
};

type Props = { character: Character; image: string | null };

export default function CharacterCard({ character, image }: Props) {
  const color = RACE_COLORS[character.race] ?? "bg-stone-500";

  return (
    <Link
      href={`/characters/${character._id}`}
      className="block overflow-hidden rounded-lg bg-stone-100 shadow transition hover:scale-105"
    >
      <div className="relative aspect-[3/4]">
        {image ? (
          <Image src={image} alt={character.name} fill sizes="250px" className="object-cover object-top" />
        ) : (
          <div className={`grid h-full place-items-center ${color}`}>
            <span className="font-serif text-7xl text-white/80">{character.name[0]}</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <h2 className="truncate font-semibold">{character.name}</h2>
        <p className="text-sm text-stone-600">{character.race}</p>
      </div>
    </Link>
  );
}
