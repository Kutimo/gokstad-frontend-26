type Props = { message: string };

// Shown on the page when an API call fails, instead of crashing the whole page
export default function ErrorMessage({ message }: Props) {
  return (
    <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-900">
      <p className="font-semibold">⚠️ Could not load the data</p>
      <p className="mt-1">{message}</p>
    </div>
  );
}
