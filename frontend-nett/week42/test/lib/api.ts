import { cacheLife } from "next/cache";

// ---------- Types: what the data looks like ----------

export type Book = {
  _id: string;
  name: string;
};

export type Character = {
  _id: string;
  name: string;
  race: string;
  gender: string;
  birth: string;
  death: string;
  realm: string;
  spouse: string;
  wikiUrl?: string;
};

export type Quote = {
  _id: string;
  dialog: string;
};

// ---------- The reusable fetch function ----------

const ONE_API = "https://the-one-api.dev/v2";

// Every API call in this file goes through this one function.
// It never crashes. It always gives back { data, error }:
//   it worked → { data: the answer, error: null }
//   it failed → { data: null, error: "a message we can show the user" }
async function fetchData(url: string) {
  "use cache";

  // Only The One API needs our key. Never send it to other websites!
  const headers = url.startsWith(ONE_API)
    ? { Authorization: `Bearer ${process.env.THE_ONE_API_KEY}` }
    : undefined;

  // Shows up in the terminal ONLY when we really ask the API (not when the answer comes from the cache)
  console.log("Fetching:", url);

  try {
    const res = await fetch(url, { headers });

    if (res.ok) {
      cacheLife("hours"); // a good answer is saved for 1 hour, so we don't hit the rate limit
      return { data: await res.json(), error: null };
    }

    cacheLife("seconds"); // an error is only saved for a moment, so we can try again soon
    return { data: null, error: errorMessage(res.status) };
  } catch {
    // fetch itself failed: no internet, or the website is down
    cacheLife("seconds");
    return { data: null, error: "Could not reach the API. Check your internet connection." };
  }
}

// Turns an HTTP status code into a message a user understands
function errorMessage(status: number) {
  if (status === 401) {
    return "The API key is missing or wrong. Check THE_ONE_API_KEY in .env.local and restart npm run dev.";
  }
  if (status === 429) {
    return "Too many requests (max 100 per 10 minutes). Wait a few minutes, then reload the page.";
  }
  return `The API answered with an error (${status}). Try again later.`;
}

// ---------- API 1: The One API (books, characters, quotes) ----------

export async function getBooks() {
  const { data, error } = await fetchData(`${ONE_API}/book`);
  const books: Book[] = data?.docs ?? []; // if it failed, data is null → empty list

  return { books, error };
}

export async function getCharacters(page: string, race?: string) {
  let url = `${ONE_API}/character?limit=24&page=${page}&sort=name:asc`;
  if (race) {
    url += `&race=${race}`;
  }

  const { data, error } = await fetchData(url);
  const characters: Character[] = data?.docs ?? [];
  const totalPages: number = data?.pages ?? 0;

  return { characters, totalPages, error };
}

export async function getCharacter(id: string) {
  // All ids in The One API are 24 characters long. Any other id can't exist,
  // and the API crashes (500) if we ask for it, so we don't ask.
  if (id.length !== 24) {
    return { character: null, error: null };
  }

  const { data, error } = await fetchData(`${ONE_API}/character/${id}`);
  const character: Character | null = data?.docs[0] ?? null;

  return { character, error };
}

export async function getQuotes(id: string) {
  const { data } = await fetchData(`${ONE_API}/character/${id}/quote?limit=5`);
  const quotes: Quote[] = data?.docs ?? []; // no quotes is better than a broken page

  return quotes;
}

// ---------- API 2: Open Library (book covers) ----------

export async function getBookCover(title: string) {
  const { data } = await fetchData(
    `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&author=Tolkien&limit=1`
  );
  const coverId = data?.docs[0]?.cover_i;

  // no cover → null, and the page shows "No cover" instead
  return coverId ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` : null;
}

// ---------- API 3: Tolkien Gateway wiki (character images) ----------

export async function getCharacterImage(name: string) {
  // Look up the wiki page with the same name as the character, e.g. "Frodo Baggins"
  const { data } = await fetchData(
    `https://tolkiengateway.net/w/api.php?action=query&titles=${encodeURIComponent(name)}&prop=pageimages&pithumbsize=400&pilicense=any&format=json&redirects=1`
  );

  // The answer looks like: { query: { pages: { "1234": { thumbnail: { source: "https://..." } } } } }
  const pages = data?.query?.pages;
  if (!pages) return null;

  const page = Object.values(pages)[0] as { thumbnail?: { source: string } };
  const image: string | null = page.thumbnail?.source ?? null;

  return image;
}
