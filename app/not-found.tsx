import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="py-24">
      <p className="font-mono text-xs text-inkSoft">404</p>
      <h1 className="mt-2 text-3xl">This page could not be found.</h1>
      <p className="mt-4 max-w-prose text-inkSoft">
        The link may be old, or the page may have moved.
      </p>
      <div className="mt-8 flex flex-wrap gap-5 text-sm">
        <Link href="/" className="underline underline-offset-4">
          Back to the start
        </Link>
        <Link href="/projects" className="underline underline-offset-4">
          See every project
        </Link>
      </div>
    </div>
  );
}
