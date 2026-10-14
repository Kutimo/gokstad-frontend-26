
export default function Home() {
  return (
    <main className="flex flex-1 w-full flex-col items-center justify-between py-32 px-16 sm:items-start">

      <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
        <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
          Gokstad blog
        </h1>
        <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. At qui labore, maxime illo est quae voluptatum corporis impedit maiores quas.
        </p>
      </div>
    </main>
  );
}
