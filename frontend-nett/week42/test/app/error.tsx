"use client"; // Error boundaries must be Client Components

// This page is only for UNEXPECTED errors (bugs in our code).
// API errors are shown with <ErrorMessage> on the page itself.
// In production, Next hides the real error text here, so we show a general message.

type Props = { error: Error & { digest?: string }; retry: () => void };

export default function ErrorPage({ retry }: Props) {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-2 text-2xl font-bold">Something went wrong</h1>
      <p className="mb-4 text-stone-600">An unexpected error happened. Try again, or go back to the home page.</p>
      <button onClick={retry} className="rounded bg-amber-600 px-4 py-2 text-white">
        Try again
      </button>
    </main>
  );
}
